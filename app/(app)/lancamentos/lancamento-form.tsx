"use client";

import { useActionState, useState } from "react";
import {
  CATEGORIAS_SAIDA,
  CATEGORIAS_ENTRADA,
  FONTES,
} from "@/lib/categories";
import type { FormState } from "./actions";

const estadoInicial: FormState = { error: null };

export type ValoresIniciais = {
  tipo: "Saída" | "Entrada";
  valor: number;
  categoria: string;
  fonte: string | null;
  descricao: string;
  data: string;
  cobranca: string | null;
  confirmado: boolean;
};

export function LancamentoForm({
  action,
  valoresIniciais,
  submitLabel = "Salvar",
}: {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  valoresIniciais?: ValoresIniciais;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, estadoInicial);
  const [tipo, setTipo] = useState<"Saída" | "Entrada">(
    valoresIniciais?.tipo ?? "Saída",
  );
  const isSaida = tipo === "Saída";
  const categorias = isSaida ? CATEGORIAS_SAIDA : CATEGORIAS_ENTRADA;

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4"
    >
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Tipo">
          <select
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "Saída" | "Entrada")}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            <option value="Saída">Saída</option>
            <option value="Entrada">Entrada</option>
          </select>
        </Campo>

        <Campo label="Valor">
          <input
            type="number"
            name="valor"
            step="0.01"
            required
            defaultValue={valoresIniciais?.valor}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </Campo>

        <Campo label="Categoria">
          <select
            name="categoria"
            required
            defaultValue={valoresIniciais?.categoria}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Campo>

        {isSaida ? (
          <Campo label="Fonte">
            <select
              name="fonte"
              defaultValue={valoresIniciais?.fonte ?? undefined}
              className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            >
              <option value="">—</option>
              {FONTES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </Campo>
        ) : null}

        <Campo label="Data">
          <input
            type="date"
            name="data"
            required
            defaultValue={valoresIniciais?.data}
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </Campo>

        {isSaida ? (
          <Campo label="Cobrança (opcional)">
            <input
              type="date"
              name="cobranca"
              defaultValue={valoresIniciais?.cobranca ?? undefined}
              className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
          </Campo>
        ) : null}
      </div>

      <Campo label="Descrição">
        <input
          type="text"
          name="descricao"
          required
          defaultValue={valoresIniciais?.descricao}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
      </Campo>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="confirmado"
          defaultChecked={valoresIniciais?.confirmado}
        />
        Já confirmado
      </label>

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Salvando..." : submitLabel}
      </button>
    </form>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      {children}
    </label>
  );
}
