import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Envia o visitante diretamente à instalação oficial adequada ao aparelho.
 * No Android, preserva o fluxo aprovado pela Play Store.
 */
export function GET(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  let destino = "https://telegram.org/apps";

  if (/android/i.test(userAgent)) {
    destino = "https://play.google.com/store/apps/details?id=org.telegram.messenger";
  } else if (/iphone|ipad|ipod/i.test(userAgent)) {
    destino = "https://apps.apple.com/br/app/telegram-messenger/id686449807";
  } else if (/windows|macintosh|mac os x|linux|cros/i.test(userAgent)) {
    destino = "https://desktop.telegram.org/";
  }

  const resposta = NextResponse.redirect(destino, 307);
  resposta.headers.set("Cache-Control", "private, no-store");
  resposta.headers.set("Referrer-Policy", "no-referrer");
  return resposta;
}
