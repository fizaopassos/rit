import Link from "next/link";
import { EmptyState } from "@/components/empty-loading-states";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-8">
      <EmptyState message="Registro não encontrado — ele pode ter sido removido ou o link está errado." />
      <Link href="/" className="text-primary text-sm underline underline-offset-2">
        Voltar para o início
      </Link>
    </div>
  );
}
