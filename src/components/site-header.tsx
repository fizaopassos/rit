"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const LABEL_POR_SEGMENTO: Record<string, string> = {
  equipamentos: "Equipamentos",
  colaboradores: "Colaboradores",
  condominios: "Condomínios",
  linhas: "Linhas",
  modelos: "Modelos",
  marcas: "Marcas",
  emails: "Emails",
  usuarios: "Usuários",
};

function tituloDaRota(pathname: string): string {
  if (pathname === "/") return "Início";
  const primeiroSegmento = pathname.split("/")[1];
  const base = LABEL_POR_SEGMENTO[primeiroSegmento] ?? primeiroSegmento;
  const temId = pathname.split("/").length > 2;
  return temId ? `${base} / Detalhes` : base;
}

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [nome, setNome] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setNome(d.nome ?? null))
      .catch(() => {});
  }, []);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      toast.error("Erro ao sair");
    }
  }

  const iniciais = nome
    ? nome.split(" ").slice(0, 2).map((p) => p[0]).join("").toUpperCase()
    : "?";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="font-heading font-medium">
              {tituloDaRota(pathname)}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button className="hover:bg-muted flex items-center gap-2 rounded-md px-2 py-1.5 text-sm">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">{iniciais}</AvatarFallback>
                </Avatar>
                <span className="text-muted-foreground">{nome ?? "..."}</span>
              </button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
