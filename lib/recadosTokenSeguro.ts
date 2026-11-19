import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function chave() {
  const segredo = process.env.FDP_RATE_LIMIT_SECRET;
  if (!segredo || segredo.length < 32) throw new Error("Segredo de proteção de recados indisponível.");
  return createHash("sha256").update("fdp:recados:token:v1\0" + segredo).digest();
}

export function protegerToken(token: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", chave(), iv);
  const cifrado = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return "enc:v1:" + Buffer.concat([iv, cipher.getAuthTag(), cifrado]).toString("base64");
}

export function lerToken(valor: unknown) {
  if (typeof valor !== "string") return null;
  // Compatibilidade com vínculos criados antes da proteção.
  if (/^[a-f0-9]{64}$/.test(valor)) return valor;
  if (!valor.startsWith("enc:v1:")) return null;
  try {
    const bytes = Buffer.from(valor.slice(7), "base64");
    if (bytes.length < 29) return null;
    const decipher = createDecipheriv("aes-256-gcm", chave(), bytes.subarray(0, 12));
    decipher.setAuthTag(bytes.subarray(12, 28));
    const token = Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8");
    return /^[a-f0-9]{64}$/.test(token) ? token : null;
  } catch { return null; }
}
