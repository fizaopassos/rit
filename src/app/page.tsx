import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { listarEquipamentos } from "@/services/equipamentos.service";
import { listarColaboradores } from "@/services/colaboradores.service";
import { listarLinhas } from "@/services/linhas.service";
import { listarEmails } from "@/services/emails.service";
import { listarCondominios } from "@/services/condominios.service";
import { InicioCliente } from "./inicio-cliente";

export default async function Home() {
  await exigirSessao("ADMIN");
  const [equipamentos, colaboradores, linhas, emails, condominios] = await Promise.all([
    listarEquipamentos(),
    listarColaboradores(),
    listarLinhas(),
    listarEmails(),
    listarCondominios(),
  ]);

  return (
    <InicioCliente
      equipamentos={paraCliente(equipamentos)}
      colaboradores={paraCliente(colaboradores)}
      linhas={paraCliente(linhas)}
      emails={paraCliente(emails)}
      condominios={paraCliente(condominios)}
    />
  );
}
