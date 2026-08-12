// Node tipa Buffer/Uint8Array como genérico sobre ArrayBufferLike (que inclui
// SharedArrayBuffer), o que o TypeScript recente não aceita mais como BodyInit
// do NextResponse. Copiar pra um ArrayBuffer "puro" resolve de vez.
export function paraArrayBuffer(dados: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(dados.byteLength);
  new Uint8Array(buffer).set(dados);
  return buffer;
}