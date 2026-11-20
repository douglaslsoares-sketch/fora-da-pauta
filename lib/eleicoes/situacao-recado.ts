import "server-only";
import type { Candidatura } from "@/data/eleicoes/tipos";
import { idsEleitosEm2026, situacaoEleitoral2026 } from "@/lib/eleicoes/acompanhamento-politico";

export type SituacaoRecadoPolitico = {
  titulo: string;
  detalhe: string;
  fonteUrl: string | null;
  fonteRotulo: string | null;
  contatoIndividualVerificado: false;
};

/**
 * Não equiparar candidatura, eleição e exercício do cargo.
 * Os contatos permanecem bloqueados até existir verificação individual
 * de identidade, mandato vigente e endereço institucional de destino.
 */
export function situacaoRecadoPolitico(pessoa: Candidatura, data = new Date()): SituacaoRecadoPolitico {
  // Confirmação excepcional por fonte governamental datada; não contém e-mail.
  // O registro expira para evitar que um mandato histórico pareça atual.
  if (pessoa.id === "280002542548" && pessoa.cargo === "presidente" &&
      pessoa.nomeUrna.trim().toUpperCase() === "LULA" &&
      data >= new Date("2026-11-03T00:00:00-03:00") &&
      data < new Date("2026-12-04T00:00:00-03:00")) {
    return {
      titulo: "Exercício do cargo confirmado em novembro de 2026",
      detalhe: "Uma publicação oficial da Presidência identifica Luiz Inácio Lula da Silva como Presidente da República. Isso não representa verificação de endereço individual para envio de mensagens.",
      fonteUrl: "https://www.gov.br/secom/pt-br/acompanhe-a-secom/area-de-imprensa/notas-a-imprensa/nota-sobre-exames-de-rotina-do-presidente-lula",
      fonteRotulo: "Consultar a fonte oficial — 3/11/2026",
      contatoIndividualVerificado: false
    };
  }
  if (idsEleitosEm2026.has(pessoa.id)) {
    const posse = pessoa.cargo === "presidente" ? "5 de janeiro de 2027" :
      pessoa.cargo === "governador" ? "6 de janeiro de 2027" : "1º de fevereiro de 2027";
    const dataPosse = pessoa.cargo === "presidente" ? "2027-01-05" :
      pessoa.cargo === "governador" ? "2027-01-06" : "2027-02-01";
    const antesPosse = data < new Date(dataPosse + "T00:00:00-03:00");
    return {
      titulo: antesPosse ? "Eleito em 2026 — novo mandato ainda não iniciado" : "Eleito em 2026 — exercício atual não verificado",
      detalhe: antesPosse
        ? `A posse do novo mandato está prevista para ${posse}. A eleição não prova que a pessoa já exerça outro mandato. O contato individual continua pendente de verificação.`
        : "A eleição de 2026 não comprova exercício atual do mandato. É necessária confirmação em fonte institucional atualizada e verificação do contato.",
      fonteUrl: "https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/da-eleicao-a-diplomacao-entenda-as-etapas-ate-a-posse-dos-eleitos-238683",
      fonteRotulo: "Consultar orientações sobre posse — TSE",
      contatoIndividualVerificado: false
    };
  }
  if (situacaoEleitoral2026(pessoa) === "Não se elegeu em 2026") {
    return {
      titulo: "Não eleito em 2026",
      detalhe: "O resultado eleitoral de 2026 não demonstra exercício de outro mandato. Nenhum contato individual foi confirmado para envio.",
      fonteUrl: null,
      fonteRotulo: null,
      contatoIndividualVerificado: false
    };
  }
  return {
    titulo: "Exercício do mandato não confirmado",
    detalhe: "A candidatura ou o resultado da eleição não bastam para verificar um mandato em exercício. É preciso conferir a identidade e um contato publicado pela instituição.",
    fonteUrl: null,
    fonteRotulo: null,
    contatoIndividualVerificado: false
  };
}
