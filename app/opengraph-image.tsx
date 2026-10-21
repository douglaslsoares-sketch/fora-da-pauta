import { ImageResponse } from "next/og";

export const alt = "Fora da Pauta — Há mais para entender.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 76px",
          background: "#000000",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 54, fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 0.94 }}>
            <span>FORA</span><span>DA</span><span>PAUTA</span>
          </div>
          <div style={{ display: "flex", color: "#FFC400", fontSize: 20, fontWeight: 700, letterSpacing: "0.14em", textAlign: "right" }}>
            HÁ MAIS PARA ENTENDER.
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: "-0.045em" }}>
            Como o jogo é jogado.
          </div>
          <div style={{ fontSize: 32, color: "#FFC400" }}>
            Decisões que afetam a sua vida.
          </div>
          <div style={{ fontSize: 21, color: "#CCCCCC", marginTop: 10 }}>
            www.foradapauta.org
          </div>
        </div>
      </div>
    ),
    size,
  );
}
