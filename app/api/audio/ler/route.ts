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
Fale em português brasileiro, com voz feminina adulta, segura e acolhedora.

Imagine que você está contando e explicando uma notícia a uma única
pessoa conhecida, numa conversa tranquila pelo telefone. Não apresente
um programa nem faça um discurso. Fale de igual para igual, com
espontaneidade, clareza e interesse genuíno pelo assunto.

A interpretação deve soar como uma resposta falada naturalmente,
e não como um texto sendo declamado. Use variações discretas e
orgânicas de entonação, pequenas pausas para dar sentido às frases
e um ritmo vivo, sem pressa excessiva. Não force uma voz doce,
infantilizada, sorridente ou teatral.

Em notícias políticas, transmita credibilidade e serenidade.
Não enfatize palavras para persuadir, não dramatize denúncias,
não celebre nem condene personagens. Mantenha neutralidade na
interpretação, mesmo quando o texto contiver críticas ou elogios.

Evite a cadência típica de telejornal, locução publicitária,
audiolivro solene, leitura escolar e voz robótica.
Não faça finais cantados nem aumente artificialmente o entusiasmo
nos títulos. Use o mesmo timbre, volume e proximidade em todo o áudio.

Títulos e subtítulos devem soar como partes da conversa,
não como manchetes anunciadas. Marque transições com pausas
naturais, geralmente breves; entre seções maiores, faça uma pausa
um pouco mais perceptível. Respeite a pontuação e a compreensão.

Leia fielmente o conteúdo recebido. Não acrescente saudações,
comentários, interjeições, opiniões ou explicações não escritas.
Não omita, não resuma, não reescreva e não invente informações.

Mantenha uma identidade vocal consistente entre todos os trechos
do mesmo artigo e entre artigos diferentes.
`.trim();;

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
