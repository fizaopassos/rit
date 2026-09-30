import { NextResponse } from "next/server";

// Erro de regra de negócio ("Devolva o equipamento antes de dar baixa") —
// a mensagem é escrita pra ser mostrada ao usuário. Qualquer outro erro
// (Prisma, rede, bug) pode carregar detalhe interno e não sai da API.
export class ErroNegocio extends Error {}

export function respostaDeErro(err: unknown, padrao: string) {
  if (err instanceof ErroNegocio) {
    return NextResponse.json({ erro: err.message }, { status: 409 });
  }
  console.error(padrao, err);
  return NextResponse.json({ erro: padrao }, { status: 500 });
}
