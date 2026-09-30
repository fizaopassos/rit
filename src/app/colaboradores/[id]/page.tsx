import { notFound } from "next/navigation";
import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { buscarColaborador } from "@/services/colaboradores.service";
import { ColaboradorCliente } from "./colaborador-cliente";

export default async function ColaboradorPage({ params }: PageProps<"/colaboradores/[id]">) {
  await exigirSessao("ADMIN");
  const { id } = await params;
  const colaborador = await buscarColaborador(id);
  if (!colaborador) notFound();

  return <ColaboradorCliente colaborador={paraCliente(colaborador)} />;
}
