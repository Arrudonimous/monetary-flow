/** Uma linha bruta extraída de um arquivo de fatura/extrato, antes de
 * qualquer regra de negócio, categorização ou dedupe. */
export type TransacaoBruta = {
  /** ISO yyyy-mm-dd */
  data: string;
  descricao: string;
  valor: number;
  /** Confiança da extração; "baixa" entra no preview marcada p/ revisão. */
  confianca: "alta" | "baixa";
};
