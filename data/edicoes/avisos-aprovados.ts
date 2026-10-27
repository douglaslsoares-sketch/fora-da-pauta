/**
 * Registro EXPLÍCITO de edições aprovadas para aviso.
 *
 * Manter vazio até uma edição estar publicada, documentada, com áudio
 * funcionando e autorizada editorialmente. A existência de uma página
 * ou de uma data em data/campanhas.ts NÃO autoriza notificação.
 * Nada aqui ativa envio para produção por si só.
 */
export type EdicaoAprovadaParaAviso = {
  slug: string;
  revisao: string;
  titulo: string;
  resumo: string;
  publicadoEm: string;
  endereco: string;
  fontes: readonly { titulo: string; url: string }[];
};

/** A primeira edição "O jogo sendo jogado" ainda não foi publicada. */
export const edicoesAprovadasParaAviso: readonly EdicaoAprovadaParaAviso[] = [];
