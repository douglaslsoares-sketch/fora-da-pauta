// Integração isolada: executa os módulos reais contra um banco/Telegram simulados.
// Não usa DATABASE_URL, CRON_SECRET, o token real nem a rede.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const idCandidato = "100000000001";
const dataPublicacao = "2026-10-16T08:00:00-03:00";
const antes = "2026-10-15T13:00:00Z";
const depois = "2026-10-16T14:00:00Z";

function montarCenario() {
  const fontes = new Set();
  const conhecidos = new Map();
  const fila = [];
  const assinantes = [
    { chat: "101", candidato: idCandidato, status: "ativo", criado: antes, atualizado: antes },
    { chat: "102", candidato: idCandidato, status: "aguardando_eleicao", criado: antes, atualizado: antes },
    { chat: "103", candidato: idCandidato, status: "ativo", criado: depois, atualizado: depois },
    { chat: "104", candidato: idCandidato, status: "cancelado", criado: antes, atualizado: antes },
    { chat: "105", candidato: idCandidato, status: "ativo", criado: antes, atualizado: depois },
    { chat: "106", candidato: "100000000002", status: "ativo", criado: antes, atualizado: antes },
  ];
  const enviados = [];
  let idFila = 0;

  const possuiDireito = (item) => assinantes.some((assinante) =>
    assinante.chat === item.chat &&
    assinante.candidato === item.referencia &&
    (assinante.status === "ativo" ||
      (assinante.status === "aguardando_eleicao" && item.eventoId.startsWith("dossie:")))
  );

  const sql = async (parts, ...args) => {
    const q = parts.join("?").replace(/\s+/g, " ").trim();

    if (q.startsWith("SELECT pg_advisory_xact_lock")) return [];
    if (q.startsWith("INSERT INTO public.telegram_fontes_notificacao")) {
      const chave = String(args[0]) + ":" + String(args[1]);
      if (fontes.has(chave)) return [];
      fontes.add(chave);
      conhecidos.set(chave, new Set());
      return [{ tipo: args[0] }];
    }
    if (q.startsWith("SELECT evento_id FROM public.telegram_eventos_conhecidos")) {
      return [...(conhecidos.get(String(args[0]) + ":" + String(args[1])) || [])]
        .map((evento_id) => ({ evento_id }));
    }
    if (q.startsWith("INSERT INTO public.telegram_eventos_conhecidos")) {
      const chave = String(args[0]) + ":" + String(args[1]);
      const ids = conhecidos.get(chave);
      assert.ok(ids, "Fonte deve ser inicializada antes dos eventos");
      ids.add(String(args[2]));
      return [];
    }
    if (q.startsWith("INSERT INTO public.telegram_fila_avisos") &&
        q.includes("FROM public.telegram_acompanhamentos")) {
      // Mesma ordem de parâmetros e predicados do SQL real.
      assert.ok(q.includes("created_at <= ?::timestamptz"));
      assert.ok(q.includes("updated_at <= ?::timestamptz"));
      const [tipo, referencia, eventoId, texto, candidato, editorial,
        publicado, criadoAntesDe, atualizadoAntesDe] = args;
      assert.equal(candidato, referencia);
      assert.equal(publicado, criadoAntesDe);
      assert.equal(publicado, atualizadoAntesDe);
      const inseridos = [];
      for (const a of assinantes) {
        const ativo = a.status === "ativo";
        const aguardando = a.status === "aguardando_eleicao" && editorial === true;
        const dentroDoPrazo = publicado == null ||
          (Date.parse(a.criado) <= Date.parse(publicado) &&
           Date.parse(a.atualizado) <= Date.parse(publicado));
        if (a.candidato !== referencia || (!ativo && !aguardando) || !dentroDoPrazo) continue;
        if (fila.some((f) => f.chat === a.chat && f.eventoId === eventoId && f.referencia === referencia)) continue;
        const item = {
          id: String(++idFila), chat: a.chat, tipo, referencia, eventoId, texto,
          status: "pendente", tentativas: 0,
        };
        fila.push(item);
        inseridos.push({ id: item.id });
      }
      return inseridos;
    }
    if (q.startsWith("UPDATE public.telegram_fontes_notificacao")) return [];
    if (q.startsWith("UPDATE public.telegram_fila_avisos AS f") &&
        q.includes("ASSINATURA_INATIVA")) {
      return fila.filter((f) => ["pendente", "erro"].includes(f.status) && !possuiDireito(f))
        .map((f) => { f.status = "cancelado"; return { id: f.id }; });
    }
    if (q.startsWith("UPDATE public.telegram_fila_avisos") &&
        q.includes("PROCESSAMENTO_INTERROMPIDO")) return [];
    if (q.startsWith("WITH escolhido AS")) {
      const f = fila.find((f) => ["pendente", "erro"].includes(f.status) && possuiDireito(f));
      if (!f) return [];
      f.status = "processando";
      f.tentativas++;
      return [{ id: f.id, chat_id: f.chat, texto: f.texto }];
    }
    if (q.startsWith("UPDATE public.telegram_fila_avisos") && q.includes("status = 'enviado'")) {
      const f = fila.find((f) => f.id === String(args[1]));
      assert.ok(f);
      f.status = "enviado";
      return [];
    }
    throw Error("SQL ainda não simulado: " + q.slice(0, 180));
  };
  sql.begin = (callback) => callback(sql);

  function modulo(caminho, imports) {
    const codigo = ts.transpileModule(
      fs.readFileSync(path.join(__dirname, "..", caminho), "utf8"),
      { compilerOptions: {
        module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      } },
    ).outputText;
    const module = { exports: {} };
    vm.runInNewContext(codigo, {
      module, exports: module.exports, Date, Set, Map, Array, Buffer, AbortSignal,
      process: { env: { TELEGRAM_BOT_TOKEN: "token-totalmente-falso" } },
      require: (nome) => {
        assert.ok(Object.prototype.hasOwnProperty.call(imports, nome), "Importação inesperada: " + nome);
        return imports[nome];
      },
      fetch: async (url, options) => {
        assert.match(url, /api\.telegram\.org/);
        assert.match(url, /token-totalmente-falso/);
        const mensagem = JSON.parse(options.body);
        enviados.push(mensagem);
        return { status: 200, json: async () => ({
          ok: true, result: { message_id: enviados.length },
        }) };
      },
      console: { warn() {}, error() {} },
    }, { timeout: 2000 });
    return module.exports;
  }

  const novidades = modulo("lib/telegram/novidades.ts", {});
  const registrar = modulo("lib/telegram/registrar-novidades.ts", {
    "server-only": {},
    "../interesses/db": { sql },
    "./novidades": novidades,
  }).registrarNovidadesNaFila;
  const processar = modulo("lib/telegram/processar-fila.ts", {
    "server-only": {},
    "../interesses/db": { sql },
  }).processarFilaTelegram;

  const raw = { id: "votacao:antiga", texto: "Atividade histórica importada." };
  const editorial = (revisao = "v1") => ({
    id: "dossie:fato-de-2024:" + revisao,
    texto: "Nova informação sobre fato histórico. Revisão " + revisao,
    publicadoEm: dataPublicacao,
  });

  return {
    assinantes, fila, enviados, raw, editorial, registrar, processar,
    registrarEventos: (eventos) => registrar({
      tipo: "candidato", referencia: idCandidato, eventos,
    }),
  };
}

