import Link from "next/link";
import {
  gastosPorCategoria,
  gastosPorFonte,
  top15Gastos,
  resumoPorMes,
} from "@/lib/reports";
import { formatarReal, formatarDataBR } from "@/lib/format";
import { Amount } from "@/components/ui/Amount";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

function nomeDoMes(mesIso: string): string {
  const [ano, mes] = mesIso.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, 1));
  const nome = data.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

function rangeDoMes(mesIso: string): { desde: Date; ate: Date } {
  const [ano, mes] = mesIso.split("-").map(Number);
  return {
    desde: new Date(Date.UTC(ano, mes - 1, 1)),
    ate: new Date(Date.UTC(mes === 12 ? ano + 1 : ano, mes === 12 ? 0 : mes, 1)),
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { periodo } = await searchParams;
  const periodoTudo = periodo === "tudo";

  const mesAtual = new Date().toISOString().slice(0, 7);

  const [porCategoria, porFonte, top15, porMes] = await Promise.all([
    gastosPorCategoria(periodoTudo ? undefined : rangeDoMes(mesAtual)),
    gastosPorFonte(periodoTudo ? undefined : rangeDoMes(mesAtual)),
    top15Gastos(),
    resumoPorMes(),
  ]);

  const resumoAtual = porMes.find((m) => m.mes === mesAtual);
  const maxCategoria = Math.max(0, ...porCategoria.map((c) => c.total));
  const maxFonte = Math.max(0, ...porFonte.map((f) => f.total));

  return (
    <div className="space-y-14">
      <section>
        <p className="font-display text-2xl italic text-ink">
          {nomeDoMes(mesAtual)}
        </p>

        {resumoAtual ? (
          <>
            <p className="tabular mt-3 text-5xl text-ink">
              {formatarReal(resumoAtual.saldo)}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              saldo do mês ·{" "}
              <span className="tabular text-forest">
                +{formatarReal(resumoAtual.entrada)}
              </span>{" "}
              entrou ·{" "}
              <span className="tabular text-oxide">
                {formatarReal(resumoAtual.saida)}
              </span>{" "}
              saiu
            </p>
          </>
        ) : (
          <EmptyState
            title="Nenhum lançamento neste mês ainda."
            action={
              <Link href="/lancamentos/novo">
                <Button variant="secondary">Registrar o primeiro</Button>
              </Link>
            }
          />
        )}
      </section>

      <section className="border-t border-line pt-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink-muted">
            {periodoTudo ? "Todo o período" : nomeDoMes(mesAtual)}
          </h2>
          <div className="flex gap-4 text-sm">
            <Link
              href="/dashboard"
              className={
                periodoTudo
                  ? "text-ink-muted hover:text-ink"
                  : "font-medium text-forest"
              }
            >
              Este mês
            </Link>
            <Link
              href="/dashboard?periodo=tudo"
              className={
                periodoTudo
                  ? "font-medium text-forest"
                  : "text-ink-muted hover:text-ink"
              }
            >
              Todo o período
            </Link>
          </div>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-medium text-ink-muted">
              Por categoria
            </h3>
            {porCategoria.length === 0 ? (
              <p className="text-sm text-ink-muted">
                Sem saídas neste período.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {porCategoria.map((c) => (
                  <li key={c.chave} className="relative">
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-0 bg-oxide-soft"
                      style={{
                        width: `${maxCategoria ? (c.total / maxCategoria) * 100 : 0}%`,
                      }}
                    />
                    <div className="relative flex items-center justify-between py-2.5 text-sm">
                      <span>{c.chave}</span>
                      <Amount tipo="Saída" valor={c.total} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-ink-muted">
              Por fonte
            </h3>
            {porFonte.length === 0 ? (
              <p className="text-sm text-ink-muted">
                Sem saídas neste período.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {porFonte.map((f) => (
                  <li key={f.chave} className="relative">
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-0 bg-oxide-soft"
                      style={{
                        width: `${maxFonte ? (f.total / maxFonte) * 100 : 0}%`,
                      }}
                    />
                    <div className="relative flex items-center justify-between py-2.5 text-sm">
                      <span>{f.chave}</span>
                      <Amount tipo="Saída" valor={f.total} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-line pt-10">
        <h2 className="mb-3 text-sm font-medium text-ink-muted">
          Maiores gastos individuais
        </h2>
        {top15.length === 0 ? (
          <p className="text-sm text-ink-muted">Sem saídas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-line">
              {top15.map((t) => (
                <tr key={t.id}>
                  <td className="tabular py-2.5 pr-4 text-ink-muted">
                    {formatarDataBR(t.data)}
                  </td>
                  <td className="py-2.5 pr-4 text-ink-muted">
                    {t.categoria}
                  </td>
                  <td className="py-2.5 pr-4">{t.descricao}</td>
                  <td className="py-2.5 text-right">
                    <Amount tipo="Saída" valor={t.valor} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>

      <section className="border-t border-line pt-10">
        <h2 className="mb-3 text-sm font-medium text-ink-muted">
          Resumo por mês
        </h2>
        {porMes.length === 0 ? (
          <p className="text-sm text-ink-muted">Sem lançamentos ainda.</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-ink-muted">
                <th className="py-2 pr-4 font-medium">Mês</th>
                <th className="py-2 pr-4 text-right font-medium">Entradas</th>
                <th className="py-2 pr-4 text-right font-medium">Saídas</th>
                <th className="py-2 text-right font-medium">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {[...porMes].reverse().map((m) => (
                <tr key={m.mes}>
                  <td className="py-2.5 pr-4">{nomeDoMes(m.mes)}</td>
                  <td className="py-2.5 pr-4 text-right">
                    <Amount tipo="Entrada" valor={m.entrada} />
                  </td>
                  <td className="py-2.5 pr-4 text-right">
                    <Amount tipo="Saída" valor={m.saida} />
                  </td>
                  <td
                    className={`tabular py-2.5 text-right ${m.saldo >= 0 ? "text-forest" : "text-oxide"}`}
                  >
                    {formatarReal(m.saldo)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>
    </div>
  );
}
