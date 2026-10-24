import { createHmac, timingSafeEqual } from "node:crypto";

/** Verifica assinaturas Svix/Resend usando o payload original e uma janela curta. */
export function verificarAssinaturaResend(
  payload: string, identificador: string | null,
  timestamp: string | null, assinaturas: string | null, segredo: string,
): boolean {
  if (!segredo.startsWith("whsec_") || !identificador || !timestamp || !assinaturas) return false;
  if (!/^[-A-Za-z0-9_]{8,200}$/.test(identificador) || !/^\d{10}$/.test(timestamp)) return false;
  const diff = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(diff) || diff > 300) return false;
  let chave: Buffer;
  try { chave = Buffer.from(segredo.slice(6), "base64"); }
  catch { return false; }
  if (chave.length < 16) return false;
  const digest = createHmac("sha256", chave)
    .update(`${identificador}.${timestamp}.${payload}`).digest();
  for (const item of assinaturas.split(" ")) {
    if (!item.startsWith("v1,")) continue;
    const codificada = item.slice(3);
    if (!/^[A-Za-z0-9+/=]+$/.test(codificada)) continue;
    const recebida = Buffer.from(codificada, "base64");
    if (recebida.length === digest.length && timingSafeEqual(recebida, digest)) return true;
  }
  return false;
}

/** E-mail por protocolo, sem confiança em assuntos ou dados de usuário. */
export function extrairProtocoloDestino(
  destinatarios: string[], dominio: string,
): string | null {
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(dominio)) return null;
  const encontrados = destinatarios.map(end => {
    const m = /^resposta\+([a-f0-9-]{36})@([a-z0-9.-]+)$/i.exec(end.trim().toLowerCase());
    return m && m[2] === dominio.toLowerCase() ? m[1] : null;
  }).filter((v): v is string => Boolean(v));
  return encontrados.length === 1 ? encontrados[0] : null;
}
