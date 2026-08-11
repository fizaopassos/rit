import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const SESSION_DURATION = "8h";

export type SessionPayload = {
  sub: string;
  nome: string;
  perfil: "ADMIN" | "CONSULTA";
};

export async function autenticar(email: string, senha: string) {
  const usuario = await prisma.appUsuario.findUnique({ where: { email } });

  if (!usuario || !usuario.ativo) {
    return null;
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
  if (!senhaValida) {
    return null;
  }

  const token = await new SignJWT({
    sub: usuario.id,
    nome: usuario.nome,
    perfil: usuario.perfil,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(JWT_SECRET);

  return { token, usuario };
}

export async function verificarSessao(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function criarUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
  perfil: "ADMIN" | "CONSULTA";
}) {
  const senhaHash = await bcrypt.hash(dados.senha, 10);

  return prisma.appUsuario.create({
    data: {
      nome: dados.nome,
      email: dados.email,
      senhaHash,
      perfil: dados.perfil,
    },
  });
}