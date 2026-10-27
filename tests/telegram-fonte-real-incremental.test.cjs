// Verifica o caminho real: arquivo parlamentar -> formatador -> controle de IDs
// -> fila SQL simulada. Nenhum banco, token nem rede são usados.
const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const agoraFixo = "2026-10-27T12:00:00.000Z";
const DateReal = Date;
class DateFixa extends DateReal {
  constructor(...args) { super(...(args.length ? args : [agoraFixo])); }
  static now() { return DateReal.parse(agoraFixo); }
}

function modulo(arquivo, imports = {}) {
  const src = fs.readFileSync(path.join(__dirname, "..", arquivo), "utf8");
  const js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const m = { exports: {} };
  vm.runInNewContext(js, {
    module: m, exports: m.exports, Date: DateFixa, URL, Map, Set, Array, Error,
    require: (nome) => {
      assert.ok(Object.hasOwn(imports, nome), "Import inesperado: " + nome);
      return imports[nome];
    },
  }, { timeout: 3000 });
  return m.exports;
}

function construirBancoSimulado() {
  const fontes = new Set();
  const conhecidos = new Map();
  const fila = [];
  const assinantes = ["111", "222"];
  const sql = async (parts, ...args) => {
    const q = parts.join("?").replace(/\s+/g, " ").trim();
    if (q.startsWith("SELECT pg_advisory_xact_lock")) return [];
    if (q.startsWith("INSERT INTO public.telegram_fontes_notificacao")) {
      const chave = args[0] + ":" + args[1];
      if (fontes.has(chave)) return [];
      fontes.add(chave);
      conhecidos.set(chave, new Set());
      return [{ tipo: args[0] }];
    }
    if (q.startsWith("SELECT evento_id FROM public.telegram_eventos_conhecidos")) {
      return [...(conhecidos.get(args[0] + ":" + args[1]) || [])]
        .map(evento_id => ({ evento_id }));
    }
    if (q.startsWith("INSERT INTO public.telegram_eventos_conhecidos")) {
      conhecidos.get(args[0] + ":" + args[1]).add(args[2]);
      return [];
    }
    if (q.startsWith("INSERT INTO public.telegram_fila_avisos") &&
        q.includes("FROM public.telegram_acompanhamentos")) {
      const [tipo, referencia, eventoId, texto, candidId] = args;
      assert.equal(referencia, candidId);
      const inseridos = [];
      for (const chat of assinantes) {
        if (fila.some(f => f.chat === chat && f.id === eventoId)) continue;
        fila.push({ chat, id: eventoId, texto });
        inseridos.push({ id: fila.length });
      }
      return inseridos;
    }
    if (q.startsWith("UPDATE public.telegram_fontes_notificacao")) return [];
    throw Error("SQL não simulado: " + q.slice(0, 150));
  };
  sql.begin = fn => fn(sql);
  return { sql, fila, conhecidos };
}

test("CSV já documentado é inicializado sem avisar; mudança recente avisa sem ressuscitar história", async () => {
  const arquivo = path.join(__dirname, "../data/eleicoes/gerado/atuacao-candidatos/100002535230.json");
  const base = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  assert.ok(base.totalVotacoes > 0 && base.totalProposicoes > 0);

  const db = construirBancoSimulado();
  const novidades = modulo("lib/telegram/novidades.ts");
  const preparar = modulo("lib/telegram/preparar-avisos-atuacao.ts").prepararAvisosAtuacao;
  const registrar = modulo("lib/telegram/registrar-novidades.ts", {
    "server-only": {},
    "../interesses/db": { sql: db.sql },
    "./novidades": novidades,
  }).registrarNovidadesNaFila;
  const noticia = async (documento) => registrar({
    tipo: "candidato",
    referencia: base.candidaturaId,
    eventos: preparar(documento, base.candidaturaId),
  });

  const inicial = {
    ...base,
    votacoes: base.votacoes.slice(0, 1),
    proposicoes: base.proposicoes.slice(0, 1),
  };
  const primeiro = await noticia(inicial);
  assert.equal(primeiro.inicializacao, true);
  assert.equal(primeiro.avisosInseridos, 0);
  assert.equal(db.fila.length, 0);

  const original = inicial.votacoes[0];
  const antigo = {
    ...original, votacaoId: "teste-historico-2024",
    data: "2024-07-09", dataHora: "2024-07-09T13:00:00",
  };
  const atual = {
    ...original, votacaoId: "teste-atual-2026",
    data: "2026-10-27", dataHora: "2026-10-27T10:00:00",
  };
  const proximo = { ...inicial, votacoes: [...inicial.votacoes, antigo, atual] };
  const segundo = await noticia(proximo);
  assert.equal(segundo.inicializacao, false);
  assert.equal(segundo.eventosNovos, 2);
  assert.equal(segundo.avisosInseridos, 2);
  assert.ok(db.fila.every(f => f.id === "votacao:teste-atual-2026"));
  assert.ok(db.fila.every(f => f.texto.includes(original.fonte.url)));
  assert.ok(db.fila.every(f => f.texto.includes("Quando ocorreu: 2026-10-27")));

  const repetido = await noticia(proximo);
  assert.equal(repetido.avisosInseridos, 0);
  assert.equal(repetido.eventosNovos, 0);
  assert.equal(db.fila.length, 2);
});
