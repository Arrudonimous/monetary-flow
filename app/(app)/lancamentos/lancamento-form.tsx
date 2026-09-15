"use client";

import { useActionState, useState } from "react";
import {
  CATEGORIAS_SAIDA,
  CATEGORIAS_ENTRADA,
  FONTES,
} from "@/lib/categories";
import { Button } from "@/components/ui/Button";
import type { FormState } from "./actions";

const estadoInicial: FormState = { error: null };

const fieldClass =
  "w-full rounded-sm border border-line-strong bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-forest";

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
      className="space-y-6 border-t border-line pt-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <Campo label="Tipo">
          <select
            name="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as "Saída" | "Entrada")}
            className={fieldClass}
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
            className={`${fieldClass} tabular`}
          />
        </Campo>

        <Campo label="Categoria">
          <select
            name="categoria"
            required
            defaultValue={valoresIniciais?.categoria}
            className={fieldClass}
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
              className={fieldClass}
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
            className={`${fieldClass} tabular`}
          />
        </Campo>

        {isSaida ? (
          <Campo label="Cobrança (opcional)">
            <input
              type="date"
              name="cobranca"
              defaultValue={valoresIniciais?.cobranca ?? undefined}
              className={`${fieldClass} tabular`}
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
          className={fieldClass}
        />
      </Campo>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          name="confirmado"
          defaultChecked={valoresIniciais?.confirmado}
          className="size-4 accent-[var(--forest)]"
        />
        Já confirmado
      </label>

      {state.error ? (
        <p className="text-sm text-oxide">{state.error}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando…" : submitLabel}
      </Button>
    </form>
  );
}

function Campo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
