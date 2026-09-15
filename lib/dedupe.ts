import { createHash } from "crypto";

function normalizarDescricao(descricao: string): string {
  return descricao
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function formatarData(data: Date | string): string {
  const d = typeof data === "string" ? data : data.toISOString().slice(0, 10);
  return d.slice(0, 10);
}

/**
 * Hash determinístico usado para evitar duplicar o mesmo lançamento vindo de
 * import de fatura ou de sincronização com o vault. Mesma data + valor +
 * categoria + descrição normalizada => mesmo hash.
 */
export function gerarDedupeHash(input: {
  data: Date | string;
  valor: number | string;
  categoria: string;
  descricao: string;
}): string {
  const valorNormalizado = Number(input.valor).toFixed(2);
  const chave = [
    formatarData(input.data),
    valorNormalizado,
    input.categoria.trim().toLowerCase(),
    normalizarDescricao(input.descricao),
  ].join("|");

  return createHash("sha256").update(chave).digest("hex");
}
