import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { buscarEquipamento } from "@/services/alocacoes.service";
import { EquipamentoCliente } from "./equipamento-cliente";

export default async function EquipamentoPage({ params }: PageProps<"/equipamentos/[id]">) {
  await exigirSessao("ADMIN");
  const { id } = await params;
  const equipamento = await buscarEquipamento(id);
  if (!equipamento) notFound();

  return <EquipamentoCliente equipamento={paraCliente(equipamento)} />;
}
