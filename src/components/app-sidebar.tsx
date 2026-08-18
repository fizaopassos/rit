"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Laptop,
  Users,
  Building2,
  Phone,
  Tag,
  Layers,
  Mail,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePerfil } from "@/lib/use-perfil";
import Image from "next/image";

const GRUPOS_ADMIN = [
  {
    label: null,
    items: [{ href: "/", label: "Início", icon: LayoutDashboard }],
  },
  {
    label: "Ativos",
    items: [
      { href: "/equipamentos", label: "Equipamentos", icon: Laptop },
      { href: "/modelos", label: "Modelos", icon: Layers },
      { href: "/marcas", label: "Marcas", icon: Tag },
    ],
  },
  {
    label: "Pessoas",
    items: [
      { href: "/colaboradores", label: "Colaboradores", icon: Users },
      { href: "/linhas", label: "Linhas", icon: Phone },
      { href: "/emails", label: "Emails", icon: Mail },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/condominios", label: "Condomínios", icon: Building2 },
      { href: "/usuarios", label: "Usuários", icon: UserCog },
    ],
  },
];

const GRUPOS_CONSULTA = [
  {
    label: null,
    items: [{ href: "/colaboradores", label: "Colaboradores", icon: Users }],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const perfil = usePerfil();
  const grupos = perfil === "CONSULTA" ? GRUPOS_CONSULTA : GRUPOS_ADMIN;

  return (
    <aside
      className={cn(
        "group fixed top-3 bottom-3 left-3 z-40 flex w-[68px] flex-col overflow-hidden",
        "rounded-2xl border border-sidebar-border bg-sidebar shadow-lg",
        "transition-[width] duration-200 ease-out hover:w-64",
      )}
    >
         <Link href="/" className="flex h-14 shrink-0 items-center gap-3 px-4">
        <div className="flex size-8 shrink-0 items-center justify-center">
          <Image src="/icon-mark.png" alt="Retha" width={32} height={32} className="rounded-lg" />
        </div>
        <div className="flex max-w-0 flex-col overflow-hidden leading-tight whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-[160px] group-hover:opacity-100">
          <span className="font-heading text-sidebar-foreground text-sm font-semibold tracking-tight">
            RIT
          </span>
          <span className="text-sidebar-foreground/50 text-[11px]">Retha Ativos</span>
        </div>
      </Link>

      <nav className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-3 py-2">
        {grupos.map((grupo, i) => (
          <div key={i}>
            {grupo.label && (
              <div className="text-sidebar-foreground/40 mb-1 h-4 max-w-0 overflow-hidden pl-2 text-[11px] font-medium tracking-wide whitespace-nowrap uppercase opacity-0 transition-all duration-200 group-hover:max-w-[160px] group-hover:opacity-100">
                {grupo.label}
              </div>
            )}
            <div className="space-y-0.5">
              {grupo.items.map((item) => {
                const ativo =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                      ativo
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    )}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-[160px] group-hover:opacity-100">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
