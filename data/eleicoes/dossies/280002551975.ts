import type { DossieCandidato } from "./modelo";

export const dossieEdmilsonCosta: DossieCandidato = {
  candidaturaId: "280002551975",

  nome: "Edmilson Costa",

  atualizadoEm: "2026-09-27",

  emPoucasLinhas:
    "Edmilson Silva Costa nasceu em Pedreiras (MA), em 1950. " +
    "É economista, professor e jornalista de formação. " +
    "Sua trajetória política inclui candidaturas anteriores, direção partidária no PCB " +
    "e a candidatura à Presidência da República em 2026.",

  biografia: {
    paragrafos: [
      "Edmilson Silva Costa nasceu em Pedreiras, no Maranhão, em 8 de abril de 1950. É economista e professor e tem formação em Jornalismo pela Universidade Federal do Maranhão (UFMA).",
      "Na década de 1990, concluiu doutorado em Economia na Universidade Estadual de Campinas (Unicamp), com trabalho relacionado à política salarial brasileira.",
      "Disputou a Prefeitura de São Paulo pelo PCB em 2008 e, em 2010, foi candidato a vice-presidente da República na chapa de Ivan Pinheiro. Em outubro de 2016, foi designado secretário-geral do PCB.",
      "Nas Eleições 2026, concorre à Presidência da República pelo PCB, tendo Cleusa Santos como candidata a vice-presidente.",
    ],

    fontes: [
      {
        id: "agencia-brasil-perfil-edmilson-2026",
        titulo:
          "PCB traz Edmilson Costa como candidato à Presidência",
        veiculoOuInstituicao:
          "Agência Brasil",
        url:
          "https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/pcb-traz-edmilson-costa-como-candidato-presidencia",
        tipo: "reportagem",
        publicadaEm: "2026-08-17",
      },
      {
        id: "pcb-secretaria-geral-edmilson-2016",
        titulo:
          "Edmilson Costa substitui Ivan Pinheiro na Secretaria Geral do PCB",
        veiculoOuInstituicao:
          "Partido Comunista Brasileiro",
        url:
          "https://pcb.org.br/portal2/12396",
        tipo: "fonte-oficial",
        publicadaEm: "2016-10-17",
      },
      {
        id: "tse-registro-edmilson-2026-biografia",
        titulo:
          "TSE valida seis registros de candidatura à Presidência da República",
        veiculoOuInstituicao:
          "Tribunal Superior Eleitoral",
        url:
          "https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/tse-valida-seis-registros-de-candidatura-a-presidencia-da-republica",
        tipo: "fonte-oficial",
        publicadaEm: "2026-09-02",
      },
    ],

    ultimaVerificacao: "2026-09-27",
  },

  promessas: [
    {
      id: "2026-presidente-jornada-30h-fim-6x1",

      eleicao: "Eleições 2026",

      cargo: "Presidente da República",

      classificacao: {
        macrotema:
          "Economia, Trabalho e Responsabilidade Fiscal",
        assunto:
          "Jornada de 30 horas semanais e fim da escala 6x1",
        origem:
          "Tribunal Superior Eleitoral",
      },

      titulo:
        "Implantar jornada de 30 horas semanais sem redução salarial e encerrar a escala 6x1",

      compromisso:
        "O programa apresentado pelo PCB propõe jornada de trabalho de 30 horas semanais, sem redução salarial, e o fim da escala 6x1.",

      origem:
        "Programa de governo apresentado ao Tribunal Superior Eleitoral",

      fontes: [
        {
          id: "tse-propostas-edmilson-30h-6x1",
          titulo:
            "Edmilson Costa — Propostas de Governo",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/propostas-de-governo-dos-candidatos-ao-cargo-de-presidente-da-republica-eleicoes-2026/edmilson-costa-propostas-de-governo",
          tipo: "fonte-oficial",
        },
        {
          id: "tse-programa-pcb-2026-30h",
          titulo:
            "Programa do Partido Comunista Brasileiro para as Eleições Presidenciais de 2026",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/proposta-pcb",
          tipo: "documento",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "2026-presidente-saude-10-pib",

      eleicao: "Eleições 2026",

      cargo: "Presidente da República",

      classificacao: {
        macrotema:
          "Saúde Pública e Assistência",
        assunto:
          "Saúde pública e investimento de 10% do PIB",
        origem:
          "Tribunal Superior Eleitoral",
      },

      titulo:
        "Destinar 10% do PIB à saúde pública e ampliar o caráter público do sistema",

      compromisso:
        "O programa propõe investimento equivalente a 10% do PIB na saúde pública, fortalecimento da atenção básica e um sistema de saúde integralmente público, gratuito e universal.",

      origem:
        "Programa de governo apresentado ao Tribunal Superior Eleitoral",

      fontes: [
        {
          id: "tse-propostas-edmilson-saude",
          titulo:
            "Edmilson Costa — Propostas de Governo",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/propostas-de-governo-dos-candidatos-ao-cargo-de-presidente-da-republica-eleicoes-2026/edmilson-costa-propostas-de-governo",
          tipo: "fonte-oficial",
        },
        {
          id: "tse-programa-pcb-2026-saude",
          titulo:
            "Programa do Partido Comunista Brasileiro para as Eleições Presidenciais de 2026",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/proposta-pcb",
          tipo: "documento",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "2026-presidente-constituinte-conselhos-populares",

      eleicao: "Eleições 2026",

      cargo: "Presidente da República",

      classificacao: {
        macrotema:
          "Governança, Transparência e Reformas de Estado",
        assunto:
          "Assembleia Constituinte e Conselhos Populares",
        origem:
          "Tribunal Superior Eleitoral",
      },

      titulo:
        "Convocar Assembleia Constituinte e instituir Conselhos Populares",

      compromisso:
        "O programa propõe convocar, em até dois anos, uma Assembleia Constituinte de Novo Tipo e instituir Conselhos Populares como mecanismos permanentes de participação direta.",

      origem:
        "Programa de governo apresentado ao Tribunal Superior Eleitoral",

      fontes: [
        {
          id: "tse-propostas-edmilson-governanca",
          titulo:
            "Edmilson Costa — Propostas de Governo",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/propostas-de-governo-dos-candidatos-ao-cargo-de-presidente-da-republica-eleicoes-2026/edmilson-costa-propostas-de-governo",
          tipo: "fonte-oficial",
        },
        {
          id: "tse-programa-pcb-2026-governanca",
          titulo:
            "Programa do Partido Comunista Brasileiro para as Eleições Presidenciais de 2026",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/proposta-pcb",
          tipo: "documento",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },
  ],

  eventos: [
    {
      id: "1950-nascimento-pedreiras",

      data: {
        inicio: "1950-04-08",
        rotulo: "8 de abril de 1950",
      },

      titulo:
        "Nascimento em Pedreiras, no Maranhão",

      resumo:
        "Perfis eleitorais publicados registram Edmilson Silva Costa como nascido em Pedreiras (MA), em 8 de abril de 1950.",

      eixos: [
        "quem-e",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
      ],

      fontes: [
        {
          id: "folha-eleicoes-2008-edmilson-nascimento",
          titulo:
            "Candidatos a prefeito — São Paulo — Eleições 2008",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/folha/especial/2008/eleicoes/candidatos.shtml",
          tipo: "reportagem",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "1990-formacao-doutorado-economia",

      data: {
        inicio: "1990",
        rotulo: "Década de 1990",
      },

      titulo:
        "Formação em Jornalismo e doutorado em Economia",

      resumo:
        "A Agência Brasil registra formação em Jornalismo pela Universidade Federal do Maranhão e doutorado em Economia pela Unicamp, concluído na década de 1990 com tese sobre política salarial brasileira.",

      eixos: [
        "formacao-trabalho",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
      ],

      fontes: [
        {
          id: "agencia-brasil-formacao-edmilson-2026",
          titulo:
            "PCB traz Edmilson Costa como candidato à Presidência",
          veiculoOuInstituicao:
            "Agência Brasil",
          url:
            "https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/pcb-traz-edmilson-costa-como-candidato-presidencia",
          tipo: "reportagem",
          publicadaEm: "2026-08-17",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "2008-candidato-prefeito-sao-paulo",

      data: {
        inicio: "2008",
        rotulo: "2008",
      },

      titulo:
        "Candidatura à Prefeitura de São Paulo",

      resumo:
        "Edmilson Costa disputou a Prefeitura de São Paulo pelo PCB nas eleições municipais de 2008.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
      ],

      fontes: [
        {
          id: "folha-eleicoes-2008-edmilson-prefeito",
          titulo:
            "Candidatos a prefeito — São Paulo — Eleições 2008",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/folha/especial/2008/eleicoes/candidatos.shtml",
          tipo: "reportagem",
        },
        {
          id: "agencia-brasil-edmilson-prefeito-2008",
          titulo:
            "PCB traz Edmilson Costa como candidato à Presidência",
          veiculoOuInstituicao:
            "Agência Brasil",
          url:
            "https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/pcb-traz-edmilson-costa-como-candidato-presidencia",
          tipo: "reportagem",
          publicadaEm: "2026-08-17",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "2010-candidato-vice-presidente",

      data: {
        inicio: "2010",
        rotulo: "2010",
      },

      titulo:
        "Candidatura à Vice-Presidência da República",

      resumo:
        "Nas eleições de 2010, Edmilson Costa concorreu à Vice-Presidência da República na chapa encabeçada por Ivan Pinheiro, do PCB.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
      ],

      fontes: [
        {
          id: "agencia-brasil-edmilson-vice-2010",
          titulo:
            "PCB traz Edmilson Costa como candidato à Presidência",
          veiculoOuInstituicao:
            "Agência Brasil",
          url:
            "https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/pcb-traz-edmilson-costa-como-candidato-presidencia",
          tipo: "reportagem",
          publicadaEm: "2026-08-17",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "2016-secretario-geral-pcb",

      data: {
        inicio: "2016-10",
        rotulo: "Outubro de 2016",
      },

      titulo:
        "Assume a Secretaria-Geral do PCB",

      resumo:
        "O Comitê Central do PCB designou Edmilson Costa como secretário-geral da legenda após o afastamento de Ivan Pinheiro da função.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fontes: [
        {
          id: "pcb-edmilson-secretario-geral-2016",
          titulo:
            "Edmilson Costa substitui Ivan Pinheiro na Secretaria Geral do PCB",
          veiculoOuInstituicao:
            "Partido Comunista Brasileiro",
          url:
            "https://pcb.org.br/portal2/12396",
          tipo: "fonte-oficial",
          publicadaEm: "2016-10-17",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "2026-08-01-convencao-pcb",

      data: {
        inicio: "2026-08-01",
        rotulo: "1º de agosto de 2026",
      },

      titulo:
        "Convenção do PCB aprova candidatura à Presidência",

      resumo:
        "A Convenção Nacional do PCB aprovou Edmilson Costa como candidato à Presidência da República e Cleusa Santos como candidata à Vice-Presidência.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "A convenção nacional ocorreu em 1º de agosto de 2026.",
        "Edmilson Costa foi aprovado como candidato à Presidência.",
        "Cleusa Santos foi aprovada como candidata à Vice-Presidência.",
      ],

      fontes: [
        {
          id: "agencia-brasil-convencao-pcb-2026",
          titulo:
            "PCB aprova candidatura de Edmilson Costa à presidência da República",
          veiculoOuInstituicao:
            "Agência Brasil",
          url:
            "https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/pcb-aprova-candidatura-de-edmilson-costa-presidencia-da-republica",
          tipo: "reportagem",
          publicadaEm: "2026-08-01",
        },
        {
          id: "pcb-convencao-edmilson-2026",
          titulo:
            "PCB oficializa candidaturas à Presidência",
          veiculoOuInstituicao:
            "Partido Comunista Brasileiro",
          url:
            "https://pcb.org.br/portal2/34109",
          tipo: "fonte-oficial",
          publicadaEm: "2026-08-03",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "2026-08-06-banco-trabalhadores-divida",

      data: {
        inicio: "2026-08-06",
        rotulo: "6 de agosto de 2026",
      },

      titulo:
        "Defende Banco dos Trabalhadores e suspensão de pagamentos da dívida durante auditoria",

      resumo:
        "Em entrevista durante agenda no Ceará, Edmilson Costa defendeu a criação de um Banco dos Trabalhadores e a suspensão do pagamento da dívida pública, entre outras propostas econômicas.",

      tema:
        "Economia e dívida pública",

      tipoManifestacao:
        "entrevista",

      contextoManifestacao:
        "Entrevista concedida ao jornal O POVO durante agenda de campanha no Ceará.",

      eixos: [
        "acontecimentos-publicos",
        "o-que-diz-e-defende",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
      ],

      fontes: [
        {
          id: "opovo-edmilson-2026-08-06",
          titulo:
            "Em visita ao Ceará, candidato à Presidência do PCB defende escala de 30h semanais",
          veiculoOuInstituicao:
            "O POVO",
          url:
            "https://www.opovo.com.br/noticias/politica/eleicoes/2026/08/06/amp/brasil-edmilson-costa-defende-escala-de-30h-semanais.html",
          tipo: "reportagem",
          publicadaEm: "2026-08-06",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "2026-09-02-tse-deferimento-chapa",

      data: {
        inicio: "2026-09-02",
        rotulo: "2 de setembro de 2026",
      },

      titulo:
        "TSE aprova registro da chapa presidencial",

      resumo:
        "O Tribunal Superior Eleitoral aprovou o registro da chapa formada por Edmilson Costa e Cleusa Santos para as Eleições 2026.",

      eixos: [
        "quem-e",
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
        "decisao",
      ],

      fatoDocumentado: [
        "O TSE aprovou o registro de Edmilson Costa para Presidente da República.",
        "Cleusa Santos integra a chapa como candidata à Vice-Presidência.",
        "A chapa concorre pelo Partido Comunista Brasileiro.",
      ],

      fontes: [
        {
          id: "tse-valida-edmilson-2026",
          titulo:
            "TSE valida seis registros de candidatura à Presidência da República",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/tse-valida-seis-registros-de-candidatura-a-presidencia-da-republica",
          tipo: "fonte-oficial",
          publicadaEm: "2026-09-02",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },

    {
      id: "2026-09-21-conselhos-populares",

      data: {
        inicio: "2026-09-21",
        rotulo: "21 de setembro de 2026",
      },

      titulo:
        "Defende Conselhos Populares como mecanismo permanente de participação",

      resumo:
        "Durante programa transmitido no YouTube pelo PCB, Edmilson Costa afirmou que os Conselhos Populares deveriam permitir a participação da população na gestão da economia e do Estado.",

      tema:
        "Participação política e democracia direta",

      tipoManifestacao:
        "rede-social",

      contextoManifestacao:
        "Participação em programa do PCB transmitido pelo YouTube durante a campanha presidencial.",

      eixos: [
        "acontecimentos-publicos",
        "o-que-diz-e-defende",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
      ],

      fontes: [
        {
          id: "agencia-brasil-edmilson-conselhos-2026-09-21",
          titulo:
            "Veja como foi a segunda-feira (21) dos candidatos a presidente",
          veiculoOuInstituicao:
            "Agência Brasil",
          url:
            "https://agenciabrasil.ebc.com.br/politica/noticia/2026-09/veja-como-foi-segunda-feira-21-dos-candidatos-presidente",
          tipo: "reportagem",
          publicadaEm: "2026-09-21",
        },
      ],

      ultimaVerificacao: "2026-09-27",
    },
  ],
};