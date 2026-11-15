import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Marca completa na mensagem de confirmação de inscrição.
 * Mantida separada da capa editorial de compartilhamento.
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
      backgroundColor: "#000000",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        width: 1000,
        alignItems: "stretch",
        justifyContent: "center",
      }}>
        <div style={{
          display: "flex",
          color: "#FFFFFF",
          fontSize: 104,
          fontWeight: 900,
          letterSpacing: -1,
          textAlign: "center",
          whiteSpace: "nowrap",
          justifyContent: "center",
          marginBottom: 28,
        }}>FORA DA PAUTA</div>
        <svg width="1000" height="145" viewBox="0 0 1000 145" xmlns="http://www.w3.org/2000/svg">
          <path d="M 12 10 H 995 L 965 50 H 0 Z" fill="#FFFFFF" />
          <path d="M 12 79 H 516 L 487 119 H 0 Z" fill="#FFE000" />
        </svg>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=3600" },
    },
  );
}
