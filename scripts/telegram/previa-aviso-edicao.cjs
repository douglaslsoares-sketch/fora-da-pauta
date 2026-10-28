#!/usr/bin/env node
// Prévia editorial somente leitura: não acessa banco, API nem bot do Telegram.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function gerarPrevia(argumentos = process.argv.slice(2)) {
  if (argumentos.length !== 1 || argumentos[0] !== "--o-jogo-sendo-jogado") {
    throw new Error("Uso: node scripts/telegram/previa-aviso-edicao.cjs --o-jogo-sendo-jogado");
  }
  const arquivo = path.join(__dirname, "../../lib/telegram/modelo-aviso-edicao.ts");
  const codigo = ts.transpileModule(fs.readFileSync(arquivo, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const modulo = { exports: {} };
  vm.runInNewContext(codigo, { module: modulo, exports: modulo.exports, URL }, { timeout: 2000 });

  const aviso = modulo.exports.prepararTextoAvisoNovaEdicao({
    titulo: "Lula venceu. O que O Globo disse no dia seguinte?",
    pergunta: "Quem escolhe o que ganha destaque nos jornais depois de uma eleição?",
    chamada: "Nesta edição, comparamos o resultado oficial, um editorial de O Globo e a interpretação apresentada por José, do Portal do José. Confira e tire suas conclusões.",
    atribuicao: "José, do Portal do José",
    // Endereço planejado: NÃO corresponde a uma publicação já confirmada.
    urlEdicao: "https://www.foradapauta.org/campanhas/lula-venceu-o-globo",
    audioDisponivel: false,
  });
  return [
    "PRÉVIA EDITORIAL — NÃO ENVIAR",
    "O link abaixo é provisório e NÃO comprova publicação.",
    "O áudio ainda não está disponível.",
    "",
    aviso,
    "",
    "FIM DA PRÉVIA — nenhum aviso foi registrado, agendado ou enviado.",
  ].join("\n");
}

if (require.main === module) {
  try {
    process.stdout.write(gerarPrevia() + "\n");
  } catch (error) {
    process.stderr.write(String(error.message) + "\n");
    process.exitCode = 1;
  }
}
module.exports = { gerarPrevia };
