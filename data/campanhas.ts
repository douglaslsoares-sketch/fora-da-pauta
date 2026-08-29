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
      "A proposta é trocar a escala 6x1 pela 5x2, sem redução de salário. Veja o que muda e quem apoia essa mudança.",
    comparison: {
      eyebrow: "Entenda rapidamente",
      title: "6x1 ou 5x2: qual é a diferença?",
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
          "Hoje, a Constituição permite uma jornada de até 44 horas por semana. Na escala 6x1, a pessoa trabalha seis dias e folga um.",
          "A Câmara dos Deputados aprovou uma proposta para reduzir a jornada máxima para 40 horas por semana, com cinco dias de trabalho e dois de descanso.",
          "A mudança é **sem redução de salário**. A proposta agora precisa ser analisada pelo Senado.",
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
          "Quem defende o fim da escala 6x1 diz que dois dias de folga fazem diferença na vida de quem trabalha.",
          "É mais tempo para **descansar, ficar com a família, estudar, cuidar da saúde e resolver as coisas do dia a dia**.",
          "A ideia é simples: **trabalhar um dia a menos por semana, ter um dia a mais de folga e manter o salário**.",
        ],
      },
      {
        eyebrow: "O outro lado do debate",
        title: "Quais são as preocupações?",
        paragraphs: [
          "Empresas e serviços que funcionam todos os dias podem precisar mudar turnos, contratar mais gente ou ter custos maiores.",
          "O impacto pode ser diferente de um setor para outro e também conforme o tamanho da empresa.",
          "Por isso, a discussão não é só sobre reduzir a jornada. Também é sobre **como fazer essa mudança funcionar na prática**.",
        ],
      },
      {
        eyebrow: "O que dizem os estudos",
        title: "Evidências",
        paragraphs: [
          "Estudos indicam que trabalhar menos horas pode trazer **mais bem-estar e melhor equilíbrio entre trabalho e vida pessoal**.",
          "Um grande estudo internacional publicado em 2025 acompanhou trabalhadores que passaram para uma semana de quatro dias, sem redução de salário. Houve **menos esgotamento, maior satisfação com o trabalho e melhora na saúde física e mental**.",
          "Mas é importante fazer uma diferença: esse estudo analisou **quatro dias de trabalho**, enquanto a proposta brasileira prevê cinco dias e até 40 horas semanais. Por isso, ele ajuda a entender o que pode acontecer quando se reduz o tempo de trabalho, **mas não prova qual será o resultado no Brasil**.",
        ],        references: [
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
          "A Câmara dos Deputados já aprovou a proposta. Agora ela está no Senado.",
          "Na Comissão de Constituição e Justiça (CCJ), o relator Omar Aziz apresentou parecer **favorável à aprovação** e manteve o texto aprovado pela Câmara.",
          "O próximo passo é a votação na CCJ. Depois, a proposta ainda precisa passar pelo Plenário do Senado. **A mudança ainda não está em vigor**.",
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
    storeUrl: "https://montink.com/fora-da-pauta/?cat=fim-da-escala-6x1",
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
    storeUrl: "https://montink.com/fora-da-pauta/?cat=fim-da-escala-6x1",
    shareImage: "/campanhas/compare-os-dados/compartilhar.png",
  },
];

export function getCampaign(slug: string) {
  return campaigns.find((campaign) => campaign.slug === slug);
}