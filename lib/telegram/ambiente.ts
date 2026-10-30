// Configuração exclusiva do ensaio do Telegram. A produção conserva o fluxo antigo.
// Preview nunca deve usar o bot público sem um banco e um bot exclusivos.
export const BRANCH_ENSAIO_TELEGRAM = "integracao/audio-telegram-voz-20261030";

export function ambientePreview() {
  return process.env.VERCEL_ENV === "preview";
}

export function telegramLiberadoNesteAmbiente() {
  if (!ambientePreview()) return true;
  if (process.env.VERCEL_GIT_COMMIT_REF !== BRANCH_ENSAIO_TELEGRAM ||
      process.env.FDP_TELEGRAM_E2E_READY !== "isolated" ||
      !process.env.FDP_TELEGRAM_TEST_DATABASE_URL ||
      !process.env.FDP_TELEGRAM_TEST_BOT_TOKEN ||
      !process.env.FDP_TELEGRAM_TEST_WEBHOOK_SECRET) return false;
  const bot = process.env.FDP_TELEGRAM_TEST_BOT_USERNAME?.trim() ?? "";
  if (!/^[A-Za-z][A-Za-z0-9_]{3,30}bot$/i.test(bot)) return false;
  const host = process.env.VERCEL_BRANCH_URL?.trim() ?? "";
  return /^[-a-z0-9]+\.vercel\.app$/i.test(host);
}

export function nomeBotTelegram() {
  if (ambientePreview()) return process.env.FDP_TELEGRAM_TEST_BOT_USERNAME?.trim() ?? "";
  return process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.trim().replace(/^@/, "") ||
    "ForaDaPautaAcompanhaBot";
}

export function tokenBotTelegram() {
  return ambientePreview()
    ? process.env.FDP_TELEGRAM_TEST_BOT_TOKEN?.trim()
    : process.env.TELEGRAM_BOT_TOKEN?.trim();
}

export function segredoWebhookTelegram() {
  return ambientePreview()
    ? process.env.FDP_TELEGRAM_TEST_WEBHOOK_SECRET?.trim()
    : process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
}

export function origemRetornoTelegram() {
  if (!ambientePreview()) return "https://www.foradapauta.org";
  if (!telegramLiberadoNesteAmbiente()) throw new Error("PREVIEW_TELEGRAM_NOT_READY");
  return `https://${process.env.VERCEL_BRANCH_URL}`;
}
