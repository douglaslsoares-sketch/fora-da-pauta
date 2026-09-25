import type { DossieCandidato } from "./modelo";

export const dossieFlavioBolsonaro: DossieCandidato = {
  candidaturaId: "280002551544",

  nome: "Flávio Bolsonaro",

  atualizadoEm: "2026-09-25",

  emPoucasLinhas:
    "Flávio Nantes Bolsonaro nasceu em Resende (RJ), em 1981. " +
    "Sua trajetória pública inclui passagem profissional pela Câmara dos Deputados, " +
    "mandatos eletivos no Rio de Janeiro e atuação no Senado Federal. " +
    "Esta ficha organiza cronologicamente informações documentadas, publicações, " +
    "questionamentos, respostas e desdobramentos posteriores.",

  eventos: [
    {
      id: "1981-nascimento",

      data: {
        inicio: "1981-04-30",
        rotulo: "30 de abril de 1981",
      },

      titulo: "Nascimento em Resende, no Rio de Janeiro",

      resumo:
        "O Senado Federal registra Flávio Nantes Bolsonaro como nascido em Resende (RJ), em 30 de abril de 1981.",

      eixos: [
        "quem-e",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "Nome civil registrado pelo Senado: Flávio Nantes Bolsonaro.",
        "Data de nascimento: 30 de abril de 1981.",
        "Naturalidade: Resende, Rio de Janeiro.",
      ],

      fontes: [
        {
          id: "senado-perfil-5894",
          titulo: "Perfil do senador Flávio Bolsonaro",
          veiculoOuInstituicao: "Senado Federal",
          url: "https://www25.senado.leg.br/web/senadores/senador/-/perfil/5894",
          tipo: "fonte-oficial",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2000-2002-camara-faculdade-estagio",

      data: {
        inicio: "2000-12",
        fim: "2002-06",
        rotulo: "Dezembro de 2000 a junho de 2002",
      },

      titulo:
        "Cargo na Câmara durante período de faculdade e estágio no Rio",

      resumo:
        "Flávio Bolsonaro ocupou cargo comissionado na liderança do PPB na Câmara dos Deputados, em Brasília, enquanto cursava Direito no Rio de Janeiro e, durante parte do período, realizava estágio voluntário na Defensoria Pública fluminense. Uma reportagem da BBC News Brasil questionou como as atividades presenciais em duas cidades eram conciliadas.",

      eixos: [
        "formacao-trabalho",
        "acontecimentos-publicos",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
        "publicado",
      ],

      fatoDocumentado: [
        "A reportagem registra que Flávio ocupou o posto de assistente técnico de gabinete na liderança do PPB de dezembro de 2000 a junho de 2002.",
        "Segundo a apuração, o cargo tinha carga horária de 40 horas semanais e era ligado à Câmara dos Deputados, em Brasília.",
        "No período, Flávio cursava Direito na Universidade Candido Mendes, no Rio de Janeiro.",
        "A Defensoria Pública informou à reportagem que um defensor relatou que Flávio atuava como estagiário voluntário duas vezes por semana.",
        "O controle de presença na Câmara era realizado por folha mensal de frequência encaminhada pela chefia da liderança, e não por ponto eletrônico diário.",
      ],

      oQueFoiPublicadoOuQuestionado: [
        {
          atribuicao: "BBC News Brasil",
          texto:
            "A reportagem questionou como seria possível conciliar as atividades presenciais em Brasília e no Rio de Janeiro.",
        },
        {
          atribuicao: "Câmara dos Deputados, em resposta à BBC",
          texto:
            "A Câmara informou que cargos daquela natureza tinham por finalidade prestar assessoramento aos órgãos da Casa em Brasília e não possuíam prerrogativa para exercício em outra cidade.",
        },
      ],

      respostas: [
        {
          atribuicao: "Assessoria de Flávio Bolsonaro",
          texto:
            "Segundo a reportagem, a assessoria informou que não responderia aos questionamentos da BBC News Brasil naquela ocasião.",
        },
        {
          atribuicao: "Defensoria Pública do Rio de Janeiro",
          texto:
            "A Defensoria informou não ter localizado vínculo formal de estágio, mas um defensor confirmou à reportagem a atividade voluntária duas vezes por semana e descreveu Flávio como assíduo e interessado.",
        },
      ],

      desdobramentos: [
        "Este registro não atribui crime ou irregularidade. A ficha preserva separadamente os fatos documentados, o questionamento jornalístico e as respostas disponíveis.",
      ],

      fontes: [
        {
          id: "bbc-uol-camara-faculdade-estagio-2019",
          titulo:
            "Como Flávio Bolsonaro ocupou um cargo na Câmara dos Deputados enquanto fazia faculdade e estágio no Rio",
          veiculoOuInstituicao: "BBC News Brasil / UOL",
          url: "https://noticias.uol.com.br/ultimas-noticias/bbc/2019/01/23/como-flavio-bolsonaro-ocupou-um-cargo-na-camara-dos-deputados-enquanto-fazia-faculdade-e-estagio-no-rio.amp.htm",
          tipo: "reportagem",
          publicadaEm: "2019-01-23",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2002-primeira-eleicao",

      data: {
        inicio: "2002",
        rotulo: "2002",
      },

      titulo: "Primeira eleição para deputado estadual",

      resumo:
        "Flávio Bolsonaro concorreu pelo PPB a deputado estadual no Rio de Janeiro e recebeu 31.293 votos.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "Candidatura a deputado estadual pelo PPB.",
        "31.293 votos registrados no resultado oficial histórico do TRE-RJ.",
      ],

      fontes: [
        {
          id: "tre-rj-eleicoes-2002",
          titulo: "Resultado das Eleições 2002 no estado do Rio de Janeiro",
          veiculoOuInstituicao:
            "Tribunal Regional Eleitoral do Rio de Janeiro",
          url: "https://www.tre-rj.jus.br/institucional/memoria/eleicoes-2002/resultados",
          tipo: "fonte-oficial",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2026-formacao-ufrj",

      data: {
        inicio: "2026-08-12",
        rotulo: "12 de agosto de 2026",
      },

      titulo:
        "Informação sobre pós-graduação na UFRJ é questionada e campanha aponta erro",

      resumo:
        "Reportagem identificou que páginas institucionais atribuíam a Flávio Bolsonaro uma pós-graduação relacionada à UFRJ. Consultada, a universidade informou não encontrar registro no sistema acadêmico citado pela reportagem. A campanha afirmou que a informação era um erro ou equívoco e solicitou correção.",

      eixos: [
        "formacao-trabalho",
        "acontecimentos-publicos",
        "fontes-atualizacoes",
      ],

      natureza: [
        "publicado",
        "contestada",
        "atualizada",
      ],

      fatoDocumentado: [
        "A reportagem registrou que páginas do Senado e da Alerj continham referência a uma pós-graduação associada à UFRJ.",
        "A UFRJ informou à reportagem não encontrar registro no sistema acadêmico consultado.",
      ],

      oQueFoiPublicadoOuQuestionado: [
        {
          atribuicao: "Folha de S.Paulo",
          texto:
            "A reportagem tratou como incorreta a informação biográfica que atribuía a pós-graduação à UFRJ.",
        },
      ],

      respostas: [
        {
          atribuicao: "Campanha de Flávio Bolsonaro",
          texto:
            "A campanha afirmou que a referência era erro ou equívoco, disse ter solicitado a correção e informou como formação correta a graduação em Direito pela Universidade Candido Mendes, pós-graduação em Políticas Públicas pelo Iuperj e MBA em Empreendedorismo pela FGV.",
        },
      ],

      fontes: [
        {
          id: "folha-formacao-ufrj-2026",
          titulo:
            "Sites oficiais do Senado e da Alerj registram pós-graduação que Flávio Bolsonaro não fez",
          veiculoOuInstituicao: "Folha de S.Paulo",
          url: "https://www1.folha.uol.com.br/poder/2026/08/sites-oficiais-do-senado-e-da-alerj-registram-pos-graduacao-que-flavio-bolsonaro-nao-fez.shtml",
          tipo: "reportagem",
          publicadaEm: "2026-08-12",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2026-registro-candidatura-presidencia",

      data: {
        inicio: "2026-09-02",
        rotulo: "2 de setembro de 2026",
      },

      titulo:
        "TSE aprova registro da chapa presidencial",

      resumo:
        "O Tribunal Superior Eleitoral aprovou o registro da chapa formada por Flávio Bolsonaro e Alfredo Gaspar, pelo PL, para a eleição presidencial de 2026.",

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
        "Chapa: Flávio Bolsonaro e Alfredo Gaspar.",
        "Partido: PL.",
        "Registro aprovado pelo Tribunal Superior Eleitoral.",
      ],

      fontes: [
        {
          id: "tse-registro-presidencia-2026",
          titulo:
            "TSE valida seis registros de candidatura à Presidência da República",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url: "https://www.tse.jus.br/comunicacao/noticias/2026/Setembro/tse-valida-seis-registros-de-candidatura-a-presidencia-da-republica",
          tipo: "fonte-oficial",
          publicadaEm: "2026-09-02",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2026-dark-horse-investigacao",

      data: {
        inicio: "2026-07-22",
        rotulo: "22 de julho de 2026",
      },

      titulo:
        "Incluído como investigado no inquérito sobre o financiamento de Dark Horse",

      resumo:
        "O ministro André Mendonça determinou a abertura de inquérito para apurar a participação de Flávio Bolsonaro em supostos crimes relacionados ao financiamento do filme Dark Horse. A inclusão do senador como investigado ocorreu em julho e tornou-se pública posteriormente.",

      eixos: [
        "acontecimentos-publicos",
        "fontes-atualizacoes",
      ],

      natureza: [
        "em-investigacao",
        "atualizada",
      ],

      fatoDocumentado: [
        "Flávio Bolsonaro foi incluído como investigado em 22 de julho de 2026.",
        "O inquérito apura possíveis crimes relacionados ao financiamento do filme Dark Horse.",
      ],

      desdobramentos: [
        "A existência de investigação não constitui conclusão de responsabilidade criminal. Novos atos e decisões do procedimento deverão ser acrescentados cronologicamente.",
      ],

      fontes: [
        {
          id: "agencia-brasil-dark-horse-2026",
          titulo:
            "Mendonça incluiu Flávio Bolsonaro como investigado no caso Dark Horse",
          veiculoOuInstituicao: "Agência Brasil",
          url: "https://agenciabrasil.ebc.com.br/justica/noticia/2026-09/mendonca-incluiu-flavio-bolsonaro-como-investigado-no-caso-dark-horse",
          tipo: "reportagem",
          publicadaEm: "2026-09-11",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },
  ],
};