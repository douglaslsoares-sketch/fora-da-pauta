const assert = require('node:assert/strict');
const { test } = require('node:test');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const { analisarArgumentos, contarElegiveis, apresentarRelatorio } =
  require('../scripts/telegram/previa-aviso-dossie.cjs');

const publicado = '2026-10-16T08:00:00-03:00';
const id = '100000000001';
const avisoId = 'dossie:fato-exemplo:v1';

function bancoFalso(resultado) {
  const comandos = [];
  const tx = async (parts, ...args) => {
    const consulta = parts.join('?').replace(/\s+/g, ' ').trim();
    comandos.push({ consulta, args });
    if (consulta === 'SET TRANSACTION READ ONLY') return [];
    if (consulta.includes('WITH elegiveis AS')) return [resultado];
    throw new Error('SQL inesperado');
  };
  const mock = () => ({
    begin: async (callback) => callback(tx),
    end: async () => { comandos.push({ consulta: 'END' }); },
  });
  return { mock, comandos };
}

test('o modo exemplo não permite conexão ao banco', () => {
  assert.deepEqual(analisarArgumentos(['--exemplo']), { exemplo: true, banco: false });
  assert.throws(() => analisarArgumentos(['--exemplo', '--com-banco']), /nunca consulta/);
});

test('exige ID, evento e opção explícita para consultar', () => {
  assert.equal(analisarArgumentos([id, 'fato-exemplo']).banco, false);
  assert.equal(analisarArgumentos([id, 'fato-exemplo', '--com-banco']).banco, true);
  assert.throws(() => analisarArgumentos(['../../segredo', 'fato-exemplo']), /Uso:/);
  assert.throws(() => analisarArgumentos([id, '../../segredo']), /inválido/);
});

test('a consulta usa transação somente leitura e critérios da fila', async () => {
  const db = bancoFalso({ elegiveis: 3, ja_registrados: 1, novos_potenciais: 2, ja_enviados: 1 });
  const c = await contarElegiveis(id, avisoId, publicado, { driver: db.mock, databaseUrl: 'postgres://u:p@localhost:5432/db?schema=public' });
  assert.deepEqual(c, { elegiveis: 3, jaRegistrados: 1, novosPotenciais: 2, jaEnviados: 1 });
  assert.equal(db.comandos[0].consulta, 'SET TRANSACTION READ ONLY');
  const sql = db.comandos[1];
  assert.match(sql.consulta, /AND a\.status IN \('ativo', 'aguardando_eleicao'\)/);
  assert.match(sql.consulta, /AND a\.cancelled_at IS NULL/);
  assert.match(sql.consulta, /AND a\.created_at <= \?::timestamptz/);
  assert.match(sql.consulta, /AND a\.updated_at <= \?::timestamptz/);
  assert.ok(sql.args.includes(id));
  assert.ok(sql.args.includes(avisoId));
  assert.ok(sql.args.includes(publicado));
  assert.equal(db.comandos.at(-1).consulta, 'END');
});

test('erros de configuração não imprimem conexão e não abrem banco', async () => {
  await assert.rejects(() => contarElegiveis('falha', avisoId, publicado, {
    databaseUrl: 'postgres://usuario:senha@localhost/banco', driver: () => { throw Error('Conexão indevida'); },
  }), /Entrada inválida/);
});

test('o relatório destaca contagem não consultada e ausência de autorização', () => {
  const dossie = { nome: 'Pessoa fictícia', candidaturaId: id };
  const evento = { titulo: 'Fato documentado', data: { rotulo: '2024' }, fontes: [{ titulo: 'Documento', url: 'https://example.org' }],
    avisoTelegram: { tipo: 'correcao', revisao: 'v2', publicadoEm: publicado } };
  const aviso = { texto: 'Mensagem de teste' };
  const relatorio = apresentarRelatorio({ dossie, evento, mensagem: aviso });
  assert.match(relatorio, /Elegibilidade real: NÃO CONSULTADA/);
  assert.match(relatorio, /NÃO autoriza publicação/);
  assert.match(relatorio, /Mensagem de teste/);
});

test('modo exemplo executa com dados fictícios sem variáveis de banco', () => {
  const original = process.env.DATABASE_URL;
  delete process.env.DATABASE_URL;
  const saida = execFileSync(process.execPath, [path.join(__dirname, '../scripts/telegram/previa-aviso-dossie.cjs'), '--exemplo'], { encoding: 'utf8', timeout: 5000 });
  if (original !== undefined) process.env.DATABASE_URL = original;
  assert.match(saida, /EXEMPLO FICTÍCIO/);
  assert.match(saida, /Pessoa fictícia/);
  assert.match(saida, /Elegibilidade real: NÃO CONSULTADA/);
  assert.match(saida, /Nenhum aviso foi agendado ou enviado/);
});
