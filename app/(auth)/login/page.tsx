"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";

const estadoInicial: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    estadoInicial,
  );

  return (
    <main className="flex min-h-screen flex-1">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#1a2a1f] px-12 py-12 text-[#eef0ea] md:flex md:w-[44%]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent, transparent 34px, currentColor 34px, currentColor 35px)",
          }}
        />
        <span className="font-display text-2xl italic">Gastos</span>
        <div>
          <p className="font-display text-4xl italic leading-tight">
            Todo real,
            <br />
            registrado.
          </p>
          <p className="mt-4 max-w-xs text-sm text-[#c7d0c4]">
            Extrato pessoal — o mesmo lançamento que você faz pelo chat com o
            Claude, ou direto por aqui.
          </p>
        </div>
        <p className="tabular text-xs text-[#8fa08c]">Acesso restrito</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <form action={formAction} className="w-full max-w-sm">
          <h1 className="font-display text-2xl text-ink md:hidden">
            Gastos
          </h1>
          <p className="mt-1 mb-8 text-sm text-ink-muted">
            Entre com sua conta para continuar.
          </p>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-ink"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                className="w-full rounded-sm border border-line-strong bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-forest"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-ink"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-sm border border-line-strong bg-paper-raised px-3 py-2 text-sm text-ink outline-none focus:border-forest"
              />
            </div>
          </div>

          {state.error ? (
            <p className="mt-4 text-sm text-oxide">{state.error}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="mt-7 w-full rounded-sm bg-forest px-4 py-2.5 text-sm font-medium text-paper-raised transition-colors hover:bg-forest-strong disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
