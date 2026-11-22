/** Identidade e texto oficiais do compartilhamento geral do Fora da Pauta. */
export const imagemCompartilhamento = "/compartilhar/capa?v=6";
export const imagemCompartilhamentoAbsoluta = "https://www.foradapauta.org/compartilhar/capa?v=6";

/** Imagem da confirmação de inscrição no Telegram — identidade de dois traços. */
export const imagemConfirmacaoTelegram = "https://www.foradapauta.org/telegram/capa-confirmacao?v=dois-tracos-1";

export const mensagemCompartilhamento = [
  "*FORA DA PAUTA*",
  "",
  "O que há por trás de certas notícias?",
  "",
  "Leia, ouça e compartilhe nossas publicações.",
  "",
  "https://foradapauta.org",
].join("\n");

export const linkCompartilhamentoWhatsApp =
  "https://wa.me/?text=" + encodeURIComponent(mensagemCompartilhamento);
