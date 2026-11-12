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
Fale em português brasileiro. Leia fielmente o texto, sem acrescentar, omitir,
resumir, comentar ou reformular qualquer conteúdo.

Use uma voz adulta brasileira, acolhedora, clara e espontânea.
Imagine que você está explicando uma notícia importante a uma pessoa amiga,
com respeito e interesse verdadeiro. A conversa é próxima, sem intimidade
forçada, sem propaganda e sem tom de locutor de rádio.

A narração deve ter VIDA: varie suavemente a melodia das frases de acordo
com o significado. Nas perguntas, demonstre curiosidade genuína; em uma
constatação importante, dê ênfase discreta às palavras centrais; em uma
explicação, mantenha um tom interessado e esclarecedor. Evite repetir
o mesmo desenho melódico em todas as frases. Não exagere na emoção,
não dramatize nem use indignação artificial.

Preserve o timbre e a identidade da mesma pessoa em todo o áudio.
Não altere personagem, microfone ou volume entre títulos, parágrafos
e itens. A diferença de entonação deve vir do SENTIDO das frases,
não de um efeito teatral para cada tipo de bloco.

Respeite a pontuação: vírgulas pedem pequenas inflexões; pontos
encerram a ideia; perguntas devem soar como perguntas reais.

ATENÇÃO ESPECIAL ÀS PERGUNTAS: quando uma frase terminar em ponto
de interrogação, dê a ela a curva melódica de uma pergunta genuína,
como quem realmente quer despertar a curiosidade do ouvinte.
Exemplo de intenção (não leia este exemplo): "Você já reparou em
uma coisa?" deve soar interessado, leve e convidativo, jamais
como uma afirmação seca ou um título anunciado.

Nos parágrafos explicativos, conserve a MESMA suavidade e o mesmo
calor humano da abertura. Não endureça o timbre nem passe para
uma leitura burocrática depois de uma pergunta ou mudança de assunto.
Faça pequenas variações naturais de ênfase dentro de cada frase,
sem perder a unidade da voz.
Não emende o fim de um parágrafo ao começo do próximo.
Entre parágrafos comuns, faça uma pausa audível de aproximadamente
0,6 a 0,8 segundo. Antes de uma nova seção ou depois de um título,
faça uma pausa ligeiramente maior, de aproximadamente 1 segundo.
São referências flexíveis: priorize a naturalidade, sem silêncios
excessivos nem cadência artificial.

Mantenha ritmo conversacional fluido e compreensão confortável.
Não acelere a ponto de apagar pausas e não leia de modo arrastado.
Não use voz robótica, cerimonial, publicitária ou de telejornal.

Se o texto trouxer opiniões, acusações ou controvérsias, narre
com clareza e neutralidade expressiva: a voz não deve endossar,
ridicularizar ou acrescentar julgamento ao conteúdo.
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
