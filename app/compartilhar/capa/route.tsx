import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Capa de compartilhamento: somente a logomarca oficial, sobre fundo preto. */
export async function GET() {
  const logoUrl = new URL("/marca/fora-da-pauta-logo-oficial.svg", "https://www.foradapauta.org");
  const logoResposta = await fetch(logoUrl, { cache: "no-store" });
  if (!logoResposta.ok) {
    return new Response("Logomarca indisponível", { status: 502 });
  }
  const svg = await logoResposta.text();
  const logo = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  return new ImageResponse(
    <div style={{
      display: "flex", width: "100%", height: "100%",
      alignItems: "center", justifyContent: "center",
      backgroundColor: "#000000",
    }}>
      <img src={logo} alt="FORA DA PAUTA" width={1080} height={268} />
    </div>,
    {
      width: 1200, height: 630,
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
