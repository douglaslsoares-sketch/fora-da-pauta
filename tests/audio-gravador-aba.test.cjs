"use strict";
const {test}=require("node:test");const assert=require("node:assert/strict");
const fs=require("node:fs");const path=require("node:path");
const root=path.join(__dirname,"../scripts/audio/");
const html=fs.readFileSync(path.join(root,"gravador-aba.html"),"utf8");
const js=fs.readFileSync(path.join(root,"gravador-aba.js"),"utf8");
const server=fs.readFileSync(path.join(root,"servidor-gravacao-local.cjs"),"utf8");
test("gravador exige interacao e autorizacao de aba com audio",()=>{
 assert.match(js,/iniciar\.addEventListener\("click"/);assert.match(js,/getDisplayMedia/);
 assert.match(js,/displaySurface!=="browser"/);assert.match(js,/getAudioTracks\(\)\.length!==1/);
 assert.match(js,/new MediaStream\(stream\.getAudioTracks\(\)\)/);
 assert.match(js,/baixar\.addEventListener\("click"/);
 assert.match(js,/recorder\.start/);assert.match(js,/limparStream/);
});
test("gravador nao envia dados para servidor",()=>{
 assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
 assert.match(server,/const HOST = "127\.0\.0\.1"/);
 assert.match(server,/req\.method !== "GET" && req\.method !== "HEAD"/);
 assert.match(html,/Nenhum som é enviado para servidor/);
});