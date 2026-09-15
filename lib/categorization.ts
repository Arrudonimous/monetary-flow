import { prisma } from "@/lib/db";
import type { TipoTransacao } from "@/lib/generated/prisma/enums";

const CATEGORIA_PADRAO = "Outros";

export type ResultadoCategorizacao = {
  categoria: string;
  precisaRevisao: boolean;
};

/**
 * Aplica as regras de categorização ativas (mais prioritárias primeiro) a
 * uma descrição de lançamento. Sem match, cai em "Outros" e sinaliza que
 * precisa de revisão manual.
 */
export async function categorizarDescricao(
  descricao: string,
  tipo: TipoTransacao,
): Promise<ResultadoCategorizacao> {
  const descricaoLower = descricao.toLowerCase();

  const regras = await prisma.categorizationRule.findMany({
    where: { tipo, ativo: true },
    orderBy: { prioridade: "desc" },
  });

  const match = regras.find((regra) =>
    descricaoLower.includes(regra.palavraChave.toLowerCase()),
  );

  if (match) {
    return { categoria: match.categoria, precisaRevisao: false };
  }

  return { categoria: CATEGORIA_PADRAO, precisaRevisao: true };
}
