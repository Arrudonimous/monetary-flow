"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/lancamentos", label: "Lançamentos" },
  { href: "/importar", label: "Importar" },
  { href: "/regras", label: "Regras" },
];

export function NavTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6 text-sm">
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`border-b-2 py-4 transition-colors ${
              active
                ? "border-forest text-ink font-medium"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
