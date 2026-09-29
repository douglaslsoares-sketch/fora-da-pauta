import type { DossieCandidato } from "./modelo";

export const dossieAugustoCury: DossieCandidato = {
  candidaturaId: "280002551547",

  nome: "Augusto Cury",

  atualizadoEm: "2026-09-28",

  emPoucasLinhas:
    "Augusto Jorge Cury nasceu em Colina (SP), em 1958. " +
    "É médico, psiquiatra e escritor. " +
    "Em 2026, participa de sua primeira disputa eleitoral, " +
    "como candidato à Presidência da República pelo Avante.",

  biografia: {
    paragrafos: [
      "Augusto Jorge Cury nasceu em Colina, no interior de São Paulo, em 2 de outubro de 1958.",
      "Formou-se em Medicina pela Faculdade de Medicina de São José do Rio Preto (Famerp), em 1984, e desenvolveu trajetória profissional ligada à psiquiatria, à pesquisa sobre emoções e à produção literária.",
      "Tornou-se conhecido pela publicação de dezenas de livros sobre comportamento, educação e saúde emocional e pela criação da Teoria da Inteligência Multifocal.",
      "Em 2026, entrou pela primeira vez em uma disputa eleitoral. Concorre à Presidência da República pelo Avante, com Júlio Delgado como candidato a vice-presidente.",
    ],

    fontes: [
      {
        id: "folha-perfil-eleitoral-augusto-2026",
        titulo:
          "Eleições 2026: Ficha de Escritor Augusto Cury",
        veiculoOuInstituicao:
          "Folha de S.Paulo",
        url:
          "https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2026/br/presidente/escritor-augusto-cury-280002551547.shtml",
        tipo: "reportagem",
      },
      {
        id: "agencia-brasil-perfil-augusto-2026",
        titulo:
          "Pelo Avante, escritor Augusto Cury estreia em disputas presidenciais",
        veiculoOuInstituicao:
          "Agência Brasil",
        url:
          "https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/pelo-avante-escritor-augusto-cury-estreia-em-disputas-presidenciais",
        tipo: "reportagem",
        publicadaEm: "2026-08-17",
      },
      {
        id: "tse-deferimento-augusto-2026-biografia",
        titulo:
          "Eleições têm 12 candidaturas na disputa pela Presidência da República",
        veiculoOuInstituicao:
          "Tribunal Superior Eleitoral",
        url:
          "https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/eleicoes-2026-tem-12-candidaturas-na-disputa-pela-presidencia-da-republica",
        tipo: "fonte-oficial",
        publicadaEm: "2026-09-11",
      },
    ],

    ultimaVerificacao: "2026-09-28",
  },

  promessas: [
    {
      id: "2026-presidente-prioridade-educacao",

      eleicao: "Eleições 2026",

      cargo: "Presidente da República",

      classificacao: {
        macrotema:
          "Educação, Ciência e Meio Ambiente",
        assunto:
          "Prioridade para educação básica, alfabetização e educação em tempo integral",
        origem:
          "Tribunal Superior Eleitoral",
      },

      titulo:
        "Priorizar a educação básica e ampliar o modelo de educação em tempo integral",

      compromisso:
        "O programa apresenta a educação básica como prioridade e propõe ampliar ambientes de educação em tempo integral, combinando formação acadêmica, desenvolvimento humano, artes, esportes e preparação profissional.",

      origem:
        "Programa de governo apresentado ao Tribunal Superior Eleitoral",

      fontes: [
        {
          id: "tse-propostas-augusto-educacao",
          titulo:
            "Escritor Augusto Cury — Propostas de Governo",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/propostas-de-governo-dos-candidatos-ao-cargo-de-presidente-da-republica-eleicoes-2026/escritor-augusto-cury-propostas-de-governo",
          tipo: "fonte-oficial",
        },
        {
          id: "agencia-brasil-plano-augusto-educacao",
          titulo:
            "Augusto Cury propõe mandato de oito anos no STF e semipresidencialismo",
          veiculoOuInstituicao:
            "Agência Brasil",
          url:
            "https://agenciabrasil.ebc.com.br/politica/noticia/2026-09/augusto-cury-propoe-mandato-de-oito-anos-no-stf-e-semipresidencialismo",
          tipo: "reportagem",
          publicadaEm: "2026-09-17",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-presidente-tele-saude-brasil",

      eleicao: "Eleições 2026",

      cargo: "Presidente da República",

      classificacao: {
        macrotema:
          "Saúde Pública e Assistência",
        assunto:
          "Tele Saúde Brasil",
        origem:
          "Tribunal Superior Eleitoral",
      },

      titulo:
        "Criar plataforma pública de telemedicina para ampliar o acesso ao SUS",

      compromisso:
        "O programa propõe o Tele Saúde Brasil, uma plataforma pública de medicina digital destinada a desafogar o SUS, com previsão de atendimento em até 30 minutos nos casos compatíveis com telemedicina.",

      origem:
        "Programa de governo apresentado ao Tribunal Superior Eleitoral",

      fontes: [
        {
          id: "tse-propostas-augusto-telesaude",
          titulo:
            "Escritor Augusto Cury — Propostas de Governo",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/propostas-de-governo-dos-candidatos-ao-cargo-de-presidente-da-republica-eleicoes-2026/escritor-augusto-cury-propostas-de-governo",
          tipo: "fonte-oficial",
        },
        {
          id: "tse-plano-augusto-2026",
          titulo:
            "Plano de Governo — O Brasil dos Nossos Sonhos",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/proposta-avante",
          tipo: "documento",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-presidente-semipresidencialismo",

      eleicao: "Eleições 2026",

      cargo: "Presidente da República",

      classificacao: {
        macrotema:
          "Governança, Transparência e Reformas de Estado",
        assunto:
          "Implantação do regime semipresidencialista",
        origem:
          "Tribunal Superior Eleitoral",
      },

      titulo:
        "Propor a implantação de um regime semipresidencialista",

      compromisso:
        "O programa propõe substituir o presidencialismo pelo semipresidencialismo, com divisão de funções entre o presidente da República e um primeiro-ministro apoiado pela maioria parlamentar.",

      origem:
        "Programa de governo apresentado ao Tribunal Superior Eleitoral",

      fontes: [
        {
          id: "tse-propostas-augusto-semipresidencialismo",
          titulo:
            "Escritor Augusto Cury — Propostas de Governo",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/propostas-de-governo-dos-candidatos-ao-cargo-de-presidente-da-republica-eleicoes-2026/escritor-augusto-cury-propostas-de-governo",
          tipo: "fonte-oficial",
        },
        {
          id: "agencia-brasil-convencao-augusto-semipresidencialismo",
          titulo:
            "Avante oficializa Augusto Cury como candidato à Presidência",
          veiculoOuInstituicao:
            "Agência Brasil",
          url:
            "https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/avante-oficializa-augusto-cury-como-candidato-presidencia",
          tipo: "reportagem",
          publicadaEm: "2026-08-03",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },
  ],

  eventos: [
    {
      id: "1958-nascimento-colina",

      data: {
        inicio: "1958-10-02",
        rotulo: "2 de outubro de 1958",
      },

      titulo:
        "Nascimento em Colina, São Paulo",

      resumo:
        "Augusto Jorge Cury nasceu em Colina, no interior paulista, em 2 de outubro de 1958.",

      eixos: [
        "quem-e",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fontes: [
        {
          id: "folha-ficha-augusto-nascimento",
          titulo:
            "Eleições 2026: Ficha de Escritor Augusto Cury",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2026/br/presidente/escritor-augusto-cury-280002551547.shtml",
          tipo: "reportagem",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "1984-formacao-medicina",

      data: {
        inicio: "1984",
        rotulo: "1984",
      },

      titulo:
        "Conclui a graduação em Medicina",

      resumo:
        "Cury concluiu a formação em Medicina na instituição hoje denominada Faculdade de Medicina de São José do Rio Preto (Famerp).",

      eixos: [
        "formacao-trabalho",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fontes: [
        {
          id: "funfarme-augusto-famerp-2026",
          titulo:
            "Funfarme recebe Augusto Cury, candidato à Presidência, para tratar de avanços na saúde e ensino médico",
          veiculoOuInstituicao:
            "Funfarme",
          url:
            "https://funfarme.com.br/blog/funfarme-recebe-augusto-cury-candidato-a-presidencia-para-tratar-de-avancos-na-saude-e-ensino-medico",
          tipo: "fonte-oficial",
          publicadaEm: "2026-09-04",
        },
        {
          id: "record-augusto-formacao-1984",
          titulo:
            "Augusto Cury reencontra colegas durante visita ao Hospital de Base em Rio Preto",
          veiculoOuInstituicao:
            "Record",
          url:
            "https://record.r7.com/record-rio-preto/augusto-cury-reencontra-colegas-durante-visita-ao-hospital-de-base-em-rio-preto-18092026/",
          tipo: "reportagem",
          publicadaEm: "2026-09-18",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-04-05-pre-candidatura-avante",

      data: {
        inicio: "2026-04-05",
        rotulo: "5 de abril de 2026",
      },

      titulo:
        "Avante anuncia Augusto Cury como pré-candidato à Presidência",

      resumo:
        "O Avante anunciou Augusto Cury como pré-candidato à Presidência da República. A entrada na eleição marcou sua estreia na política partidária eleitoral.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
      ],

      fontes: [
        {
          id: "folha-pre-candidatura-augusto-2026",
          titulo:
            "Quem é Augusto Cury, anunciado como pré-candidato à Presidência",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/amp/poder/2026/04/quem-e-augusto-cury-anunciado-como-pre-candidato-a-presidencia.shtml",
          tipo: "reportagem",
          publicadaEm: "2026-04-08",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-08-03-convencao-avante",

      data: {
        inicio: "2026-08-03",
        rotulo: "3 de agosto de 2026",
      },

      titulo:
        "Convenção do Avante oficializa candidatura à Presidência",

      resumo:
        "A Convenção Nacional do Avante, realizada na Assembleia Legislativa de São Paulo, oficializou Augusto Cury como candidato à Presidência da República.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "A convenção nacional do Avante ocorreu em 3 de agosto de 2026.",
        "Augusto Cury foi oficializado candidato à Presidência da República.",
      ],

      fontes: [
        {
          id: "agencia-brasil-convencao-augusto-2026",
          titulo:
            "Avante oficializa Augusto Cury como candidato à Presidência",
          veiculoOuInstituicao:
            "Agência Brasil",
          url:
            "https://agenciabrasil.ebc.com.br/politica/noticia/2026-08/avante-oficializa-augusto-cury-como-candidato-presidencia",
          tipo: "reportagem",
          publicadaEm: "2026-08-03",
        },
        {
          id: "avante-convencao-augusto-2026",
          titulo:
            "Convenção Nacional do Avante oficializa candidatura de Augusto Cury à Presidência da República",
          veiculoOuInstituicao:
            "Avante",
          url:
            "https://avante70.org.br/noticias/convencao-nacional-do-avante-homologa-candidatura-de-augusto-cury-a-presidencia-da-republica/",
          tipo: "fonte-oficial",
          publicadaEm: "2026-08-04",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-08-05-julio-delgado-vice",

      data: {
        inicio: "2026-08-05",
        rotulo: "5 de agosto de 2026",
      },

      titulo:
        "Anuncia Júlio Delgado como candidato a vice-presidente",

      resumo:
        "Augusto Cury anunciou o ex-deputado federal Júlio Delgado, também do Avante, como candidato a vice-presidente em sua chapa.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
      ],

      fontes: [
        {
          id: "cnn-julio-delgado-vice-cury",
          titulo:
            "Cury anuncia Júlio Delgado para vice à Presidência",
          veiculoOuInstituicao:
            "CNN Brasil",
          url:
            "https://www.cnnbrasil.com.br/eleicoes/cury-anuncia-julio-delgado-para-vice-a-presidencia/",
          tipo: "reportagem",
          publicadaEm: "2026-08-05",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-09-01-formacao-academica-divergencias",

      data: {
        inicio: "2026-09-01",
        rotulo: "1º de setembro de 2026",
      },

      titulo:
        "Publicação aponta descrições divergentes sobre formação acadêmica",

      resumo:
        "Reportagem comparou diferentes descrições públicas do título obtido por Cury na Florida Christian University, incluindo o plano de governo, o currículo Lattes e manifestação anterior do próprio candidato.",

      eixos: [
        "formacao-trabalho",
        "suspeitas-investigacoes-acusacoes",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
        "publicado",
        "contestada",
        "atualizada",
      ],

      fatoDocumentado: [
        "O plano de governo apresentado ao TSE descreve um doutorado internacional em Psicologia Multifocal pela Florida Christian University, concluído em 2013.",
        "Segundo a reportagem, o currículo Lattes consultado registrava Doctor of Business Administration pela mesma instituição.",
      ],

      oQueFoiPublicadoOuQuestionado: [
        {
          atribuicao:
            "Folha de S.Paulo",
          texto:
            "A reportagem apontou divergência entre as descrições públicas do título acadêmico e questionou a caracterização da formação.",
        },
      ],

      respostas: [
        {
          atribuicao:
            "Augusto Cury, em manifestação reproduzida pela Folha",
          texto:
            "O candidato havia afirmado anteriormente que seu currículo registrava Doctor of Business Administration e que não apresentava o título como doutorado acadêmico em psicologia.",
        },
        {
          atribuicao:
            "Augusto Cury, após questionamento da reportagem",
          texto:
            "Cury afirmou não se lembrar dos detalhes relativos às diferentes descrições da formação.",
        },
      ],

      desdobramentos: [
        "Após a publicação, um ex-reitor da Florida Christian University informou à Folha que o curso realizado por Cury teria sido em psicologia clínica.",
        "A ficha preserva separadamente o conteúdo do plano eleitoral, as informações atribuídas ao currículo, a resposta do candidato e a informação posterior fornecida pela instituição.",
      ],

      fontes: [
        {
          id: "folha-cury-formacao-academica-2026",
          titulo:
            "Cury se contradiz sobre doutorado em faculdade religiosa de 'coaching' nos EUA",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/poder/2026/09/cury-cita-em-plano-de-governo-doutorado-em-psicologia-que-nao-fez.shtml",
          tipo: "reportagem",
          publicadaEm: "2026-09-01",
        },
        {
          id: "tse-plano-augusto-formacao",
          titulo:
            "Plano de Governo — O Brasil dos Nossos Sonhos",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/eleicoes/eleicoes-2026-content/arquivos/proposta-avante",
          tipo: "documento",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-09-03-valores-economicos-sociais",

      data: {
        inicio: "2026-09-03",
        rotulo: "3 de setembro de 2026",
      },

      titulo:
        "Expõe como combina valores econômicos e sociais",

      resumo:
        "Em evento público, Cury afirmou valorizar meritocracia, família, empreendedorismo, liberdade de expressão e um Estado mais enxuto, ao mesmo tempo em que se definiu como social em relação às questões humanas.",

      tema:
        "Valores econômicos e sociais",

      tipoManifestacao:
        "outro",

      contextoManifestacao:
        "Fala durante evento na Assembleia de Deus, em São Paulo.",

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
          id: "folha-cury-assembleia-deus-2026",
          titulo:
            "Na Assembleia de Deus, Cury diz ser próximo de evangélicos",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/poder/2026/09/em-evento-na-assembleia-de-deus-cury-nega-ter-pedido-votos-e-diz-ja-ser-proximo-de-evangelicos.shtml",
          tipo: "reportagem",
          publicadaEm: "2026-09-03",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-09-05-declaracao-empresas-questionada",

      data: {
        inicio: "2026-09-05",
        rotulo: "5 de setembro de 2026",
      },

      titulo:
        "Reportagem questiona empresas ausentes da declaração patrimonial então disponível",

      resumo:
        "Reportagem identificou participações e vínculos empresariais que não apareciam na relação patrimonial disponibilizada naquele momento pela Justiça Eleitoral. A equipe do candidato afirmou que eventuais inconsistências seriam corrigidas.",

      eixos: [
        "patrimonio-atividades-economicas",
        "suspeitas-investigacoes-acusacoes",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
        "publicado",
        "contestada",
        "atualizada",
      ],

      fatoDocumentado: [
        "A reportagem apontou três empresas nos Estados Unidos e duas empresas no Brasil que não apareciam na declaração patrimonial então disponível.",
        "A declaração patrimonial posteriormente disponível passou a incluir 60 bens e total de R$ 242.593.012,43.",
        "Entre os registros incorporados posteriormente estão participações relacionadas a Free Mind Publish, Cury Academia Comportamental, Contemplare Investments e Contemplare Inteligência Imobiliária.",
      ],

      oQueFoiPublicadoOuQuestionado: [
        {
          atribuicao:
            "Folha de S.Paulo",
          texto:
            "A reportagem questionou a ausência de participações e vínculos empresariais na declaração entregue à Justiça Eleitoral disponível à época.",
        },
      ],

      respostas: [
        {
          atribuicao:
            "Equipe de Augusto Cury",
          texto:
            "A equipe afirmou que o patrimônio do candidato foi construído de forma lícita e que, caso fossem identificadas inconsistências pontuais, seriam adotadas providências para corrigi-las.",
        },
      ],

      desdobramentos: [
        "A base patrimonial posteriormente disponibilizada passou de 56 para 60 registros e de R$ 242.281.162,52 para R$ 242.593.012,43.",
        "A atualização posterior documenta a inclusão de quatro registros relacionados ao questionamento original, mas não é apresentada nesta ficha como conclusão sobre todos os pontos levantados pela reportagem.",
      ],

      fontes: [
        {
          id: "folha-cury-negocios-declaracao-2026",
          titulo:
            "Augusto Cury omitiu negócios nos EUA da Justiça Eleitoral",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/poder/2026/09/augusto-cury-omitiu-negocios-nos-eua-da-justica-eleitoral.shtml",
          tipo: "reportagem",
          publicadaEm: "2026-09-05",
        },
        {
          id: "folha-ficha-augusto-patrimonio-atual",
          titulo:
            "Eleições 2026: Ficha de Escritor Augusto Cury",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2026/br/presidente/escritor-augusto-cury-280002551547.shtml",
          tipo: "reportagem",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-09-10-impulsionamento-terceiros",

      data: {
        inicio: "2026-09-10",
        rotulo: "10 de setembro de 2026",
      },

      titulo:
        "Reportagem identifica anúncios pró-Cury impulsionados por terceiros",

      resumo:
        "Levantamento jornalístico encontrou mais de 60 anúncios favoráveis a Cury impulsionados por terceiros na Meta e comparou a prática às regras eleitorais que restringem a contratação de impulsionamento.",

      eixos: [
        "suspeitas-investigacoes-acusacoes",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
        "alegacao",
        "contestada",
        "atualizada",
      ],

      fatoDocumentado: [
        "A Folha informou ter localizado mais de 60 anúncios favoráveis a Cury impulsionados por terceiros.",
        "A reportagem registrou que parte dos anúncios foi retirada e que a Meta derrubou outros por descumprimento de suas regras para publicidade eleitoral.",
      ],

      oQueFoiPublicadoOuQuestionado: [
        {
          atribuicao:
            "Folha de S.Paulo",
          texto:
            "A reportagem questionou se o impulsionamento por terceiros se enquadrava nas regras eleitorais e se havia participação ou ciência da candidatura.",
        },
      ],

      respostas: [
        {
          atribuicao:
            "Sergio Lima, marqueteiro da campanha de Augusto Cury",
          texto:
            "Segundo a reportagem, o marqueteiro afirmou que a campanha atuava de acordo com as normas eleitorais e que não tinha conhecimento dos impulsionamentos encontrados.",
        },
        {
          atribuicao:
            "Augusto Cury, em manifestação anterior reproduzida pela imprensa",
          texto:
            "O candidato negou que sua campanha tivesse pago influenciadores e descreveu o movimento de apoio nas redes como espontâneo.",
        },
      ],

      desdobramentos: [
        "Nesta verificação, a ficha não incorpora decisão judicial definitiva atribuindo responsabilidade à candidatura pelos impulsionamentos descritos.",
        "O registro preserva a diferença entre a existência dos anúncios, a avaliação jurídica relatada pela imprensa e a resposta da campanha.",
      ],

      fontes: [
        {
          id: "folha-cury-anuncios-terceiros-2026",
          titulo:
            "Anúncios pró-Cury ferem legislação eleitoral com impulsionamento irregular",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/poder/2026/09/anuncios-pro-cury-ferem-legislacao-eleitoral-com-impulsionamento-irregular.shtml",
          tipo: "reportagem",
          publicadaEm: "2026-09-10",
        },
        {
          id: "folha-cury-resposta-influenciadores-2026",
          titulo:
            "Na Assembleia de Deus, Cury diz ser próximo de evangélicos",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/poder/2026/09/em-evento-na-assembleia-de-deus-cury-nega-ter-pedido-votos-e-diz-ja-ser-proximo-de-evangelicos.shtml",
          tipo: "reportagem",
          publicadaEm: "2026-09-03",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-09-11-tse-deferimento-chapa",

      data: {
        inicio: "2026-09-11",
        rotulo: "11 de setembro de 2026",
      },

      titulo:
        "TSE aprova registro da chapa Augusto Cury e Júlio Delgado",

      resumo:
        "O Tribunal Superior Eleitoral aprovou o registro da chapa presidencial formada por Augusto Cury e Júlio Delgado.",

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
        "O TSE aprovou o registro de Augusto Cury para Presidente da República.",
        "Júlio Delgado integra a chapa como candidato à Vice-Presidência.",
        "A candidatura presidencial concorre pelo Avante.",
      ],

      fontes: [
        {
          id: "tse-deferimento-augusto-2026",
          titulo:
            "Eleições têm 12 candidaturas na disputa pela Presidência da República",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/eleicoes-2026-tem-12-candidaturas-na-disputa-pela-presidencia-da-republica",
          tipo: "fonte-oficial",
          publicadaEm: "2026-09-11",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },

    {
      id: "2026-09-12-politica-externa",

      data: {
        inicio: "2026-09-12",
        rotulo: "12 de setembro de 2026",
      },

      titulo:
        "Defende permanência no Brics com foco econômico e flexibilização do Mercosul",

      resumo:
        "Em entrevista sobre política externa, Cury defendeu manter o Brasil no Brics, mas concentrar a participação em comércio e financiamento, além de flexibilizar negociações comerciais no Mercosul e retomar o processo de adesão à OCDE.",

      tema:
        "Política externa e comércio internacional",

      tipoManifestacao:
        "entrevista",

      contextoManifestacao:
        "Posições apresentadas à Folha em levantamento com candidatos à Presidência sobre política externa.",

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
          id: "folha-cury-politica-externa-2026",
          titulo:
            "Veja o que os candidatos à Presidência pensam sobre EUA, China, Brics e outros temas de política externa",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/poder/2026/09/veja-o-que-os-candidatos-a-presidencia-pensam-sobre-eua-china-brics-e-outros-temas-de-politica-externa.shtml",
          tipo: "reportagem",
          publicadaEm: "2026-09-12",
        },
      ],

      ultimaVerificacao: "2026-09-28",
    },
  ],
};