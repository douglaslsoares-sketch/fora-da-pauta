const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const raiz = path.join(__dirname, "..");
const ler = (arquivo) => fs.readFileSync(path.join(raiz, arquivo), "utf8");

const tela = ler("components/VotouFiqueDeOlhoExperience.tsx");
const sessao = ler("app/api/telegram/sessao/route.ts");
const webhook = ler("app/api/telegram/webhook/route.ts");
const retorno = ler("app/api/telegram/concluir/route.ts");
const cookie = ler("lib/telegram/sessao-site.ts");

test("visitante novo vê convite antes de escolher ou iniciar Telegram", () => {
  assert.match(tela, /!conferindoInscricao && !inscricaoAtiva && !retornoTelegram/);
  assert.match(tela, />Fique de olho\.<\/p>/);
  assert.match(tela, /Receba as novidades do Fora da Pauta/);
  assert.match(tela, /setInscricaoGeral\(true\)/);
  assert.match(tela, /setEtapa\("telegram"\)/);
});

test("sem políticos escolhidos o botão inicia a inscrição geral", () => {
  assert.match(tela, /body: JSON\.stringify\(\{ ids: inscricaoGeral \? \[\] : selecionadas\.map\(p => p\.id\) \}\)/);
  assert.match(sessao, /let idsPendentes: string\[\] = \[\]/);
  assert.match(sessao, /https:\/\/t\.me\/\$\{BOT\}\?start=s_\$\{codigo\}/);
});

test("clicar para abrir bot não confirma inscrição prematuramente", () => {
  assert.match(tela, /setInscricaoAtiva\(dados\.ativo === true\)/);
  assert.match(tela, /const inscricaoConfirmada\s*=\s*inscricaoAtiva &&/);
  assert.match(sessao, /const ativo = await inscricaoAtiva\(token\)/);
  assert.match(sessao, /ativo: false, novasEdicoes: false, ids: \[\]/);
});

test("o webhook confirma, habilita edições e fornece retorno ao site", () => {
  assert.match(webhook, /if \(payload\.startsWith\("s_"\)\)/);
  assert.match(webhook, /INSERT INTO telegram_preferencias[\s\S]*?'novas_edicoes'/);
  assert.match(webhook, /Concluir a inscrição/);
  assert.match(webhook, /https:\/\/www\.foradapauta\.org\/api\/telegram\/concluir\?codigo=/);
});

test("retorno autentica navegador por cookie, sem expor o ID do chat", () => {
  assert.match(retorno, /SET codigo_hash = NULL, codigo_expira_at = NULL/);
  assert.match(retorno, /\/votou-fique-de-olho\?retorno=telegram/);
  assert.match(retorno, /httpOnly: true/);
  assert.match(retorno, /sameSite: "lax"/);
  assert.match(cookie, /telegram_chat_id IS NOT NULL/);
  assert.match(cookie, /p\.tipo = 'novas_edicoes'/);
});

test("pode ficar inscrito nas edições sem selecionar ninguém", () => {
  assert.match(tela, /inscricaoGeral\s*\?\s*novasEdicoesAtivas/);
  assert.match(tela, /Essa escolha é opcional\./);
  assert.match(tela, /Escolher pessoas para acompanhar/);
  assert.match(tela, /Aguarde a próxima novidade\./);
});

test("adicionar ou retirar pessoas usa sessão autenticada, nunca o protótipo", () => {
  assert.match(tela, /method: "PUT"/);
  assert.match(tela, /method: "DELETE"/);
  assert.match(sessao, /if \(!token\) return NextResponse\.json\(\{ erro: "Vincule o Telegram\."/);
  assert.match(sessao, /somente adiciona\/reativa|Somente adiciona\/reativa/);
});

test("segunda tela de inscrição geral prioriza botão sem texto redundante", () => {
  assert.match(tela, /etapaAtual === "telegram" && inscricaoGeral/);
  assert.match(tela, /Abra o Telegram para concluir sua inscrição/);
  assert.match(tela, /Continuar no Telegram/);
  assert.match(tela, /Você poderá escolher pessoas para acompanhar depois/);
  assert.match(tela, /onClick=\{\(\) => void ativarTelegram\(\)\}/);
});
