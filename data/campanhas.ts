export type CampaignSection = {
  title: string;
  eyebrow?: string;
  paragraphs: string[];
};

export type Campaign = {
  slug: string;
  brand: string;
  title: string;
  statement: string;
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
    statement: "Vote em candidatos que defendem o fim da escala 6x1.",
    sections: [
      {
        eyebrow: "A mensagem",
        title: "Por quê?",
        paragraphs: [
          "A escala 6x1 organiza a rotina em seis dias de trabalho para um dia de descanso. Esta campanha defende a substituição por uma jornada 5x2, com cinco dias de trabalho e dois de descanso, **sem redução de salário**.",
          "A proposta busca ampliar o tempo disponível para descanso, convivência familiar, estudo, lazer e vida pessoal — colocando qualidade de vida e dignidade no centro da discussão sobre trabalho.",
        ],
      },
      {
        eyebrow: "Para aprofundar",
        title: "Evidências",
        paragraphs: [
          "A proposta de substituir a escala 6x1 pela 5x2, sem redução salarial, parte da ideia de que trabalhar cinco dias e ter dois dias de descanso pode melhorar a qualidade de vida sem necessariamente significar menor produtividade.",
          "Experiências com redução da jornada de trabalho em diferentes países e empresas têm encontrado resultados como melhora no bem-estar, redução de estresse e esgotamento, maior satisfação profissional e manutenção — e, em alguns casos, aumento — da produtividade.",
          "Isso acontece porque produtividade não depende apenas do número de dias ou horas trabalhadas. Descanso adequado pode contribuir para maior concentração, menor absenteísmo, menor rotatividade e melhor desempenho durante o período efetivamente trabalhado.",
          "Há também argumentos contrários à mudança. Setores que funcionam durante muitos dias da semana alertam para aumento de custos, necessidade de novas contratações e dificuldades na reorganização das escalas. Esses impactos podem variar bastante conforme o setor e o tamanho da empresa.",
          "Por isso, o debate sobre o fim da escala 6x1 envolve não apenas quantos dias se trabalha, mas como organizar uma jornada que preserve a atividade econômica e, ao mesmo tempo, proporcione ao trabalhador mais tempo para descanso, família, lazer e vida pessoal.",
          "A proposta defendida nesta campanha é clara: escala 5x2, com dois dias de descanso e sem redução de salário.",
        ],
      },
    ],
    storeUrl: "https://montink.com/terceiro-nivel",
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
    shareImage: "/campanhas/compare-os-dados/compartilhar.png",
  },
];

export function getCampaign(slug: string) {
  return campaigns.find((campaign) => campaign.slug === slug);
}