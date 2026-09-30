import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const SESSION_DURATION = "8h";
// bcrypt de uma senha aleatória, com o mesmo custo das reais — só pra igualar
// o tempo do login quando o email não existe
const HASH_DESCARTAVEL = bcrypt.hashSync(crypto.randomUUID(), 10);

export type SessionPayload = {
  sub: string;
  nome: string;
  perfil: "ADMIN" | "CONSULTA";
};

export async function autenticar(email: string, senha: string) {
  const usuario = await prisma.appUsuario.findUnique({ where: { email } });

  // Compara com um hash descartável quando o email não existe, pra resposta
  // levar o mesmo tempo nos dois casos e não revelar quem tem conta.
  const senhaValida = await bcrypt.compare(senha, usuario?.senhaHash ?? HASH_DESCARTAVEL);
  if (!usuario || !usuario.ativo || !senhaValida) {
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

// Além do JWT, confere no banco se o usuário continua ativo e qual o perfil
// dele agora — desativar ou rebaixar alguém vale na hora, sem esperar o
// token de 8h expirar. Usado pelas páginas e rotas /api; o proxy.ts fica
// só com o JWT (primeira barreira, sem consulta ao banco).
export async function sessaoValida(token: string): Promise<SessionPayload | null> {
  const payload = await verificarSessao(token);
  if (!payload) return null;

  const usuario = await prisma.appUsuario.findUnique({
    where: { id: payload.sub },
    select: { nome: true, perfil: true, ativo: true },
  });
  if (!usuario?.ativo) return null;

  return { sub: payload.sub, nome: usuario.nome, perfil: usuario.perfil };
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