import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { tipoParaExterno } from "@/lib/transaction-format";
import { LancamentoForm } from "../lancamento-form";
import { atualizarLancamento, descartarLancamento } from "../actions";

export default async function EditarLancamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const transacao = await prisma.transaction.findUnique({ where: { id } });

  if (!transacao || transacao.status !== "ativo") notFound();

  const valoresIniciais = {
    tipo: tipoParaExterno(transacao.tipo),
    valor: Number(transacao.valor),
    categoria: transacao.categoria,
    fonte: transacao.fonte,
    descricao: transacao.descricao,
    data: transacao.data.toISOString().slice(0, 10),
    cobranca: transacao.cobranca?.toISOString().slice(0, 10) ?? null,
    confirmado: transacao.confirmado,
  };

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Editar lançamento</h1>
        <form action={descartarLancamento.bind(null, transacao.id)}>
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Descartar
          </button>
        </form>
      </div>
      <LancamentoForm
        action={atualizarLancamento.bind(null, transacao.id)}
        valoresIniciais={valoresIniciais}
        submitLabel="Atualizar"
      />
    </div>
  );
}
