import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { listarModelos } from "@/services/modelos.service";
import { ModelosCliente } from "./modelos-cliente";

export default async function ModelosPage() {
  await exigirSessao("ADMIN");
  return <ModelosCliente modelos={paraCliente(await listarModelos())} />;
}
