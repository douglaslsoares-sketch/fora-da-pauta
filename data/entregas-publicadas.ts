/**
 * Fonte das entregas efetivamente publicadas.
 * Uma entrega só entra aqui depois de verificada e exibida na respectiva página.
 * A lista vazia evita sinalizar "Novidade" enquanto a seção está em preparação.
 */
export type EntregaPublicada = {
  id: string;
  titulo: string;
  resumo: string;
  publicadaEm: string; // YYYY-MM-DD
  fonte: { nome: string; url: string };
};

export const entregasPublicadas: EntregaPublicada[] = [];
