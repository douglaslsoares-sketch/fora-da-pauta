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
  "*A desinformação aliena.*",
  "",
  "*Você pensa por si mesmo ou deixa que outros pensem por você?*",
  "",
  "Acompanhamos o jogo político, investigamos os interesses por trás das notícias e compartilhamos nossa interpretação para você tirar suas próprias conclusões.",
  "",
  "*É gratuito.*",
  "",
  "https://foradapauta.org",
].join("\n");

export const linkCompartilhamentoWhatsApp =
  "https://wa.me/?text=" + encodeURIComponent(mensagemCompartilhamento);
