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
      id: "2003-primeiro-mandato-alerj",

      data: {
        inicio: "2003",
        rotulo: "2003",
      },

      titulo:
        "Início do primeiro mandato na Assembleia Legislativa do Rio",

      resumo:
        "Após ser eleito em 2002, Flávio Bolsonaro iniciou seu primeiro mandato como deputado estadual do Rio de Janeiro em 2003. Naquele período, ainda cursava Direito na Universidade Candido Mendes.",

      eixos: [
        "formacao-trabalho",
        "caminho-politica",
        "exercicio-cargo",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "A Alerj registra Flávio Bolsonaro em seu primeiro mandato como deputado estadual em 2003.",
        "Uma publicação institucional da Assembleia, de junho de 2003, registrava que ele tinha 22 anos e cursava Direito na Universidade Candido Mendes.",
        "O Senado registra posteriormente que Flávio exerceu quatro mandatos como deputado estadual antes de assumir o Senado.",
      ],

      fontes: [
        {
          id: "alerj-jornal-12-2003",
          titulo:
            "Jornal da Alerj — entrevista com Flávio Bolsonaro",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://www2.alerj.rj.gov.br/jornalalerj/jornalalerj12.pdf",
          tipo: "fonte-oficial",
          publicadaEm: "2003-06",
        },
        {
          id: "senado-biografia-flavio-2019",
          titulo:
            "Flávio Bolsonaro (PSL)",
          veiculoOuInstituicao:
            "Senado Federal",
          url:
            "https://www12.senado.leg.br/noticias/materias/2019/01/18/flavio-bolsonaro-psl",
          tipo: "fonte-oficial",
          publicadaEm: "2019-01-18",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2003-mocao-adriano-nobrega",

      data: {
        inicio: "2003-10-24",
        rotulo: "24 de outubro de 2003",
      },

      titulo:
        "Apresenta moção de louvor a Adriano Magalhães da Nóbrega",

      resumo:
        "Como deputado estadual, Flávio Bolsonaro apresentou na Alerj uma moção de louvor e congratulações ao então 1º tenente da Polícia Militar Adriano Magalhães da Nóbrega.",

      eixos: [
        "exercicio-cargo",
        "acontecimentos-publicos",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
        "atualizada",
      ],

      fatoDocumentado: [
        "A Moção nº 2650/2003 foi apresentada por Flávio Bolsonaro em 24 de outubro de 2003.",
        "O documento oficial da Alerj identifica Adriano Magalhães da Nóbrega como 1º tenente da Polícia Militar e registra a homenagem por serviços prestados à sociedade.",
      ],

      oQueFoiPublicadoOuQuestionado: [
        {
          atribuicao:
            "Ministério Público do Estado do Rio de Janeiro, em comunicação institucional de 2021",
          texto:
            "Anos depois da homenagem, o MPRJ descreveu Adriano da Nóbrega como líder da milícia de Rio das Pedras e afirmou que ele exercia forte influência sobre o grupo conhecido como Escritório do Crime.",
        },
      ],

      desdobramentos: [
        "A caracterização feita pelo MPRJ é posterior à moção de 2003. Este registro cronológico não presume que informações apuradas ou divulgadas posteriormente fossem conhecidas por Flávio Bolsonaro no momento da homenagem.",
      ],

      fontes: [
        {
          id: "alerj-mocao-2650-2003",
          titulo:
            "Moção nº 2650/2003",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://alerjln1.alerj.rj.gov.br/scpro0307.nsf/0c5bf5cde95601f903256caa0023131b/7c5e3718a895341783256dc9004b6f49",
          tipo: "fonte-oficial",
          publicadaEm: "2003-11-04",
        },
        {
          id: "mprj-adriano-contexto-2021",
          titulo:
            "Operação Gárgula — comunicação institucional",
          veiculoOuInstituicao:
            "Ministério Público do Estado do Rio de Janeiro",
          url:
            "https://transparencia.mprj.mp.br/web/guest/visualizar?noticiaId=103209",
          tipo: "fonte-oficial",
          publicadaEm: "2021",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },
    {
      id: "2004-2005-laqueadura-vasectomia-controle-natalidade",

      data: {
        inicio: "2004",
        fim: "2005-11",
        rotulo: "2004–2005",
      },

      titulo:
        "Propõe laqueadura e vasectomia gratuitas e defende política de controle da natalidade",

      resumo:
        "Flávio Bolsonaro apresentou o Projeto de Lei nº 1.700/2004, que previa laqueadura e vasectomia gratuitas em estabelecimentos de saúde vinculados ao Estado do Rio. Em artigo publicado no Jornal da Alerj em 2005, relacionou a proposta a uma política que chamou de controle da natalidade, afirmando que os procedimentos seriam voluntários e sujeitos às exigências legais.",

      eixos: [
        "exercicio-cargo",
        "acontecimentos-publicos",
        "o-que-diz-e-defende",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
        "publicado",
      ],

      fatoDocumentado: [
        "O Projeto de Lei nº 1.700/2004 é registrado pela Alerj como de autoria de Flávio Bolsonaro.",
        "A proposição tratava da gratuidade da laqueadura e da vasectomia em estabelecimentos de saúde vinculados ao Estado do Rio de Janeiro.",
        "Em novembro de 2005, o Jornal da Alerj publicou texto assinado por Flávio Bolsonaro em que ele voltou a apresentar o projeto como instrumento de planejamento da quantidade de filhos.",
      ],

      oQueFoiPublicadoOuQuestionado: [
        {
          atribuicao:
            "Flávio Bolsonaro, em texto publicado pelo Jornal da Alerj em novembro de 2005",
          texto:
            "O deputado afirmou que o projeto permitiria, voluntariamente e observadas as exigências legais, que homens e mulheres sem recursos para pagar por esterilização cirúrgica tivessem acesso aos procedimentos. No mesmo texto, defendeu o que chamou de política de controle da natalidade e relacionou o tema a educação, saúde, moradia e condições de vida.",
        },
      ],

      desdobramentos: [
        "Na legislação federal então vigente, planejamento familiar era definido como direito e a Lei nº 9.263/1996 proibia sua utilização para qualquer tipo de controle demográfico.",
        "A mesma lei federal regulamentava a esterilização voluntária mediante requisitos específicos. A referência de Flávio Bolsonaro a controle da natalidade e a expressão legal controle demográfico são registradas separadamente nesta ficha; este evento não faz conclusão jurídica sobre eventual equivalência entre os termos.",
        "O tema reaparece posteriormente na trajetória parlamentar de Flávio Bolsonaro em iniciativas relacionadas a planejamento familiar, registradas em outro ponto desta cronologia.",
      ],

      fontes: [
        {
          id: "alerj-pl-1700-2004",
          titulo:
            "Projeto de Lei nº 1700/2004 — laqueadura e vasectomia gratuitas",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=58&url=L3RhcWFsZXJqMjAwNi5uc2YvNWQ1MGQzOWJkOTc2MzkxYjgzMjU2NTM2MDA2YTI1MDIvODBmOTc2ZWI3OGNjZWNkOTgzMjU3MGIzMDA2ZGRkOWQ%2FT3BlbkRvY3VtZW50",
          tipo: "fonte-oficial",
        },
        {
          id: "jornal-alerj-105-controle-natalidade",
          titulo:
            "Jornal da Alerj nº 105 — Em debate: a remoção de favelas do Rio",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://www2.alerj.rj.gov.br/jornalalerj/jornalalerj105.pdf",
          tipo: "fonte-oficial",
          publicadaEm: "2005-11-08",
        },
        {
          id: "lei-federal-9263-planejamento-familiar",
          titulo:
            "Lei nº 9.263, de 12 de janeiro de 1996",
          veiculoOuInstituicao:
            "Presidência da República",
          url:
            "https://www.planalto.gov.br/ccivil_03/leis/l9263.htm",
          tipo: "fonte-oficial",
          publicadaEm: "1996-01-12",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },
    {
      id: "2005-medalha-tiradentes-adriano-nobrega",

      data: {
        inicio: "2005-06-15",
        rotulo: "15 de junho de 2005",
      },

      titulo:
        "Propõe Medalha Tiradentes a Adriano Magalhães da Nóbrega",

      resumo:
        "Flávio Bolsonaro apresentou projeto de resolução para conceder a Medalha Tiradentes e respectivo diploma ao então 1º tenente da Polícia Militar Adriano Magalhães da Nóbrega. A proposta foi posteriormente aprovada pela Alerj.",

      eixos: [
        "exercicio-cargo",
        "acontecimentos-publicos",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
        "atualizada",
      ],

      fatoDocumentado: [
        "O Projeto de Resolução nº 1067/2005 foi apresentado por Flávio Bolsonaro em 15 de junho de 2005.",
        "A proposta previa a concessão da Medalha Tiradentes e respectivo diploma a Adriano Magalhães da Nóbrega.",
        "A Alerj registra aprovação da proposição em 24 de agosto de 2005 e resultado final como Resolução nº 931/2005.",
      ],

      oQueFoiPublicadoOuQuestionado: [
        {
          atribuicao:
            "Ministério Público do Estado do Rio de Janeiro, em comunicação institucional de 2021",
          texto:
            "Anos depois da concessão da homenagem, o MPRJ descreveu Adriano da Nóbrega como líder da milícia de Rio das Pedras e afirmou que ele exercia forte influência sobre o grupo conhecido como Escritório do Crime.",
        },
      ],

      desdobramentos: [
        "O contexto criminal atribuído posteriormente a Adriano pelo MPRJ é apresentado como desenvolvimento posterior e separado do ato legislativo de 2005.",
        "A cronologia não permite concluir, apenas com esses documentos, que informações apuradas posteriormente fossem conhecidas por Flávio Bolsonaro quando propôs a homenagem.",
      ],

      fontes: [
        {
          id: "alerj-pr-1067-2005",
          titulo:
            "Projeto de Resolução nº 1067/2005",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://alerjln1.alerj.rj.gov.br/scpro0307.nsf/e4bb858a5b3d42e383256cee006ab66a/66ed6d7f6f4d035583257021004902c3",
          tipo: "fonte-oficial",
          publicadaEm: "2005-06-23",
        },
        {
          id: "mprj-adriano-contexto-2021-medalha",
          titulo:
            "Operação Gárgula — comunicação institucional",
          veiculoOuInstituicao:
            "Ministério Público do Estado do Rio de Janeiro",
          url:
            "https://transparencia.mprj.mp.br/web/guest/visualizar?noticiaId=103209",
          tipo: "fonte-oficial",
          publicadaEm: "2021",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },
    {
      id: "2005-2006-formacao-direito-oab",

      data: {
        inicio: "2005",
        fim: "2006-07",
        rotulo: "2005–2006",
      },

      titulo:
        "Conclusão do curso de Direito e inscrição profissional",

      resumo:
        "Flávio Bolsonaro concluiu o curso de Direito na Universidade Candido Mendes em 2005. Segundo informação da OAB reproduzida em apuração jornalística, obteve a carteira profissional em julho de 2006.",

      eixos: [
        "formacao-trabalho",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
        "publicado",
      ],

      fatoDocumentado: [
        "A formação em Direito pela Universidade Candido Mendes é registrada também na biografia institucional do Senado.",
        "A apuração publicada em 2019 informa, com base em dados fornecidos pela OAB, conclusão do curso em 2005 e obtenção da carteira profissional em julho de 2006.",
        "Entre 2003 e 2005, o período final da graduação coincidiu com o exercício do primeiro mandato estadual.",
      ],

      fontes: [
        {
          id: "folha-bbc-formacao-direito-2019",
          titulo:
            "Flávio Bolsonaro ocupou cargo na Câmara enquanto fazia faculdade e estágio no Rio",
          veiculoOuInstituicao:
            "BBC News Brasil / Folha de S.Paulo",
          url:
            "https://www1.folha.uol.com.br/poder/2019/01/flavio-bolsonaro-ocupou-cargo-na-camara-enquanto-fazia-faculdade-e-estagio-no-rio.shtml",
          tipo: "reportagem",
          publicadaEm: "2019-01-23",
        },
        {
          id: "senado-biografia-formacao",
          titulo:
            "Flávio Bolsonaro (PSL)",
          veiculoOuInstituicao:
            "Senado Federal",
          url:
            "https://www12.senado.leg.br/noticias/materias/2019/01/18/flavio-bolsonaro-psl",
          tipo: "fonte-oficial",
          publicadaEm: "2019-01-18",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2006-segunda-eleicao-alerj",

      data: {
        inicio: "2006-10-01",
        rotulo: "1º de outubro de 2006",
      },

      titulo:
        "Reeleito deputado estadual para o segundo mandato",

      resumo:
        "Flávio Bolsonaro foi reeleito deputado estadual pelo PP no Rio de Janeiro, recebendo 43.099 votos.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "Cargo disputado: deputado estadual.",
        "Partido: PP.",
        "Votação nominal registrada: 43.099 votos.",
        "Resultado: eleito.",
      ],

      fontes: [
        {
          id: "tse-resultados-2006",
          titulo:
            "Resultados — Eleições 2006",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://dadosabertos.tse.jus.br/dataset/resultados-2006",
          tipo: "fonte-oficial",
        },
        {
          id: "folha-resultados-rj-2006",
          titulo:
            "Apuração — Rio de Janeiro — Deputado Estadual",
          veiculoOuInstituicao:
            "Folha de S.Paulo",
          url:
            "https://eleicoes.folha.uol.com.br/folha/especial/2006/eleicoes/rj1de-1.html",
          tipo: "reportagem",
          publicadaEm: "2006-10-01",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2007-discurso-sobre-milicias",

      data: {
        inicio: "2007-02-07",
        rotulo: "7 de fevereiro de 2007",
      },

      titulo:
        "Discurso na Alerj sobre milícias e segurança em comunidades",

      resumo:
        "Em discurso no plenário da Alerj, Flávio Bolsonaro apresentou sua posição sobre as milícias. Argumentou contra a generalização desses grupos e afirmou que, em determinadas comunidades, policiais locais poderiam proporcionar segurança aos moradores.",

      eixos: [
        "exercicio-cargo",
        "acontecimentos-publicos",
        "o-que-diz-e-defende",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "O registro taquigráfico da Alerj identifica discurso de Flávio Bolsonaro em 7 de fevereiro de 2007 dedicado ao tema das milícias.",
        "No discurso, ele afirmou que não se deveria generalizar a atuação das milícias a partir de casos de abuso e sustentou que havia situações em que policiais moradores das comunidades atuavam contra criminosos.",
        "Também criticou políticos e entidades ligados aos direitos humanos e defendeu a necessidade de rediscutir aspectos sociais, constitucionais, penais e processuais relacionados ao tema.",
      ],

      desdobramentos: [
        "Este registro apresenta a posição pública manifestada naquele momento. A inclusão do discurso na cronologia não significa concordância ou discordância editorial do Fora da Pauta com as afirmações feitas.",
      ],

      fontes: [
        {
          id: "alerj-discurso-milicias-2007",
          titulo:
            "Discurso de Flávio Bolsonaro — sessão de 7 de fevereiro de 2007",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=58&url=L3RhcWFsZXJqMjAwNi5uc2YvOGI5OWNhMzhlMDc4MjZkYjAzMjU2NTMwMDA0NmZkZjEvYzcyYWY4ODI5NTQwZWFkZDgzMjU3YjZiMDA2MjUyOTk%2FT3BlbkRvY3VtZW50JkV4cGFuZFNlY3Rpb249MSNfU2VjdGlvbjE%3D",
          tipo: "fonte-oficial",
          publicadaEm: "2007-02-07",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },
    {
      id: "2008-2010-planejamento-familiar",

      data: {
        inicio: "2008",
        fim: "2010",
        rotulo: "2008–2010",
      },

      titulo:
        "Atuação na Alerj em planejamento familiar",

      resumo:
        "Registros da Alerj mostram Flávio Bolsonaro na presidência da Comissão Especial de Planejamento Familiar. Um projeto de sua autoria deu origem à Lei estadual nº 5.646/2010, que instituiu 2010 como o Ano do Planejamento Familiar no Estado do Rio de Janeiro.",

      eixos: [
        "exercicio-cargo",
        "o-que-diz-e-defende",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "Em março de 2008, publicação institucional da Alerj identificava Flávio Bolsonaro como presidente da Comissão Especial de Planejamento Familiar.",
        "O Projeto de Lei nº 2.760/2009, de autoria de Flávio Bolsonaro, originou a Lei estadual nº 5.646/2010.",
        "A lei instituiu 2010 como Ano do Planejamento Familiar no Estado do Rio de Janeiro e previu apoio a iniciativas de informação e acesso a serviços relacionados ao tema.",
      ],

      fontes: [
        {
          id: "alerj-planejamento-familiar-2008",
          titulo:
            "Jornal da Alerj — Planejamento familiar",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://www2.alerj.rj.gov.br/jornalalerj/jornalalerj169.pdf",
          tipo: "fonte-oficial",
          publicadaEm: "2008-03",
        },
        {
          id: "alerj-lei-5646-2010",
          titulo:
            "Lei nº 5.646, de 15 de janeiro de 2010",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://www3.alerj.rj.gov.br/lotus_notes/default.asp?URL=L0NPTlRMRUkuTlNGL2M4YWEwOTAwMDI1ZmVlZjYwMzI1NjRlYzAwNjBkZmZmL2VmYzY5YTU0MDM4Y2ZkZTc4MzI1NzZiZTAwNjMyZGUzP09wZW5Eb2N1bWVudA%3D%3D&id=2",
          tipo: "fonte-oficial",
          publicadaEm: "2010-01-15",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2009-relator-comissao-cumprimento-leis",

      data: {
        inicio: "2009-02-19",
        fim: "2009-06-16",
        rotulo: "Fevereiro a junho de 2009",
      },

      titulo:
        "Atua como relator de comissão sobre cumprimento das leis",

      resumo:
        "Flávio Bolsonaro foi designado relator de uma comissão especial da Alerj criada para acompanhar o cumprimento das leis estaduais. Em junho, apresentou relatório parcial que concluiu pela apresentação de seis projetos de lei.",

      eixos: [
        "exercicio-cargo",
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "Em 19 de fevereiro de 2009, Flávio Bolsonaro foi designado relator da Comissão Especial para Acompanhar o Cumprimento das Leis.",
        "A comissão analisava dificuldades de cumprimento e a necessidade de revisão, consolidação ou revogação de normas estaduais.",
        "Na reunião de 16 de junho de 2009, Flávio apresentou relatório parcial que concluiu pela apresentação de seis projetos de lei.",
        "A ata registra que o relatório parcial foi aprovado por unanimidade pelos membros presentes.",
      ],

      fontes: [
        {
          id: "alerj-comissao-cumprimento-leis-instalacao-2009",
          titulo:
            "Ata da reunião de instalação da Comissão Especial — Requerimento nº 105/2007",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=69&url=L2NvbXRlbXAubnNmLzBkMDM0Y2ZmNzViMjg4ZGUwMzI1NmJiMTAwNWJlN2Y4LzlhMTYxNzU0MWUzZDk2MWY4MzI1NzU3MTAwNjgxNzRhP09wZW5Eb2N1bWVudA%3D%3D",
          tipo: "fonte-oficial",
          publicadaEm: "2009-03-09",
        },
        {
          id: "alerj-comissao-cumprimento-leis-relatorio-2009",
          titulo:
            "Ata da 6ª reunião ordinária da Comissão Especial para Acompanhar o Cumprimento das Leis",
          veiculoOuInstituicao:
            "Assembleia Legislativa do Estado do Rio de Janeiro",
          url:
            "https://www3.alerj.rj.gov.br/lotus_notes/default.asp?id=69&url=L2NvbXRlbXAubnNmLzBkMDM0Y2ZmNzViMjg4ZGUwMzI1NmJiMTAwNWJlN2Y4LzQ4NGI4MmZjZWIzMmFlY2Y4MzI1NzVkODAwNjc4ZTI3P09wZW5Eb2N1bWVudA%3D%3D",
          tipo: "fonte-oficial",
          publicadaEm: "2009-06-16",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },
    {
      id: "2010-terceira-eleicao-alerj",

      data: {
        inicio: "2010-10-03",
        rotulo: "3 de outubro de 2010",
      },

      titulo:
        "Eleito para o terceiro mandato de deputado estadual",

      resumo:
        "Flávio Bolsonaro concorreu novamente pelo PP e recebeu 58.322 votos para deputado estadual no Rio de Janeiro, sendo eleito.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "Cargo disputado: deputado estadual.",
        "Partido: PP.",
        "Votação nominal registrada: 58.322 votos.",
        "Resultado: eleito.",
      ],

      fontes: [
        {
          id: "tse-resultados-2010",
          titulo:
            "Resultados — Eleições 2010",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://dadosabertos.tse.jus.br/dataset/resultados-2010",
          tipo: "fonte-oficial",
        },
        {
          id: "hub-politico-flavio-2010",
          titulo:
            "Flávio Bolsonaro — eleição de 2010",
          veiculoOuInstituicao:
            "Hub Político — dados do TSE",
          url:
            "https://hubpolitico.com.br/perfil/flaviobolsonaro/eleicoes/2010",
          tipo: "documento",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2014-quarta-eleicao-alerj",

      data: {
        inicio: "2014-10-05",
        rotulo: "5 de outubro de 2014",
      },

      titulo:
        "Eleito para o quarto mandato de deputado estadual",

      resumo:
        "Flávio Bolsonaro foi novamente eleito deputado estadual pelo PP. Recebeu 160.359 votos e iniciou seu quarto mandato consecutivo na Assembleia Legislativa do Rio.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "Cargo disputado: deputado estadual.",
        "Partido: PP.",
        "Votação nominal registrada: 160.359 votos.",
        "Resultado: eleito.",
        "Foi o quarto mandato estadual consecutivo de Flávio Bolsonaro.",
      ],

      fontes: [
        {
          id: "tse-resultados-2014",
          titulo:
            "Resultados — Eleições 2014",
          veiculoOuInstituicao:
            "Tribunal Superior Eleitoral",
          url:
            "https://dadosabertos.tse.jus.br/dataset/resultados-2014",
          tipo: "fonte-oficial",
        },
        {
          id: "hub-politico-flavio-2014",
          titulo:
            "Flávio Bolsonaro — eleição de 2014",
          veiculoOuInstituicao:
            "Hub Político — dados do TSE",
          url:
            "https://hubpolitico.com.br/perfil/flaviobolsonaro/eleicoes/2014",
          tipo: "documento",
        },
        {
          id: "senado-quatro-mandatos",
          titulo:
            "Flávio Bolsonaro (PSL)",
          veiculoOuInstituicao:
            "Senado Federal",
          url:
            "https://www12.senado.leg.br/noticias/materias/2019/01/18/flavio-bolsonaro-psl",
          tipo: "fonte-oficial",
          publicadaEm: "2019-01-18",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2016-candidatura-prefeitura-rio",

      data: {
        inicio: "2016-10-02",
        rotulo: "2 de outubro de 2016",
      },

      titulo:
        "Disputa a Prefeitura do Rio de Janeiro",

      resumo:
        "Flávio Bolsonaro concorreu à Prefeitura do Rio de Janeiro pelo PSC. Recebeu 424.307 votos, equivalentes a 14,00% dos votos válidos, e terminou o primeiro turno sem avançar para a etapa seguinte.",

      eixos: [
        "caminho-politica",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "Cargo disputado: prefeito do Rio de Janeiro.",
        "Partido: PSC.",
        "Votação: 424.307 votos.",
        "Percentual dos votos válidos: 14,00%.",
        "Resultado: não eleito.",
      ],

      fontes: [
        {
          id: "tre-rj-eleicoes-2016",
          titulo:
            "Eleições 2016",
          veiculoOuInstituicao:
            "Tribunal Regional Eleitoral do Rio de Janeiro",
          url:
            "https://www.tre-rj.jus.br/institucional/memoria/eleicoes-2016",
          tipo: "fonte-oficial",
        },
        {
          id: "uol-resultados-prefeitura-rio-2016",
          titulo:
            "Apuração do primeiro turno no Rio de Janeiro",
          veiculoOuInstituicao:
            "UOL Eleições",
          url:
            "https://placar.eleicoes.uol.com.br/2016/1turno/rj/rio-de-janeiro/",
          tipo: "reportagem",
          publicadaEm: "2016-10-02",
        },
      ],

      ultimaVerificacao: "2026-09-25",
    },

    {
      id: "2018-eleicao-senado",

      data: {
        inicio: "2018-10-07",
        rotulo: "7 de outubro de 2018",
      },

      titulo:
        "Eleito senador pelo Rio de Janeiro",

      resumo:
        "No último ano de seu quarto mandato na Alerj, Flávio Bolsonaro concorreu ao Senado pelo PSL e foi eleito pelo Rio de Janeiro com 4.380.418 votos, equivalentes a 31,36% dos votos válidos.",

      eixos: [
        "caminho-politica",
        "exercicio-cargo",
        "fontes-atualizacoes",
      ],

      natureza: [
        "documentado",
      ],

      fatoDocumentado: [
        "Cargo disputado: senador pelo Rio de Janeiro.",
        "Partido: PSL.",
        "Votação: 4.380.418 votos.",
        "Percentual dos votos válidos: 31,36%.",
        "Resultado: eleito.",
        "O mandato no Senado teve início em 2019 e vai até 2027.",
      ],

      fontes: [
        {
          id: "senado-eleicao-rj-2018",
          titulo:
            "Flávio Bolsonaro e Arolde de Oliveira são eleitos pelo Rio de Janeiro",
          veiculoOuInstituicao:
            "Senado Federal",
          url:
            "https://www12.senado.leg.br/noticias/materias/2018/10/07/flavio-bolsonaro-e-arolde-de-oliveira-sao-eleitos-pelo-rio-de-janeiro",
          tipo: "fonte-oficial",
          publicadaEm: "2018-10-07",
        },
        {
          id: "senado-jornal-eleicoes-2018",
          titulo:
            "Jornal do Senado — resultado das eleições de 2018",
          veiculoOuInstituicao:
            "Senado Federal",
          url:
            "https://www2.senado.leg.br/bdsf/bitstream/handle/id/548757/2018-10-08.pdf",
          tipo: "fonte-oficial",
          publicadaEm: "2018-10-08",
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