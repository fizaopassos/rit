import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Tom = "neutro" | "sucesso" | "aviso" | "perigo";

const TOM_CLASSES: Record<Tom, string> = {
  neutro: "bg-muted text-muted-foreground",
  sucesso: "bg-success/15 text-success border-success/30",
  aviso: "bg-warning/15 text-warning-foreground border-warning/40",
  perigo: "bg-destructive/10 text-destructive border-destructive/30",
};

export function StatusBadge({ label, tom = "neutro" }: { label: string; tom?: Tom }) {
  return (
    <Badge variant="outline" className={cn("rounded-full font-medium", TOM_CLASSES[tom])}>
      {label}
    </Badge>
  );
}