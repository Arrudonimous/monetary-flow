"use client";

import { useState, useTransition } from "react";
import { CATEGORIAS_SAIDA } from "@/lib/categories";
import { formatarReal, formatarDataBR } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { confirmarImportAction } from "./actions";
import type { ItemPreview } from "@/lib/import-pipeline";

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
    <div className="space-y-6 border-t border-line pt-6">
      <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-ink-muted">
            <th className="py-2 pr-3 font-medium" />
            <th className="py-2 pr-4 font-medium">Data</th>
            <th className="py-2 pr-4 font-medium">Descrição</th>
            <th className="py-2 pr-4 font-medium">Categoria</th>
            <th className="py-2 pr-4 text-right font-medium">Valor</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {itens.map((item, i) => (
            <tr key={i} className={item.incluir ? "" : "opacity-50"}>
              <td className="py-2.5 pr-3">
                <input
                  type="checkbox"
                  checked={item.incluir}
                  onChange={(e) =>
                    atualizarItem(i, { incluir: e.target.checked })
                  }
                  className="size-4 accent-[var(--forest)]"
                />
              </td>
              <td className="tabular py-2.5 pr-4 text-ink-muted">
                {formatarDataBR(item.data)}
              </td>
              <td className="py-2.5 pr-4">{item.descricao}</td>
              <td className="py-2.5 pr-4">
                <select
                  value={item.categoria}
                  onChange={(e) =>
                    atualizarItem(i, { categoria: e.target.value })
                  }
                  className="rounded-sm border border-line-strong bg-paper-raised px-2 py-1 text-sm text-ink outline-none focus:border-forest"
                >
                  {CATEGORIAS_SAIDA.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </td>
              <td className="tabular py-2.5 pr-4 text-right">
                {formatarReal(item.valor)}
              </td>
              <td className="py-2.5 text-xs">
                {item.possivelDuplicata ? (
                  <span className="text-ochre">Possível duplicata</span>
                ) : null}
                {item.precisaRevisao ? (
                  <span className="ml-2 text-ochre">Revisar</span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <Button onClick={confirmar} disabled={pending || totalIncluidos === 0}>
        {pending
          ? "Confirmando…"
          : `Confirmar ${totalIncluidos} lançamento(s)`}
      </Button>
    </div>
  );
}
