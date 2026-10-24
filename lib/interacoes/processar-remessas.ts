import "server-only";
import { sql } from "@/lib/interesses/db";

/**
 * Executor automatizado e conservador.
 * A atribuição a um destinatário é feita exclusivamente pelo ID da candidatura;
 * aceitar no provedor de e-mail não significa leitura ou entrega ao gabinete.
 */
export async function processarRemessasAutomaticas() {
  if (process.env.FDP_INTERACOES_AUTOMATICAS !== "1") return { desativado: true };
  const chave = process.env.RESEND_API_KEY?.trim();
  const remetente = process.env.FDP_INTERACOES_EMAIL_REMETENTE?.trim();
  const dominioRespostas = process.env.FDP_INTERACOES_DOMINIO_RESPOSTAS?.trim();
  if (!chave || !remetente || !dominioRespostas ||
      !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(dominioRespostas)) {
    throw new Error("Canal de e-mail não está configurado para encaminhamento.");
  }

  const resumo = { aceitas: 0, semContato: 0, incertas: 0 };
  // Uma remessa que já entrou em processamento não é repetida cegamente.
  const candidatas = await sql<{ id: string; candidatura_id: string }[]>`
    SELECT p.id::text AS id, p.candidatura_id
    FROM public.interacoes_politicas p
    WHERE p.status = 'recebida'
      AND p.created_at > now() - interval '14 days'
      AND NOT EXISTS (
        SELECT 1 FROM public.interacoes_remessas r WHERE r.interacao_id = p.id
      )
    ORDER BY p.created_at, p.id
    LIMIT 8
  `;

  for (const item of candidatas) {
    const reservado = await sql.begin(async tx => {
      const detalhes = await tx<{ id: string; mensagem: string; categoria: string; candidatura_id: string }[]>`
        SELECT id::text AS id, candidatura_id, mensagem, categoria
        FROM public.interacoes_politicas
        WHERE id = ${item.id}::uuid AND status = 'recebida'
        FOR UPDATE SKIP LOCKED
      `;
      const atual = detalhes[0];
      if (!atual) return null;
      const contatos = await tx<{ endereco_email: string; fonte_url: string; nome_publico: string }[]>`
        SELECT endereco_email, fonte_url, nome_publico
        FROM public.interacoes_contatos_institucionais
        WHERE candidatura_id = ${atual.candidatura_id}
          AND habilitado AND expira_at > now()
        LIMIT 1
      `;
      const contato = contatos[0];
      if (!contato || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contato.endereco_email) ||
          !/^https:\/\//.test(contato.fonte_url)) {
        await tx`
          UPDATE public.interacoes_politicas
          SET status = 'nao_encaminhada', updated_at = now()
          WHERE id = ${item.id}::uuid AND status = 'recebida'
        `;
        await tx`
          INSERT INTO public.interacoes_politicas_historico (interacao_id, evento, observacao)
          VALUES (${item.id}::uuid, 'nao_encaminhada', 'CONTATO_INSTITUCIONAL_INDISPONIVEL')
        `;
        return "sem_contato" as const;
      }
      const inseridas = await tx<{ interacao_id: string }[]>`
        INSERT INTO public.interacoes_remessas
          (interacao_id, candidatura_id, endereco_destino, origem_contato, status)
        VALUES (${item.id}::uuid, ${atual.candidatura_id},
                ${contato.endereco_email}, ${contato.fonte_url}, 'processando')
        ON CONFLICT (interacao_id) DO NOTHING
        RETURNING interacao_id::text
      `;
      if (!inseridas.length) return null;
      return { ...atual, destinatario: contato.endereco_email };
    });
    if (!reservado) continue;
    if (reservado === "sem_contato") { resumo.semContato++; continue; }

    // Endereço individual por protocolo, sem dados privados no e-mail.
    const resposta = `resposta+${reservado.id}@${dominioRespostas}`;
    const texto = [
      "Manifestação de cidadão recebida pelo Fora da Pauta",
      `Protocolo: ${reservado.id}`,
      `Tipo: ${reservado.categoria}`,
      "",
      reservado.mensagem,
      "",
      "Responda diretamente a este e-mail para que o remetente receba pelo bot do Telegram.",
      "O Fora da Pauta não divulga dados pessoais do cidadão neste encaminhamento.",
    ].join("\n");

    let dados: { id?: string } | null = null;
    try {
      const result = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chave}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `fdp-interacao-${reservado.id}`,
        },
        body: JSON.stringify({
          from: remetente, to: [reservado.destinatario], reply_to: resposta,
          subject: `Fora da Pauta - manifestação ${reservado.id}`,
          text: texto,
        }),
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      });
      if (result.ok) dados = await result.json() as { id?: string };
    } catch { /* Falha incerta não permite reenvio automático. */ }

    const idProvedor = dados?.id;
    if (idProvedor && /^[a-zA-Z0-9-]{10,100}$/.test(idProvedor)) {
      await sql.begin(async tx => {
        await tx`
          UPDATE public.interacoes_remessas
          SET status = 'aceita_pelo_provedor', protocolo_externo = ${idProvedor},
              aceita_at = now(), atualizada_at = now()
          WHERE interacao_id = ${reservado.id}::uuid AND status = 'processando'
        `;
        await tx`
          UPDATE public.interacoes_politicas SET status = 'em_analise', updated_at = now()
          WHERE id = ${reservado.id}::uuid AND status = 'recebida'
        `;
        await tx`
          INSERT INTO public.interacoes_politicas_historico (interacao_id, evento, observacao)
          VALUES (${reservado.id}::uuid, 'em_analise', 'ACEITA_PELO_PROVEDOR_AGUARDANDO_ENTREGA')
        `;
      });
      resumo.aceitas++;
    } else {
      await sql`
        UPDATE public.interacoes_remessas
        SET status = 'incerto', falha_codigo = 'ENVIO_SEM_CONFIRMACAO',
            atualizada_at = now()
        WHERE interacao_id = ${reservado.id}::uuid AND status = 'processando'
      `;
      resumo.incertas++;
    }
  }
  return resumo;
}
