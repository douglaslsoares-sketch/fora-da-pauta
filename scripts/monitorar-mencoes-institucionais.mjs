/**
 * Monitor independente de MENÇÕES em notícias institucionais públicas.
 *
 * Uma menção não prova ato, promessa, apoio, posicionamento ou identidade.
 * Não insere eventos em dossiês e NÃO encaminha avisos ao Telegram.
 *
 * O monitor começa pelos eleitos presentes na base oficial TSE/2026.
 * Apenas nomes completos com >= 3 palavras, únicos na lista, são aceitos.
 * Links só são admitidos nos domínios explicitamente autorizados.
 */
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

export const FONTES = Object.freeze([
  {
    id: "camara",
    nome: "Agência Câmara",
    feed: "https://www.camara.leg.br/noticias/rss/ultimas-noticias",
    dominios: ["www.camara.leg.br", "camara.leg.br", "www2.camara.leg.br"],
  },
  {
    id: "senado",
    nome: "Agência Senado",
    feed: "https://www12.senado.leg.br/noticias/rss.xml",
    dominios: ["www12.senado.leg.br"],
  },
  {
    id: "agencia-brasil",
    nome: "Agência Brasil",
    feed: "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml",
    dominios: ["agenciabrasil.ebc.com.br"],
  },
]);

