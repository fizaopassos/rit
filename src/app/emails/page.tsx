import { exigirSessao } from "@/lib/sessao";
import { paraCliente } from "@/lib/serializar";
import { listarEmails } from "@/services/emails.service";
import { EmailsCliente } from "./emails-cliente";

export default async function EmailsPage() {
  await exigirSessao("ADMIN");
  return <EmailsCliente emails={paraCliente(await listarEmails())} />;
}
