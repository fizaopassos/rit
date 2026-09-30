import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/empty-loading-states";

// Mostrado na navegação enquanto a página busca os dados no servidor
export default function Carregando() {
  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-8">
      <Skeleton className="mb-2 h-8 w-48" />
      <Skeleton className="mb-8 h-4 w-72 max-w-full" />
      <LoadingState rows={5} />
    </div>
  );
}