export function textoNormalizado(valor) {
  return String(valor || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function textoXml(valor) {
  return String(valor || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function primeiroElemento(bloco, nomes) {
  for (const nome of nomes) {
    const re = new RegExp("<" + nome + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + nome + "\\s*>", "i");
    const achado = bloco.match(re);
    if (achado) return textoXml(achado[1]);
  }
  return "";
}

function lerLink(bloco, atom) {
  if (!atom) return primeiroElemento(bloco, ["link"]);
  const links = [...bloco.matchAll(/<link\b([^>]*?)\/?>/gi)];
  for (const [, attrs] of links) {
    if (/rel\s*=\s*["'](?:self|enclosure)["']/i.test(attrs)) continue;
    const href = attrs.match(/\bhref\s*=\s*["']([^"']+)["']/i);
    if (href) return textoXml(href[1]);
  }
  return "";
}

function linkOficial(link, fonte) {
  try {
    const url = new URL(link);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    if (!fonte.dominios.includes(url.hostname.toLowerCase())) return null;
    if (url.port || url.pathname === "/") return null;
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

export function lerFeed(xml, fonte) {
  if (typeof xml !== "string" || xml.length < 70 || xml.length > 6000000) {
    throw new Error("Feed ausente, vazio ou acima do limite: " + fonte.id);
  }
  const atom = /<feed(?:\s|>)/i.test(xml);
  const blocos = atom
    ? [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)]
    : [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];
  if (blocos.length === 0) throw new Error("Feed RSS/Atom sem registros: " + fonte.id);

  return blocos.slice(0, 100).map(([, bloco]) => {
    const titulo = primeiroElemento(bloco, ["title"]);
    const url = linkOficial(lerLink(bloco, atom), fonte);
    const publicado = primeiroElemento(bloco, ["pubDate", "published", "updated", "dc:date"]);
    const data = Date.parse(publicado);
    const descricao = primeiroElemento(bloco, ["description", "summary", "content:encoded", "content"]);
    if (!titulo || !url || !Number.isFinite(data)) return null;
    return {
      titulo: titulo.slice(0, 280),
      descricao: descricao.slice(0, 850),
      url,
      fonte: fonte.nome,
      fonteId: fonte.id,
      publicadoEm: new Date(data).toISOString(),
    };
  }).filter(Boolean);
}

export function indexarPessoas(pessoas) {
  const nomes = new Map();
  for (const p of pessoas) {
    const id = String(p.id || "");
    const nome = textoNormalizado(p.nomeCompleto);
    if (!/^\d{8,20}$/.test(id) || nome.split(" ").length < 3) continue;
    if (!nomes.has(nome)) nomes.set(nome, []);
    nomes.get(nome).push({ id, nome: String(p.nomeCompleto), cargo: p.cargo, uf: p.uf });
  }
  // Evita homônimos dentro da própria base.
  return [...nomes.entries()]
    .filter(([, pessoas]) => pessoas.length === 1)
    .map(([nome, pessoas]) => ({ chave: " " + nome + " ", ...pessoas[0] }));
}

export function identificarMencoes(itens, pessoasIndexadas, agora = new Date()) {
  const registros = [];
  const janela = 30 * 86400000;
  for (const item of itens) {
    const instante = Date.parse(item.publicadoEm);
    if (!Number.isFinite(instante) || instante < agora.getTime() - janela ||
        instante > agora.getTime() + 86400000) continue;
    const texto = " " + textoNormalizado(item.titulo + " " + item.descricao) + " ";
    for (const p of pessoasIndexadas) {
      if (!texto.includes(p.chave)) continue;
      registros.push({
        id: createHash("sha256").update(p.id + "|" + item.url).digest("hex").slice(0, 24),
        candidaturaId: p.id,
        nomeDaBase: p.nome,
        titulo: item.titulo,
        fonte: item.fonte,
        fonteId: item.fonteId,
        url: item.url,
        publicadoEm: item.publicadoEm,
        situacao: "mencao-automatica-nao-verificada",
      });
    }
  }
  return registros;
}

export function consolidarMencoes(existentes, encontrados, agora = new Date()) {
  const anteriores = Array.isArray(existentes) ? existentes : [];
  const limite = agora.getTime() - 60 * 86400000;
  const mapa = new Map();
  for (const item of [...anteriores, ...encontrados]) {
    if (!item || item.situacao !== "mencao-automatica-nao-verificada" ||
        !/^\d{8,20}$/.test(String(item.candidaturaId)) ||
        !Number.isFinite(Date.parse(item.publicadoEm)) ||
        Date.parse(item.publicadoEm) < limite || Date.parse(item.publicadoEm) > agora.getTime() + 86400000) continue;
    const fonte = FONTES.find(f => f.id === item.fonteId);
    if (!fonte || linkOficial(item.url, fonte) !== item.url) continue;
    const id = createHash("sha256").update(item.candidaturaId + "|" + item.url).digest("hex").slice(0, 24);
    if (item.id !== id) continue;
    mapa.set(id, {
      id, candidaturaId: String(item.candidaturaId),
      nomeDaBase: String(item.nomeDaBase).slice(0, 150),
      titulo: String(item.titulo).slice(0, 280),
      fonte: fonte.nome, fonteId: fonte.id,
      url: item.url, publicadoEm: item.publicadoEm,
      situacao: "mencao-automatica-nao-verificada",
    });
  }
  return [...mapa.values()]
    .sort((a, b) => b.publicadoEm.localeCompare(a.publicadoEm) || a.id.localeCompare(b.id))
    .slice(0, 2500);
}

export async function executarMonitor({
  listaPessoas = "data/eleicoes/gerado/eleitos-2026.json",
  destino = "data/eleicoes/gerado/mencoes-institucionais.json",
  requisitar = fetch,
  agora = new Date(),
} = {}) {
  const eleitos = JSON.parse(await readFile(listaPessoas, "utf8"));
  const atuais = JSON.parse(await readFile(destino, "utf8"));
  const indexados = indexarPessoas(eleitos);

  // Falhas de fonte não geram atualização parcial silenciosa.
  const itensPorFonte = await Promise.all(FONTES.map(async fonte => {
    try {
      const resposta = await requisitar(fonte.feed, {
        headers: { "User-Agent": "ForaDaPautaMonitor/1.0 (contato: www.foradapauta.org)" },
        signal: AbortSignal.timeout(20000),
        redirect: "error",
      });
      if (!resposta.ok) throw new Error("HTTP " + resposta.status);
      const conteudo = await resposta.text();
      return lerFeed(conteudo, fonte);
    } catch (erro) {
      // Identifica qual provedor falhou, sem expor trechos de documentos ou dados privados.
      const motivo = erro instanceof Error ? erro.message.slice(0, 140) : "erro desconhecido";
      throw new Error("Fonte " + fonte.id + " indisponível: " + motivo);
    }
  }));

  const extraidos = itensPorFonte.flat();
  const mencoes = identificarMencoes(extraidos, indexados, agora);
  const resultado = consolidarMencoes(atuais, mencoes, agora);
  const anterior = consolidarMencoes(atuais, [], agora);

  if (JSON.stringify(resultado) !== JSON.stringify(anterior)) {
    await writeFile(destino, JSON.stringify(resultado, null, 2) + "\n", "utf8");
  }
  return { fontes: FONTES.length, noticias: extraidos.length,
    pessoasIndexadas: indexados.length, mencoesNovas: Math.max(0, resultado.length - anterior.length),
    total: resultado.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  executarMonitor().then(r => {
    console.log(JSON.stringify(r));
  }).catch(e => {
    console.error("Falha no monitor institucional: " + (e instanceof Error ? e.message : "erro desconhecido"));
    process.exitCode = 1;
  });
}
