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
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">
          Revisar import — {faturaImport.arquivoNome}
        </h1>
        <p className="text-sm text-neutral-500">
          {faturaImport.status === "pendente"
            ? "Revise as categorias, desmarque possíveis duplicatas e confirme."
            : `Este import já foi ${faturaImport.status}.`}
        </p>
      </div>

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
