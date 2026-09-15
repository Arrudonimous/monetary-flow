import {
  gastosPorCategoria,
  gastosPorFonte,
  top15Gastos,
  resumoPorMes,
} from "@/lib/reports";

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarDataBR(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default async function DashboardPage() {
  const [porCategoria, porFonte, top15, porMes] = await Promise.all([
    gastosPorCategoria(),
    gastosPorFonte(),
    top15Gastos(),
    resumoPorMes(),
  ]);

  const mesAtual = new Date().toISOString().slice(0, 7);
  const resumoAtual = porMes.find((m) => m.mes === mesAtual);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-xl font-semibold">Dashboard</h1>
        {resumoAtual ? (
          <div className="mt-3 grid grid-cols-3 gap-3">
            <ResumoCard label="Entradas (mês)" valor={resumoAtual.entrada} />
            <ResumoCard label="Saídas (mês)" valor={resumoAtual.saida} />
            <ResumoCard label="Saldo (mês)" valor={resumoAtual.saldo} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-neutral-500">
            Ainda sem lançamentos este mês.
          </p>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Cartao titulo="Maiores gastos por categoria">
          <Tabela
            colunas={["Categoria", "Total"]}
            linhas={porCategoria.map((c) => [c.chave, formatarReal(c.total)])}
          />
        </Cartao>

        <Cartao titulo="Maiores gastos por fonte">
          <Tabela
            colunas={["Fonte", "Total"]}
            linhas={porFonte.map((f) => [f.chave, formatarReal(f.total)])}
          />
        </Cartao>
      </section>

      <section>
        <Cartao titulo="Top 15 maiores gastos individuais">
          <Tabela
            colunas={["Data", "Categoria", "Descrição", "Valor"]}
            linhas={top15.map((t) => [
              formatarDataBR(t.data),
              t.categoria,
              t.descricao,
              formatarReal(t.valor),
            ])}
          />
        </Cartao>
      </section>

      <section>
        <Cartao titulo="Resumo por mês">
          <Tabela
            colunas={["Mês", "Entradas", "Saídas", "Saldo"]}
            linhas={porMes.map((m) => [
              m.mes,
              formatarReal(m.entrada),
              formatarReal(m.saida),
              formatarReal(m.saldo),
            ])}
          />
        </Cartao>
      </section>
    </div>
  );
}

function ResumoCard({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <p className="text-xs text-neutral-500">{label}</p>
      <p className="mt-1 text-lg font-semibold">{formatarReal(valor)}</p>
    </div>
  );
}

function Cartao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="mb-3 text-sm font-semibold text-neutral-700">
        {titulo}
      </h2>
      {children}
    </div>
  );
}

function Tabela({
  colunas,
  linhas,
}: {
  colunas: string[];
  linhas: string[][];
}) {
  if (linhas.length === 0) {
    return <p className="text-sm text-neutral-500">Ainda sem lançamentos.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            {colunas.map((c) => (
              <th key={c} className="py-1 pr-4 font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((linha, i) => (
            <tr key={i} className="border-b border-neutral-100 last:border-0">
              {linha.map((valor, j) => (
                <td key={j} className="py-1 pr-4">
                  {valor}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
