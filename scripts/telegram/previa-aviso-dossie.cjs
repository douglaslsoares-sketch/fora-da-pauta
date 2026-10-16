#!/usr/bin/env node
// Ferramenta LOCAL, exclusivamente de leitura. Nenhuma rota, fila ou envio de Telegram.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const raiz = path.resolve(__dirname, '../..');
const candidatoValido = /^\d{8,20}$/;

function lerModuloTs(arquivo) {
  const ts = require('typescript');
  const compilado = ts.transpileModule(fs.readFileSync(arquivo, 'utf8'), {
    fileName: arquivo,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    reportDiagnostics: true,
  });
  if ((compilado.diagnostics || []).some((d) => d.category === ts.DiagnosticCategory.Error)) {
    throw new Error('Falha ao interpretar arquivo de dossiê.');
  }
  const mod = { exports: {} };
  vm.runInNewContext(compilado.outputText, {
    module: mod,
    exports: mod.exports,
    require: (nome) => { throw new Error('Importação inesperada em arquivo editorial: ' + nome); },
  }, { filename: arquivo, timeout: 1500 });
  return mod.exports;
}

function carregarDossie(id) {
  if (!candidatoValido.test(id)) throw new Error('Identificador de candidatura inválido.');
  const arquivo = path.join(raiz, 'data', 'eleicoes', 'dossies', id + '.ts');
  if (!fs.existsSync(arquivo)) throw new Error('Não existe dossiê editorial com esse ID neste projeto.');
  const exports = lerModuloTs(arquivo);
  const encontrado = Object.values(exports).find((x) => x && x.candidaturaId === id && Array.isArray(x.eventos));
  if (!encontrado) throw new Error('Dossiê com estrutura inesperada.');
  return encontrado;
}

function prepararMensagens(dossie, agora = new Date()) {
  const modulo = lerModuloTs(path.join(raiz, 'lib', 'telegram', 'preparar-avisos-dossie.ts'));
  return modulo.prepararAvisosDossie(dossie, agora);
}

function analisarArgumentos(args) {
  const aceitos = new Set(['--com-banco', '--exemplo']);
  const opcoes = args.filter((arg) => arg.startsWith('--'));
  if (opcoes.some((arg) => !aceitos.has(arg)) || new Set(opcoes).size !== opcoes.length) {
    throw new Error('Opção inválida. Use --exemplo ou <candidaturaId> <eventoId> [--com-banco].');
  }
  const posicionais = args.filter((arg) => !arg.startsWith('--'));
  if (opcoes.includes('--exemplo')) {
    if (posicionais.length || opcoes.includes('--com-banco')) throw new Error('--exemplo nunca consulta banco.');
    return { exemplo: true, banco: false };
  }
  if (posicionais.length !== 2 || !candidatoValido.test(posicionais[0])) {
    throw new Error('Uso: node scripts/telegram/previa-aviso-dossie.cjs <candidaturaId> <eventoId> [--com-banco]');
  }
  if (!/^[a-zA-Z0-9._-]{1,120}$/.test(posicionais[1])) {
    throw new Error('Identificador de evento inválido.');
  }
  return { exemplo: false, banco: opcoes.includes('--com-banco'), id: posicionais[0], eventoId: posicionais[1] };
}

function apresentarRelatorio({ dossie, evento, mensagem, contagem = null, ficticio = false }) {
  const aviso = evento.avisoTelegram;
  const linhas = [
    '=== PRÉVIA EDITORIAL — SOMENTE LEITURA ===',
    ficticio ? 'EXEMPLO FICTÍCIO: nenhuma publicação ou assinatura real.' : 'Dossiê do código local — confirmar publicação no site antes de autorizar aviso.',
    `Pessoa: ${dossie.nome}`,
    `Candidatura: ${dossie.candidaturaId}`,
    `Informação: ${evento.titulo}`,
    `Quando ocorreu: ${evento.data.rotulo}`,
    `Tipo: ${aviso.tipo}`,
    `Revisão: ${aviso.revisao}`,
    `Publicada em: ${aviso.publicadoEm}`,
    'Fontes:',
    ...evento.fontes.map((f) => `  - ${f.titulo}: ${f.url}`),
    '',
    '--- MENSAGEM PREVISTA NO TELEGRAM ---',
    mensagem.texto,
    '--- FIM DA MENSAGEM ---',
  ];
  if (!contagem) {
    linhas.push('', 'Elegibilidade real: NÃO CONSULTADA.', 'Para consultar somente contagens no seu próprio computador, execute novamente com --com-banco.');
  } else {
    linhas.push('', `Assinantes elegíveis: ${contagem.elegiveis}`, `Já registrados na fila (qualquer status): ${contagem.jaRegistrados}`, `Potenciais novos registros na fila: ${contagem.novosPotenciais}`, `Já enviados entre os elegíveis: ${contagem.jaEnviados}`);
  }
  linhas.push('', 'Nenhum aviso foi agendado ou enviado. Este relatório NÃO autoriza publicação.');
  return linhas.join('\n');
}

