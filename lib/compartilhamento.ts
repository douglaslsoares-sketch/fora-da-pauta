/** Identidade e texto oficiais do compartilhamento geral do Fora da Pauta. */
export const imagemCompartilhamento = "/compartilhar/capa?v=6";
export const imagemCompartilhamentoAbsoluta = "https://www.foradapauta.org/compartilhar/capa?v=6";

/** Imagem da confirmação de inscrição no Telegram — identidade de dois traços. */
export const imagemConfirmacaoTelegram = "https://www.foradapauta.org/telegram/capa-confirmacao?v=dois-tracos-1";

export const mensagemCompartilhamento = [
  "*FORA DA PAUTA*",
  "",
  "Você confia?",
  "",
  "O que querem que você pense, sinta ou faça a partir das informações que chegam até você?",
  "",
  "Acompanhe o Fora da Pauta e receba nossas publicações pelo WhatsApp.",
  "",
  "*Conhecer é importante. Entender é fundamental.*",
  "",
  "É gratuito.",
  "",
  "https://foradapauta.org/?compartilhar=6",
].join("\n");

export const linkCompartilhamentoWhatsApp =
  "https://wa.me/?text=" + encodeURIComponent(mensagemCompartilhamento);
