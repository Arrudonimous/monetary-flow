import { LancamentoForm } from "../lancamento-form";
import { criarLancamento } from "../actions";

export default function NovoLancamentoPage() {
  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-xl font-semibold">Novo lançamento</h1>
      <LancamentoForm action={criarLancamento} />
    </div>
  );
}
