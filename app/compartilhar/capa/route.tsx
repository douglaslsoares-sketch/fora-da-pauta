import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Capa oficial compartilhada no WhatsApp, Telegram e demais redes.
 * Sem o símbolo antigo: somente nome e chamada editorial.
 */
export async function GET() {
  return new ImageResponse(
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%",
      padding: "68px",
      backgroundColor: "#080808",
    }}>
      <div style={{
        display: "flex",
        color: "#ffffff",
        fontSize: 94,
        fontWeight: 800,
        letterSpacing: 3,
        whiteSpace: "nowrap",
        textAlign: "center",
      }}>FORA DA PAUTA</div>
      <div style={{
        display: "flex",
        width: 84,
        height: 5,
        marginTop: 39,
        marginBottom: 42,
        backgroundColor: "#F4C533",
      }} />
      <div style={{
        display: "flex",
        maxWidth: 960,
        color: "#F4C533",
        fontSize: 56,
        fontWeight: 700,
        lineHeight: 1.15,
        textAlign: "center",
      }}>Existe muito mais por trás das notícias.</div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400" },
    },
  );
}
