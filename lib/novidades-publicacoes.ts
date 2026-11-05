import { createHash } from "node:crypto";
import { campaigns } from "@/data/campanhas";
import { entregasPublicadas } from "@/data/entregas-publicadas";

const artigoFixo = "quem-decide-o-que-chega-ate-voce";
const slugsOcultosNaListagem = new Set(["seus-interesses"]);

// Calcula a versao a partir do material efetivamente publicado. Uma nova
// edicao ou uma revisao de texto altera a versao, sem ajuste manual de datas.
const edicoesPublicas = campaigns.filter(
  (campanha) => Boolean(campanha.publishedAt) &&
    !slugsOcultosNaListagem.has(campanha.slug),
);

function assinatura(conteudo: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(conteudo))
    .digest("hex")
    .slice(0, 20);
}

export const versaoEdicoes = edicoesPublicas.length > 0
  ? assinatura(edicoesPublicas)
  : null;

// A secao ainda esta em preparacao. Sem publicacoes, nao existe novidade.
export const versaoEntregas = entregasPublicadas.length > 0
  ? assinatura(entregasPublicadas)
  : null;

export const totalEdicoesPublicas = edicoesPublicas.length;
export const totalEntregasPublicadas = entregasPublicadas.length;

export { artigoFixo, slugsOcultosNaListagem };
