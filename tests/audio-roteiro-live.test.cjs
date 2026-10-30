const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root,"lib/editorial/roteiro-narracao-live.ts"),"utf8");
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const moduleObj={ exports:{} };
new Function("module","exports",js)(moduleObj,moduleObj.exports);
const { criarTrechosLive, LIMITE_MENSAGEM_CARACTERES } = moduleObj.exports;
test("blocos preservados sem cortar, repetir ou omitir palavras", () => {
 const texto="Lula venceu. O que O Globo disse no dia seguinte? ".repeat(75).trim();
 const entrada=[{tipo:"titulo",texto:"Lula venceu."},{tipo:"paragrafo",texto}];
 const pedacos=criarTrechosLive(entrada);
 assert.ok(pedacos.length > 2);
 assert.ok(pedacos.every(t=>t.caracteres<=LIMITE_MENSAGEM_CARACTERES));
 const reconstruido=pedacos.map(t=>t.texto).join(" ").replace(/\s+/g," ");
 assert.equal(reconstruido,entrada.map(b=>b.texto).join(" "));
});
test("rótulo privado e proteção contra publicação", () => {
 const p=fs.readFileSync(path.join(root,"app/previa-editorial/lula-venceu-o-globo/roteiro-live/page.tsx"),"utf8");
 assert.match(p,/notFound\(\)/);
 assert.match(p,/VERCEL_ENV === "preview"/);
 assert.match(p,/index: false/);
 assert.match(p,/criarTrechosLive/);
});
