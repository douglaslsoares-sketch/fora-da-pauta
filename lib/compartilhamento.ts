/** Identidade e texto oficiais do compartilhamento geral do Fora da Pauta. */
export const imagemCompartilhamento = "/compartilhar/capa?v=5";
export const imagemCompartilhamentoAbsoluta = "https://www.foradapauta.org/compartilhar/capa?v=5";

/** Imagem da confirmação de inscrição no Telegram — identidade de dois traços. */
export const imagemConfirmacaoTelegram = "https://www.foradapauta.org/telegram/capa-confirmacao?v=dois-tracos-1";

export const mensagemCompartilhamento = [
  "*FORA DA PAUTA*",
  "",
  "Quem forma sua opinião? Você ou quem escolhe a informação que chega até você?",
  "",
  "Investigamos interesses e motivações que possam existir na escolha dos assuntos que ganham destaque e daqueles que ficam de fora. Procuramos desvendar o que está por trás das informações e os motivos pelos quais elas são apresentadas de uma determinada maneira e não de outra, para que você tire suas próprias conclusões. Será que, por trás da informação que chega até você, existe alguma intenção de direcionar sua opinião para determinada conclusão?",
  "",
  "*Conhecer é importante. Entender é fundamental.*",
  "",
  "É gratuito.",
  "",
  "https://foradapauta.org",
].join("\n");

export const linkCompartilhamentoWhatsApp =
  "https://wa.me/?text=" + encodeURIComponent(mensagemCompartilhamento);
