import "server-only";
import type { Candidatura } from "@/data/eleicoes/tipos";
import { idsEleitosEm2026 } from "@/lib/eleicoes/acompanhamento-politico";

export type ContatoGovernador = {
  cargo: "governador";
  situacao: "confirmado" | "aguardando_posse" | "nao_confirmado" | "indisponivel" | "manual" | "nao_aplicavel";
  instituicao: string;
  nomeOficial: string | null;
  emailInstitucional: string | null;
  fonteUrl: string | null;
  fontesConferidas: string[];
  explicacao: string;
  envioHabilitado: false;
  contatoAprovado: false;
};

const POSSE_GOVERNADORES = Date.parse("2027-01-06T00:00:00-03:00");
const fontesPR = [
  {
    url: "https://www.parana.pr.gov.br/Pagina/Quemequem",
    formato: "quem-e-quem" as const,
  },
  {
    url: "https://www.gcau-consulta.casacivil.pr.gov.br/gcau_internet/servicoLivreConsultaAgrupadorInternet.do?action=pesquisarPorAgrupadorInternet&codAgrupadorInternet=219",
    formato: "gcau" as const,
  },
];
type FontePR = typeof fontesPR[number];
type Registro = { nome: string; email: string };

function simplificar(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
function htmlParaLinhas(html: string): string[] {
  const limpo = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|svg|noscript)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&aacute;/gi, "á").replace(/&eacute;/gi, "é")
    .replace(/&iacute;/gi, "í").replace(/&oacute;/gi, "ó").replace(/&uacute;/gi, "ú")
    .replace(/&atilde;/gi, "ã").replace(/&otilde;/gi, "õ")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&#(\d+);/g, (_, n: string) => {
      const code = Number(n); return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : " ";
    });
  return limpo.split(/\r?\n/).map(l => l.replace(/\s+/g, " ").trim()).filter(Boolean);
}

function extrairRegistro(html: string, formato: FontePR["formato"]): Registro | null {
  const linhas = htmlParaLinhas(html);
  // Cada fonte organiza o cargo e o nome em ordem inversa.
  const papel = formato === "gcau" ? "GOVERNADOR DO ESTADO DO PARANA" : "GOVERNADOR DO ESTADO";
  const indices = linhas.map((linha, index) => simplificar(linha) === papel ? index : -1).filter(i => i >= 0);
  if (indices.length !== 1) return null;
  const i = indices[0];
  const nome = formato === "gcau" ? linhas[i - 1] : linhas[i + 1];
  if (!nome || simplificar(nome).length < 7 || nome.includes("@")) return null;
  const limite = Math.min(linhas.length, i + (formato === "gcau" ? 10 : 10));
  const proximas = linhas.slice(i + (formato === "gcau" ? 1 : 2), limite);
  const outraAutoridade = /^(?:VICE.GOVERNADOR|CHEFE DA CASA CIVIL|SUB.CHEFE DA CASA CIVIL)/;
  const bloco: string[] = [];
  for (const linha of proximas) {
    if (outraAutoridade.test(simplificar(linha))) break;
    bloco.push(linha);
  }
  const linhaEmail = bloco.find(l => /^\s*E-?mail\s*:/i.test(l));
  const email = linhaEmail?.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i)?.[0]?.toLowerCase();
  if (!email || !/^[a-z0-9._%+-]+@[a-z0-9.-]+\.pr\.gov\.br$/i.test(email)) return null;
  return { nome, email };
}
function pertenceAoEleito(registro: Registro, pessoa: Candidatura) {
  const oficial = simplificar(registro.nome);
  const nomeUrna = simplificar(pessoa.nomeUrna);
  const nomeCompleto = simplificar(pessoa.nomeCompleto);
  // A grafia civil nem sempre coincide com o nome parlamentar/de urna.
  // Só aceitar coincidência integral do nome civil ou nome de urna com ao menos dois termos.
  return oficial === nomeCompleto || (nomeUrna.split(" ").length >= 2 && oficial === nomeUrna);
}
async function lerFonte(fonte: FontePR): Promise<Registro | null> {
  const resposta = await fetch(fonte.url, {
    headers: { Accept: "text/html" },
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(9000),
  });
  if (!resposta.ok || !/^text\/html\b/i.test(resposta.headers.get("content-type") || "")) {
    throw new Error("Resposta oficial não é HTML válido");
  }
  // Não aceitar redirecionamento para outro domínio, mesmo com URL original fixa.
  const final = new URL(resposta.url);
  if (final.protocol !== "https:" || !/\.pr\.gov\.br$/.test(final.hostname)) {
    throw new Error("Redirecionamento não oficial");
  }
  const html = await resposta.text();
  if (html.length > 1_000_000) throw new Error("Página oficial excessivamente grande");
  return extrairRegistro(html, fonte.formato);
}

function base(pessoa: Candidatura, situacao: ContatoGovernador["situacao"], explicacao: string): ContatoGovernador {
  return {
    cargo: "governador",
    situacao,
    instituicao: pessoa.uf === "PR" ? "Governo do Estado do Paraná" : "Governo estadual — " + pessoa.uf,
    nomeOficial: null,
    emailInstitucional: null,
    fonteUrl: pessoa.uf === "PR" ? fontesPR[0].url : null,
    fontesConferidas: [],
    explicacao,
    envioHabilitado: false,
    contatoAprovado: false,
  };
}

export async function consultarContatoGovernadorEmExercicio(
  pessoa: Candidatura, agora: number = Date.now()
): Promise<ContatoGovernador> {
  if (pessoa.cargo !== "governador" || !idsEleitosEm2026.has(pessoa.id)) {
    return base(pessoa, "nao_aplicavel", "Não há eleição para governador confirmada para esta candidatura.");
  }
  if (agora < POSSE_GOVERNADORES) {
    return base(pessoa, "aguardando_posse",
      "Ainda não chegou a data constitucional de posse (6 de janeiro de 2027). Nenhum contato do novo governo é reconhecido.");
  }
  if (pessoa.uf !== "PR") {
    return base(pessoa, "manual",
      "Ainda não foram validadas duas fontes oficiais independentes para reconhecer automaticamente o contato do governador nesta UF. Conferência manual necessária.");
  }
  // Exigência de duas publicações governamentais atualizadas:
  // a virada do calendário sozinha jamais habilita um endereço antigo.
  const consultas = await Promise.allSettled(fontesPR.map(lerFonte));
  if (consultas.some(r => r.status === "rejected")) {
    return base(pessoa, "indisponivel",
      "Não foi possível consultar todas as fontes oficiais. O endereço do novo governador permanece não confirmado.");
  }
  const registros = consultas.map(r => r.status === "fulfilled" ? r.value : null);
  const mesmoEmail = registros[0] && registros[1] &&
    registros[0].email.toLowerCase() === registros[1].email.toLowerCase();
  if (!registros.every(r => !!r && pertenceAoEleito(r, pessoa)) || !mesmoEmail) {
    return base(pessoa, "nao_confirmado",
      "As duas fontes oficiais ainda não identificam o governador eleito com o mesmo endereço institucional. Pode haver dados do governo anterior ou publicação incompleta.");
  }
  return {
    ...base(pessoa, "confirmado",
      "Nome do governador eleito e mesmo e-mail institucional identificados em dois cadastros públicos oficiais, após a data prevista da posse. Reconhecimento informativo: nenhum contato está aprovado para envio."),
    nomeOficial: registros[0]!.nome,
    emailInstitucional: registros[0]!.email,
    fonteUrl: fontesPR[0].url,
    fontesConferidas: fontesPR.map(f => f.url),
  };
}