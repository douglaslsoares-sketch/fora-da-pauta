/**
 * Modelo editorial para avisos de novas edições.
 * Este módulo apenas prepara textos: não publica, não enfileira e não envia.
 * Usar somente após revisão humana e com a edição realmente publicada.
 */
export type AvisoNovaEdicao = {
  titulo: string;
  pergunta: string;
  chamada: string;
  urlEdicao: string;
  /** Apenas informar áudio quando ele estiver disponível ao público. */
  audioDisponivel: boolean;
  /** Identificação explícita da interpretação citada, se houver. */
  atribuicao?: string;
};

function linha(valor: string, limite: number, nome: string): string {
  const texto = valor.trim().replace(/\s+/g, " ");
  if (!texto || [...texto].length > limite) {
    throw new Error(`Campo editorial inválido: ${nome}.`);
  }
  return texto;
}

export function prepararTextoAvisoNovaEdicao(dados: AvisoNovaEdicao): string {
  const titulo = linha(dados.titulo, 110, "título");
  const pergunta = linha(dados.pergunta, 220, "pergunta");
  const chamada = linha(dados.chamada, 350, "chamada");
  const atribuicao = dados.atribuicao
    ? linha(dados.atribuicao, 150, "atribuição")
    : null;

  let url: URL;
  try {
    url = new URL(dados.urlEdicao);
  } catch {
    throw new Error("Link da edição inválido.");
  }
  if (url.protocol !== "https:" ||
      url.hostname !== "www.foradapauta.org" ||
      !/^\/campanhas\/[a-z0-9-]+\/?$/.test(url.pathname) ||
      url.search || url.hash || url.username || url.password) {
    throw new Error("A edição precisa de um link direto e público do Fora da Pauta.");
  }

  const texto = [
    "👁️ NOVA EDIÇÃO | FORA DA PAUTA",
    titulo,
    pergunta,
    chamada,
    atribuicao ? `Análise de: ${atribuicao}.` : null,
    dados.audioDisponivel
      ? `📖🎧 Leia ou ouça a edição: ${url.href}`
      : `📖 Leia a edição: ${url.href}`,
  ].filter(Boolean).join("\n\n");

  if ([...texto].length > 1200) {
    throw new Error("Aviso editorial muito longo.");
  }
  return texto;
}
