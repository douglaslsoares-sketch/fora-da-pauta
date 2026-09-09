import { NextResponse } from "next/server";
import { generateText } from "ai";
import { z } from "zod";

import { sql } from "@/lib/interesses/db";

type InterpretRequest = {
  sessionId?: string;
  inputId?: string;
};

type CanonicalTopic = {
  slug: string;
  name: string;
  description: string | null;
};

type ConversationInput = {
  id: string;
  transcript: string;
  created_at: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    UUID_PATTERN.test(value)
  );
}

const interpretationSchema = z.object({
  summary: z
    .string()
    .min(1)
    .max(1500),

  needsClarification: z.boolean(),

  clarificationQuestion: z
    .string()
    .max(500)
    .nullable(),

  topics: z
    .array(
      z.object({
        slug: z
          .string()
          .min(1)
          .max(120),

        description: z
          .string()
          .min(1)
          .max(500),

        sourceInputId: z
          .string()
          .uuid(),

        sourceExcerpt: z
          .string()
          .min(1)
          .max(1000),
      }),
    )
    .max(20),
});

export async function POST(request: Request) {
  try {
    const body =
      (await request.json().catch(() => ({}))) as InterpretRequest;

    const sessionId = body.sessionId;
    const inputId = body.inputId;

    if (
      !validUuid(sessionId) ||
      !validUuid(inputId)
    ) {
      return NextResponse.json(
        {
          error:
            "Sessão ou entrada inválida.",
        },
        { status: 400 },
      );
    }

    /*
     * Primeiro confirmamos que a entrada atual pertence
     * à sessão e que a sessão ainda está ativa.
     */
    const currentInputRows = await sql`
      SELECT
        ui.id,
        ui.session_id,
        ui.transcript,
        ui.created_at,
        a.status
      FROM user_inputs ui
      JOIN audit_sessions a
        ON a.id = ui.session_id
      WHERE ui.id = ${inputId}::uuid
        AND ui.session_id = ${sessionId}::uuid
      LIMIT 1
    `;

    if (currentInputRows.length === 0) {
      return NextResponse.json(
        {
          error:
            "Entrada não encontrada para esta sessão.",
        },
        { status: 404 },
      );
    }

    const currentInput =
      currentInputRows[0] as {
        id: string;
        session_id: string;
        transcript: string;
        created_at: string;
        status: string;
      };

    if (currentInput.status !== "active") {
      return NextResponse.json(
        {
          error:
            "A sessão não está ativa.",
        },
        { status: 409 },
      );
    }

    /*
     * Recuperamos TODAS as falas do participante nesta
     * conversa até a entrada atual.
     *
     * Isso permite que um esclarecimento realmente
     * complemente a resposta anterior, em vez de ser
     * interpretado como uma fala isolada.
     */
    const conversationRows = await sql`
      SELECT
        id,
        transcript,
        created_at
      FROM user_inputs
      WHERE session_id = ${sessionId}::uuid
      ORDER BY created_at, id
    `;

    const allConversationInputs: ConversationInput[] =
      conversationRows.map((row) => ({
        id: String(row.id),
        transcript: String(row.transcript),
        created_at: String(row.created_at),
      }));

    /*
     * Não usamos created_at como limite SQL porque a conversão
     * PostgreSQL -> JavaScript pode perder frações de microssegundo
     * e excluir justamente a entrada atual.
     *
     * Em vez disso, recuperamos a sessão em ordem e cortamos
     * explicitamente no ID auditado desta chamada.
     */
    const currentInputIndex =
      allConversationInputs.findIndex(
        (item) => item.id === inputId,
      );

    if (currentInputIndex < 0) {
      return NextResponse.json(
        {
          error:
            "Não foi possível reconstruir a conversa auditada.",
        },
        { status: 409 },
      );
    }

    const conversationInputs =
      allConversationInputs.slice(
        0,
        currentInputIndex + 1,
      );

    /*
     * Perguntas de esclarecimento já persistidas também
     * entram no contexto. Assim a IA sabe o que estava
     * tentando esclarecer entre uma fala e outra.
     */
    const clarificationRows = await sql`
      SELECT
        user_input_id,
        clarification_question,
        created_at
      FROM interpretations
      WHERE session_id = ${sessionId}::uuid
        AND clarification_question IS NOT NULL
      ORDER BY created_at
    `;

    const clarificationByInput =
      new Map<string, string>();

    for (const row of clarificationRows) {
      clarificationByInput.set(
        String(row.user_input_id),
        String(row.clarification_question),
      );
    }

    const conversationById =
      new Map(
        conversationInputs.map((item) => [
          item.id,
          item.transcript,
        ]),
      );

    const conversationForPrompt =
      conversationInputs
        .map((item, index) => {
          const clarification =
            clarificationByInput.get(item.id);

          const parts = [
            `ENTRADA ${index + 1}`,
            `sourceInputId: ${item.id}`,
            `PARTICIPANTE: ${item.transcript}`,
          ];

          if (clarification) {
            parts.push(
              `PERGUNTA DE ESCLARECIMENTO FEITA DEPOIS DESTA ENTRADA: ${clarification}`,
            );
          }

          return parts.join("\n");
        })
        .join("\n\n");

    /*
     * Taxonomia canônica controlada pelo servidor.
     */
    const canonicalTopicRows = await sql`
      SELECT
        slug,
        name,
        description
      FROM aggregate_topics
      WHERE is_active IS TRUE
      ORDER BY name
    `;

    const canonicalTopics: CanonicalTopic[] =
      canonicalTopicRows.map((row) => ({
        slug: String(row.slug),
        name: String(row.name),
        description:
          row.description === null
            ? null
            : String(row.description),
      }));

    if (canonicalTopics.length === 0) {
      return NextResponse.json(
        {
          error:
            "A taxonomia de temas não está disponível neste momento.",
        },
        { status: 503 },
      );
    }

    const canonicalBySlug =
      new Map(
        canonicalTopics.map((topic) => [
          topic.slug,
          topic,
        ]),
      );

    const taxonomyForPrompt =
      canonicalTopics
        .map((topic) => {
          const description =
            topic.description?.trim();

          return description
            ? `- ${topic.slug} | ${topic.name}: ${description}`
            : `- ${topic.slug} | ${topic.name}`;
        })
        .join("\n");

    const result = await generateText({
      model:
        "inclusionai/ling-3.0-flash-sante-free",

      system: `
Você interpreta uma CONVERSA iniciada pela pergunta:

"O que você faria se fosse presidente?"

A conversa pode conter:
- uma resposta inicial;
- perguntas de esclarecimento;
- respostas posteriores que esclarecem o que a pessoa quis dizer.

Sua tarefa é interpretar a intenção DECLARADA pelo participante
considerando o conjunto da conversa até a entrada atual.

Uma resposta posterior pode esclarecer uma anterior.
Não descarte automaticamente o contexto anterior.

Sua função NÃO é avaliar a pessoa, inferir ideologia,
preferência partidária, candidato, intenção de voto,
personalidade ou qualquer característica não declarada.

Classifique usando EXCLUSIVAMENTE a taxonomia canônica fornecida.

REGRAS OBRIGATÓRIAS:

1. Não invente temas.
2. Não invente novos slugs.
3. Cada slug deve ser copiado EXATAMENTE da taxonomia.
4. Não amplie o sentido político da fala.
5. Não conclua apoio ou oposição a partido, candidato ou ideologia.
6. Cada tema precisa ter sourceInputId e sourceExcerpt.
7. sourceInputId deve ser exatamente o ID de UMA das entradas
   do participante fornecidas na conversa.
8. sourceExcerpt deve ser uma cópia LITERAL e CONTÍGUA de palavras
   presentes naquela entrada específica.
9. Se um tema depende da combinação de duas falas, escolha como
   evidência a fala que sustenta mais diretamente a classificação.
10. Se nenhuma fala sustentar claramente o tema, não o inclua.
11. O resumo deve refletir a intenção atual da pessoa ao longo
    da conversa, incluindo esclarecimentos relevantes.
12. Se ainda houver ambiguidade relevante, use
    needsClarification=true e faça UMA pergunta curta.
13. Se não precisar esclarecer, clarificationQuestion deve ser null.
14. Não faça pesquisa factual.
15. Não avalie se a proposta é boa, ruim, possível ou correta.
16. Não use rótulos ideológicos.
17. Não repita o mesmo slug.
18. Se nenhum tema representar com segurança o que foi dito,
    não force uma classificação.
`.trim(),

      prompt: `
TAXONOMIA CANÔNICA DISPONÍVEL:

${taxonomyForPrompt}

CONVERSA AUDITADA ATÉ AGORA:

${conversationForPrompt}

Interprete a intenção declarada do participante.

RETORNE SOMENTE JSON VÁLIDO.
Não use Markdown, crases ou texto antes/depois do JSON.

Use exatamente esta estrutura:
{
  "summary": "resumo fiel da intenção atual ao longo da conversa",
  "needsClarification": false,
  "clarificationQuestion": null,
  "topics": [
    {
      "slug": "slug-exato-da-taxonomia",
      "description": "descrição fiel do que a pessoa declarou",
      "sourceInputId": "uuid exato de uma entrada fornecida acima",
      "sourceExcerpt": "trecho literal e contínuo dessa entrada"
    }
  ]
}

Não inclua propriedades adicionais.
`.trim(),
    });

    const rawModelText =
      result.text.trim();

    const normalizedModelText =
      rawModelText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    let parsedModelOutput: unknown;

    try {
      parsedModelOutput =
        JSON.parse(normalizedModelText);
    } catch (parseError) {
      console.error(
        "Modelo retornou conteúdo que não é JSON válido:",
        parseError,
      );

      return NextResponse.json(
        {
          error:
            "A interpretação retornada pela IA não passou pela validação estrutural.",
        },
        { status: 502 },
      );
    }

    const validatedInterpretation =
      interpretationSchema.safeParse(
        parsedModelOutput,
      );

    if (
      !validatedInterpretation.success
    ) {
      console.error(
        "JSON retornado pela IA não corresponde ao schema esperado:",
        validatedInterpretation.error,
      );

      return NextResponse.json(
        {
          error:
            "A interpretação retornada pela IA não passou pela validação estrutural.",
        },
        { status: 502 },
      );
    }

    const interpretation =
      validatedInterpretation.data;

    /*
     * Defesa 1:
     * todos os slugs precisam existir na taxonomia ativa.
     */
    for (
      const topic
      of interpretation.topics
    ) {
      if (
        !canonicalBySlug.has(topic.slug)
      ) {
        console.error(
          "Modelo retornou slug fora da taxonomia:",
          topic.slug,
        );

        return NextResponse.json(
          {
            error:
              "A interpretação retornou um tema fora da taxonomia permitida.",
          },
          { status: 422 },
        );
      }
    }

    /*
     * Defesa 2:
     * sourceInputId precisa pertencer à conversa e o
     * sourceExcerpt precisa existir literalmente naquela
     * entrada específica.
     */
    for (
      const topic
      of interpretation.topics
    ) {
      const sourceTranscript =
        conversationById.get(
          topic.sourceInputId,
        );

      if (!sourceTranscript) {
        console.error(
          "Modelo retornou sourceInputId fora da conversa:",
          topic.sourceInputId,
        );

        return NextResponse.json(
          {
            error:
              "A interpretação não passou pela verificação da origem do trecho.",
          },
          { status: 422 },
        );
      }

      if (
        !sourceTranscript.includes(
          topic.sourceExcerpt,
        )
      ) {
        console.error(
          "Trecho não encontrado na entrada indicada:",
          topic.sourceInputId,
          topic.sourceExcerpt,
        );

        return NextResponse.json(
          {
            error:
              "A interpretação não passou pela verificação de fidelidade ao texto original.",
          },
          { status: 422 },
        );
      }
    }

    /*
     * Defesa 3:
     * um slug só aparece uma vez por interpretação.
     */
    const uniqueTopics =
      Array.from(
        new Map(
          interpretation.topics.map(
            (topic) => [
              topic.slug,
              topic,
            ],
          ),
        ).values(),
      );

    /*
     * Se o modelo não conseguiu classificar e também
     * esqueceu de pedir esclarecimento, o servidor
     * transforma isso em um pedido de esclarecimento.
     * Essa pergunta será PERSISTIDA no banco.
     */
    const effectiveNeedsClarification =
      uniqueTopics.length === 0
        ? true
        : interpretation.needsClarification;

    const effectiveClarificationQuestion =
      effectiveNeedsClarification
        ? (
            interpretation
              .clarificationQuestion
              ?.trim()
            ||
            "Você pode explicar um pouco mais o que gostaria de mudar?"
          )
        : null;

    const stored =
      await sql.begin(async (tx) => {
        const interpretationRows =
          await tx`
            INSERT INTO interpretations (
              session_id,
              user_input_id,
              summary,
              needs_clarification,
              clarification_question,
              confirmed_by_user
            )
            VALUES (
              ${sessionId}::uuid,
              ${inputId}::uuid,
              ${interpretation.summary},
              ${effectiveNeedsClarification},
              ${effectiveClarificationQuestion},
              false
            )
            RETURNING
              id,
              created_at,
              summary,
              needs_clarification,
              clarification_question
          `;

        const interpretationRow =
          interpretationRows[0] as {
            id: string;
            created_at: string;
            summary: string;
            needs_clarification: boolean;
            clarification_question:
              string | null;
          };

        const storedTopics: Array<{
          interpretedTopicId: string;
          name: string;
          slug: string;
          description: string;
          sourceInputId: string;
          sourceExcerpt: string;
        }> = [];

        for (
          const topic
          of uniqueTopics
        ) {
          const canonicalTopic =
            canonicalBySlug.get(
              topic.slug,
            );

          if (!canonicalTopic) {
            throw new Error(
              `CANONICAL_TOPIC_NOT_FOUND:${topic.slug}`,
            );
          }

          const topicRows =
            await tx`
              INSERT INTO interpreted_topics (
                interpretation_id,
                topic,
                description,
                source_user_input_id,
                source_excerpt,
                confidence
              )
              VALUES (
                ${interpretationRow.id}::uuid,
                ${canonicalTopic.name},
                ${topic.description},
                ${topic.sourceInputId}::uuid,
                ${topic.sourceExcerpt},
                NULL
              )
              RETURNING id
            `;

          storedTopics.push({
            interpretedTopicId:
              (
                topicRows[0] as {
                  id: string;
                }
              ).id,
            name:
              canonicalTopic.name,
            slug:
              canonicalTopic.slug,
            description:
              topic.description,
            sourceInputId:
              topic.sourceInputId,
            sourceExcerpt:
              topic.sourceExcerpt,
          });
        }

        return {
          interpretationId:
            interpretationRow.id,
          createdAt:
            interpretationRow.created_at,
          summary:
            interpretationRow.summary,
          needsClarification:
            interpretationRow
              .needs_clarification,
          clarificationQuestion:
            interpretationRow
              .clarification_question,
          topics:
            storedTopics,
        };
      });

    /*
     * Nada é contado aqui.
     * participant_topic_mentions só é alterado
     * depois da confirmação do usuário.
     */
    return NextResponse.json(
      stored,
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "Falha ao interpretar resposta da Campanha de Interesses:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível interpretar a resposta neste momento.",
      },
      { status: 500 },
    );
  }
}
