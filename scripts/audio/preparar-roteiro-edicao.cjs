"use strict";

/**
 * Prepara um roteiro de narração a partir da MESMA fonte do artigo em rascunho.
 * NÃO cria áudio, não acessa rede, não usa chave de API e não publica conteúdo.
 *
 * Uso (após npm ci):
 *   node scripts/audio/preparar-roteiro-edicao.cjs --check
 *   node scripts/audio/preparar-roteiro-edicao.cjs --json
 *   node scripts/audio/preparar-roteiro-edicao.cjs --text
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const ts = require("typescript");

const RAIZ = path.resolve(__dirname, "../..");
const FONTE = "data/edicoes/rascunhos/lula-venceu-o-globo.ts";
const NOME_EXPORTACAO = "lulaVenceuOGloboRascunho";

function propriedade(obj, nome) {
  if (!obj || !ts.isObjectLiteralExpression(obj)) {
    throw new Error("Era esperado um objeto literal: " + nome);
  }
  const itens = obj.properties.filter(p =>
    ts.isPropertyAssignment(p) &&
    (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) &&
    p.name.text === nome
  );
  if (itens.length !== 1) {
    throw new Error("Propriedade ausente ou ambígua: " + nome);
  }
  return itens[0].initializer;
}

function literalTexto(n) {
  if (!n || !ts.isStringLiteralLike(n)) {
    throw new Error("A fonte de áudio exige texto literal, sem interpolação.");
  }
  return n.text;
}

function literalArray(n) {
  if (!n || !ts.isArrayLiteralExpression(n)) {
    throw new Error("Era esperada uma lista literal de blocos.");
  }
  return n.elements;
}

function textoAudivel(s) {
  // Elimina apenas os marcadores tipográficos de negrito; NÃO reescreve o texto.
  return s.replace(/\*\*(.*?)\*\*/gs, "$1").replace(/\s+/g, " ").trim();
}

function digest(blocos) {
  return crypto.createHash("sha256")
    .update(JSON.stringify(blocos), "utf8").digest("hex");
}

function prepararRoteiro(arquivo = path.join(RAIZ, FONTE)) {
  const original = fs.readFileSync(arquivo, "utf8");
  const ast = ts.createSourceFile(arquivo, original, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  if (ast.parseDiagnostics.length) {
    throw new Error("O arquivo de origem contém sintaxe inválida.");
  }
  const declaracoes = [];
  for (const statement of ast.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const decl of statement.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.name.text === NOME_EXPORTACAO) {
          declaracoes.push(decl.initializer);
        }
      }
    }
  }
  if (declaracoes.length !== 1) {
    throw new Error("Não foi possível identificar o rascunho editorial único.");
  }
  const edicao = declaracoes[0];
  const slug = literalTexto(propriedade(edicao, "slug"));
  if (slug !== "lula-venceu-o-globo") {
    throw new Error("Slug inesperado: não gerar roteiro para outra edição.");
  }

  const blocos = [
    { tipo: "titulo", texto: textoAudivel(literalTexto(propriedade(edicao, "title"))) },
    { tipo: "subtitulo", texto: textoAudivel(literalTexto(propriedade(edicao, "statement"))) },
  ];

  for (const secao of literalArray(propriedade(edicao, "sections"))) {
    const titulo = textoAudivel(literalTexto(propriedade(secao, "title")));
    blocos.push({ tipo: "subtitulo", texto: titulo });
    for (const p of literalArray(propriedade(secao, "paragraphs"))) {
      blocos.push({ tipo: "paragrafo", texto: textoAudivel(literalTexto(p)) });
    }
  }

  if (blocos.some(b => !b.texto || b.texto.includes("**"))) {
    throw new Error("Há blocos vazios ou marcação editorial sem tratamento.");
  }

  const texto = blocos.map(b => b.texto).join("\n\n");
  return {
    schema: 1,
    slug,
    origem: FONTE,
    estado: "rascunho_para_revisao",
    voz: "não_escolhida_para_TTS",
    assinatura_sha256: digest(blocos),
    quantidade_blocos: blocos.length,
    quantidade_palavras: texto.split(/\s+/).length,
    blocos,
  };
}

function main() {
  const modo = process.argv[2] || "--check";
  if (!["--check", "--json", "--text"].includes(modo) || process.argv.length > 3) {
    throw new Error("Use --check, --json ou --text.");
  }
  const roteiro = prepararRoteiro();
  if (modo === "--json") {
    process.stdout.write(JSON.stringify(roteiro, null, 2) + "\n");
  } else if (modo === "--text") {
    process.stdout.write(roteiro.blocos.map(b => b.texto).join("\n\n") + "\n");
  } else {
    process.stdout.write("Roteiro validado: " + roteiro.quantidade_blocos +
      " blocos; SHA-256 " + roteiro.assinatura_sha256 + "\n");
  }
}

if (require.main === module) {
  try { main(); } catch (erro) {
    console.error("Roteiro NÃO preparado:", erro.message);
    process.exitCode = 1;
  }
}

module.exports = { prepararRoteiro, textoAudivel, digest };
