import { prisma } from "@/lib/db";
import { TipoTransacao } from "@/lib/generated/prisma/enums";

const SAIDA_ATIVA = {
  status: "ativo" as const,
  tipo: TipoTransacao.Saida,
};

export type TotalPorChave = { chave: string; total: number };

/** Equivalente ao bloco "Maiores gastos por categoria" do Index Gastos.md. */
export async function gastosPorCategoria(): Promise<TotalPorChave[]> {
  const grupos = await prisma.transaction.groupBy({
    by: ["categoria"],
    where: SAIDA_ATIVA,
    _sum: { valor: true },
  });

  return grupos
    .map((g) => ({ chave: g.categoria, total: Number(g._sum.valor ?? 0) }))
    .sort((a, b) => b.total - a.total);
}

/** Equivalente ao bloco "Maiores gastos por fonte" do Index Gastos.md. */
export async function gastosPorFonte(): Promise<TotalPorChave[]> {
  const grupos = await prisma.transaction.groupBy({
    by: ["fonte"],
    where: SAIDA_ATIVA,
    _sum: { valor: true },
  });

  return grupos
    .map((g) => ({
      chave: g.fonte ?? "Sem fonte",
      total: Number(g._sum.valor ?? 0),
    }))
    .sort((a, b) => b.total - a.total);
}

export type LancamentoResumo = {
  id: string;
  data: string;
  categoria: string;
  descricao: string;
  valor: number;
};

/** Equivalente ao bloco "Top 15 maiores gastos individuais". */
export async function top15Gastos(): Promise<LancamentoResumo[]> {
  const transacoes = await prisma.transaction.findMany({
    where: SAIDA_ATIVA,
    orderBy: { valor: "desc" },
    take: 15,
  });

  return transacoes.map((t) => ({
    id: t.id,
    data: t.data.toISOString().slice(0, 10),
    categoria: t.categoria,
    descricao: t.descricao,
    valor: Number(t.valor),
  }));
}

export type ResumoMes = {
  mes: string;
  entrada: number;
  saida: number;
  saldo: number;
};

/** Equivalente ao bloco "Resumo por mês". */
export async function resumoPorMes(): Promise<ResumoMes[]> {
  const transacoes = await prisma.transaction.findMany({
    where: { status: "ativo" },
    select: { data: true, tipo: true, valor: true },
  });

  const porMes = new Map<string, { entrada: number; saida: number }>();

  for (const t of transacoes) {
    const mes = t.data.toISOString().slice(0, 7);
    const atual = porMes.get(mes) ?? { entrada: 0, saida: 0 };
    const valor = Number(t.valor);

    if (t.tipo === TipoTransacao.Entrada) {
      atual.entrada += valor;
    } else {
      atual.saida += valor;
    }

    porMes.set(mes, atual);
  }

  return Array.from(porMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, v]) => ({
      mes,
      entrada: v.entrada,
      saida: v.saida,
      saldo: v.entrada - v.saida,
    }));
}
