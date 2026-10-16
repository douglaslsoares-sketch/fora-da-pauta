import type { DossieCandidato } from "./modelo";

// Primeira ficha documental, sem autorização de notificações pelo Telegram.
export const dossieRenatoFreitas: DossieCandidato = {
  candidaturaId: "160002536522",
  nome: "Renato Freitas",
  atualizadoEm: "2026-10-16",

  emPoucasLinhas:
    "Renato de Almeida Freitas Júnior nasceu em Sorocaba (SP) e cresceu na " +
    "Região Metropolitana de Curitiba. É formado e mestre em Direito pela " +
    "Universidade Federal do Paraná (UFPR). Foi vereador em Curitiba e " +
    "eleito deputado estadual do Paraná em 2022. Em 2026, foi eleito " +
    "deputado federal pelo PT no Paraná, com 115.227 votos, segundo " +
    "o relatório oficial de totalização do TRE-PR. A posse federal " +
    "está prevista para 2027.",

  biografia: {
    paragrafos: [
      "Renato de Almeida Freitas Júnior nasceu em Sorocaba, no interior de São Paulo, e cresceu na Região Metropolitana de Curitiba. É graduado e mestre em Direito pela Universidade Federal do Paraná (UFPR), com atuação nas áreas de Direito Penal, Criminologia e Sociologia da Violência.",
      "Segundo o perfil institucional da Assembleia Legislativa do Paraná, trabalhou na Defensoria Pública do Estado, atuou como professor universitário e advogado popular. O perfil institucional informa que suas principais áreas de atuação são educação, segurança e moradia. A Assembleia ressalva que os dados biográficos de seu perfil são fornecidos pela assessoria parlamentar.",
      "Foi eleito vereador de Curitiba em 2020 e deputado estadual do Paraná em 2022. Na eleição de 4 de outubro de 2026, foi eleito deputado federal pelo Paraná, pelo PT, com 115.227 votos e situação «Eleito por QP», conforme o relatório oficial de totalização do TRE-PR. O mandato federal ainda não começou: o início da nova legislatura está previsto para 2027.",
    ],
    fontes: [
      {
        id: "alep-perfil-renato-freitas",
        titulo: "Perfil institucional — Renato Freitas",
        veiculoOuInstituicao: "Assembleia Legislativa do Paraná",
        url: "https://www.assembleia.pr.leg.br/deputados/perfil/renato-freitas",
        tipo: "fonte-oficial",
      },
      {
        id: "alep-trajetoria-renato-2022",
        titulo: "Renato Freitas, um rapaz comum, batalhador e político por acidente",
        veiculoOuInstituicao: "Assembleia Legislativa do Paraná",
        url: "https://www.assembleia.pr.leg.br/index.php/comunicacao/noticias/renato-freitas-um-rapaz-comum-batalhador-e-politico-por-acidente",
        tipo: "fonte-oficial",
        publicadaEm: "2022-11-10",
      },
      {
        id: "tre-pr-totalizacao-deputado-federal-2026-renato-biografia",
        titulo: "Relatório Resultado da Totalização — Paraná — Eleições 2026, Anexo IX, página 108",
        veiculoOuInstituicao: "Tribunal Regional Eleitoral do Paraná (SISTOT)",
        url: "https://www.tre-pr.jus.br/eleicoes/eleicoes-2026/arquivos/tre-pr-relatorio-resultado-da-totalizacao-eleicoes-gerais-estaduais-2026-parana-1o-turno-para-governador-senador-deputados-federais-e-estaduais",
        tipo: "fonte-oficial",
        publicadaEm: "2026-10-04",
      },
    ],
    ultimaVerificacao: "2026-10-16",
  },

  eventos: [
    {
      id: "2026-10-04-eleito-deputado-federal-parana",
      data: {
        inicio: "2026-10-04",
        rotulo: "4 de outubro de 2026",
      },
      titulo: "Eleito deputado federal pelo Paraná com 115.227 votos",
      resumo:
        "Na eleição de 4 de outubro de 2026, Renato de Almeida Freitas Junior " +
        "(PT, nº 1333) recebeu 115.227 votos para deputado federal no Paraná. " +
        "O relatório oficial da Justiça Eleitoral registra a situação " +
        "«Eleito por QP» (quociente partidário). A eleição não significa " +
        "que ele já tenha tomado posse no mandato federal, cujo início " +
        "está previsto para 2027.",
      eixos: [
        "caminho-politica",
        "linha-do-tempo",
        "fontes-atualizacoes",
      ],
      natureza: ["documentado"],
      fatoDocumentado: [
        "O Anexo IX, Resultado de votação, cargo Deputado Federal, página 108 do relatório oficial de totalização do TRE-PR (SISTOT), registra o candidato nº 1333, Renato de Almeida Freitas Junior, com 115.227 votos válidos e situação «Eleito por QP».",
        "O registro é do resultado eleitoral de 4 de outubro de 2026; não representa início do exercício do mandato de deputado federal.",
      ],
      fontes: [
        {
          id: "tre-pr-totalizacao-deputado-federal-2026-renato-eleicao",
          titulo: "Relatório Resultado da Totalização — Eleições 2026, Paraná, Anexo IX, p. 108",
          veiculoOuInstituicao: "Tribunal Regional Eleitoral do Paraná (SISTOT)",
          url: "https://www.tre-pr.jus.br/eleicoes/eleicoes-2026/arquivos/tre-pr-relatorio-resultado-da-totalizacao-eleicoes-gerais-estaduais-2026-parana-1o-turno-para-governador-senador-deputados-federais-e-estaduais",
          tipo: "fonte-oficial",
          publicadaEm: "2026-10-04",
        },
      ],
      ultimaVerificacao: "2026-10-16",
      // Fato histórico verificado; nenhuma notificação está habilitada.
    },
    {
      id: "2026-06-08-pl23-sarau-periferico-comissao-cultura",
      data: {
        inicio: "2026-06-08",
        rotulo: "8 de junho de 2026",
      },
      titulo: "Projeto sobre o Sarau Periférico avança em comissões da Assembleia do Paraná",
      resumo:
        "Em 8 de junho de 2026, a Comissão de Cultura da Assembleia Legislativa " +
        "do Paraná aprovou o Projeto de Lei nº 23/2026, de autoria de Renato " +
        "Freitas, relacionado ao Sarau Periférico, realizado em novembro na " +
        "região de Curitiba. Em 5 de maio, a Comissão de Constituição e " +
        "Justiça havia aprovado parecer favorável. Essas decisões não " +
        "significam, por si só, que o projeto se tornou lei. Os documentos " +
        "consultados apresentam descrições divergentes sobre a esfera do " +
        "calendário (municipal ou estadual) e não comprovam a situação final " +
        "da proposta.",
      eixos: [
        "exercicio-cargo",
        "linha-do-tempo",
        "fontes-atualizacoes",
      ],
      natureza: ["documentado"],
      fatoDocumentado: [
        "O extrato da reunião da Comissão de Constituição e Justiça de 5 de maio de 2026, item 38, registra o PL 23/2026 de autoria de Renato Freitas e parecer favorável aprovado por unanimidade.",
        "Notícia institucional de 8 de junho de 2026 registra a aprovação do PL 23/2026 pela Comissão de Cultura, como proposta relacionada ao Sarau Periférico.",
      ],
      oQueFoiPublicadoOuQuestionado: [
        {
          atribuicao: "Divergência entre documentos oficiais da Assembleia Legislativa do Paraná",
          texto:
            "O extrato da CCJ menciona o calendário oficial do município de " +
            "Curitiba, enquanto a notícia da Comissão de Cultura relaciona " +
            "a proposta ao calendário de eventos do Estado do Paraná. " +
            "A íntegra e a redação final do projeto ainda precisam ser " +
            "consultadas para esclarecer essa diferença.",
        },
      ],
      fontes: [
        {
          id: "alep-ccj-2026-05-05-pl23",
          titulo: "Extrato da 10ª reunião ordinária da CCJ — item 38, PL 23/2026",
          veiculoOuInstituicao: "Assembleia Legislativa do Paraná",
          url: "https://storage.assembleia.pr.leg.br/ccj/1778008823_0_EXTRATO%20DA%2010%C2%AA%20REUNI%C3%83O%20ORDIN%C3%81RIA%20%28Resultado%20da%20Sess%C3%A3o%29.pdf",
          tipo: "documento",
          publicadaEm: "2026-05-05",
        },
        {
          id: "alep-cultura-2026-06-08-pl23",
          titulo: "Comissão de Cultura aprova projetos de valorização cultural — 8/6/2026",
          veiculoOuInstituicao: "Assembleia Legislativa do Paraná",
          url: "https://www.assembleia.pr.leg.br/comunicacao/noticias/comissao-cultura-aprova-projetos-valorizam-montanhismo-promo",
          tipo: "fonte-oficial",
          publicadaEm: "2026-06-08",
        },
      ],
      ultimaVerificacao: "2026-10-16",
      // O fato é histórico; nenhum aviso editorial está habilitado.
    },
  ],
};
