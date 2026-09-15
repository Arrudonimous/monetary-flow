import type { TransacaoBruta } from "@/lib/parsers/types";

const PADRAO_PAGAMENTO_FATURA =
  /pagto antecipado|pagamento efetuado|pagamento recebido|pgto\.? fatura/i;

const PADRAO_ENCARGO =
  /\biof\b|encargos? de rotativo|encargos? sobre parcelado|iof adic|rotativo\/atraso|juros/i;

const PADRAO_MECANICA_DIVIDA =
  /parc\.?\s*facil|parcelado facil|reversao de saldo|reversão de saldo/i;

export type TransacaoAposRegras = TransacaoBruta & {
  /** Força essa categoria (ex.: Encargos Financeiros), ignorando categorização automática. */
  categoriaForcada?: string;
};

/**
 * Aplica as regras de negócio aprendidas processando faturas Bradesco
 * manualmente: descarta linhas que não são gasto real (pagamento da própria
 * fatura, mecânica de reestruturação de dívida) e força a categoria de
 * encargos financeiros (IOF/juros/rotativo).
 */
export function aplicarRegrasDeNegocio(
  transacoes: TransacaoBruta[],
): TransacaoAposRegras[] {
  const resultado: TransacaoAposRegras[] = [];

  for (const t of transacoes) {
    if (PADRAO_PAGAMENTO_FATURA.test(t.descricao)) continue;
    if (PADRAO_MECANICA_DIVIDA.test(t.descricao)) continue;

    if (PADRAO_ENCARGO.test(t.descricao)) {
      resultado.push({ ...t, categoriaForcada: "Encargos Financeiros" });
      continue;
    }

    // Estorno/valor negativo: mantido como está — a categorização por
    // palavra-chave da descrição original ainda se aplica, o que já tende
    // a cair na mesma categoria da compra original.
    resultado.push(t);
  }

  return resultado;
}
