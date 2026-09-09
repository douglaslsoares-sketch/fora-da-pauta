import { NextResponse } from "next/server";
import { sql } from "@/lib/interesses/db";

type ConfirmedTopic = {
  interpretedTopicId?: string;
};

type ConfirmRequest = {
  sessionId?: string;
  interpretationId?: string;
  topics?: ConfirmedTopic[];
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    UUID_PATTERN.test(value)
  );
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}


export async function POST(request: Request) {
  try {
    const body =
      (await request.json().catch(() => ({}))) as ConfirmRequest;

    const sessionId = body.sessionId;
    const interpretationId = body.interpretationId;
    const topics = body.topics;

    if (
      !validUuid(sessionId) ||
      !validUuid(interpretationId)
    ) {
      return NextResponse.json(
        {
          error: "Sessão ou interpretação inválida.",
        },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(topics) ||
      topics.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "É necessário confirmar pelo menos um tema.",
        },
        { status: 400 },
      );
    }

    if (topics.length > 50) {
      return NextResponse.json(
        {
          error:
            "Quantidade de temas acima do limite permitido.",
        },
        { status: 400 },
      );
    }

    for (const topic of topics) {
      if (!validUuid(topic.interpretedTopicId)) {
        return NextResponse.json(
          {
            error:
              "Há um tema confirmado com dados inválidos.",
          },
          { status: 400 },
        );
      }
    }

    const result = await sql.begin(async (tx) => {
      const sessionRows = await tx`
        SELECT
          id,
          participant_id
        FROM audit_sessions
        WHERE id = ${sessionId}::uuid
        FOR UPDATE
      `;

      if (sessionRows.length === 0) {
        throw new Error("SESSION_NOT_FOUND");
      }

      const session = sessionRows[0] as {
        id: string;
        participant_id: string | null;
      };

      if (!session.participant_id) {
        throw new Error("SESSION_WITHOUT_PARTICIPANT");
      }

      const interpretationRows = await tx`
        SELECT id
        FROM interpretations
        WHERE id = ${interpretationId}::uuid
          AND session_id = ${sessionId}::uuid
        FOR UPDATE
      `;

      if (interpretationRows.length === 0) {
        throw new Error("INTERPRETATION_NOT_FOUND");
      }

      const registeredTopics: Array<{
        slug: string;
        name: string;
        countedNow: boolean;
      }> = [];

      for (const topic of topics) {
        const interpretedTopicId =
          topic.interpretedTopicId as string;

        const interpretedTopicRows = await tx`
          SELECT
            id,
            topic
          FROM interpreted_topics
          WHERE id = ${interpretedTopicId}::uuid
            AND interpretation_id = ${interpretationId}::uuid
        `;

        if (interpretedTopicRows.length === 0) {
          throw new Error(
            `INTERPRETED_TOPIC_NOT_FOUND:${interpretedTopicId}`,
          );
        }

        const interpretedTopic =
          interpretedTopicRows[0] as {
            id: string;
            topic: string;
          };

        const canonicalSlug =
          slugify(interpretedTopic.topic);

        if (!canonicalSlug) {
          throw new Error(
            "AGGREGATE_TOPIC_NOT_FOUND:empty-slug",
          );
        }

        /*
         * A taxonomia canônica é controlada pelo servidor.
         *
         * O cliente NÃO escolhe o identificador canônico.
         * O servidor deriva um slug estável do tema
         * interpretado e resolve o tema canônico ativo
         * diretamente ou por alias controlado no banco.
         */
        const aggregateRows = await tx`
          SELECT
            at.id,
            at.slug,
            at.name
          FROM aggregate_topics at
          WHERE at.is_active IS TRUE
            AND (
              at.slug = ${canonicalSlug}
              OR at.id = (
                SELECT ata.aggregate_topic_id
                FROM aggregate_topic_aliases ata
                WHERE ata.alias_slug = ${canonicalSlug}
                LIMIT 1
              )
            )
          ORDER BY
            CASE
              WHEN at.slug = ${canonicalSlug}
                THEN 0
              ELSE 1
            END
          LIMIT 1
        `;

        const aggregateTopic = aggregateRows[0] as
          | {
              id: string;
              slug: string;
              name: string;
            }
          | undefined;

        if (!aggregateTopic) {
          throw new Error(
            `AGGREGATE_TOPIC_NOT_FOUND:${canonicalSlug}`,
          );
        }

        /*
         * O INSERT abaixo também torna a confirmação
         * idempotente.
         *
         * Se a MESMA confirmação for reenviada,
         * o mapping já existe e a menção não é registrada
         * novamente.
         */
        const mappingRows = await tx`
          INSERT INTO interpreted_topic_mappings (
            interpreted_topic_id,
            aggregate_topic_id,
            mapping_confidence,
            mapping_method
          )
          VALUES (
            ${interpretedTopicId}::uuid,
            ${aggregateTopic.id}::uuid,
            1,
            'rule'
          )
          ON CONFLICT (
            interpreted_topic_id,
            aggregate_topic_id
          )
          DO NOTHING
          RETURNING id
        `;

        const countedNow = mappingRows.length === 1;

        if (countedNow) {
          await tx`
            SELECT register_participant_topic_mention(
              ${session.participant_id}::uuid,
              ${aggregateTopic.id}::uuid,
              ${interpretedTopicId}::uuid,
              ${sessionId}::uuid,
              now()
            )
          `;
        }

        registeredTopics.push({
          slug: aggregateTopic.slug,
          name: aggregateTopic.name,
          countedNow,
        });
      }

      /*
       * Só marcamos como confirmada depois que TODOS
       * os temas passaram pelas validações.
       *
       * Como tudo ocorre na mesma transação, qualquer
       * erro reverte a operação inteira.
       */
      await tx`
        UPDATE interpretations
        SET
          confirmed_by_user = true,
          confirmed_at = COALESCE(
            confirmed_at,
            now()
          )
        WHERE id = ${interpretationId}::uuid
          AND session_id = ${sessionId}::uuid
      `;

      return registeredTopics;
    });

    return NextResponse.json(
      {
        confirmed: true,
        topics: result,
      },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "UNKNOWN_ERROR";

    if (message === "SESSION_NOT_FOUND") {
      return NextResponse.json(
        { error: "Sessão não encontrada." },
        { status: 404 },
      );
    }

    if (message === "SESSION_WITHOUT_PARTICIPANT") {
      return NextResponse.json(
        {
          error:
            "A sessão não possui participante pseudonimizado.",
        },
        { status: 409 },
      );
    }

    if (message === "INTERPRETATION_NOT_FOUND") {
      return NextResponse.json(
        {
          error:
            "Interpretação não encontrada para esta sessão.",
        },
        { status: 404 },
      );
    }

    if (
      message.startsWith(
        "INTERPRETED_TOPIC_NOT_FOUND:",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Um dos temas não pertence à interpretação informada.",
        },
        { status: 409 },
      );
    }

    if (
      message.startsWith(
        "AGGREGATE_TOPIC_NOT_FOUND:",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Um dos temas canônicos informados não existe.",
        },
        { status: 409 },
      );
    }

    console.error(
      "Falha ao confirmar temas da Campanha de Interesses:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível confirmar os temas.",
      },
      { status: 500 },
    );
  }
}
