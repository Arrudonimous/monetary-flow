import { prisma } from "@/lib/db";
import { tipoParaExterno } from "@/lib/transaction-format";
import { CATEGORIAS_SAIDA, CATEGORIAS_ENTRADA } from "@/lib/categories";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { criarRegra, alternarRegraAtiva, excluirRegra } from "./actions";

const fieldClass =
  "rounded-sm border border-line-strong bg-paper-raised px-2.5 py-1.5 text-sm text-ink outline-none focus:border-forest";

export default async function RegrasPage() {
  const regras = await prisma.categorizationRule.findMany({
    orderBy: [{ prioridade: "desc" }, { palavraChave: "asc" }],
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="font-display text-2xl italic text-ink">
          Regras de categorização
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          Toda descrição que contiver a palavra-chave recebe a categoria
          automaticamente, na importação e na integração com o vault.
        </p>
      </div>

      <form
        action={criarRegra}
        className="grid grid-cols-2 gap-2 border-t border-line pt-6 sm:grid-cols-5"
      >
        <input
          type="text"
          name="palavraChave"
          placeholder="Palavra-chave"
          required
          className={`${fieldClass} col-span-2 sm:col-span-1`}
        />
        <select name="tipo" className={fieldClass}>
          <option value="Saída">Saída</option>
          <option value="Entrada">Entrada</option>
        </select>
        <input
          type="text"
          name="categoria"
          list="categorias"
          placeholder="Categoria"
          required
          className={fieldClass}
        />
        <datalist id="categorias">
          {[...new Set([...CATEGORIAS_SAIDA, ...CATEGORIAS_ENTRADA])].map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <input
          type="number"
          name="prioridade"
          placeholder="Prioridade"
          defaultValue={0}
          className={`${fieldClass} tabular`}
        />
        <Button type="submit">Adicionar</Button>
      </form>

      {regras.length === 0 ? (
        <EmptyState title="Nenhuma regra cadastrada ainda." />
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-ink-muted">
              <th className="py-2 pr-4 font-medium">Palavra-chave</th>
              <th className="py-2 pr-4 font-medium">Tipo</th>
              <th className="py-2 pr-4 font-medium">Categoria</th>
              <th className="py-2 pr-4 text-right font-medium">Prioridade</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {regras.map((r) => (
              <tr key={r.id} className={r.ativo ? "" : "opacity-50"}>
                <td className="py-2.5 pr-4">{r.palavraChave}</td>
                <td className="py-2.5 pr-4 text-ink-muted">
                  {tipoParaExterno(r.tipo)}
                </td>
                <td className="py-2.5 pr-4">{r.categoria}</td>
                <td className="tabular py-2.5 pr-4 text-right">
                  {r.prioridade}
                </td>
                <td className="py-2.5 pr-4">
                  <form action={alternarRegraAtiva.bind(null, r.id, !r.ativo)}>
                    <button
                      type="submit"
                      className={`text-sm ${r.ativo ? "text-forest" : "text-ink-muted"}`}
                    >
                      {r.ativo ? "Ativa" : "Inativa"}
                    </button>
                  </form>
                </td>
                <td className="py-2.5 text-right">
                  <form action={excluirRegra.bind(null, r.id)}>
                    <Button type="submit" variant="danger">
                      Excluir
                    </Button>
                  </form>
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
