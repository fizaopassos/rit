// Limite de tentativas de login em memória — o Rit roda num processo só
// (pm2 fork), então não precisa de Redis. Reiniciar o app zera os contadores.
//
// A chave principal é o email: o nginx hoje não repassa o IP real, então todo
// acesso chega como 127.0.0.1 e um limite por IP bloquearia todo mundo junto.
// O limite por IP só é aplicado quando X-Forwarded-For/X-Real-IP vier preenchido.

const JANELA_MS = 15 * 60 * 1000;
const MAX_POR_EMAIL = 5;
const MAX_POR_IP = 20;

const falhas = new Map<string, { quantidade: number; expiraEm: number }>();

function limparExpiradas(agora: number) {
  for (const [chave, registro] of falhas) {
    if (registro.expiraEm <= agora) falhas.delete(chave);
  }
}

function chaves(email: string, ip: string | null) {
  const lista: [string, number][] = [[`email:${email.trim().toLowerCase()}`, MAX_POR_EMAIL]];
  if (ip) lista.push([`ip:${ip}`, MAX_POR_IP]);
  return lista;
}

// Minutos até liberar, ou null se pode tentar
export function loginBloqueado(email: string, ip: string | null): number | null {
  const agora = Date.now();
  limparExpiradas(agora);
  for (const [chave, maximo] of chaves(email, ip)) {
    const registro = falhas.get(chave);
    if (registro && registro.quantidade >= maximo) {
      return Math.ceil((registro.expiraEm - agora) / 60000);
    }
  }
  return null;
}

export function registrarFalhaLogin(email: string, ip: string | null) {
  const agora = Date.now();
  for (const [chave] of chaves(email, ip)) {
    const registro = falhas.get(chave);
    if (registro && registro.expiraEm > agora) {
      registro.quantidade += 1;
    } else {
      falhas.set(chave, { quantidade: 1, expiraEm: agora + JANELA_MS });
    }
  }
}

export function limparFalhasLogin(email: string) {
  falhas.delete(`email:${email.trim().toLowerCase()}`);
}
