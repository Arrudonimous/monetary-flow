"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { tipoParaInterno, type TipoExterno } from "@/lib/transaction-format";

const regraSchema = z.object({
  palavraChave: z.string().min(1),
  tipo: z.enum(["Saída", "Entrada"]),
  categoria: z.string().min(1),
  prioridade: z.coerce.number().int().default(0),
});

export async function criarRegra(formData: FormData) {
  const parsed = regraSchema.safeParse({
    palavraChave: formData.get("palavraChave"),
    tipo: formData.get("tipo"),
    categoria: formData.get("categoria"),
    prioridade: formData.get("prioridade") || 0,
  });
  if (!parsed.success) return;

  const input = parsed.data;
  await prisma.categorizationRule.create({
    data: {
      palavraChave: input.palavraChave,
      tipo: tipoParaInterno(input.tipo as TipoExterno),
      categoria: input.categoria,
      prioridade: input.prioridade,
    },
  });
  revalidatePath("/regras");
}

export async function alternarRegraAtiva(id: string, ativo: boolean) {
  await prisma.categorizationRule.update({ where: { id }, data: { ativo } });
  revalidatePath("/regras");
}

export async function excluirRegra(id: string) {
  await prisma.categorizationRule.delete({ where: { id } });
  revalidatePath("/regras");
}