test("primeira carga avisa só a publicação editorial e respeita a inscrição", async () => {
  const c = montarCenario();
  const resultado = await c.registrarEventos([c.raw, c.editorial()]);
  assert.equal(resultado.inicializacao, true);
  assert.equal(resultado.eventosNovos, 1);
  assert.equal(resultado.avisosInseridos, 2);
  assert.deepEqual(c.fila.map((x) => x.chat).sort(), ["101", "102"]);
  assert.ok(c.fila.every((x) => x.eventoId === "dossie:fato-de-2024:v1"));
  const envio = await c.processar();
  assert.equal(envio.enviados, 2);
  assert.deepEqual(c.enviados.map((x) => String(x.chat_id)).sort(), ["101", "102"]);
  assert.ok(c.fila.every((x) => x.status === "enviado"));
});

test("repetir a mesma publicação não duplica avisos", async () => {
  const c = montarCenario();
  await c.registrarEventos([c.raw, c.editorial()]);
  const repeticao = await c.registrarEventos([c.raw, c.editorial()]);
  assert.equal(repeticao.inicializacao, false);
  assert.equal(repeticao.eventosNovos, 0);
  assert.equal(repeticao.avisosInseridos, 0);
  await c.processar();
  const repeticaoEnvio = await c.processar();
  assert.equal(repeticaoEnvio.enviados, 0);
  assert.equal(c.enviados.length, 2);
});

