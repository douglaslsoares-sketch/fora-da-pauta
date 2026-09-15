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
Fale em português brasileiro.

Leia todo o conteúdo como uma única passagem contínua,
gravada pela mesma pessoa, com o mesmo microfone,
o mesmo volume percebido, a mesma projeção e o mesmo
registro vocal.

Use uma voz jornalística informativa, clara, sóbria,
segura e natural.

Não use tom publicitário, chamada de telejornal,
documentário dramático, cerimônia ou discurso político.

Não mude de personagem, timbre ou intensidade quando
o texto passar de título para parágrafo, de parágrafo
para lista ou entre itens.

Não transforme títulos em chamadas.

Não abaixe a voz nos parágrafos.

Não aumente o entusiasmo nos títulos.

Não dê aos itens de lista uma voz diferente da narração
principal.

A diferença entre as partes do texto deve ser marcada
principalmente pela pausa e pela articulação, e não pela
mudança de voz.

As pausas abaixo são referências aproximadas.
Elas devem soar naturais, e não mecanicamente cronometradas.

Use apenas dois níveis principais de pausa editorial.

NÍVEL 1 — DIVISÃO EDITORIAL:
aproximadamente 0,55 a 0,65 segundo.

Use esse nível:
- entre o TÍTULO PRINCIPAL e o primeiro tópico;
- entre um SUBTÍTULO OU TÍTULO DE SEÇÃO e o primeiro parágrafo;
- antes de um novo tópico numerado;
- na passagem de uma seção editorial para outra.

Essas pausas devem soar equivalentes entre si.

A passagem:

título -> tópico

deve ter aproximadamente a mesma duração da passagem:

tópico -> primeiro parágrafo.

NÍVEL 2 — FLUXO NORMAL:
aproximadamente 0,30 a 0,40 segundo.

Use esse nível:
- entre parágrafos comuns;
- entre itens consecutivos de uma lista;
- na passagem entre um parágrafo e uma lista quando não houver
  mudança de seção;
- na passagem de uma lista de volta ao texto normal.

Evite variar arbitrariamente a duração das pausas.

Não faça uma divisão editorial com pausa muito curta em um ponto
e muito longa em outro ponto equivalente.

Em condições normais, não ultrapasse aproximadamente 0,7 segundo
entre dois blocos consecutivos.

Não emende um título ao tópico seguinte.

Não transforme uma mudança estrutural em silêncio prolongado.

Respeite naturalmente a pontuação interna de cada frase.

Preserve rigorosamente o conteúdo fornecido.
Não acrescente, não omita, não resuma e não reformule.
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
