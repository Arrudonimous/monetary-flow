"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FONTES } from "@/lib/categories";
import { Button } from "@/components/ui/Button";

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
    <div className="max-w-lg space-y-2">
      <p className="font-display text-2xl italic text-ink">
        Importar fatura
      </p>
      <p className="text-sm text-ink-muted">
        OFX é o formato preferido — mais confiável que PDF. Você revisa cada
        linha antes de confirmar.
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-5 border-t border-line pt-6"
      >
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">Fonte</span>
          <select
            name="fonte"
            required
            className="w-full rounded-sm border border-line-strong bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-forest"
          >
            {FONTES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-ink">Arquivo (.ofx ou .pdf)</span>
          <input
            type="file"
            name="arquivo"
            accept=".ofx,.pdf"
            required
            className="w-full text-sm text-ink-muted file:mr-3 file:rounded-sm file:border file:border-line-strong file:bg-paper-raised file:px-3 file:py-1.5 file:text-sm file:text-ink"
          />
        </label>

        {erro ? <p className="text-sm text-oxide">{erro}</p> : null}

        <Button type="submit" disabled={enviando}>
          {enviando ? "Processando…" : "Processar arquivo"}
        </Button>
      </form>
    </div>
  );
}