async function contarElegiveis(id, avisoId, publicadoEm, { driver, databaseUrl, carregarAmbiente } = {}) {
  if (!candidatoValido.test(id) || !/^dossie:[a-zA-Z0-9._:-]{1,190}$/.test(avisoId) ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/.test(publicadoEm) ||
      !Number.isFinite(Date.parse(publicadoEm))) throw new Error('Entrada inválida para consulta.');
  if (carregarAmbiente) carregarAmbiente();
  const urlOriginal = databaseUrl || process.env.DATABASE_URL;
  if (!urlOriginal) throw new Error('DATABASE_URL não está disponível neste computador. Nenhuma consulta foi feita.');
  const url = new URL(urlOriginal);
  url.searchParams.delete('schema');
  const sql = (driver || require('postgres'))(url.toString(), { max: 1, connect_timeout: 8, idle_timeout: 3 });
  try {
    return await sql.begin(async (tx) => {
      await tx`SET TRANSACTION READ ONLY`;
      const rows = await tx`
        WITH elegiveis AS (
          SELECT a.telegram_chat_id
          FROM public.telegram_acompanhamentos AS a
          WHERE a.candidatura_id = ${id}
            AND a.status IN ('ativo', 'aguardando_eleicao')
            AND a.cancelled_at IS NULL
            AND a.created_at <= ${publicadoEm}::timestamptz
            AND a.updated_at <= ${publicadoEm}::timestamptz
        )
        SELECT
          count(*)::integer AS elegiveis,
          count(f.id)::integer AS ja_registrados,
          count(*) FILTER (WHERE f.id IS NULL)::integer AS novos_potenciais,
          count(*) FILTER (WHERE f.status = 'enviado')::integer AS ja_enviados
        FROM elegiveis AS a
        LEFT JOIN public.telegram_fila_avisos AS f
          ON f.telegram_chat_id = a.telegram_chat_id
         AND f.tipo = 'candidato'
         AND f.referencia = ${id}
         AND f.evento_id = ${avisoId}
      `;
      const c = rows[0];
      if (!c) throw new Error('Consulta não retornou contagens.');
      return {
        elegiveis: Number(c.elegiveis),
        jaRegistrados: Number(c.ja_registrados),
        novosPotenciais: Number(c.novos_potenciais),
        jaEnviados: Number(c.ja_enviados),
      };
    });
  } finally {
    await sql.end({ timeout: 2 });
  }
}

async function executar(args) {
  const escolha = analisarArgumentos(args);
  const dossie = escolha.exemplo ? {
    candidaturaId: '100000000001', nome: 'Pessoa fictícia',
    eventos: [{ id: 'fato-exemplo', titulo: 'Documento de exemplo', resumo: 'Exemplo fictício de informação histórica.',
      data: { inicio: '2024-01-01', rotulo: '1º de janeiro de 2024' },
      fontes: [{ titulo: 'Documento fictício', url: 'https://example.org/documento' }],
      avisoTelegram: { revisao: 'v1', publicadoEm: '2026-10-16T08:00:00-03:00', tipo: 'nova-informacao' },
    }],
  } : carregarDossie(escolha.id);
  const evento = escolha.exemplo ? dossie.eventos[0] : dossie.eventos.find((e) => e.id === escolha.eventoId);
  if (!evento) throw new Error('Evento não encontrado na ficha.');
  if (!evento.avisoTelegram) throw new Error('Este registro não tem aprovação editorial para aviso.');
  const mensagens = prepararMensagens(dossie);
  const avisoId = `dossie:${evento.id}:${evento.avisoTelegram.revisao}`;
  const mensagem = mensagens.find((a) => a.id === avisoId);
  if (!mensagem) throw new Error('A publicação não está habilitada agora ou seus dados são inválidos.');
  let contagem = null;
  if (escolha.banco) {
    const { loadEnvConfig } = require('@next/env');
    contagem = await contarElegiveis(escolha.id, avisoId, mensagem.publicadoEm, {
      carregarAmbiente: () => loadEnvConfig(raiz, true),
    });
  }
  return apresentarRelatorio({ dossie, evento, mensagem, contagem, ficticio: escolha.exemplo });
}

module.exports = { analisarArgumentos, apresentarRelatorio, contarElegiveis, executar };
if (require.main === module) {
  executar(process.argv.slice(2)).then((texto) => console.log(texto)).catch((erro) => {
    console.error('PRÉVIA NÃO EXECUTADA: ' + (process.argv.includes('--com-banco')
      ? 'Consulta somente de leitura indisponível. Confirme a configuração local do banco, sem compartilhar credenciais.'
      : erro.message));
    process.exitCode = 1;
  });
}