test("correção com outra revisão notifica uma vez e não reenvia a anterior", async () => {
  const c = montarCenario();
  await c.registrarEventos([c.raw, c.editorial()]);
  await c.processar();
  const resultado = await c.registrarEventos([c.raw, c.editorial(), c.editorial("v2")]);
  assert.equal(resultado.eventosNovos, 1);
  assert.equal(resultado.avisosInseridos, 2);
  const envio = await c.processar();
  assert.equal(envio.enviados, 2);
  assert.equal(c.enviados.length, 4);
  assert.equal(c.fila.filter((x) => x.eventoId.endsWith(":v2")).length, 2);
});

test("cancelamento antes do processamento impede a entrega", async () => {
  const c = montarCenario();
  await c.registrarEventos([c.raw, c.editorial()]);
  c.assinantes.find((x) => x.chat === "102").status = "cancelado";
  const envio = await c.processar();
  assert.equal(envio.enviados, 1);
  assert.equal(envio.cancelados, 1);
  assert.deepEqual(c.enviados.map((x) => String(x.chat_id)), ["101"]);
  assert.equal(c.fila.find((x) => x.chat === "102").status, "cancelado");
});


test("fato editorial com histórico do mesmo tema percorre ficha, fila e Telegram simulados", async () => {
  const dossie = {
    candidaturaId: idCandidato,
    nome: "Representante de exemplo",
    eventos: [
      {
        id: "registro-anterior",
        tema: "jornada de trabalho",
        data: { inicio: "2025-03-10", rotulo: "10 de março de 2025" },
        titulo: "Pronunciamento público registrado",
        resumo: "Registro atribuído ao representante com fonte original.",
        natureza: ["documentado"],
        fontes: [{ titulo: "Registro oficial anterior", url: "https://www.camara.leg.br/noticias/123" }],
      },
      {
        id: "fato-atual",
        tema: "Jornada de trabalho",
        data: { inicio: "2026-10-15", rotulo: "15 de outubro de 2026" },
        titulo: "Nova votação documentada",
        resumo: "Consta em documento oficial um voto em proposta sobre jornada de trabalho.",
        natureza: ["documentado"],
        fontes: [{ titulo: "Registro oficial da votação", url: "https://www.camara.leg.br/noticias/456" }],
        avisoTelegram: {
          revisao: "v1",
          publicadoEm: dataPublicacao,
          tipo: "nova-informacao",
        },
      },
    ],
  };
  const original = fs.readFileSync(
    path.join(__dirname, "..", "lib/telegram/preparar-avisos-dossie.ts"), "utf8",
  );
  const codigo = ts.transpileModule(original, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(codigo, {
    module: mod, exports: mod.exports, Date, Set, Error,
  }, { timeout: 2000 });
  const preparar = mod.exports.prepararAvisosDossie;
  const avisos = preparar(dossie, new Date("2026-10-26T13:00:00Z"));
  assert.equal(avisos.length, 1);
  assert.match(avisos[0].texto, /Sobre o mesmo assunto/);
  assert.match(avisos[0].texto, /Pronunciamento público registrado/);
  assert.match(avisos[0].texto, /Nova votação documentada/);
  assert.match(avisos[0].texto, /www.camara.leg.br\/noticias\/123/);
  assert.match(avisos[0].texto, /www.camara.leg.br\/noticias\/456/);

  const c = montarCenario();
  const primeiro = await c.registrarEventos(avisos);
  assert.equal(primeiro.avisosInseridos, 2);
  assert.equal((await c.processar()).enviados, 2);
  assert.equal(c.enviados.length, 2);
  assert.ok(c.enviados.every(m => m.text.includes("Sobre o mesmo assunto")));
  assert.equal((await c.registrarEventos(avisos)).avisosInseridos, 0);
  assert.equal((await c.processar()).enviados, 0);
  assert.equal(c.enviados.length, 2);
});

test("menções automáticas não podem ser enviadas como avisos de dossiê", () => {
  const script = fs.readFileSync(
    path.join(__dirname, "..", "scripts/monitorar-mencoes-institucionais.mjs"), "utf8",
  );
  assert.match(script, /mencao-automatica-nao-verificada/);
  assert.doesNotMatch(script, /registrarNovidadesNaFila|processarFilaTelegram|TELEGRAM_BOT_TOKEN/);
});
