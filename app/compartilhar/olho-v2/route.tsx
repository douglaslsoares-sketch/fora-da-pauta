import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const svg = await readFile(path.join(process.cwd(), "public/marca/eu-vigio-original.svg"), "utf8");
  const jpeg = svg.match(/data:image\/jpeg;base64,([^"]+)/)?.[1];
  if (!jpeg) return new Response("Imagem oficial do olho não encontrada", { status: 500 });
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", width: 920, height: 300, overflow: "hidden", justifyContent: "center" }}>
        <img src={`data:image/jpeg;base64,${jpeg}`} width={920} height={613} style={{ width: 920, height: 613, objectFit: "contain" }} alt="" />
      </div>
      <div style={{ display: "flex", marginTop: 24, color: "#fff", fontSize: 92, fontWeight: 800, letterSpacing: 4, textAlign: "center" }}>FORA DA PAUTA</div>
    </div>,
    { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
