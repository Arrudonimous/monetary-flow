import { prisma } from "@/lib/db";
import { parseOfx } from "@/lib/parsers/ofx";
import { parsePdfBradesco } from "@/lib/parsers/pdf-bradesco";
import { aplicarRegrasDeNegocio } from "@/lib/import-rules";
import { categorizarDescricao } from "@/lib/categorization";
import { gerarDedupeHash } from "@/lib/dedupe";
import { tipoParaInterno } from "@/lib/transaction-format";
import { TipoTransacao } from "@/lib/generated/prisma/enums";

export type ItemPreview = {
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
  confianca: "alta" | "baixa";
  precisaRevisao: boolean;
  dedupeHash: string;
  possivelDuplicata: boolean;
  transacaoExistenteId: string | null;
};

async function extrairTransacoesBrutas(
  buffer: Buffer,
  tipoArquivo: "pdf" | "ofx",
) {
  if (tipoArquivo === "ofx") {
    return parseOfx(buffer.toString("utf-8"));
  }

  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const { text } = await parser.getText();
    return parsePdfBradesco(text, new Date());
  } finally {
    await parser.destroy();
  }
}

/**
 * Pipeline de import de fatura: extrai → aplica regras de negócio →
 * categoriza → calcula dedupe hash e sinaliza duplicatas prováveis contra
 * `transactions` ativas → grava o preview em `fatura_imports.raw_json`
 * (status "pendente"). Nada é gravado em `transactions` até o usuário
 * confirmar o preview em /importar/[id].
 */
export async function processarImport(
  buffer: Buffer,
  arquivoNome: string,
  tipoArquivo: "pdf" | "ofx",
  fonte: string,
): Promise<{ faturaImportId: string; preview: ItemPreview[] }> {
  const brutas = await extrairTransacoesBrutas(buffer, tipoArquivo);
  const aposRegras = aplicarRegrasDeNegocio(brutas);

  const preview: ItemPreview[] = [];

  for (const t of aposRegras) {
    // Import de fatura de cartão de crédito só gera Saídas — inclusive
    // estornos, que entram como valor negativo na mesma categoria da
    // compra original (regra de negócio já validada manualmente).
    const categoria =
      t.categoriaForcada ??
      (await categorizarDescricao(t.descricao, TipoTransacao.Saida))
        .categoria;

    const precisaRevisao =
      t.confianca === "baixa" || (!t.categoriaForcada && categoria === "Outros");

    const dedupeHash = gerarDedupeHash({
      data: t.data,
      valor: t.valor,
      categoria,
      descricao: t.descricao,
    });

    const existente = await prisma.transaction.findFirst({
      where: { dedupeHash, status: "ativo" },
      select: { id: true },
    });

    preview.push({
      data: t.data,
      descricao: t.descricao,
      valor: t.valor,
      categoria,
      confianca: t.confianca,
      precisaRevisao,
      dedupeHash,
      possivelDuplicata: existente !== null,
      transacaoExistenteId: existente?.id ?? null,
    });
  }

  const faturaImport = await prisma.faturaImport.create({
    data: {
      arquivoNome,
      tipoArquivo,
      fonte,
      status: "pendente",
      rawJson: preview,
    },
  });

  return { faturaImportId: faturaImport.id, preview };
}

export type ItemConfirmacao = {
  data: string;
  descricao: string;
  valor: number;
  categoria: string;
  dedupeHash: string;
  incluir: boolean;
};

/**
 * Confirma um import: grava em `transactions` (origem "import_fatura",
 * já confirmado por vir de dado oficial do banco) apenas os itens marcados
 * `incluir: true`, e marca o `fatura_imports` como confirmado.
 */
export async function confirmarImport(
  faturaImportId: string,
  fonte: string,
  itens: ItemConfirmacao[],
) {
  const paraGravar = itens.filter((i) => i.incluir);

  await prisma.$transaction([
    ...paraGravar.map((item) =>
      prisma.transaction.create({
        data: {
          tipo: tipoParaInterno("Saída"),
          valor: item.valor,
          categoria: item.categoria,
          fonte,
          descricao: item.descricao,
          data: new Date(`${item.data}T00:00:00.000Z`),
          confirmado: true,
          origem: "import_fatura",
          dedupeHash: item.dedupeHash,
          faturaImportId,
        },
      }),
    ),
    prisma.faturaImport.update({
      where: { id: faturaImportId },
      data: { status: "confirmado", confirmedAt: new Date() },
    }),
  ]);
}
