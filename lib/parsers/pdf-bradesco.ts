import type { TransacaoBruta } from "./types";

const VALOR_BR = /-?\d{1,3}(?:\.\d{3})*,\d{2}/;
const DATA_DDMM = /^(\d{2})\/(\d{2})\b/;

// Ex.: "12/09  IFOOD *IFOOD.COM RIO DE JANEI          45,90"
const LINHA_ESTRITA = new RegExp(
  `^(\\d{2}/\\d{2})\\s+(.+?)\\s+(${VALOR_BR.source})\\s*$`,
);

function valorBrParaNumero(valorBr: string): number {
  return Number(valorBr.replace(/\./g, "").replace(",", "."));
}

/**
 * Dado um dia e mês (DD/MM) e o ano de referência da fatura, resolve o ano
 * real da transação — faturas frequentemente listam compras de dezembro do
 * ano anterior numa fatura fechada em janeiro.
 */
function resolverData(dia: string, mes: string, anoReferencia: number, mesReferencia: number): string {
  const mesNum = Number(mes);
  const ano = mesNum > mesReferencia + 1 ? anoReferencia - 1 : anoReferencia;
  return `${ano}-${mes}-${dia}`;
}

/**
 * Extrai transações de texto de fatura Bradesco já convertido de PDF via
 * pdf-parse. Layout tabular ("DD/MM  DESCRIÇÃO  VALOR") é melhor esforço —
 * pdf-parse não preserva alinhamento de colunas de forma confiável, então
 * linhas que não batem no formato estrito ainda são tentadas de forma
 * permissiva e marcadas com confianca "baixa" para revisão manual na UI de
 * import, em vez de descartadas silenciosamente.
 */
export function parsePdfBradesco(
  texto: string,
  dataReferencia: Date,
): TransacaoBruta[] {
  const anoReferencia = dataReferencia.getUTCFullYear();
  const mesReferencia = dataReferencia.getUTCMonth() + 1;

  const linhas = texto
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const resultado: TransacaoBruta[] = [];

  for (const linha of linhas) {
    const estrita = linha.match(LINHA_ESTRITA);
    if (estrita) {
      const [, dataDdMm, descricao, valorBr] = estrita;
      const [dia, mes] = dataDdMm.split("/");
      resultado.push({
        data: resolverData(dia, mes, anoReferencia, mesReferencia),
        descricao: descricao.trim(),
        valor: valorBrParaNumero(valorBr),
        confianca: "alta",
      });
      continue;
    }

    const temData = linha.match(DATA_DDMM);
    const temValor = linha.match(VALOR_BR);
    if (temData && temValor) {
      const [, dia, mes] = temData;
      const descricao = linha
        .replace(DATA_DDMM, "")
        .replace(VALOR_BR, "")
        .trim();

      resultado.push({
        data: resolverData(dia, mes, anoReferencia, mesReferencia),
        descricao: descricao || "Descrição não reconhecida",
        valor: valorBrParaNumero(temValor[0]),
        confianca: "baixa",
      });
    }
  }

  return resultado;
}
