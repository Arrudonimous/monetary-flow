"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FONTES } from "@/lib/categories";

export default function ImportarPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/import/parse", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErro(body.error ?? "Falha ao processar o arquivo.");
        return;
      }

      const { faturaImportId } = await res.json();
      router.push(`/importar/${faturaImportId}`);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Importar fatura/extrato</h1>
      <p className="text-sm text-neutral-500">
        OFX é o formato preferido (mais confiável). PDF é aceito, mas a
        extração é melhor esforço — revise o preview antes de confirmar.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Fonte</span>
          <select
            name="fonte"
            required
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          >
            {FONTES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Arquivo (.ofx ou .pdf)</span>
          <input
            type="file"
            name="arquivo"
            accept=".ofx,.pdf"
            required
            className="w-full text-sm"
          />
        </label>

        {erro ? <p className="text-sm text-red-600">{erro}</p> : null}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {enviando ? "Processando..." : "Processar arquivo"}
        </button>
      </form>
    </div>
  );
}
