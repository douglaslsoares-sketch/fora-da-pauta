import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
const route = readFileSync("app/pessoa/[id]/page.tsx", "utf8");
const identity = readFileSync("lib/eleicoes/identidade-politica.ts", "utf8");
assert.match(route, /buscarCandidaturaConfirmadaDaPessoa/);
assert.match(route, /if \(!candidaturaId\) notFound\(\)/);
assert.match(identity, /ids\.length === 1 \? ids\[0\] : null/);
console.log("Verificação estática: endereço da pessoa não escolhe candidatura ambígua.");
