// Dados do Prisma (Date, Decimal) não podem ir direto como props pra Client
// Components. Passa pelo mesmo JSON que as rotas /api devolviam — datas e
// valores viram string — então os tipos das telas continuam os mesmos.
export function paraCliente<T>(dados: unknown): T {
  return JSON.parse(JSON.stringify(dados)) as T;
}
