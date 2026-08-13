"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { NovoUsuarioDialog } from "@/components/novo-usuario-dialog";
import { EditarUsuarioDialog } from "@/components/editar-usuario-dialog";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: "ADMIN" | "CONSULTA";
  ativo: boolean;
};

const PERFIL_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  CONSULTA: "Consulta",
};

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetch("/api/usuarios");
      setUsuarios(await res.json());
    } catch {
      toast.error("Não foi possível carregar os usuários");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return (
    <div className="mx-auto max-w-2xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuários do sistema</h1>
          <p className="text-muted-foreground text-sm">
            Quem tem login no RIT — TI (Admin) ou recepção (Consulta).
          </p>
        </div>
        <NovoUsuarioDialog onCriado={carregar} />
      </div>

      {carregando ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : usuarios.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhum usuário cadastrado ainda.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {usuarios.map((u) => (
            <li key={u.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium">{u.nome}</p>
                <p className="text-muted-foreground text-xs">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">{PERFIL_LABEL[u.perfil]}</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    u.ativo ? "bg-muted" : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {u.ativo ? "Ativo" : "Inativo"}
                </span>
                <EditarUsuarioDialog usuarioId={u.id} dadosAtuais={u} onEditado={carregar} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
