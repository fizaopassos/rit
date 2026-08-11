// Uso: npx tsx scripts/debug-login.ts "email@retha.com.br" "senha-digitada"
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const [email, senha] = process.argv.slice(2);
  const usuario = await prisma.appUsuario.findUnique({ where: { email } });

  if (!usuario) {
    console.log(`Nenhum usuário encontrado com o email "${email}"`);
    return;
  }

  console.log("Usuário encontrado:", {
    nome: usuario.nome,
    email: usuario.email,
    ativo: usuario.ativo,
    perfil: usuario.perfil,
  });

  const bate = await bcrypt.compare(senha, usuario.senhaHash);
  console.log("Senha confere?", bate);
}

main().catch(console.error).finally(() => prisma.$disconnect());