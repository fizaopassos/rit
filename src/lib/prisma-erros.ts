import { Prisma } from "@prisma/client";

// true quando o erro é violação de @unique no campo dado (Prisma P2002)
export function violouUnico(err: unknown, campo: string): boolean {
  if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== "P2002") {
    return false;
  }
  const alvo = err.meta?.target;
  return Array.isArray(alvo) ? alvo.includes(campo) : alvo === campo;
}
