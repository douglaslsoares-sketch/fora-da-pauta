/** Identidade e texto oficiais do compartilhamento geral do Fora da Pauta. */
export const imagemCompartilhamento = "/compartilhar/capa?v=5";
export const imagemCompartilhamentoAbsoluta = "https://www.foradapauta.org/compartilhar/capa?v=5";

/** Imagem da confirmação de inscrição no Telegram — identidade de dois traços. */
export const imagemConfirmacaoTelegram = "https://www.foradapauta.org/telegram/capa-confirmacao?v=dois-tracos-1";

export const mensagemCompartilhamento = [
  "*FORA DA PAUTA*",
  "",
  "Quem forma a sua opinião: você ou quem escolhe a informação que chega até você?",
  "",
  "Investigamos interesses e motivações que possam existir na escolha do que vira ou não notícia. Procuramos desvendar o que está por trás daquilo que é apresentado como notícia e a maneira como a notícia é apresentada, para que você tire suas próprias conclusões.",
  "",
  "*Conhecer é importante. Entender é fundamental.*",
  "",
  "É gratuito.",
  "",
  "https://foradapauta.org",
].join("\n");

export const linkCompartilhamentoWhatsApp =
  "https://wa.me/?text=" + encodeURIComponent(mensagemCompartilhamento);
