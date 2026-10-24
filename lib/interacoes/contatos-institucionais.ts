import "server-only";
import { sql } from "@/lib/interesses/db";

/** Endereço institucional só pode ser usado enquanto o cadastro oficial estiver válido. */
export async function localizarContatoInstitucional(candidaturaId: string) {
  const rows = await sql<{
    candidatura_id: string; endereco_email: string; fonte_url: string; nome_publico: string;
  }[]>`
    SELECT candidatura_id, endereco_email, fonte_url, nome_publico
    FROM public.interacoes_contatos_institucionais
    WHERE candidatura_id = ${candidaturaId}
      AND habilitado = true AND expira_at > now()
    LIMIT 1
  `;
  const contato = rows[0];
  if (!contato || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contato.endereco_email) ||
      !/^https:\/\//.test(contato.fonte_url)) return null;
  return contato;
}

/** Status honesto: cadastro institucional não equivale a mensagem entregue. */
export async function localizarPendenciasDeEnvio(limite = 10) {
  return sql<{ id: string; candidatura_id: string }[]>`
    SELECT id::text AS id, candidatura_id
    FROM public.interacoes_politicas
    WHERE status = 'recebida'
      AND NOT EXISTS (
        SELECT 1 FROM public.interacoes_remessas r WHERE r.interacao_id = interacoes_politicas.id
      )
    ORDER BY created_at, id
    LIMIT ${Math.min(20, Math.max(1, limite))}
  `;
}
