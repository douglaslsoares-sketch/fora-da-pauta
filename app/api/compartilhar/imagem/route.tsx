import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

function limitar(s: string, max: number) {
  return s.trim().slice(0, max);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const titulo = limitar(params.get("titulo") || "HÁ MAIS PARA ENTENDER.", 100);
  const descricao = limitar(params.get("descricao") || "Como o jogo é jogado.", 140);
  const tipo = params.get("tipo") === "ficha" ? "FICHA POLÍTICA" : params.get("tipo") === "artigo" ? "ARTIGO" : "FORA DA PAUTA";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#101014", color: "#fff", display: "flex", flexDirection: "column", padding: "64px 76px", fontFamily: "sans-serif", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div style={{ width: 70, height: 70, display: "flex", justifyContent: "center", alignItems: "center", border: "6px solid #ffd700", borderRadius: "60% 15%", transform: "rotate(45deg)" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#ffd700" }} />
          </div>
          <span style={{ fontSize: 39, fontWeight: 900, letterSpacing: -1 }}>FORA DA PAUTA</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ color: "#FFD700", fontSize: 23, letterSpacing: 5, fontWeight: 800 }}>{tipo}</div>
          <div style={{ fontSize: titulo.length > 70 ? 52 : titulo.length > 42 ? 61 : 73, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, overflow: "hidden", maxHeight: 240 }}>{titulo}</div>
          <div style={{ fontSize: 29, color: "#f0e9df", lineHeight: 1.24, maxHeight: 78, overflow: "hidden" }}>{descricao}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "2px solid #494949", paddingTop: 26 }}>
          <span style={{ fontSize: 25, color: "#FFD700", fontWeight: 800 }}>HÁ MAIS PARA ENTENDER.</span>
          <span style={{ fontSize: 22, color: "#b9b9b9" }}>foradapauta.org</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
