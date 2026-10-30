"use strict";

/**
 * Gera uma página HTML LOCAL para ouvir e revisar um MP3 já preparado.
 *
 * NÃO cria gravação, não publica, não envia nada pela rede e não usa API.
 *
 * Pré-requisito: node scripts/audio/validar-gravacao-edicao.cjs --preparar caminho-do-mp3
 * Comando:       node scripts/audio/gerar-previa-local.cjs
 *
 * Abrir manualmente .local/audio-review/lula-venceu-o-globo/audicao.html
 */
const fs = require("node:fs");
const path = require("node:path");
const { prepararRoteiro } = require("./preparar-roteiro-edicao.cjs");
const { verificarPacote } = require("./validar-gravacao-edicao.cjs");

const PASTA_PADRAO = path.resolve(__dirname, "../../.local/audio-review/lula-venceu-o-globo");
const NOME_PREVIA = "audicao.html";

function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, caractere =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[caractere]
  );
}

function montarHtml(roteiro) {
  const corpo = roteiro.blocos.map(bloco => {
    const tag = bloco.tipo === "titulo" ? "h1" :
      bloco.tipo === "subtitulo" ? "h2" : "p";
    return "<" + tag + ">" + escaparHtml(bloco.texto) + "</" + tag + ">";
  }).join("\n");

  return [
    "<!doctype html>",
    '<html lang="pt-BR">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<meta name="robots" content="noindex, nofollow">',
    "<title>Revisão de áudio — Fora da Pauta (local)</title>",
    "<style>",
    "html{font-family:system-ui,sans-serif;background:white;color:#181818}",
    "body{max-width:46rem;margin:0 auto;padding:1.5rem 1rem 4rem;line-height:1.65}",
    "h1{font-size:1.8rem;line-height:1.25}h2{font-size:1.14rem;margin-top:1.75rem}",
    "audio{display:block;width:100%;margin:1.25rem 0}",
    ".aviso{border:1px solid #b8b8b8;background:#f5f5f5;padding:1rem}",
    "small{color:#505050;word-break:break-word}",
    "</style>",
    "</head><body>",
    "<header>",
    "<strong>Fora da Pauta — audição privada</strong>",
    '<p class="aviso"><strong>Rascunho. Áudio gerado por IA, sem aprovação.</strong> Esta página é um arquivo local para revisão; não foi publicada no site. A gravação deve ser conferida integralmente.</p>',
    "</header>",
    '<audio controls preload="metadata" src="gravacao.mp3" aria-label="Ouvir gravação em revisão">O navegador não suporta reprodução de MP3.</audio>',
    "<p><small>Roteiro: " + roteiro.quantidade_blocos + " blocos · Versão do texto SHA-256: " +
      escaparHtml(roteiro.assinatura_sha256) + "</small></p>",
    '<main aria-label="Texto correspondente à gravação">',
    corpo,
    "</main>",
    "<footer><p><small>Confira, ouvindo, se o MP3 reproduz todas as palavras, números e frases do texto acima. O código SHA-256 só detecta mudanças nos arquivos e não comprova fidelidade da narração.</small></p></footer>",
    "</body></html>"
  ].join("\n") + "\n";
}

function gerarPrevia(pasta = PASTA_PADRAO) {
  const status = verificarPacote(pasta);
  if (status.publicacao !== "bloqueada") {
    throw new Error("O pacote precisa permanecer bloqueado para publicação.");
  }
  const roteiro = prepararRoteiro();
  const nome = path.join(pasta, NOME_PREVIA);
  const html = montarHtml(roteiro);
  if (fs.existsSync(nome)) {
    const anterior = fs.readFileSync(nome, "utf8");
    if (anterior !== html) {
      throw new Error("A prévia local já existe com conteúdo diferente; não sobrescrever.");
    }
    return { caminho: nome, criado: false };
  }
  fs.writeFileSync(nome, html, { flag: "wx", mode: 0o600 });
  return { caminho: nome, criado: true };
}

if (require.main === module) {
  try {
    const resultado = gerarPrevia();
    console.log("Prévia de áudio local " + (resultado.criado ? "criada: " : "já existe: ") + resultado.caminho);
    console.log("Abra o arquivo no navegador. Nenhuma publicação ou chamada de API foi feita.");
  } catch (erro) {
    console.error("Prévia não criada:", erro.message);
    process.exitCode = 1;
  }
}

module.exports = { escaparHtml, montarHtml, gerarPrevia };
