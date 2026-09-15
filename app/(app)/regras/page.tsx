import { prisma } from "@/lib/db";
import { tipoParaExterno } from "@/lib/transaction-format";
import {
  CATEGORIAS_SAIDA,
  CATEGORIAS_ENTRADA,
} from "@/lib/categories";
import { criarRegra, alternarRegraAtiva, excluirRegra } from "./actions";

export default async function RegrasPage() {
  const regras = await prisma.categorizationRule.findMany({
    orderBy: [{ prioridade: "desc" }, { palavraChave: "asc" }],
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold">Regras de categorização</h1>

      <form
        action={criarRegra}
        className="grid grid-cols-2 gap-3 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-5"
      >
        <input
          type="text"
          name="palavraChave"
          placeholder="Palavra-chave"
          required
          className="col-span-2 rounded-md border border-neutral-300 px-2 py-1.5 text-sm sm:col-span-1"
        />
        <select
          name="tipo"
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        >
          <option value="Saída">Saída</option>
          <option value="Entrada">Entrada</option>
        </select>
        <input
          type="text"
          name="categoria"
          list="categorias"
          placeholder="Categoria"
          required
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <datalist id="categorias">
          {[...CATEGORIAS_SAIDA, ...CATEGORIAS_ENTRADA].map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <input
          type="number"
          name="prioridade"
          placeholder="Prioridade"
          defaultValue={0}
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          Adicionar
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="px-3 py-2 font-medium">Palavra-chave</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Categoria</th>
              <th className="px-3 py-2 font-medium">Prioridade</th>
              <th className="px-3 py-2 font-medium">Ativa</th>
              <th className="px-3 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {regras.map((r) => (
              <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-3 py-2">{r.palavraChave}</td>
                <td className="px-3 py-2">{tipoParaExterno(r.tipo)}</td>
                <td className="px-3 py-2">{r.categoria}</td>
                <td className="px-3 py-2">{r.prioridade}</td>
                <td className="px-3 py-2">
                  <form action={alternarRegraAtiva.bind(null, r.id, !r.ativo)}>
                    <button
                      type="submit"
                      className={r.ativo ? "text-green-700" : "text-neutral-400"}
                    >
                      {r.ativo ? "Ativa" : "Inativa"}
                    </button>
                  </form>
                </td>
                <td className="px-3 py-2">
                  <form action={excluirRegra.bind(null, r.id)}>
                    <button type="submit" className="text-red-600 hover:underline">
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
