"use client";

import { useEffect, useState } from "react";

export function usePerfil() {
  const [perfil, setPerfil] = useState<"ADMIN" | "CONSULTA" | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setPerfil(d.perfil ?? null))
      .catch(() => setPerfil(null));
  }, []);

  return perfil;
}