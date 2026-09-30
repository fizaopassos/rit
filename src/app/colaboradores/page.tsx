import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { listarColaboradoresParaPerfil } from "@/services/colaboradores.service";
import { ColaboradoresCliente } from "./colaboradores-cliente";

// Única página liberada pro perfil Consulta — que recebe só nome/telefone/email
export default async function ColaboradoresPage() {
  const { perfil } = await exigirSessao();
  const colaboradores = await listarColaboradoresParaPerfil(perfil);
  return <ColaboradoresCliente colaboradores={paraCliente(colaboradores)} perfil={perfil} />;
}
