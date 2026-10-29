const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname,"..");
const read = (p) => fs.readFileSync(path.join(root,p),"utf8");
test("rascunho não entra na lista publicada", () => {
 const campanhas=read("data/campanhas.ts");
 assert.doesNotMatch(campanhas, /slug:\s*["']lula-venceu-o-globo["']/);
 const draft=read("data/edicoes/rascunhos/lula-venceu-o-globo.ts");
 assert.doesNotMatch(draft,/^\s*publishedAt:/m);
});
test("prévia não é servida em produção", () => {
 const route=read("app/previa-editorial/lula-venceu-o-globo/page.tsx");
 assert.match(route,/process\.env\.VERCEL_ENV === "preview"/);
 assert.match(route,/!ehDesenvolvimentoLocal && !ehPreviewVercel\) notFound\(\)/);
 assert.match(route,/index: false/);
});
test("rascunho distingue fontes e interpretação", () => {
 const draft=read("data/edicoes/rascunhos/lula-venceu-o-globo.ts");
 assert.match(draft,/Tribunal Superior Eleitoral/);
 assert.match(draft,/Essa é a leitura política de José/);
 assert.match(draft,/live original/);
});

test("coluna não é pública e artigo tem título próprio", () => {
 const coluna=read("app/previa-editorial/o-jogo-sendo-jogado-coluna/page.tsx");
 const artigo=read("data/edicoes/rascunhos/lula-venceu-o-globo.ts");
 assert.match(coluna,/NODE_ENV !== "development"\) notFound\(\)/);
 assert.match(coluna,/O jogo sendo jogado/);
 assert.match(artigo,/Lula venceu\. O que O Globo disse no dia seguinte\?/);
});

test("a introdução e o áudio atendem à primeira edição", () => {
 const page=read("components/CampaignPage.tsx");
 const audio=read("components/EditorialAudioSystem.tsx");
 const route=read("app/api/audio/ler/route.ts");
 assert.match(page,/ehArtigoOGlobo/);
 assert.match(page,/O que é notícia\? O que é opinião\?/);
 assert.match(page,/onClick=\{ouvirEdicao\}/);
 assert.match(page,/fdp:audio-start/);
 assert.match(audio,/fdp:audio-start/);
 assert.match(audio,/\/api\/audio\/ler/);
 assert.match(route,/OPENAI_API_KEY/);
});

test("prévia usa leitor local e deixa catálogo e áudio neural intactos",()=>{const p=read("app/previa-editorial/lula-venceu-o-globo/page.tsx");const c=read("components/CampaignPage.tsx");const a=read("components/PreviewAudioReader.tsx");assert.match(p,/audioDemonstrativo/);assert.match(p,/PreviewAudioReader/);assert.match(c,/fdp:preview-audio-start/);assert.match(a,/speechSynthesis/);assert.doesNotMatch(a,/\/api\/audio\/ler/);});

test("primeiro bloco aberto e áudio de IA identificado",()=>{const c=read("components/CampaignPage.tsx");const e=read("components/ExpandableCard.tsx");assert.match(c,/defaultOpen=\{ehArtigoOGlobo && index === 0\}/);assert.match(e,/open=\{defaultOpen\}/);assert.match(c,/Áudio de demonstração gerado digitalmente/);});
