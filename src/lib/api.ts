// fetch + json que falha quando a API responde erro (sessão expirada, 403,
// 500...). Sem isso, o corpo { erro } ia parar no estado da página como se
// fosse a lista, e o primeiro .map/.filter derrubava a tela.
export async function buscarJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.erro ?? `Erro ${res.status} ao carregar ${url}`);
  }
  return data as T;
}
