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
      backgroundColor: "#141C2B",
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
        width: 860,
        height: 15,
        marginTop: 28,
        marginBottom: 28,
        backgroundColor: "#ffffff",
      }} />
      <div style={{
        display: "flex",
        maxWidth: 1040,
        color: "#F4C533",
        fontSize: 48,
        fontWeight: 700,
        lineHeight: 1.15,
        textAlign: "center",
      }}>Conhecer é importante. Entender é fundamental.</div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400" },
    },
  );
}
