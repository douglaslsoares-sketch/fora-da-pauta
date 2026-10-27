"use strict";
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { dataValida, validarArquivo } = require("../scripts/validar-atuacao-candidatos.cjs");

test("aceita data, hora em minutos, segundos, frações e fuso", () => {
  for (const data of ["2026-10-14", "2026-09-22T16:37", "2026-04-16T14:52:11", "2026-04-16T14:52:11.123Z", "2024-02-29T00:00:00-03:00"]) {
    assert.equal(dataValida(data), true, data);
  }
});
test("rejeita calendário impossível, horários e formatos inválidos", () => {
  for (const data of ["2026-02-29", "2026-13-01", "2026-04-31", "2026-10-14T24:00", "2026-10-14T12:60", "2026-10-14T12:00:60", "14/10/2026", "", null]) {
    assert.equal(dataValida(data), false, String(data));
  }
});
function ficha() {
  return {
    candidaturaId: "123", atualizadoEm: "2026-10-26T01:30:15",
    totalVotacoes: 1, totalProposicoes: 2,
    votacoes: [{ votacaoId: "12-4", data: "2026-10-14", dataHora: "2026-10-14T20:30:07", fonte: { url: "https://dadosabertos.camara.leg.br/api/v2/votacoes/12-4" } }],
    proposicoes: [
      { proposicaoId: "2646925", data: "2026-09-22T16:37", fonte: { url: "https://dadosabertos.camara.leg.br/api/v2/proposicoes/2646925" } },
      { proposicaoId: "2601407", data: "2026-04-16T14:52:11", fonte: { url: "https://dadosabertos.camara.leg.br/api/v2/proposicoes/2601407" } },
    ],
  };
}
test("valida uma ficha íntegra com proposições em data/hora", () => {
  assert.deepEqual(validarArquivo(ficha(), "123.json"), []);
});
test("aponta inconsistência sem alterar conteúdo", () => {
  const dados = ficha();
  const original = JSON.stringify(dados);
  dados.proposicoes[0].data = "2026-02-30T16:37";
  dados.totalProposicoes = 1;
  dados.votacoes[0].fonte.url = "http://invalido";
  const antes = JSON.stringify(dados);
  const erros = validarArquivo(dados, "123.json");
  assert.ok(erros.some((e) => e.includes("data inválida")));
  assert.ok(erros.some((e) => e.includes("totalProposicoes")));
  assert.ok(erros.some((e) => e.includes("HTTPS")));
  assert.equal(JSON.stringify(dados), antes);
  assert.notEqual(antes, original);
});
