/**
 * Prepara a leitura integral de um rascunho em pequenos blocos para GPT-Live.
 * Não chama API, não cria áudio, não altera o artigo, não publica conteúdo.
 *
 * A divisão é determinística e conservadora (caracteres, não tokens reais).
 * Como o GPT-Live pode parafrasear, toda gravação exige revisão humana.
 */
export type BlocoRoteiro = {
  tipo: "titulo" | "subtitulo" | "paragrafo";
  texto: string;
};

export type TrechoLive = {
  numero: number;
  texto: string;
  mensagem: string;
  caracteres: number;
};

export const INSTRUCAO_LEITURA_LIVE = [
  "Leia SOMENTE o TEXTO abaixo, literalmente, sem comentários ou acréscimos.",
  "Use a Voz 01 natural e tranquila, num ritmo levemente mais lento,",
  "com pequenos respiros entre frases e pausas um pouco maiores entre parágrafos.",
  "Não diga números de trechos nem leia estas instruções.",
  "",
  "TEXTO:",
].join(" ");

export const LIMITE_MENSAGEM_CARACTERES = 790;
// A divisão abaixo deixa espaço suficiente para a instrução acima.
const MAX_TEXTO = LIMITE_MENSAGEM_CARACTERES - INSTRUCAO_LEITURA_LIVE.length - 3;

function normalizar(texto: string) {
  // Remove somente a marcação tipográfica de negrito e espaços duplicados.
  return texto.replace(/\*\*([\s\S]*?)\*\*/g, "$1").replace(/\s+/g, " ").trim();
}

function partirPalavras(texto: string, maximo: number) {
  const partes: string[] = [];
  let atual = "";
  for (const palavra of texto.split(" ")) {
    if (palavra.length > maximo) {
      throw new Error("Palavra maior que limite: revise o roteiro antes de narrar.");
    }
    if (atual && atual.length + 1 + palavra.length > maximo) {
      partes.push(atual);
      atual = palavra;
    } else {
      atual = atual ? atual + " " + palavra : palavra;
    }
  }
  if (atual) partes.push(atual);
  return partes;
}

function unidadesDeLeitura(texto: string, maximo: number) {
  if (texto.length <= maximo) return [texto];
  // Só quebra frases longas quando um parágrafo não cabe sozinho.
  // Não divide abreviações decimais como 51,79 nem milhares como 64.256.232.
  const frases = texto.split(/(?<=[.!?…])\s+(?=[A-ZÀ-Ú“"¿])/u);
  const unidades: string[] = [];
  for (const frase of frases) {
    if (frase.length <= maximo) unidades.push(frase);
    else unidades.push(...partirPalavras(frase, maximo));
  }
  return unidades;
}

export function criarTrechosLive(blocos: BlocoRoteiro[]): TrechoLive[] {
  if (!blocos.length) throw new Error("Roteiro vazio.");
  const normalizados = blocos.map(b => ({ ...b, texto: normalizar(b.texto) }));
  if (normalizados.some(b => !b.texto || b.texto.includes("**"))) {
    throw new Error("Bloco vazio ou marcação de negrito não tratada.");
  }

  const conjuntos: string[] = [];
  let atual = "";
  for (const bloco of normalizados) {
    const partes = unidadesDeLeitura(bloco.texto, MAX_TEXTO);
    let primeira = true;
    for (const parte of partes) {
      const separador = atual ? (primeira ? "\n\n" : " ") : "";
      // Se o parágrafo foi dividido, preserva o espaço entre suas frases.
      const candidato = atual + separador + parte;
      if (candidato.length > MAX_TEXTO && atual) {
        conjuntos.push(atual);
        atual = parte;
      } else {
        atual = candidato;
      }
      primeira = false;
    }
  }
  if (atual) conjuntos.push(atual);

  // O limite é sobre a mensagem INTEIRA, não só sobre o artigo.
  const trechos = conjuntos.map((texto, i) => {
    const mensagem = INSTRUCAO_LEITURA_LIVE + "\n\n" + texto;
    if (mensagem.length > LIMITE_MENSAGEM_CARACTERES) {
      throw new Error("Trecho excede o limite conservador para GPT-Live.");
    }
    return {
      numero: i + 1,
      texto,
      mensagem,
      caracteres: mensagem.length,
    };
  });

  // Validação de fidelidade: todos os blocos precisam aparecer,
  // preservando palavras e pontuação (ignorando apenas espaçamento).
  const original = normalizados.map(b => b.texto).join(" ").replace(/\s+/g, " ");
  const reconstruido = trechos.map(t => t.texto).join(" ").replace(/\s+/g, " ");
  if (reconstruido !== original) {
    throw new Error("Divisão alterou ou omitiu conteúdo do artigo.");
  }
  return trechos;
}
