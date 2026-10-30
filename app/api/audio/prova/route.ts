import { createHash } from "node:crypto";
import { POST as gerarLeitura } from "@/app/api/audio/ler/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BRANCH_AUTORIZADA = "integracao/audio-telegram-voz-20261030";
const TEXTO_DE_TESTE =
  "No Fora da Pauta, a informação chega de pessoa para pessoa. " +
  "Com respeito, clareza e atenção, vamos entender juntos como as decisões políticas afetam a nossa vida.";

function permitido() {
  // Nunca habilitar este diagnóstico de geração paga em produção.
  return process.env.VERCEL_ENV === "preview" &&
    process.env.VERCEL_GIT_COMMIT_REF === BRANCH_AUTORIZADA;
}

async function obterAudio() {
  const request = new Request("https://preview.local/api/audio/ler", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      texto: TEXTO_DE_TESTE,
      continua: false,
      estrutura: ["paragrafo"],
    }),
  });
  return gerarLeitura(request);
}

export async function GET(request: Request) {
  if (!permitido()) {
    return Response.json({ error: "Indisponível." }, { status: 404 });
  }

  const acao = new URL(request.url).searchParams.get("acao");
  if (acao !== "verificar" && acao !== "ouvir") {
    return Response.json({
      pronto: true,
      modelo: "gpt-4o-mini-tts",
      voz: "marin",
      informacao: "Apenas esta prévia protegida oferece a prova da voz.",
      acoes: ["verificar", "ouvir"],
    }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const primeira = await obterAudio();
    if (!primeira.ok) {
      return Response.json({
        concluido: false,
        etapa: "gerar",
        httpStatus: primeira.status,
        detalhe: (await primeira.json().catch(() => ({})))?.error || "O serviço de voz não respondeu.",
      }, { status: 502, headers: { "Cache-Control": "no-store" } });
    }

    if (acao === "ouvir") {
      const arquivo = await primeira.arrayBuffer();
      return new Response(arquivo, {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": "inline; filename=fora-da-pauta-voz-acolhedora.mp3",
          "Cache-Control": "private, no-store",
          "X-FDP-Audio-Cache": primeira.headers.get("X-FDP-Audio-Cache") || "desconhecido",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const primeiraCache = primeira.headers.get("X-FDP-Audio-Cache") || "desconhecido";
    const arquivoInicial = Buffer.from(await primeira.arrayBuffer());
    const segunda = await obterAudio();
    if (!segunda.ok) {
      return Response.json({ concluido: false, etapa: "reutilizar", httpStatus: segunda.status },
        { status: 502, headers: { "Cache-Control": "no-store" } });
    }
    const segundaCache = segunda.headers.get("X-FDP-Audio-Cache") || "desconhecido";
    const arquivoReutilizado = Buffer.from(await segunda.arrayBuffer());
    const assinaturaMp3 =
      arquivoInicial.subarray(0, 3).toString("ascii") === "ID3" ||
      (arquivoInicial.length > 2 && arquivoInicial[0] === 0xff && (arquivoInicial[1] & 0xe0) === 0xe0);
    const valido =
      arquivoInicial.byteLength > 400 &&
      assinaturaMp3 &&
      arquivoInicial.equals(arquivoReutilizado) &&
      segundaCache === "reutilizado";

    return Response.json({
      comprovado: valido,
      modelo: "gpt-4o-mini-tts",
      voz: "marin",
      tamanhoBytes: arquivoInicial.byteLength,
      formatoMp3Reconhecido: assinaturaMp3,
      primeiraObtencao: primeiraCache,
      segundaObtencao: segundaCache,
      arquivosIdenticos: arquivoInicial.equals(arquivoReutilizado),
      sha256_12: createHash("sha256").update(arquivoInicial).digest("hex").slice(0, 12),
      escutaHumanaPendente: true,
      acaoParaOuvir: "ouvir",
    }, { status: valido ? 200 : 502, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Falha na prova de voz da preview:", error);
    return Response.json({ comprovado: false, erro: "Não foi possível concluir a prova de voz." },
      { status: 502, headers: { "Cache-Control": "no-store" } });
  }
}
