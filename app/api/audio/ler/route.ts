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
  continua: boolean,
  estrutura: TipoBlocoLeitura[],
) {
  const mapa =
    estrutura.length
      ? estrutura
          .map(
            (tipo, indice) =>
              `${indice + 1}. ${nomeDoTipo(tipo)}`,
          )
          .join("\n")
      : "Estrutura não informada.";

  const contexto = `
${INSTRUCOES_BASE}

O conteúdo recebido está dividido em blocos separados
por uma linha em branco.

A ordem estrutural desses blocos é:

${mapa}

Essas descrições estruturais são apenas instruções.
NÃO fale nem anuncie os nomes "título", "subtítulo",
"parágrafo" ou "item".

Use a sequência acima apenas para decidir a pausa
e a articulação entre os blocos.
`.trim();

  if (continua) {
    return `
${contexto}

Este áudio ainda não é o final do texto completo.

Ao final, não faça entonação de despedida ou conclusão.
`.trim();
  }

  return `
${contexto}

Este é o último trecho do texto.

Somente no fim faça uma conclusão suave e discreta.
`.trim();
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
          voice: "marin",
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
