import "server-only";
import { sql } from "@/lib/interesses/db";

type PessoaCamara = {
  id?: number; nome?: string; siglaPartido?: string; siglaUf?: string; email?: string;
};
type DetalheCamara = {
  nomeCivil?: string;
  ultimoStatus?: { email?: string; siglaUf?: string; siglaPartido?: string };
};
type ApiCamara<T> = { dados?: T };

function normalizarNome(nome: string) {
  return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
}

async function apiCamara<T>(caminho: string): Promise<T | null> {
  try {
    const resposta = await fetch(`https://dadosabertos.camara.leg.br/api/v2/${caminho}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000), cache: "no-store",
    });
    if (!resposta.ok) return null;
    return ((await resposta.json()) as ApiCamara<T>).dados ?? null;
  } catch { return null; }
}

/**
 * Preenche contatos sem trabalho manual por manifestação.
 * Evita atribuir endereço por coincidência de nome: exige mandato atual
 * documentado, UF, partido e nome civil idêntico na fonte oficial.
 * Não cobre automaticamente candidatos que não ocupam a Câmara.
 */
export async function sincronizarContatosCamara() {
  if (process.env.FDP_INTERACOES_AUTOMATICAS !== "1") return { desativado: true };
  const [{ candidaturas }, { obterMandatoAtualConhecido }] = await Promise.all([
    import("@/data/eleicoes/candidaturas"),
    import("@/data/eleicoes/reeleicao"),
  ]);
  const pendencias = await sql<{ candidatura_id: string }[]>`
    SELECT DISTINCT p.candidatura_id
    FROM public.interacoes_politicas p
    WHERE p.status = 'recebida'
      AND NOT EXISTS (
        SELECT 1 FROM public.interacoes_remessas r
        WHERE r.interacao_id = p.id
      )
      AND NOT EXISTS (
        SELECT 1 FROM public.interacoes_contatos_institucionais c
        WHERE c.candidatura_id = p.candidatura_id
          AND c.habilitado AND c.expira_at > now()
      )
    LIMIT 3
  `;
  const resumo = { verificados: 0, semCorrespondencia: 0 };
  for (const { candidatura_id } of pendencias) {
    const pessoa = candidaturas.find(p => p.id === candidatura_id);
    if (!pessoa || !pessoa.nomeCompleto || !pessoa.nomeUrna ||
        obterMandatoAtualConhecido(pessoa.id)?.cargo !== "deputado-federal") {
      resumo.semCorrespondencia++;
      continue;
    }
    const lista = await apiCamara<PessoaCamara[]>(
      `deputados?nome=${encodeURIComponent(pessoa.nomeUrna)}&itens=100`
    );
    if (!lista) continue;
    const correspondentes = lista.filter(p =>
      p.id && normalizarNome(p.nome ?? "") === normalizarNome(pessoa.nomeUrna) &&
      p.siglaUf?.toUpperCase() === pessoa.uf.toUpperCase() &&
      p.siglaPartido?.toUpperCase() === pessoa.siglaPartido.toUpperCase()
    );
    // Nunca escolher arbitrariamente entre homônimos.
    if (correspondentes.length !== 1 || !correspondentes[0].id) {
      resumo.semCorrespondencia++;
      continue;
    }
    const dep = correspondentes[0];
    const detalhes = await apiCamara<DetalheCamara>(`deputados/${dep.id}`);
    const email = (detalhes?.ultimoStatus?.email || dep.email || "").trim().toLowerCase();
    if (!detalhes?.nomeCivil ||
      normalizarNome(detalhes.nomeCivil) !== normalizarNome(pessoa.nomeCompleto) ||
      detalhes.ultimoStatus?.siglaUf?.toUpperCase() !== pessoa.uf.toUpperCase() ||
      detalhes.ultimoStatus?.siglaPartido?.toUpperCase() !== pessoa.siglaPartido.toUpperCase() ||
      !/^[a-z0-9._%+-]+@camara\.leg\.br$/.test(email)) {
      resumo.semCorrespondencia++;
      continue;
    }
    const fonte = `https://dadosabertos.camara.leg.br/api/v2/deputados/${dep.id}`;
    await sql`
      INSERT INTO public.interacoes_contatos_institucionais
        (candidatura_id, nome_publico, endereco_email, fonte_url, origem,
         expira_at, atualizado_at, habilitado)
      VALUES (${pessoa.id}, ${pessoa.nomeUrna}, ${email},
              ${fonte}, 'camara_api', now() + interval '7 days', now(), true)
      ON CONFLICT (candidatura_id) DO UPDATE
      SET nome_publico = EXCLUDED.nome_publico,
          endereco_email = EXCLUDED.endereco_email, fonte_url = EXCLUDED.fonte_url,
          origem = 'camara_api', expira_at = EXCLUDED.expira_at,
          atualizado_at = now(), habilitado = true
    `;
    resumo.verificados++;
  }
  return resumo;
}
