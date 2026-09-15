import { formatarReal } from "@/lib/format";

/**
 * Valor monetário em mono tabular. Verde para entrada, tinta padrão para
 * saída normal, óxido para saída negativa (estorno) — cor carrega
 * significado real, não decoração.
 */
export function Amount({
  valor,
  tipo,
  className = "",
}: {
  valor: number;
  tipo: "Saída" | "Entrada";
  className?: string;
}) {
  const isEntrada = tipo === "Entrada";
  const isEstorno = tipo === "Saída" && valor < 0;
  const cor = isEntrada ? "text-forest" : isEstorno ? "text-oxide" : "text-ink";
  const sinal = isEntrada ? "+" : "";

  return (
    <span className={`tabular ${cor} ${className}`}>
      {sinal}
      {formatarReal(valor)}
    </span>
  );
}
