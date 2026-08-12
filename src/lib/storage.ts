import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  keyFilename: process.env.GCS_KEY_FILE,
});

function getBucket() {
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("GCS_BUCKET_NAME não definido no .env");
  }
  return storage.bucket(bucketName);
}

export async function enviarArquivo(
  caminho: string,
  buffer: Buffer,
  contentType: string,
) {
  const bucket = getBucket();
  const file = bucket.file(caminho);
  await file.save(buffer, { contentType, resumable: false });
  return caminho;
}

// URL temporária — o bucket é privado, então nunca expomos um link permanente
export async function gerarUrlAssinada(caminho: string, minutos = 15) {
  const bucket = getBucket();
  const file = bucket.file(caminho);
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + minutos * 60 * 1000,
  });
  return url;
}