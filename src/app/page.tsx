import Link from "next/link";

const ATALHOS = [
  { href: "/equipamentos", titulo: "Equipamentos", desc: "Parque de equipamentos de TI" },
  { href: "/colaboradores", titulo: "Colaboradores", desc: "Quem recebe equipamento" },
  { href: "/condominios", titulo: "Condomínios", desc: "Locais administrados pela Retha" },
  { href: "/modelos", titulo: "Modelos", desc: "Catálogo reutilizável, vinculado à marca" },
  { href: "/marcas", titulo: "Marcas", desc: "Ex.: Dell, Motorola" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-1 text-2xl font-semibold">RIT — Retha Ativos</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Controle de ativos de tecnologia.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ATALHOS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
          >
            <p className="font-medium">{a.titulo}</p>
            <p className="text-muted-foreground text-xs">{a.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
