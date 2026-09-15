import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { autenticarApiKey } from "@/lib/integration-auth";
import { gerarDedupeHash } from "@/lib/dedupe";
import {
  serializarTransacao,
  tipoParaInterno,
} from "@/lib/transaction-format";

export const dynamic = "force-dynamic";

const postSchema = z.object({
  tipo: z.enum(["Saída", "Entrada"]),
  valor: z.number(),
  categoria: z.string().min(1),
  fonte: z.string().min(1).optional().nullable(),
  descricao: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cobranca: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable(),
  confirmado: z.boolean().optional().default(false),
  external_id: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  const apiKey = await autenticarApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_body", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const dedupeHash = gerarDedupeHash({
    data: input.data,
    valor: input.valor,
    categoria: input.categoria,
    descricao: input.descricao,
  });

  try {
    const criada = await prisma.transaction.create({
      data: {
        tipo: tipoParaInterno(input.tipo),
        valor: new Prisma.Decimal(input.valor),
        categoria: input.categoria,
        fonte: input.fonte ?? null,
        descricao: input.descricao,
        data: new Date(`${input.data}T00:00:00.000Z`),
        cobranca: input.cobranca
          ? new Date(`${input.cobranca}T00:00:00.000Z`)
          : null,
        confirmado: input.confirmado,
        origem: "vault",
        dedupeHash,
        externalId: input.external_id ?? null,
      },
    });

    return NextResponse.json(
      { ...serializarTransacao(criada), duplicate: false },
      { status: 201 },
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      const existente = await prisma.transaction.findFirst({
        where: { dedupeHash, status: "ativo" },
      });
      if (existente) {
        return NextResponse.json(
          { ...serializarTransacao(existente), duplicate: true },
          { status: 200 },
        );
      }
    }
    throw err;
  }
}

const getQuerySchema = z.object({
  since: z.string().datetime(),
  limit: z.coerce.number().int().min(1).max(1000).default(500),
});

export async function GET(request: Request) {
  const apiKey = await autenticarApiKey(request);
  if (!apiKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const parsed = getQuerySchema.safeParse({
    since: url.searchParams.get("since"),
    limit: url.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_query", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { since, limit } = parsed.data;
  const serverTime = new Date();

  const transacoes = await prisma.transaction.findMany({
    where: {
      updatedAt: { gte: new Date(since) },
      origem: { in: ["site", "import_fatura"] },
      status: "ativo",
    },
    orderBy: { updatedAt: "asc" },
    take: limit,
  });

  return NextResponse.json({
    serverTime: serverTime.toISOString(),
    transactions: transacoes.map(serializarTransacao),
    truncated: transacoes.length === limit,
  });
}
