"use client";

import { useTransition } from "react";
import { alternarConfirmado } from "./actions";

export function ToggleConfirmado({
  id,
  confirmado,
}: {
  id: string;
  confirmado: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      defaultChecked={confirmado}
      disabled={pending}
      onChange={(e) => {
        const novoValor = e.target.checked;
        startTransition(() => {
          alternarConfirmado(id, novoValor);
        });
      }}
    />
  );
}
