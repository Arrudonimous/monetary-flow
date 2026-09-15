import { LancamentoForm } from "../lancamento-form";
import { criarLancamento } from "../actions";

export default function NovoLancamentoPage() {
  return (
    <div className="max-w-lg space-y-2">
      <p className="font-display text-2xl italic text-ink">
        Novo lançamento
      </p>
      <LancamentoForm action={criarLancamento} />
    </div>
  );
}
