export type Estampa = {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
  campanhaSlug: string;
};

export const estampas: Estampa[] = [
  {
    id: "vote-fim-escala-6x1",
    titulo:
      "Vote em candidatos que defendem o fim da escala 6x1",
    descricao:
      "Entenda a mensagem, confira os argumentos e veja quem defende essa mudança.",
    imagem:
      "/estampas/estampa-vote-fim-escala-6x1.png",
    campanhaSlug: "escala-6x1",
  },
  {
    id: "lula-bolsonaro-compare-dados",
    titulo:
      "Lula x Bolsonaro — Compare os dados",
    descricao:
      "Compare os dados e tire suas próprias conclusões.",
    imagem:
      "/estampas/estampa-lula-bolsonaro-compare-dados.png",
    campanhaSlug: "compare-os-dados",
  },
  {
    id: "6x1-ou-5x2",
    titulo:
      "O que você prefere? 6x1 ou 5x2",
    descricao:
      "Conheça a proposta de mudança para cinco dias de trabalho e dois de folga, sem redução salarial.",
    imagem:
      "/estampas/estampa-6x1-ou-5x2.png",
    campanhaSlug: "escala-6x1",
  },
];