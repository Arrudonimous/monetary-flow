import type { Transaction } from "@/lib/generated/prisma/client";
import { TipoTransacao } from "@/lib/generated/prisma/enums";

/**
 * O enum do Prisma Client usa "Saida" (sem acento) como identificador
 * TypeScript — o valor real gravado no banco/exposto pela API é "Saída"
 * (`@map("Saída")` no schema.prisma). Todo texto voltado ao usuário, ao
 * vault e ao contrato JSON da API de integração deve usar a forma externa.
 */
export type TipoExterno = "Saída" | "Entrada";

export function tipoParaInterno(tipo: TipoExterno): TipoTransacao {
  return tipo === "Saída" ? TipoTransacao.Saida : TipoTransacao.Entrada;
}

export function tipoParaExterno(tipo: TipoTransacao): TipoExterno {
  return tipo === TipoTransacao.Saida ? "Saída" : "Entrada";
}

export type TransacaoExterna = {
  id: string;
  tipo: TipoExterno;
  valor: number;
  categoria: string;
  fonte: string | null;
  descricao: string;
  data: string;
  cobranca: string | null;
  confirmado: boolean;
  origem: string;
  createdAt: string;
  updatedAt: string;
};

function formatarDataISO(data: Date): string {
  return data.toISOString().slice(0, 10);
}

export function serializarTransacao(t: Transaction): TransacaoExterna {
  return {
    id: t.id,
    tipo: tipoParaExterno(t.tipo),
    valor: Number(t.valor),
    categoria: t.categoria,
    fonte: t.fonte,
    descricao: t.descricao,
    data: formatarDataISO(t.data),
    cobranca: t.cobranca ? formatarDataISO(t.cobranca) : null,
    confirmado: t.confirmado,
    origem: t.origem,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  };
}
