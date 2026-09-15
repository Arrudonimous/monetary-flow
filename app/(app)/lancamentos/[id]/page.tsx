import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { tipoParaExterno } from "@/lib/transaction-format";
import { Button } from "@/components/ui/Button";
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
    <div className="max-w-lg space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl italic text-ink">
          Editar lançamento
        </p>
        <form action={descartarLancamento.bind(null, transacao.id)}>
          <Button type="submit" variant="danger">
            Descartar
          </Button>
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
