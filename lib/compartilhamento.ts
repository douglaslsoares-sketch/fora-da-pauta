/** Identidade e texto oficiais do compartilhamento geral do Fora da Pauta. */
export const imagemCompartilhamento = "/compartilhar/capa?v=2";
export const imagemCompartilhamentoAbsoluta = "https://www.foradapauta.org/compartilhar/capa?v=2";

/** Imagem da confirmação de inscrição no Telegram — identidade de dois traços. */
export const imagemConfirmacaoTelegram = "https://www.foradapauta.org/telegram/capa-confirmacao?v=dois-tracos-1";

export const mensagemCompartilhamento = [
  "*FORA DA PAUTA*",
  "",
  "*Conhecer é importante. Entender é fundamental.*",
  "",
  "Quem toma as decisões? Quais interesses estão em jogo? Como essas decisões afetam a nossa vida?",
  "",
  "O Fora da Pauta investiga o que está por trás das notícias, apresenta fontes e ajuda você a tirar suas próprias conclusões.",
  "",
  "Acompanhe também os políticos que você escolher.",
  "",
  "*É gratuito.*",
  "",
  "https://foradapauta.org",
].join("\n");

export const linkCompartilhamentoWhatsApp =
  "https://wa.me/?text=" + encodeURIComponent(mensagemCompartilhamento);
