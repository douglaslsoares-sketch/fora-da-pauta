export type CampaignSection = {
  title: string;
  eyebrow?: string;
  paragraphs: string[];
  references?: CampaignReference[];
};

export type CampaignReference = {
  label: string;
  url: string;
};

export type CampaignComparison = {
  eyebrow?: string;
  title: string;
  left: {
    label: string;
    lines: string[];
  };
  connector: string;
  right: {
    label: string;
    lines: string[];
    emphasis?: string;
  };
  summary?: string;
};

export type Campaign = {
  slug: string;
  brand: string;
  title: string;
  statement: string;
  comparison?: CampaignComparison;
  sections: CampaignSection[];
  storeUrl?: string;
  shareImage?: string;
  pautaId?: string;
};

export const campaigns: Campaign[] = [
  {
    slug: "escala-6x1",
    brand: "Fora da Pauta",
    title: "Fim da escala 6x1",
    statement:
      "Entenda o que muda da escala 6x1 para a 5x2 — e veja quem defende essa mudança.",
    comparison: {
      eyebrow: "Entenda rapidamente",
      title: "O que você prefere?",
      left: {
        label: "6x1",
        lines: [
          "6 dias de trabalho",
          "1 dia de folga",
        ],
      },
      connector: "OU",
      right: {
        label: "5x2",
        lines: [
          "5 dias de trabalho",
          "2 dias de folga",
        ],
        emphasis: "COM O MESMO SALÁRIO",
      },
      summary:
        "Em termos simples: um dia a menos de trabalho por semana e um dia a mais de folga, mantendo o salário.",
    },
    sections: [
      {
        eyebrow: "Em linguagem simples",
        title: "O que está sendo proposto?",
        paragraphs: [
          "Hoje, a legislação permite jornada de até 44 horas semanais. A escala 6x1 significa trabalhar seis dias e descansar um.",
          "A PEC 221/2019, aprovada pela Câmara dos Deputados, propõe jornada máxima de 40 horas semanais distribuídas em cinco dias, com dois dias de descanso e **sem redução de salário**.",
          "Na prática, a proposta troca a lógica de seis dias de trabalho e um de folga por cinco dias de trabalho e dois de folga.",
        ],
        references: [
          {
            label: "Câmara dos Deputados — texto aprovado",
            url: "https://www.camara.leg.br/noticias/1277141-camara-aprova-em-dois-turnos-fim-da-escala-6x1-com-jornada-maxima-de-40-horas-semanais",
          },
        ],
      },
      {
        eyebrow: "Argumentos favoráveis",
        title: "Por que há quem defenda a mudança?",
        paragraphs: [
          "Quem defende o fim da escala 6x1 argumenta que dois dias de descanso por semana podem dar ao trabalhador mais tempo para descansar, conviver com a família, estudar, cuidar da saúde e resolver assuntos da vida cotidiana.",
          "A ideia é buscar um equilíbrio melhor entre trabalho e vida pessoal sem reduzir o salário por causa da diminuição da jornada.",
          "O argumento central é simples: o tempo fora do trabalho também faz parte da qualidade de vida.",
        ],
      },
      {
        eyebrow: "O outro lado do debate",
        title: "Quais são as preocupações?",
        paragraphs: [
          "Empresas e setores que funcionam todos os dias podem precisar reorganizar turnos, contratar mais pessoas ou absorver custos maiores. O impacto pode ser diferente conforme o setor, o tamanho da empresa e a forma de implementação.",
          "Por isso, parte do debate envolve o período de transição, a reorganização das escalas e regras para atividades que precisam funcionar continuamente.",
          "Discutir a mudança também significa discutir como ela pode ser aplicada sem ignorar as necessidades de trabalhadores, empresas e serviços.",
        ],
      },
      {
        eyebrow: "Para aprofundar",
        title: "Evidências",
        paragraphs: [
          "Pesquisas sobre redução do tempo de trabalho indicam que jornadas menores podem favorecer o equilíbrio entre trabalho e vida pessoal, o bem-estar e, em determinadas condições, a produtividade. Os resultados não são iguais em todos os setores e dependem de como o trabalho é reorganizado.",
          "Um grande estudo internacional publicado em 2025 sobre experiências de semana de quatro dias, sem redução salarial, encontrou redução de esgotamento, maior satisfação no trabalho e melhora na saúde dos participantes.",
          "Esse modelo de quatro dias não é igual à proposta brasileira de cinco dias e 40 horas. Por isso, esses estudos ajudam a entender possíveis efeitos da redução de jornada, mas não provam, sozinhos, qual será o resultado da PEC no Brasil.",
        ],
        references: [
          {
            label: "OIT — tempo de trabalho, equilíbrio e produtividade",
            url: "https://www.ilo.org/resource/news/flexible-working-hours-can-benefit-work-life-balance-businesses-and",
          },
          {
            label: "Nature Human Behaviour — estudo sobre semana de quatro dias",
            url: "https://www.nature.com/articles/d41586-025-02295-2",
          },
        ],
      },
      {
        eyebrow: "Tramitação",
        title: "Onde a proposta está agora?",
        paragraphs: [
          "A Câmara dos Deputados aprovou a PEC 221/2019 em dois turnos em 27 de maio de 2026.",
          "Situação consultada em 27 de agosto de 2026: a proposta está na Comissão de Constituição, Justiça e Cidadania do Senado, sob relatoria do senador Omar Aziz. O texto ainda pode receber alterações durante a tramitação.",
          "Portanto, a mudança ainda não está em vigor.",
        ],
        references: [
          {
            label: "Senado Federal — tramitação da PEC 221/2019",
            url: "https://www25.senado.leg.br/web/atividade/materias/-/materia/174386",
          },
          {
            label: "Câmara dos Deputados — aprovação em dois turnos",
            url: "https://www.camara.leg.br/noticias/1277141-camara-aprova-em-dois-turnos-fim-da-escala-6x1-com-jornada-maxima-de-40-horas-semanais",
          },
        ],
      },
    ],
    storeUrl: "https://montink.com/fora-da-pauta/?cat=o-fim-da-escala-6x1",
    shareImage: "/campanhas/escala-6x1/compartilhar.png",
    pautaId: "fim-escala-6x1",
  },
  {
    slug: "compare-os-dados",
    brand: "Fora da Pauta",
    title: "Lula × Bolsonaro",
    statement: "Compare os dados. Tire suas conclusões.",
    sections: [
      {
        eyebrow: "A proposta",
        title: "O que estamos comparando?",
        paragraphs: [
          "Esta página reúne indicadores econômicos e sociais de períodos dos governos Lula e Bolsonaro para facilitar uma comparação baseada em dados verificáveis.",
          "O objetivo não é escolher um vencedor por você. É apresentar os números, explicar o que cada indicador mede e permitir que você tire suas próprias conclusões.",
        ],
      },
      {
        eyebrow: "Como ler",
        title: "Os números precisam de contexto",
        paragraphs: [
          "Um mesmo indicador pode ser influenciado por fatores internos e externos. Por isso, números isolados não explicam, sozinhos, o desempenho de um governo.",
          "Sempre que possível, a comparação deve informar o período considerado, a fonte, a metodologia e acontecimentos relevantes que possam ter influenciado os resultados.",
          "Os mesmos critérios de seleção e apresentação dos dados devem ser aplicados aos dois governos.",
        ],
      },
      {
        eyebrow: "Transparência",
        title: "De onde vêm os dados?",
        paragraphs: [
          "Cada indicador apresentado nesta campanha deve estar acompanhado de sua fonte e do período de referência.",
          "A prioridade é utilizar bases oficiais, estudos acadêmicos e instituições com metodologia identificável. Quando houver diferenças entre fontes ou formas distintas de medir o mesmo fenômeno, isso deve ser indicado claramente.",
        ],
      },
    ],
    storeUrl: "https://montink.com/fora-da-pauta/?cat=lula-x-bolsonaro-compare-os-dados",
    shareImage: "/campanhas/compare-os-dados/compartilhar.png",
  },
];

export function getCampaign(slug: string) {
  return campaigns.find((campaign) => campaign.slug === slug);
}