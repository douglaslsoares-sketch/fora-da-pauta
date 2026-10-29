"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { inspecionarWav, converterWav } = require("../scripts/audio/extrair-voz-live.cjs");

test("recusa arquivos que não sejam WAV RIFF", () => {
 const pasta=fs.mkdtempSync(path.join(os.tmpdir(),"fdp-wav-"));
 try {const arq=path.join(pasta,"in.wav");fs.writeFileSync(arq,Buffer.alloc(64));assert.throws(()=>inspecionarWav(arq),/RIFF\/WAVE/);}
 finally {fs.rmSync(pasta,{recursive:true,force:true});}
});
test("inspeciona cabeçalho, mas não realiza conversão nem usa API", () => {
 const pasta=fs.mkdtempSync(path.join(os.tmpdir(),"fdp-wav-"));
 try {const arq=path.join(pasta,"in.wav");const bytes=Buffer.alloc(64);bytes.write("RIFF",0);bytes.write("WAVE",8);fs.writeFileSync(arq,bytes);
 const info=inspecionarWav(arq);assert.equal(info.canal_a_extrair,1);
 const saida=path.join(pasta,"saida.mp3");fs.writeFileSync(saida,"existente");assert.throws(()=>converterWav(arq,{destino:saida}),/não sobrescrever/);
 } finally {fs.rmSync(pasta,{recursive:true,force:true});}
});
