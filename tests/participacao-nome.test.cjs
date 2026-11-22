const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

function ler(path) { return fs.readFileSync(path, "utf8"); }
test("convite fica desativado e exige abertura administrativa", () => {
  const lib = ler("lib/participacaoNome.ts");
  const pagina = ler("app/sugira-um-nome/page.tsx");
  const menu = ler("components/MenuPrincipal.tsx");
  assert.match(lib, /aberta boolean NOT NULL DEFAULT false/);
  assert.match(lib, /VALUES \(1, false\)/);
  assert.match(pagina, /if \(!\(await participacaoNomeAberta\(\)\)\) notFound\(\)/);
  assert.match(menu, /sugestoesAbertas && <Link/);
});
test("abertura é protegida e explícita, sem alterar a marca", () => {
  const api = ler("app/api/admin/participacao-nome/route.ts");
  const admin = ler("components/AdminParticipacaoNome.tsx");
  assert.match(api, /verifyQuestionsAdminSessionToken/);
  assert.match(api, /ABRIR CONSULTA/);
  assert.match(admin, /window\.prompt/);
  assert.doesNotMatch(api, /UPDATE public\.admin_artigos/);
});
test("público respeita rate-limit, origem e fechamento", () => {
  const api = ler("app/api/participacao/nome/route.ts");
  assert.match(api, /request\.headers\.get\("origin"\)/);
  assert.match(api, /consumeRateLimit/);
  assert.match(api, /participacaoNomeAberta/);
  assert.match(api, /SELECT 1 FROM public\.participacao_nome_config WHERE id = 1 AND aberta = true/);
});
