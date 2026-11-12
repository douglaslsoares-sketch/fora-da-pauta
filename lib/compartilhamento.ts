/** Identidade e texto oficiais do compartilhamento geral do Fora da Pauta. */
export const imagemCompartilhamento = "/compartilhar/capa?v=1";
export const imagemCompartilhamentoAbsoluta = "https://www.foradapauta.org/compartilhar/capa?v=1";

export const mensagemCompartilhamento = [
  "*FORA DA PAUTA*",
  "",
  "*Existe muito mais por trás das notícias.*",
  "",
  "Quem ganha? Quem perde? Quais interesses estão em jogo?",
  "",
  "O Fora da Pauta investiga o que não está sendo explicado, apresenta fontes e ajuda você a entender como os acontecimentos e as decisões políticas afetam a sua vida.",
  "",
  "*Conheça. Questione. Tire suas próprias conclusões.*",
  "",
  "É gratuito.",
  "",
  "👉 https://www.foradapauta.org/?compartilhar=whatsapp",
].join("\n");

export const linkCompartilhamentoWhatsApp =
  "https://wa.me/?text=" + encodeURIComponent(mensagemCompartilhamento);
