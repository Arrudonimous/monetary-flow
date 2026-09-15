import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ImportPreview } from "../import-preview";
import type { ItemPreview } from "@/lib/import-pipeline";

export default async function ImportPreviewPage({
  params,
}: {
  params: Promise<{ faturaImportId: string }>;
}) {
  const { faturaImportId } = await params;
  const faturaImport = await prisma.faturaImport.findUnique({
    where: { id: faturaImportId },
  });

  if (!faturaImport) notFound();

  const itens = faturaImport.rawJson as unknown as ItemPreview[];

  return (
    <div className="space-y-2">
      <p className="font-display text-2xl italic text-ink">
        Revisar import
      </p>
      <p className="text-sm text-ink-muted">
        {faturaImport.arquivoNome} ·{" "}
        {faturaImport.status === "pendente"
          ? "revise as categorias, desmarque duplicatas e confirme."
          : `este import já foi ${faturaImport.status}.`}
      </p>

      {faturaImport.status === "pendente" ? (
        <ImportPreview
          faturaImportId={faturaImport.id}
          fonte={faturaImport.fonte}
          itensIniciais={itens}
        />
      ) : null}
    </div>
  );
}
