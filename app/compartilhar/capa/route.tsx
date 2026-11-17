import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Prévia oficial: símbolo de duas barras, sem palavras, grande e centralizado. */
export async function GET() {
  return new ImageResponse(
    <div style={{
      display: "flex", width: "100%", height: "100%",
      alignItems: "center", justifyContent: "center",
      backgroundColor: "#000000",
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 32, width: 940 }}>
        <div style={{
          display: "flex", width: 940, height: 105,
          backgroundColor: "#ffffff",
          clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)",
        }} />
        <div style={{
          display: "flex", width: 680, height: 105,
          backgroundColor: "#ffdf00",
          clipPath: "polygon(6% 0, 100% 0, 94% 100%, 0 100%)",
        }} />
      </div>
    </div>,
    {
      width: 1200, height: 630,
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
