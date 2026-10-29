"use strict";

/**
 * Prepara o pacote LOCAL de revisão de um áudio já gravado para a edição.
 * Não gera voz, não acessa rede, não aprova nem publica gravações.
 *
 * node scripts/audio/validar-gravacao-edicao.cjs --status
 * node scripts/audio/validar-gravacao-edicao.cjs --preparar /caminho/gravacao.mp3
 * node scripts/audio/validar-gravacao-edicao.cjs --verificar
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { prepararRoteiro } = require("./preparar-roteiro-edicao.cjs");

const RAIZ = path.resolve(__dirname, "../..");
const PASTA_PRIVADA = path.join(RAIZ, ".local", "audio-review", "lula-venceu-o-globo");
const NOME_AUDIO = "gravacao.mp3";
const NOME_MANIFESTO = "revisao.json";
const MAX_BYTES = 80 * 1024 * 1024;
const MIN_BYTES = 1024;

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function lerMp3(caminho) {
  const stat = fs.lstatSync(caminho);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error("A gravação precisa ser um arquivo MP3 regular (não um link).");
  }
  if (stat.size < MIN_BYTES || stat.size > MAX_BYTES) {
    throw new Error("Tamanho de gravação inválido (1 KiB a 80 MiB).");
  }
  const bytes = fs.readFileSync(caminho);
  const id3 = bytes.toString("ascii", 0, 3) === "ID3";
  const frameMpeg = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
  if (!id3 && !frameMpeg) {
    throw new Error("Cabeçalho MP3 não reconhecido.");
  }
  // Cabeçalho é só triagem. Audição humana integral continua obrigatória.
  return bytes;
}

function prepararPacote(arquivo, pasta = PASTA_PRIVADA) {
  if (typeof arquivo !== "string" || !arquivo.trim()) {
    throw new Error("Informe o caminho local de um MP3 já gravado.");
  }
  const audioDestino = path.join(pasta, NOME_AUDIO);
  const manifestoDestino = path.join(pasta, NOME_MANIFESTO);
  if (fs.existsSync(audioDestino) || fs.existsSync(manifestoDestino)) {
    throw new Error("Já existe um pacote. Não sobrescrever gravação em revisão.");
  }
  const bytes = lerMp3(path.resolve(arquivo));
  const roteiro = prepararRoteiro();
  const manifesto = {
    schema: 1,
    estado: "aguardando_revisao_humana",
    edicao: roteiro.slug,
    arquivo_local: NOME_AUDIO,
    versao_texto_sha256: roteiro.assinatura_sha256,
    gravacao_sha256: sha256(bytes),
    tamanho_bytes: bytes.length,
    gravacao_criada_por: "origem_nao_auditada",
    narracao_aprovada: false,
    artigo_aprovado: false,
    verificada_por: null,
    criado_em: new Date().toISOString(),
    observacao: "Associação por hashes NÃO verifica palavras faladas. Conferir áudio integral e texto manualmente antes de aprovar."
  };
  fs.mkdirSync(pasta, { recursive: true });
  fs.writeFileSync(audioDestino, bytes, { flag: "wx", mode: 0o600 });
  try {
    fs.writeFileSync(manifestoDestino, JSON.stringify(manifesto, null, 2) + "\n", { flag: "wx", mode: 0o600 });
  } catch (erro) {
    fs.rmSync(audioDestino, { force: true });
    throw erro;
  }
  return manifesto;
}

function verificarPacote(pasta = PASTA_PRIVADA) {
  const manifestoPath = path.join(pasta, NOME_MANIFESTO);
  const audioPath = path.join(pasta, NOME_AUDIO);
  const manifesto = JSON.parse(fs.readFileSync(manifestoPath, "utf8"));
  const roteiro = prepararRoteiro();
  if (manifesto.schema !== 1 || manifesto.estado !== "aguardando_revisao_humana" ||
      manifesto.narracao_aprovada !== false || manifesto.artigo_aprovado !== false ||
      manifesto.edicao !== roteiro.slug || manifesto.arquivo_local !== NOME_AUDIO) {
    throw new Error("Manifesto de revisão alterado ou inválido. Sem aprovação para publicação.");
  }
  if (manifesto.versao_texto_sha256 !== roteiro.assinatura_sha256) {
    throw new Error("O texto editorial mudou desde a gravação; regravar ou revisar antes de avançar.");
  }
  const bytes = lerMp3(audioPath);
  if (manifesto.gravacao_sha256 !== sha256(bytes) || manifesto.tamanho_bytes !== bytes.length) {
    throw new Error("Arquivo de áudio mudou após preparação. Revisão invalidada.");
  }
  return { estado: manifesto.estado, edicao: roteiro.slug, integridade: "conferida", fidelidade_da_fala: "nao_verificada", publicacao: "bloqueada" };
}

function main() {
  const [, , modo, arquivo] = process.argv;
  if (modo === "--status" && !arquivo) {
    process.stdout.write(fs.existsSync(path.join(PASTA_PRIVADA, NOME_MANIFESTO))
      ? JSON.stringify(verificarPacote()) + "\n"
      : "Nenhuma gravação preparada; artigo permanece sem MP3 aprovado.\n");
  } else if (modo === "--preparar" && arquivo && process.argv.length === 4) {
    const manifesto = prepararPacote(arquivo);
    process.stdout.write("Gravação copiada para pasta privada. Estado: " + manifesto.estado + ". Nenhuma publicação.\n");
  } else if (modo === "--verificar" && !arquivo) {
    process.stdout.write(JSON.stringify(verificarPacote()) + "\n");
  } else {
    throw new Error("Use --status, --preparar /caminho/gravacao.mp3 ou --verificar.");
  }
}

if (require.main === module) {
  try { main(); } catch (erro) {
    console.error("Revisão de áudio interrompida:", erro.message);
    process.exitCode = 1;
  }
}

module.exports = { prepararPacote, verificarPacote, sha256, lerMp3 };
