import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Identidade oficial enviada: duas barras inclinadas, branca e amarela, sobre preto. */
export async function GET() {
  return new ImageResponse(
    <div style={{
      display: "flex", width: "100%", height: "100%",
      alignItems: "center", justifyContent: "center",
      backgroundColor: "#000000",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 52, width: 820 }}>
        <div style={{
          display: "flex", width: 820, height: 112,
          backgroundColor: "#ffffff",
          clipPath: "polygon(5.5% 0, 100% 0, 94.5% 100%, 0 100%)",
        }} />
        <div style={{
          display: "flex", width: 662, height: 112,
          backgroundColor: "#ffdf00",
          clipPath: "polygon(6.8% 0, 100% 0, 93.2% 100%, 0 100%)",
        }} />
      </div>
    </div>,
    {
      width: 1200, height: 630,
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
