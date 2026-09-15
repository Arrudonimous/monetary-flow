"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { gerarDedupeHash } from "@/lib/dedupe";
import { tipoParaInterno, type TipoExterno } from "@/lib/transaction-format";
import { Prisma } from "@/lib/generated/prisma/client";

export type FormState = { error: string | null };

const lancamentoSchema = z.object({
  tipo: z.enum(["Saída", "Entrada"]),
  valor: z.coerce.number().refine((v) => v !== 0, "Valor não pode ser zero"),
  categoria: z.string().min(1),
  fonte: z.string().optional(),
  descricao: z.string().min(1),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cobranca: z.string().optional(),
  confirmado: z.coerce.boolean().optional().default(false),
});

function extrairCampos(formData: FormData) {
  return {
    tipo: formData.get("tipo"),
    valor: formData.get("valor"),
    categoria: formData.get("categoria"),
    fonte: formData.get("fonte") || undefined,
    descricao: formData.get("descricao"),
    data: formData.get("data"),
    cobranca: formData.get("cobranca") || undefined,
    confirmado: formData.get("confirmado") === "on",
  };
}

export async function criarLancamento(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = lancamentoSchema.safeParse(extrairCampos(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const input = parsed.data;
  const isSaida = input.tipo === "Saída";

  const dedupeHash = gerarDedupeHash({
    data: input.data,
    valor: input.valor,
    categoria: input.categoria,
    descricao: input.descricao,
  });

  try {
    await prisma.transaction.create({
      data: {
        tipo: tipoParaInterno(input.tipo as TipoExterno),
        valor: input.valor,
        categoria: input.categoria,
        fonte: isSaida ? (input.fonte ?? null) : null,
        descricao: input.descricao,
        data: new Date(`${input.data}T00:00:00.000Z`),
        cobranca:
          isSaida && input.cobranca
            ? new Date(`${input.cobranca}T00:00:00.000Z`)
            : null,
        confirmado: input.confirmado,
        origem: "site",
        dedupeHash,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: "Já existe um lançamento igual (mesma data/valor/categoria/descrição)." };
    }
    throw err;
  }

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  redirect("/lancamentos");
}

export async function atualizarLancamento(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = lancamentoSchema.safeParse(extrairCampos(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const input = parsed.data;
  const isSaida = input.tipo === "Saída";

  const dedupeHash = gerarDedupeHash({
    data: input.data,
    valor: input.valor,
    categoria: input.categoria,
    descricao: input.descricao,
  });

  try {
    await prisma.transaction.update({
      where: { id },
      data: {
        tipo: tipoParaInterno(input.tipo as TipoExterno),
        valor: input.valor,
        categoria: input.categoria,
        fonte: isSaida ? (input.fonte ?? null) : null,
        descricao: input.descricao,
        data: new Date(`${input.data}T00:00:00.000Z`),
        cobranca:
          isSaida && input.cobranca
            ? new Date(`${input.cobranca}T00:00:00.000Z`)
            : null,
        confirmado: input.confirmado,
        dedupeHash,
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return { error: "Já existe um lançamento igual (mesma data/valor/categoria/descrição)." };
    }
    throw err;
  }

  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  redirect("/lancamentos");
}

export async function alternarConfirmado(id: string, confirmado: boolean) {
  await prisma.transaction.update({
    where: { id },
    data: { confirmado },
  });
  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
}

export async function descartarLancamento(id: string) {
  await prisma.transaction.update({
    where: { id },
    data: { status: "descartado" },
  });
  revalidatePath("/lancamentos");
  revalidatePath("/dashboard");
  redirect("/lancamentos");
}
