import Link from "next/link";
import { prisma } from "@/lib/db";
import { tipoParaExterno } from "@/lib/transaction-format";
import {
  CATEGORIAS_SAIDA,
  CATEGORIAS_ENTRADA,
  FONTES,
} from "@/lib/categories";
import { formatarDataBR } from "@/lib/format";
import { Amount } from "@/components/ui/Amount";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ToggleConfirmado } from "./toggle-confirmado";

type SearchParams = {
  mes?: string;
  categoria?: string;
  fonte?: string;
  tipo?: string;
  confirmado?: string;
  busca?: string;
};

const selectClass =
  "rounded-sm border border-line-strong bg-paper-raised px-2.5 py-1.5 text-sm text-ink outline-none focus:border-forest";

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
      lt: new Date(
        Date.UTC(mes === 12 ? ano + 1 : ano, mes === 12 ? 0 : mes, 1),
      ),
    };
  }
  if (filtros.categoria) where.categoria = filtros.categoria;
  if (filtros.fonte) where.fonte = filtros.fonte;
  if (filtros.tipo)
    where.tipo = filtros.tipo === "Saída" ? "Saida" : "Entrada";
  if (filtros.confirmado) where.confirmado = filtros.confirmado === "true";
  if (filtros.busca) {
    where.descricao = { contains: filtros.busca, mode: "insensitive" };
  }

  const transacoes = await prisma.transaction.findMany({
    where,
    orderBy: { data: "desc" },
    take: 200,
  });

  const categorias = [...new Set([...CATEGORIAS_SAIDA, ...CATEGORIAS_ENTRADA])];
  const temFiltro = Object.keys(filtros).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl italic text-ink">Lançamentos</p>
        <Link href="/lancamentos/novo">
          <Button>Novo lançamento</Button>
        </Link>
      </div>

      <form className="flex flex-wrap gap-2">
        <input
          type="month"
          name="mes"
          defaultValue={filtros.mes}
          className={selectClass}
        />
        <select name="tipo" defaultValue={filtros.tipo ?? ""} className={selectClass}>
          <option value="">Tipo (todos)</option>
          <option value="Saída">Saída</option>
          <option value="Entrada">Entrada</option>
        </select>
        <select
          name="categoria"
          defaultValue={filtros.categoria ?? ""}
          className={selectClass}
        >
          <option value="">Categoria (todas)</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select name="fonte" defaultValue={filtros.fonte ?? ""} className={selectClass}>
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
          className={selectClass}
        >
          <option value="">Confirmado (todos)</option>
          <option value="true">Confirmado</option>
          <option value="false">Não confirmado</option>
        </select>
        <input
          type="search"
          name="busca"
          placeholder="Buscar descrição…"
          defaultValue={filtros.busca}
          className={`${selectClass} flex-1 min-w-40`}
        />
        <Button type="submit" variant="secondary">
          Filtrar
        </Button>
      </form>

      {transacoes.length === 0 ? (
        <EmptyState
          title={
            temFiltro
              ? "Nenhum lançamento bate com esse filtro."
              : "Nenhum lançamento ainda."
          }
          action={
            !temFiltro && (
              <Link href="/lancamentos/novo">
                <Button variant="secondary">Registrar o primeiro</Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-muted">
              <th className="py-2 pr-4 font-medium">Data</th>
              <th className="py-2 pr-4 font-medium">Categoria</th>
              <th className="py-2 pr-4 font-medium">Fonte</th>
              <th className="py-2 pr-4 font-medium">Descrição</th>
              <th className="py-2 pr-4 text-right font-medium">Valor</th>
              <th className="py-2 pr-4 text-center font-medium">Ok</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {transacoes.map((t) => (
              <tr key={t.id} className="group">
                <td className="tabular py-2.5 pr-4 text-ink-muted">
                  {formatarDataBR(t.data)}
                </td>
                <td className="py-2.5 pr-4">{t.categoria}</td>
                <td className="py-2.5 pr-4 text-ink-muted">
                  {t.fonte ?? "—"}
                </td>
                <td className="py-2.5 pr-4">{t.descricao}</td>
                <td className="py-2.5 pr-4 text-right">
                  <Amount tipo={tipoParaExterno(t.tipo)} valor={Number(t.valor)} />
                </td>
                <td className="py-2.5 pr-4 text-center">
                  <ToggleConfirmado id={t.id} confirmado={t.confirmado} />
                </td>
                <td className="py-2.5 text-right">
                  <Link
                    href={`/lancamentos/${t.id}`}
                    className="text-ink-muted opacity-0 transition-opacity hover:text-ink group-hover:opacity-100 group-focus-within:opacity-100 focus:opacity-100"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
