import * as ofx from "node-ofx-parser";
import type { TransacaoBruta } from "./types";

type StmtTrn = {
  DTPOSTED?: string;
  TRNAMT?: string;
  MEMO?: string;
  NAME?: string;
};

function paraArray<T>(valor: T | T[] | undefined): T[] {
  if (!valor) return [];
  return Array.isArray(valor) ? valor : [valor];
}

function formatarDataOfx(dtposted: string): string | null {
  const match = dtposted.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  const [, ano, mes, dia] = match;
  return `${ano}-${mes}-${dia}`;
}

function encontrarTransacoes(ofxData: unknown): StmtTrn[] {
  const raiz = ofxData as {
    OFX?: {
      CREDITCARDMSGSRSV1?: {
        CCSTMTTRNRS?: {
          CCSTMTRS?: { BANKTRANLIST?: { STMTTRN?: StmtTrn | StmtTrn[] } };
        };
      };
      BANKMSGSRSV1?: {
        STMTTRNRS?: {
          STMTRS?: { BANKTRANLIST?: { STMTTRN?: StmtTrn | StmtTrn[] } };
        };
      };
    };
  };

  const doCartao =
    raiz.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST
      ?.STMTTRN;
  const daConta =
    raiz.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN;

  return [...paraArray(doCartao), ...paraArray(daConta)];
}

/**
 * Parseia um arquivo OFX de fatura/extrato (formato preferencial: mais
 * confiável que PDF por ser estruturado). Retorna as transações brutas,
 * sem aplicar regras de negócio nem categorização.
 */
export function parseOfx(conteudo: string): TransacaoBruta[] {
  const dados = ofx.parse(conteudo);
  const transacoes = encontrarTransacoes(dados);

  return transacoes
    .map((t): TransacaoBruta | null => {
      if (!t.DTPOSTED || !t.TRNAMT) return null;
      const data = formatarDataOfx(t.DTPOSTED);
      const valor = Number(t.TRNAMT);
      if (!data || Number.isNaN(valor)) return null;

      const descricao = (t.MEMO || t.NAME || "Sem descrição").trim();

      return { data, descricao, valor, confianca: "alta" };
    })
    .filter((t): t is TransacaoBruta => t !== null);
}
