import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { listarLinhas } from "@/services/linhas.service";
import { LinhasCliente } from "./linhas-cliente";

export default async function LinhasPage() {
  await exigirSessao("ADMIN");
  return <LinhasCliente linhas={paraCliente(await listarLinhas())} />;
}
