import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { listarEquipamentos } from "@/services/equipamentos.service";
import { EquipamentosCliente } from "./equipamentos-cliente";

export default async function EquipamentosPage() {
  await exigirSessao("ADMIN");
  return <EquipamentosCliente equipamentos={paraCliente(await listarEquipamentos())} />;
}
