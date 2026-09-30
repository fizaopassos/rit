"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-loading-states";
import { StatusBadge } from "@/components/status-badge";
import { NovoUsuarioDialog } from "@/components/novo-usuario-dialog";
import { EditarUsuarioDialog } from "@/components/editar-usuario-dialog";
import { PERFIL_LABEL } from "@/lib/rotulos";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: "ADMIN" | "CONSULTA";
  ativo: boolean;
};

export function UsuariosCliente({ usuarios }: { usuarios: Usuario[] }) {
  const router = useRouter();

  // Depois de criar/editar, refaz a página no servidor com os dados novos
  const carregar = useCallback(() => router.refresh(), [router]);

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-8">
      <PageHeader
        title="Usuários do sistema"
        description="Quem tem login no RIT — TI (Admin) ou recepção (Consulta)."
        action={<NovoUsuarioDialog onCriado={carregar} />}
      />

      {usuarios.length === 0 ? (
        <EmptyState message="Nenhum usuário cadastrado ainda." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-px" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuarios.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.nome}</div>
                    <div className="text-muted-foreground text-xs">{u.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{PERFIL_LABEL[u.perfil]}</TableCell>
                  <TableCell>
                    <StatusBadge label={u.ativo ? "Ativo" : "Inativo"} tom={u.ativo ? "sucesso" : "perigo"} />
                  </TableCell>
                  <TableCell>
                    <EditarUsuarioDialog usuarioId={u.id} dadosAtuais={u} onEditado={carregar} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
