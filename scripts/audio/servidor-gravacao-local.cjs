"use strict";

/**
 * Página privada, servida SOMENTE em 127.0.0.1, para capturar ÁUDIO
 * da aba selecionada pelo usuário no Chrome.
 *
 * node scripts/audio/servidor-gravacao-local.cjs
 * Abrir: http://127.0.0.1:4178/
 *
 * Não acessa a API OpenAI, não recebe uploads e não guarda gravações.
 * O navegador só salva o arquivo quando o usuário clica em Baixar.
 */
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const HOST = "127.0.0.1";
const PORT = 4178;
const DIR = __dirname;

const ASSETS = {
  "/": { file: "gravador-aba.html", contentType: "text/html; charset=utf-8" },
  "/gravador-aba.js": { file: "gravador-aba.js", contentType: "text/javascript; charset=utf-8" },
};
const CAB = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; script-src 'self'; style-src 'unsafe-inline'; media-src 'self' blob:; connect-src 'none'; img-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
};

function criarServidor() {
  return http.createServer((req, res) => {
    const host = String(req.headers.host || "").toLowerCase();
    if (!/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) {
      res.writeHead(403, CAB);
      res.end("Acesso somente local.");
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405, { ...CAB, Allow: "GET, HEAD" });
      res.end("Somente leitura.");
      return;
    }
    const item = ASSETS[req.url || "/"];
    if (!item) {
      res.writeHead(404, CAB);
      res.end("Não encontrado.");
      return;
    }
    const arquivo = path.join(DIR, item.file);
    const data = fs.readFileSync(arquivo);
    res.writeHead(200, { ...CAB, "Content-Type": item.contentType, "Content-Length": data.length });
    res.end(req.method === "HEAD" ? undefined : data);
  });
}

if (require.main === module) {
  criarServidor().listen(PORT, HOST, () => {
    console.log("Gravador PRIVADO pronto: http://" + HOST + ":" + PORT + "/");
    console.log("Selecione somente a aba do Playground. Nenhum áudio é enviado ou publicado.");
    console.log("Ctrl+C encerra este servidor local.");
  });
}

module.exports = { criarServidor };
