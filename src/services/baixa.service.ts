import { prisma } from "@/lib/prisma";
import { MotivoBaixa } from "@prisma/client";

export async function baixarEquipamento(
  equipamentoId: string,
  motivoBaixa: MotivoBaixa,
  observacaoBaixa?: string,
) {
  const equipamento = await prisma.equipamento.findUniqueOrThrow({
    where: { id: equipamentoId },
  });

  if (equipamento.status === "EM_USO") {
    throw new Error("Devolva o equipamento antes de dar baixa");
  }

  if (equipamento.status === "BAIXADO") {
    throw new Error("Equipamento já está baixado");
  }

  return prisma.equipamento.update({
    where: { id: equipamentoId },
    data: {
      status: "BAIXADO",
      dataBaixa: new Date(),
      motivoBaixa,
      observacaoBaixa,
    },
  });
}