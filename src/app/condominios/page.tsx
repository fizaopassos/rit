import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { listarCondominios } from "@/services/condominios.service";
import { CondominiosCliente } from "./condominios-cliente";

export default async function CondominiosPage() {
  await exigirSessao("ADMIN");
  return <CondominiosCliente condominios={paraCliente(await listarCondominios())} />;
}
