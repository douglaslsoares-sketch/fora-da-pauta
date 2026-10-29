"use strict";

/**
 * Converte um WAV estéreo DE UMA SESSÃO GPT-LIVE JÁ GRAVADA em MP3.
 * A documentação oficial informa: canal esquerdo = microfone, direito = IA.
 *
 * Uso:
 *   node scripts/audio/extrair-voz-live.cjs --verificar /caminho/sessao.wav
 *   node scripts/audio/extrair-voz-live.cjs --converter /caminho/sessao.wav
 *
 * Requer ffmpeg instalado para converter. Nunca acessa rede ou API.
 * NÃO é um clone da voz. Isola o áudio real da resposta da IA no Live.
 * NÃO garante que o conteúdo falado corresponde fielmente ao artigo.
 */
const fs = require("node:fs");
const path = require("node:path");
const child = require("node:child_process");

const RAIZ = path.resolve(__dirname, "../..");
const PASTA = path.join(RAIZ, ".local", "audio-review", "lula-venceu-o-globo");
const DESTINO = path.join(PASTA, "live-saida-para-revisao.mp3");
const LIMITE_WAV = 250 * 1024 * 1024;

function inspecionarWav(arquivo) {
  if (typeof arquivo !== "string" || !arquivo.trim()) {
    throw new Error("Informe um arquivo WAV de gravação do GPT-Live.");
  }
  const caminho = path.resolve(arquivo);
  const stat = fs.lstatSync(caminho);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size < 44 || stat.size > LIMITE_WAV) {
    throw new Error("O WAV deve ser arquivo regular, com 44 bytes a 250 MiB.");
  }
  const fd = fs.openSync(caminho, "r");
  const header = Buffer.alloc(12);
  try { fs.readSync(fd, header, 0, 12, 0); } finally { fs.closeSync(fd); }
  if (header.toString("ascii", 0, 4) !== "RIFF" ||
      header.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Arquivo não contém cabeçalho RIFF/WAVE válido.");
  }
  // FFmpeg validará codecs/canais. Não afirmar que áudio é de sessão Live
  // só porque possui um cabeçalho WAV.
  return { caminho, tamanho: stat.size, formato: "WAV", canais_esperados: 2,
    canal_do_microfone: "esquerdo (0)", canal_da_voz_ia: "direito (1)",
    canal_a_extrair: 1, saida: DESTINO };
}

function converterWav(arquivo, opcoes = {}) {
  const info = inspecionarWav(arquivo);
  const destino = opcoes.destino || DESTINO;
  if (fs.existsSync(destino)) {
    throw new Error("Já existe um MP3 nesse destino; não sobrescrever gravação anterior.");
  }
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  const ffmpeg = opcoes.ffmpeg || "ffmpeg";
  const args = [
    "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
    "-i", info.caminho, "-map", "0:a:0",
    "-af", "pan=mono|c0=c1",
    "-codec:a", "libmp3lame", "-b:a", "128k", "-ar", "24000",
    "-metadata", "comment=AI generated voice - private editorial review",
    destino
  ];
  // O uso de spawnSync com argumentos separados evita interpretação por shell.
  const resultado = child.spawnSync(ffmpeg, args, {
    encoding: "utf8", shell: false, timeout: 90000, maxBuffer: 1024 * 1024
  });
  if (resultado.error || resultado.status !== 0) {
    fs.rmSync(destino, { force: true });
    const detalhe = resultado.error && resultado.error.code === "ENOENT"
      ? "FFmpeg não encontrado. Instale o FFmpeg para converter WAV em MP3."
      : "Conversão falhou. Confirme se WAV é estéreo e contém o canal de saída da IA.";
    throw new Error(detalhe);
  }
  if (!fs.existsSync(destino) || fs.statSync(destino).size < 1024) {
    fs.rmSync(destino, { force: true });
    throw new Error("Conversão não produziu MP3 válido para revisão.");
  }
  return { destino, bytes: fs.statSync(destino).size,
    estado: "aguardando_escuta_e_conferencia_manual", publicado: false };
}

function main() {
  const [, , modo, entrada] = process.argv;
  if (!["--verificar", "--converter"].includes(modo) || !entrada || process.argv.length !== 4) {
    throw new Error("Use --verificar arquivo.wav ou --converter arquivo.wav");
  }
  const info = inspecionarWav(entrada);
  if (modo === "--verificar") {
    console.log(JSON.stringify(info, null, 2));
    console.log("Inspeção parcial: FFmpeg confirma os canais na conversão.");
  } else {
    console.log(JSON.stringify(converterWav(entrada), null, 2));
    console.log("O arquivo está em pasta privada; revise antes de qualquer uso.");
  }
}

if (require.main === module) {
  try { main(); } catch (erro) {
    console.error("Extração interrompida:", erro.message);
    process.exitCode = 1;
  }
}

module.exports = { inspecionarWav, converterWav };
