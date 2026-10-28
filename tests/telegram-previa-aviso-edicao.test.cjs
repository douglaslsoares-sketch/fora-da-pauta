const assert = require("node:assert/strict");
const { test } = require("node:test");
const { gerarPrevia } = require("../scripts/telegram/previa-aviso-edicao.cjs");
test("prévia sinaliza rascunho e não promete áudio", () => {
  const texto = gerarPrevia(["--o-jogo-sendo-jogado"]);
  assert.match(texto, /NÃO ENVIAR/);
  assert.match(texto, /provisório/);
  assert.match(texto, /Lula venceu\. O que O Globo disse no dia seguinte\?/);
  assert.match(texto, /José, do Portal do José/);
  assert.match(texto, /📖 Leia a edição:/);
  assert.doesNotMatch(texto, /📖🎧/);
  assert.match(texto, /nenhum aviso foi registrado, agendado ou enviado/);
});
test("a prévia rejeita opções não previstas", () => {
  assert.throws(() => gerarPrevia([]), /Uso:/);
  assert.throws(() => gerarPrevia(["--publicar"]), /Uso:/);
});
