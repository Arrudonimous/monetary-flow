export function formatarReal(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Formata uma data já em UTC-midnight (como as `data`/`cobranca` do banco) sem deslocar de fuso. */
export function formatarDataBR(data: Date | string): string {
  const iso = typeof data === "string" ? data : data.toISOString();
  const [ano, mes, dia] = iso.slice(0, 10).split("-");
  return `${dia}/${mes}/${ano}`;
}
