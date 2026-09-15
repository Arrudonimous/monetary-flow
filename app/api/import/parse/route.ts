import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { processarImport } from "@/lib/import-pipeline";
import { FONTES } from "@/lib/categories";

export const dynamic = "force-dynamic";

const fonteSchema = z.enum(FONTES);

function detectarTipoArquivo(nome: string): "pdf" | "ofx" | null {
  const extensao = nome.toLowerCase().split(".").pop();
  if (extensao === "pdf") return "pdf";
  if (extensao === "ofx") return "ofx";
  return null;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const arquivo = formData?.get("arquivo");
  const fonteBruta = formData?.get("fonte");

  if (!(arquivo instanceof File)) {
    return NextResponse.json({ error: "arquivo_ausente" }, { status: 400 });
  }

  const fonteParse = fonteSchema.safeParse(fonteBruta);
  if (!fonteParse.success) {
    return NextResponse.json({ error: "fonte_invalida" }, { status: 400 });
  }

  const tipoArquivo = detectarTipoArquivo(arquivo.name);
  if (!tipoArquivo) {
    return NextResponse.json(
      { error: "tipo_arquivo_nao_suportado" },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await arquivo.arrayBuffer());

  const resultado = await processarImport(
    buffer,
    arquivo.name,
    tipoArquivo,
    fonteParse.data,
  );

  return NextResponse.json(resultado, { status: 201 });
}
