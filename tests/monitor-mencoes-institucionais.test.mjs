import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FONTES, lerFeed, indexarPessoas, identificarMencoes,
  consolidarMencoes, executarMonitor,
} from "../scripts/monitorar-mencoes-institucionais.mjs";

const camara = FONTES[0];
const agora = new Date("2026-10-26T12:00:00.000Z");
const xml = '<?xml version="1.0"?><rss><channel><item><title>Renato de Almeida Freitas Junior defende debate</title><link>https://www.camara.leg.br/noticias/12345-materia/</link><pubDate>Mon, 26 Oct 2026 09:00:00 GMT</pubDate><description>Debate com convidados.</description></item></channel></rss>';
const eleitos = [
  {id: "160002536522", nomeCompleto: "Renato de Almeida Freitas Junior", cargo: "deputado-federal", uf:"PR"},
  {id: "100000000002", nomeCompleto: "Ana Maria da Silva", cargo:"senador", uf:"SP"},
];

test("lê RSS permitido e preserva fonte, data e link", () => {
  const a = lerFeed(xml, camara);
  assert.equal(a.length, 1);
  assert.equal(a[0].url, "https://www.camara.leg.br/noticias/12345-materia/");
  assert.equal(a[0].publicadoEm, "2026-10-26T09:00:00.000Z");
  assert.equal(a[0].fonteId, "camara");
});

test("bloqueia URLs externas ou HTTP e entradas vazias", () => {
  assert.equal(lerFeed(xml.replace("https://www.camara.leg.br/noticias/12345-materia/", "https://site-externo.example/news"), camara).length, 0);
  assert.equal(lerFeed(xml.replace("https://www.camara.leg.br/noticias/12345-materia/", "http://www.camara.leg.br/noticias/12345-materia/"), camara).length, 0);
  assert.throws(() => lerFeed("<rss></rss>", camara));
});

test("não associa nome parcial e descarta homônimos na base", () => {
  const idx = indexarPessoas([...eleitos, {id:"100000000003", nomeCompleto:"Ana Maria da Silva"}]);
  assert.equal(idx.length, 1);
  assert.equal(idx[0].id, "160002536522");
  const item = lerFeed(xml, camara)[0];
  assert.equal(identificarMencoes([item], idx, agora).length, 1);
  assert.equal(identificarMencoes([{...item, titulo:"Renato Freitas Junior", descricao:""}], idx, agora).length, 0);
});

test("reconhece nome parlamentar composto mas não apelido isolado", () => {
  const eleita = { id:"100000000004", nomeCompleto:"Maria Silva Albuquerque",
    nomeUrna:"Maria Albuquerque", cargo:"deputado-estadual", uf:"PE" };
  const idx = indexarPessoas([...eleitos, eleita]);
  const noticia = {
    ...lerFeed(xml, camara)[0],
    titulo:"Maria Albuquerque participa de audiência pública",
    descricao:"",
  };
  const resultado = identificarMencoes([noticia], idx, agora);
  assert.equal(resultado.length, 1);
  assert.equal(resultado[0].candidaturaId, eleita.id);
  assert.equal(identificarMencoes([{...noticia,titulo:"Maria",descricao:""}], idx, agora).length,0);
  const comHomonimo = indexarPessoas([...eleitos, eleita,
    {id:"100000000005",nomeCompleto:"Maria Pereira Albuquerque",nomeUrna:"Maria Albuquerque"}]);
  assert.equal(identificarMencoes([noticia], comHomonimo, agora).length,0);
});

test("menção é explicitamente não verificada, nunca evento ou manifestação comprovada", () => {
  const idx = indexarPessoas(eleitos);
  const registros = identificarMencoes(lerFeed(xml, camara), idx, agora);
  assert.equal(registros.length, 1);
  assert.equal(registros[0].situacao, "mencao-automatica-nao-verificada");
  assert.equal("textoTelegram" in registros[0], false);
  assert.equal("posicionamento" in registros[0], false);
});

test("deduplica menções e recusa dados alterados", () => {
  const m = identificarMencoes(lerFeed(xml, camara), indexarPessoas(eleitos), agora)[0];
  assert.equal(consolidarMencoes([m], [m], agora).length, 1);
  assert.equal(consolidarMencoes([{...m, url:"https://evil.example/news"}], [], agora).length, 0);
  assert.equal(consolidarMencoes([{...m, id:"invalido"}], [], agora).length, 0);
});

test("lê Atom sem confundir link self com artigo", () => {
  const fonte = FONTES[1];
  const atom = '<?xml version="1.0"?><feed><entry><title>Senado examina medida</title><link rel="self" href="https://www12.senado.leg.br/noticias/rss.xml"/><link rel="alternate" href="https://www12.senado.leg.br/noticias/materias/2026/10/teste"/><published>2026-10-26T10:00:00Z</published></entry></feed>';
  assert.equal(lerFeed(atom, fonte)[0].url, "https://www12.senado.leg.br/noticias/materias/2026/10/teste");
});

test("falha se lista de pessoas não existe; nenhum resultado parcial é aceito", async () => {
  await assert.rejects(() => executarMonitor({listaPessoas:"tests/sem-arquivo.json"}));
});
