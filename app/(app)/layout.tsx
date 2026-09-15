import { logoutAction } from "./actions";
import { NavTabs } from "./nav-tabs";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-line bg-paper-raised">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-between gap-6 py-4 md:py-0">
            <div className="flex items-center gap-10">
              <span className="font-display text-lg italic text-ink">
                Gastos
              </span>
              <div className="hidden md:block">
                <NavTabs />
              </div>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="shrink-0 text-sm text-ink-muted hover:text-ink"
              >
                Sair
              </button>
            </form>
          </div>
          <div className="overflow-x-auto md:hidden">
            <NavTabs />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
