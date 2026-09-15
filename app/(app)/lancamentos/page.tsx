import Link from "next/link";
import { prisma } from "@/lib/db";
import { tipoParaExterno } from "@/lib/transaction-format";
import { CATEGORIAS_SAIDA, CATEGORIAS_ENTRADA, FONTES } from "@/lib/categories";
import { ToggleConfirmado } from "./toggle-confirmado";

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataBR(data: Date): string {
  return data.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

type SearchParams = {
  mes?: string;
  categoria?: string;
  fonte?: string;
  tipo?: string;
  confirmado?: string;
  busca?: string;
};

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const filtros = await searchParams;

  const where: Record<string, unknown> = { status: "ativo" };

  if (filtros.mes) {
    const [ano, mes] = filtros.mes.split("-").map(Number);
    where.data = {
      gte: new Date(Date.UTC(ano, mes - 1, 1)),
      lt: new Date(Date.UTC(mes === 12 ? ano + 1 : ano, mes === 12 ? 0 : mes, 1)),
    };
  }
  if (filtros.categoria) where.categoria = filtros.categoria;
  if (filtros.fonte) where.fonte = filtros.fonte;
  if (filtros.tipo) where.tipo = filtros.tipo === "Saída" ? "Saida" : "Entrada";
  if (filtros.confirmado) where.confirmado = filtros.confirmado === "true";
  if (filtros.busca) {
    where.descricao = { contains: filtros.busca, mode: "insensitive" };
  }

  const transacoes = await prisma.transaction.findMany({
    where,
    orderBy: { data: "desc" },
    take: 200,
  });

  const categorias = [...CATEGORIAS_SAIDA, ...new Set(CATEGORIAS_ENTRADA)];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Lançamentos</h1>
        <Link
          href="/lancamentos/novo"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Novo lançamento
        </Link>
      </div>

      <form className="flex flex-wrap gap-2 text-sm">
        <input
          type="month"
          name="mes"
          defaultValue={filtros.mes}
          className="rounded-md border border-neutral-300 px-2 py-1"
        />
        <select
          name="tipo"
          defaultValue={filtros.tipo ?? ""}
          className="rounded-md border border-neutral-300 px-2 py-1"
        >
          <option value="">Tipo (todos)</option>
          <option value="Saída">Saída</option>
          <option value="Entrada">Entrada</option>
        </select>
        <select
          name="categoria"
          defaultValue={filtros.categoria ?? ""}
          className="rounded-md border border-neutral-300 px-2 py-1"
        >
          <option value="">Categoria (todas)</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          name="fonte"
          defaultValue={filtros.fonte ?? ""}
          className="rounded-md border border-neutral-300 px-2 py-1"
        >
          <option value="">Fonte (todas)</option>
          {FONTES.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select
          name="confirmado"
          defaultValue={filtros.confirmado ?? ""}
          className="rounded-md border border-neutral-300 px-2 py-1"
        >
          <option value="">Confirmado (todos)</option>
          <option value="true">Confirmado</option>
          <option value="false">Não confirmado</option>
        </select>
        <input
          type="search"
          name="busca"
          placeholder="Buscar descrição..."
          defaultValue={filtros.busca}
          className="rounded-md border border-neutral-300 px-2 py-1"
        />
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-3 py-1"
        >
          Filtrar
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="px-3 py-2 font-medium">Data</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Categoria</th>
              <th className="px-3 py-2 font-medium">Fonte</th>
              <th className="px-3 py-2 font-medium">Descrição</th>
              <th className="px-3 py-2 text-right font-medium">Valor</th>
              <th className="px-3 py-2 font-medium">Confirmado</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {transacoes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-neutral-500">
                  Nenhum lançamento encontrado.
                </td>
              </tr>
            ) : (
              transacoes.map((t) => (
                <tr key={t.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-3 py-2">{formatarDataBR(t.data)}</td>
                  <td className="px-3 py-2">{tipoParaExterno(t.tipo)}</td>
                  <td className="px-3 py-2">{t.categoria}</td>
                  <td className="px-3 py-2">{t.fonte ?? "—"}</td>
                  <td className="px-3 py-2">{t.descricao}</td>
                  <td className="px-3 py-2 text-right">
                    {formatarReal(Number(t.valor))}
                  </td>
                  <td className="px-3 py-2">
                    <ToggleConfirmado id={t.id} confirmado={t.confirmado} />
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/lancamentos/${t.id}`}
                      className="text-neutral-500 hover:text-neutral-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
