"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/equipamentos", label: "Equipamentos" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/condominios", label: "Condomínios" },
  { href: "/modelos", label: "Modelos" },
  { href: "/marcas", label: "Marcas" },
  { href: "/linhas", label: "Linhas" }
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center gap-1 px-8 py-3">
        <span className="mr-4 font-semibold">RIT</span>
        {LINKS.map((link) => {
          const ativo =
            link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                ativo
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}