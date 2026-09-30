import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { listarUsuarios } from "@/services/usuarios.service";
import { UsuariosCliente } from "./usuarios-cliente";

export default async function UsuariosPage() {
  await exigirSessao("ADMIN");
  return <UsuariosCliente usuarios={paraCliente(await listarUsuarios())} />;
}
