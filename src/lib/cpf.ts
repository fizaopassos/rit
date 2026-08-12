import crypto from "crypto";

// CPF_ENCRYPTION_KEY deve ser uma string hex de 64 caracteres (32 bytes).
// Gerar com: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
const KEY = process.env.CPF_ENCRYPTION_KEY
  ? Buffer.from(process.env.CPF_ENCRYPTION_KEY, "hex")
  : null;

function getKey(): Buffer {
  if (!KEY || KEY.length !== 32) {
    throw new Error(
      "CPF_ENCRYPTION_KEY ausente ou inválida no .env (precisa ser hex de 32 bytes)",
    );
  }
  return KEY;
}

// Formato armazenado: iv (12 bytes) + authTag (16 bytes) + ciphertext
export function cifrarCpf(cpfTextoPuro: string): Buffer {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(cpfTextoPuro, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]);
}

export function decifrarCpf(cpfCifrado: Buffer): string {
  const iv = cpfCifrado.subarray(0, 12);
  const authTag = cpfCifrado.subarray(12, 28);
  const ciphertext = cpfCifrado.subarray(28);

  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

// Mostra só os 3 últimos dígitos — usado na listagem, nunca o CPF completo
export function mascararCpf(cpfTextoPuro: string): string {
  const digitos = cpfTextoPuro.replace(/\D/g, "");
  const finais = digitos.slice(-3);
  return `***.***.**${finais.slice(0, 1)}-${finais.slice(1)}`;
}