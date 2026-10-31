import { ImageResponse } from "next/og";
import { createElement as h } from "react";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const div = (style: Record<string, string | number>, ...children: React.ReactNode[]) => h("div", { style }, ...children);
const span = (style: Record<string, string | number>, child: string) => h("span", { style }, child);

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const title = (p.get("titulo") || "HÁ MAIS PARA ENTENDER.").trim().slice(0, 95);
  const description = (p.get("descricao") || "Como o jogo é jogado.").trim().slice(0, 130);
  const kind = p.get("tipo") === "ficha" ? "FICHA POLÍTICA" : p.get("tipo") === "artigo" ? "ARTIGO" : "FORA DA PAUTA";
  const image = div({ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", backgroundColor: "#101014", color: "#ffffff", padding: "58px 70px", fontFamily: "sans-serif" },
    div({ display: "flex", alignItems: "center", gap: 22 },
      div({ width: 72, height: 54, border: "6px solid #FFD700", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" },
        div({ width: 27, height: 27, backgroundColor: "#FFD700", borderRadius: "50%" })
      ),
      span({ fontSize: 37, fontWeight: 900 }, "FORA DA PAUTA")
    ),
    div({ display: "flex", flexDirection: "column", gap: 18 },
      span({ fontSize: 22, letterSpacing: 3, color: "#FFD700", fontWeight: 800 }, kind),
      div({ display: "flex", fontSize: title.length > 65 ? 48 : title.length > 42 ? 56 : 67, lineHeight: 1.08, fontWeight: 900, maxHeight: 255, overflow: "hidden" }, title),
      div({ display: "flex", fontSize: 27, lineHeight: 1.2, color: "#E0E0E0", maxHeight: 96, overflow: "hidden" }, description)
    ),
    div({ display: "flex", justifyContent: "space-between", borderTop: "2px solid #555555", paddingTop: 24 },
      span({ fontSize: 23, fontWeight: 800, color: "#FFD700" }, "HÁ MAIS PARA ENTENDER."),
      span({ fontSize: 20, color: "#CCCCCC" }, "foradapauta.org")
    )
  );
  return new ImageResponse(image, { width: 1200, height: 630 });
}
