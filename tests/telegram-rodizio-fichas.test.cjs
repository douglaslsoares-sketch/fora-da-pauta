const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");

const src = fs.readFileSync(path.join(__dirname, "../lib/telegram/coletar-novidades.ts"),"utf8");

test("coletor distribui todas as fichas acompanhadas sem depender da existencia de arquivo",()=>{
 assert.match(src,/row_number\(\) OVER \(ORDER BY candidatura_id\)/);
 assert.match(src,/\(\$\{janela\}::bigint \* 10\) % total/);
 assert.match(src,/LIMIT 10/);
 assert.match(src,/const janela = Math\.floor\(Date\.now\(\) \/ \(15 \* 60 \* 1000\)\)/);
 assert.match(src,/'nao_eleito'/);
 assert.match(src,/!atuacao && !dossie/);
 assert.doesNotMatch(src,/ORDER BY f\.verificado_at ASC NULLS FIRST/);
});

test("rodízio circular cobre grupos com fichas vazias, inclusive total menor que lote",()=>{
 for (const total of [1,5,10,11,20,21,23,51,101]) {
  const conjunto=new Set();
  const ciclos=Math.ceil(total/10)+1;
  for(let janela=0;janela<ciclos;janela++){
   const ordenados=Array.from({length:total},(_,indice)=>({
    indice,ordem:((indice - ((janela*10)%total) + total)%total)
   })).sort((a,b)=>a.ordem-b.ordem).slice(0,10);
   assert.equal(ordenados.length,Math.min(10,total));
   for(const item of ordenados)conjunto.add(item.indice);
  }
  assert.equal(conjunto.size,total,`cobertura para ${total} inscritos`);
 }
});
