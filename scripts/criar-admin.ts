import { criarUsuario } from "../src/services/auth.service";
import { prisma } from "../src/lib/prisma";

async function main() {
  const [nome, email, senha] = process.argv.slice(2);

  if (!nome || !email || !senha) {
    console.error('Uso: npx tsx scripts/criar-admin.ts "Nome" "email@retha.com" "senha"');
    process.exit(1);
  }

  const usuario = await criarUsuario({ nome, email, senha, perfil: "ADMIN" });
  console.log(`Usuário Admin criado: ${usuario.nome} <${usuario.email}>`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());