import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  text: z.string().trim().min(1).max(300),
});

const identificationSchema = z.object({
  nome: z.string().trim().min(1).max(200).nullable(),
  cargo: z.string().trim().min(1).max(100).nullable(),
  partido: z.string().trim().min(1).max(100).nullable(),
  estado: z.string().trim().min(1).max(100).nullable(),
  municipio: z.string().trim().min(1).max(150).nullable(),
  needsClarification: z.boolean(),
  clarificationQuestion: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .nullable(),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const parsedRequest = requestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error:
            "Informe o nome do candidato ou uma descrição curta para a busca.",
        },
        { status: 400 },
      );
    }

    const { text } = parsedRequest.data;

    const result = await generateText({
      model: "inclusionai/ling-3.0-flash-sante-free",

      system: `
Você recebe uma frase escrita ou transcrita por voz de uma pessoa
que quer localizar um candidato em uma eleição brasileira.

Sua tarefa é SOMENTE extrair os dados declarados na frase.

Retorne exclusivamente JSON válido neste formato:

{
  "nome": string | null,
  "cargo": string | null,
  "partido": string | null,
  "estado": string | null,
  "municipio": string | null,
  "needsClarification": boolean,
  "clarificationQuestion": string | null
}

REGRAS OBRIGATÓRIAS:

1. Não pesquise e não use conhecimento externo sobre políticos.

2. Não complete partido, estado, município ou cargo com base na
identidade conhecida da pessoa.

3. Extraia somente informações presentes na frase.

4. Preserve o nome da forma como a pessoa o informou.
Exemplo:
"Lula presidente"
nome = "Lula"
cargo = "Presidente da República"

5. Você pode normalizar nomes de cargos quando forem explícitos:
- presidente -> Presidente da República
- governador -> Governador
- senador -> Senador
- deputado federal -> Deputado Federal
- deputado estadual -> Deputado Estadual
- deputado distrital -> Deputado Distrital
- prefeito -> Prefeito
- vereador -> Vereador

6. Quando um estado ou UF estiver explicitamente informado,
normalize para o nome completo do estado.
Exemplo:
PR -> Paraná
RJ -> Rio de Janeiro
SP -> São Paulo

7. Município só deve ser preenchido quando tiver sido informado.

8. Se um dado não tiver sido informado, use null.

9. needsClarification deve ser true somente quando não houver
um nome utilizável de candidato ou quando a própria frase
contiver ambiguidade evidente sobre qual nome deve ser usado.

10. Não considere a ausência de partido, cargo, estado ou município
como erro nesta etapa. A busca posterior decidirá se são necessários.

11. Se needsClarification for false,
clarificationQuestion deve ser null.

12. Se needsClarification for true, faça uma pergunta curta,
neutra e objetiva.

Não inclua comentários, explicações ou Markdown.
Retorne apenas o JSON.
`,

      prompt: `Texto informado pelo usuário:\n${text}`,
    });

    const normalizedText = result.text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    let parsedModelOutput: unknown;

    try {
      parsedModelOutput = JSON.parse(normalizedText);
    } catch (error) {
      console.error(
        "Identificador de candidato retornou JSON inválido:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Não foi possível interpretar os dados informados.",
        },
        { status: 502 },
      );
    }

    const validated =
      identificationSchema.safeParse(parsedModelOutput);

    if (!validated.success) {
      console.error(
        "Identificação do candidato não corresponde ao schema:",
        validated.error,
      );

      return NextResponse.json(
        {
          error:
            "A identificação retornada não passou pela validação.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    console.error(
      "Falha ao identificar dados do candidato:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível interpretar a busca neste momento.",
      },
      { status: 500 },
    );
  }
}