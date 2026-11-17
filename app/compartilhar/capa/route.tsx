import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Capa de compartilhamento alinhada à apresentação atual da home. */
export async function GET() {
  return new ImageResponse(
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "flex-start",
      justifyContent: "center", width: "100%", height: "100%",
      padding: "72px 76px", backgroundColor: "#050505",
    }}>
      <div style={{
        display: "flex", color: "#ffffff", fontSize: 88,
        fontWeight: 900, letterSpacing: 1, whiteSpace: "nowrap",
      }}>FORA DA PAUTA</div>
      <div style={{ display: "flex", width: 1025, height: 18, marginTop: 10, backgroundColor: "#ffffff", transform: "skewX(-25deg)" }} />
      <div style={{ display: "flex", width: 515, height: 18, marginTop: 14, backgroundColor: "#FFD600", transform: "skewX(-25deg)" }} />
      <div style={{
        display: "flex", color: "#F4C533", fontSize: 29, fontWeight: 700,
        marginTop: 22,
      }}>Conhecer é importante. Entender é fundamental.</div>
      <div style={{
        display: "flex", color: "#ffffff", fontSize: 63, fontWeight: 850,
        marginTop: 48,
      }}>A desinformação aliena.</div>
      <div style={{
        display: "flex", color: "#F4C533", fontSize: 35, fontWeight: 700,
        lineHeight: 1.25, maxWidth: 1040, marginTop: 16,
      }}>Você pensa por si mesmo ou deixa que outros pensem por você?</div>
    </div>,
    {
      width: 1200, height: 630,
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
