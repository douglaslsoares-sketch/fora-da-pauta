const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
function carregar(caminho, imports = {}) {
  const src = fs.readFileSync(path.join(__dirname, "..", caminho), "utf8");
  const js = ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = {exports: {}};
  vm.runInNewContext(js, {module: mod, exports: mod.exports, URL, Date, Map, Set, require: (nome) => {
    assert.ok(nome in imports, "Importação inesperada " + nome);
    return imports[nome];
  }}, {timeout: 2000});
  return mod.exports;
}
const modelo = carregar("lib/telegram/modelo-aviso-edicao.ts");
const { prepararAvisosEdicoes } = carregar("lib/telegram/preparar-avisos-edicoes.ts", {"./modelo-aviso-edicao": modelo});
const campanha = { slug: "o-jogo-sendo-jogado", title: "O jogo sendo jogado", publishedAt: "2026-10-28" };
const aprovacao = {
 slug: campanha.slug, revisao: "v1", publicadoEm: "2026-10-28T09:00:00-03:00", 
 pergunta: "Quem escolhe as notícias?", chamada: "Entenda as fontes e os argumentos.",
 audioDisponivel: false, aprovado: true,
};
const agora = new Date("2026-10-28T13:00:00Z");
test("sem aprovação não há eventos", () => {
 assert.equal(prepararAvisosEdicoes([campanha], [], agora).length, 0);
});
test("publicação aprovada recente gera aviso único", () => {
 const r = prepararAvisosEdicoes([campanha], [aprovacao], agora);
 assert.equal(r.length, 1);
 assert.equal(r[0].id, "edicao:o-jogo-sendo-jogado:v1");
 assert.match(r[0].texto, /Leia a edição/);
 assert.doesNotMatch(r[0].texto, /ouça/);
});
test("aprovação vencida é ignorada, não bloqueia atual", () => {
 const velho = { ...aprovacao, slug:"edicao-antiga", publicadoEm:"2026-10-01T09:00:00-03:00" };
 const campanhas = [campanha, {slug:"edicao-antiga", title:"Antiga", publishedAt:"2026-10-01"}];
 assert.equal(prepararAvisosEdicoes(campanhas, [velho, aprovacao], agora).length, 1);
});
test("edição sem publicação, no futuro ou data divergente é bloqueada", () => {
 assert.throws(() => prepararAvisosEdicoes([], [aprovacao], agora), /não consta como publicada/);
 assert.throws(() => prepararAvisosEdicoes([campanha], [{...aprovacao, publicadoEm:"2026-10-29T09:00:00-03:00"}], agora));
 assert.throws(() => prepararAvisosEdicoes([campanha], [{...aprovacao, publicadoEm:"2026-10-27T09:00:00-03:00"}], agora));
});
test("mesma revisão publicada duas vezes é bloqueada", () => {
 assert.throws(() => prepararAvisosEdicoes([campanha], [aprovacao, aprovacao], agora), /duplicada/);
});
