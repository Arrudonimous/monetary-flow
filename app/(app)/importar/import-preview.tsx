"use client";

import { useState, useTransition } from "react";
import { CATEGORIAS_SAIDA } from "@/lib/categories";
import { confirmarImportAction } from "./actions";
import type { ItemPreview } from "@/lib/import-pipeline";

function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type LinhaEditavel = ItemPreview & { incluir: boolean };

export function ImportPreview({
  faturaImportId,
  fonte,
  itensIniciais,
}: {
  faturaImportId: string;
  fonte: string;
  itensIniciais: ItemPreview[];
}) {
  const [itens, setItens] = useState<LinhaEditavel[]>(
    itensIniciais.map((i) => ({ ...i, incluir: !i.possivelDuplicata })),
  );
  const [pending, startTransition] = useTransition();

  function atualizarItem(index: number, patch: Partial<LinhaEditavel>) {
    setItens((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function confirmar() {
    startTransition(() => {
      confirmarImportAction(faturaImportId, fonte, itens);
    });
  }

  const totalIncluidos = itens.filter((i) => i.incluir).length;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-left text-neutral-500">
              <th className="px-3 py-2 font-medium">Incluir</th>
              <th className="px-3 py-2 font-medium">Data</th>
              <th className="px-3 py-2 font-medium">Descrição</th>
              <th className="px-3 py-2 font-medium">Categoria</th>
              <th className="px-3 py-2 text-right font-medium">Valor</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item, i) => (
              <tr
                key={i}
                className="border-b border-neutral-100 last:border-0"
              >
                <td className="px-3 py-2">
                  <input
                    type="checkbox"
                    checked={item.incluir}
                    onChange={(e) =>
                      atualizarItem(i, { incluir: e.target.checked })
                    }
                  />
                </td>
                <td className="px-3 py-2">{item.data}</td>
                <td className="px-3 py-2">{item.descricao}</td>
                <td className="px-3 py-2">
                  <select
                    value={item.categoria}
                    onChange={(e) =>
                      atualizarItem(i, { categoria: e.target.value })
                    }
                    className="rounded-md border border-neutral-300 px-1.5 py-1 text-sm"
                  >
                    {CATEGORIAS_SAIDA.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 text-right">
                  {formatarReal(item.valor)}
                </td>
                <td className="px-3 py-2 text-xs">
                  {item.possivelDuplicata ? (
                    <span className="text-amber-600">Possível duplicata</span>
                  ) : null}
                  {item.precisaRevisao ? (
                    <span className="ml-2 text-amber-600">Revisar</span>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={confirmar}
        disabled={pending || totalIncluidos === 0}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending
          ? "Confirmando..."
          : `Confirmar ${totalIncluidos} lançamento(s)`}
      </button>
    </div>
  );
}
