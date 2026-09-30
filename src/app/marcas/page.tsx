import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { listarMarcas } from "@/services/marcas.service";
import { MarcasCliente } from "./marcas-cliente";

export default async function MarcasPage() {
  await exigirSessao("ADMIN");
  return <MarcasCliente marcas={paraCliente(await listarMarcas())} />;
}
