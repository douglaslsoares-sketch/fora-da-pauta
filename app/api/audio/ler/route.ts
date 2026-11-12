export const runtime = "nodejs";

const LIMITE_TEXTO = 4000;

type TipoBlocoLeitura =
  | "titulo"
  | "subtitulo"
  | "paragrafo"
  | "item";

const TIPOS_VALIDOS =
  new Set<TipoBlocoLeitura>([
    "titulo",
    "subtitulo",
    "paragrafo",
    "item",
  ]);

function normalizarEstrutura(
  valor: unknown,
): TipoBlocoLeitura[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.filter(
    (
      item,
    ): item is TipoBlocoLeitura =>
      typeof item === "string" &&
      TIPOS_VALIDOS.has(
        item as TipoBlocoLeitura,
      ),
  );
}

function nomeDoTipo(
  tipo: TipoBlocoLeitura,
) {
  switch (tipo) {
    case "titulo":
      return "TÍTULO PRINCIPAL";

    case "subtitulo":
      return "SUBTÍTULO OU TÍTULO DE SEÇÃO";

    case "item":
      return "ITEM DE LISTA";

    default:
      return "PARÁGRAFO";
  }
}

const INSTRUCOES_BASE = `
Leia o texto exatamente como está escrito, em português brasileiro,
sem acrescentar, omitir ou reformular palavras.

Fale com voz adulta, tranquila, clara e próxima, como alguém que
conversa naturalmente com outra pessoa. Mantenha o mesmo timbre,
volume e maneira de falar ao longo de toda a leitura.

Siga a pontuação e o sentido normal das frases. Perguntas devem
soar como perguntas, sem ênfase exagerada. Evite teatralidade,
mudanças bruscas de tom, melodias artificiais e estilo de locutor.

Faça pausas naturais entre frases e parágrafos. Respeite as
separações entre títulos e seções, sem alongar as palavras.
Não anuncie nem descreva a estrutura do texto.

Mantenha uma postura informativa e equilibrada, sem acrescentar
emoção ou julgamento que não estejam no conteúdo.
`.trim();

function criarInstrucoes(
  _continua: boolean,
  _estrutura: TipoBlocoLeitura[],
) {
  // Mesmas instruções em todos os trechos: evita mudanças de
  // personagem ou estilo entre gerações independentes.
  return INSTRUCOES_BASE;
}

export async function POST(
  request: Request,
) {
  const apiKey =
    process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return Response.json(
      {
        error:
          "A leitura neural ainda não está configurada no servidor.",
      },
      {
        status: 503,
      },
    );
  }

  try {
    const body =
      (await request.json()) as {
        texto?: unknown;
        continua?: unknown;
        estrutura?: unknown;
        voz?: unknown;
      };

    const texto =
      typeof body.texto === "string"
        ? body.texto.trim()
        : "";

    const continua =
      body.continua === true;

    const estrutura =
      normalizarEstrutura(
        body.estrutura,
      );

    if (!texto) {
      return Response.json(
        {
          error:
            "Nenhum texto foi informado para leitura.",
        },
        {
          status: 400,
        },
      );
    }

    if (texto.length > LIMITE_TEXTO) {
      return Response.json(
        {
          error:
            "O trecho de leitura ultrapassa o limite permitido.",
        },
        {
          status: 400,
        },
      );
    }

    const vozesTeste = new Set(["marin", "nova", "onyx", "echo"]);
    const voz =
      typeof body.voz === "string" && vozesTeste.has(body.voz)
        ? body.voz
        : "marin";

    const resposta = await fetch(
      "https://api.openai.com/v1/audio/speech",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${apiKey}`,
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          model: "gpt-4o-mini-tts",
          voice: voz,
          input: texto,
          instructions:
            criarInstrucoes(
              continua,
              estrutura,
            ),
          response_format: "mp3",
          speed: 1,
        }),
      },
    );

    if (!resposta.ok) {
      const detalhe =
        await resposta.text();

      console.error(
        "Falha ao gerar leitura neural:",
        resposta.status,
        detalhe,
      );

      return Response.json(
        {
          error:
            "Não foi possível preparar a leitura em áudio.",
        },
        {
          status: 502,
        },
      );
    }

    if (!resposta.body) {
      return Response.json(
        {
          error:
            "A resposta de áudio veio vazia.",
        },
        {
          status: 502,
        },
      );
    }

    return new Response(
      resposta.body,
      {
        status: 200,

        headers: {
          "Content-Type":
            "audio/mpeg",
          "Cache-Control":
            "private, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Erro na rota de leitura neural:",
      error,
    );

    return Response.json(
      {
        error:
          "Não foi possível preparar a leitura em áudio.",
      },
      {
        status: 500,
      },
    );
  }
}
