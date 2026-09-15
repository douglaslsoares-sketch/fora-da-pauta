export type ProjectTimelineEvent = {
  id: string;
  date: string;
  sequence: number;
  category: string;
  title: string;
  description: string;
};

export const projectTimelineEvents:
  ProjectTimelineEvent[] = [

  {
    id: "2026-09-14-contato-juridico-enviado",
    date: "2026-09-14",
    sequence: 90,
    category: "Consulta",
    title:
      "Contato jurídico preventivo enviado",
    description:
      "O contato inicial foi enviado por formulário institucional para solicitar análise preventiva sobre a estrutura do projeto, sua compatibilidade com a situação previdenciária do titular e quais dados pessoais precisam ou não ser divulgados publicamente.",
  },{
    id: "2026-09-14-prelancamento-v1",
    date: "2026-09-14",
    sequence: 80,
    category: "Desenvolvimento",
    title:
      "Primeira versão pública do pré-lançamento entra em construção",
    description:
      "A página passa a apresentar o novo conceito do Fora da Pauta, leitura em áudio, retomada de leitura, Espinha Dorsal, sustentabilidade, Telegram e compartilhamento universal.",
  },
  {
    id: "2026-09-14-identidade",
    date: "2026-09-14",
    sequence: 70,
    category: "Identidade",
    title:
      "Nova identidade visual definida",
    description:
      "Adotado o logotipo ForaDaPauta.org e definido o favicon com F branco e ponto amarelo sobre fundo preto.",
  },
  {
    id: "2026-09-14-conceito",
    date: "2026-09-14",
    sequence: 60,
    category: "Princípios",
    title:
      "Fora da Pauta passa a ser apresentado como espaço público de fala e escuta",
    description:
      "O projeto deixa de ser apresentado principalmente como publicação e passa a ser estruturado como espaço público de fala, escuta, informação, verificação, documentação e participação.",
  },
  {
    id: "2026-09-14-participacao-audio",
    date: "2026-09-14",
    sequence: 50,
    category: "Participação",
    title:
      "Fluxo de participação por áudio definido",
    description:
      "A pessoa fala livremente, o sistema interpreta, devolve o entendimento para conferência e só registra a manifestação depois da confirmação.",
  },
  {
    id: "2026-09-14-sustentacao",
    date: "2026-09-14",
    sequence: 40,
    category: "Sustentabilidade",
    title:
      "Regras centrais da sustentação refinadas",
    description:
      "O modelo em construção prevê contribuição voluntária, uma cota por pessoa em cada período de 12 meses e consulta antes de eventual redimensionamento do valor.",
  },
  {
    id: "2026-09-14-espinha",
    date: "2026-09-14",
    sequence: 30,
    category: "Transparência",
    title:
      "Espinha Dorsal definida como registro permanente do projeto",
    description:
      "Foi definido que os acontecimentos do Fora da Pauta serão registrados em ordem cronológica, preservando publicamente a história de sua construção e funcionamento.",
  },
  {
    id: "2026-09-14-pautas",
    date: "2026-09-14",
    sequence: 20,
    category: "Participação",
    title:
      "Sugestão de pautas passa a partir da fala livre das pessoas",
    description:
      "As sugestões serão recebidas sem lista pré-definida, interpretadas e confirmadas pela própria pessoa, com agregação por tema e prestação de contas sobre o tratamento dado às sugestões.",
  },
  {
    id: "2026-09-13-consulta-juridica",
    date: "2026-09-13",
    sequence: 10,
    category: "Consulta",
    title:
      "Consulta jurídica preventiva iniciada",
    description:
      "Enviado o primeiro contato para análise preventiva da estrutura jurídica e previdenciária relacionada à implantação do projeto.",
  },
];

function chave(
  evento: ProjectTimelineEvent,
) {
  return `${evento.date}-${String(
    evento.sequence,
  ).padStart(4, "0")}`;
}

export function getProjectTimelineEvents() {
  return [
    ...projectTimelineEvents,
  ].sort(
    (a, b) =>
      chave(b).localeCompare(
        chave(a),
      ),
  );
}