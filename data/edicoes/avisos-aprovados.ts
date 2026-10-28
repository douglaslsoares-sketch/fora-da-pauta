/**
 * Somente incluir um aviso após aprovação editorial explícita da edição
 * e confirmação de que o texto e as fontes estão publicados.
 *
 * O arquivo permanece vazio enquanto "O jogo sendo jogado" for rascunho.
 */
export type AvisoEdicaoAprovado = {
  slug: string;
  revisao: string;
  publicadoEm: string;
  pergunta: string;
  chamada: string;
  atribuicao?: string;
  audioDisponivel: boolean;
  aprovado: true;
};

export const avisosEdicoesAprovados: readonly AvisoEdicaoAprovado[] = [];
