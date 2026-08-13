"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePerfil } from "@/lib/use-perfil";

const LINKS_ADMIN = [
  { href: "/", label: "Início" },
  { href: "/equipamentos", label: "Equipamentos" },
  { href: "/colaboradores", label: "Colaboradores" },
  { href: "/condominios", label: "Condomínios" },
  { href: "/linhas", label: "Linhas" },
  { href: "/modelos", label: "Modelos" },
  { href: "/marcas", label: "Marcas" },
  { href: "/emails", label: "Emails" },
  { href: "/usuarios", label: "Usuários" },
];

const LINKS_CONSULTA = [{ href: "/colaboradores", label: "Colaboradores" }];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const perfil = usePerfil();

  const links = perfil === "CONSULTA" ? LINKS_CONSULTA : LINKS_ADMIN;

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Erro ao sair");
    }
  }

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex max-w-4xl items-center gap-1 px-8 py-3">
        <span className="mr-4 font-semibold">RIT</span>
        {links.map((link) => {
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
        <Button variant="ghost" size="sm" className="ml-auto" onClick={handleLogout}>
          Sair
        </Button>
      </div>
    </nav>
  );
}