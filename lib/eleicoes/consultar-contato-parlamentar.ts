import "server-only";
import type { Candidatura } from "@/data/eleicoes/tipos";

type Localizado = {
  situacao: "encontrado";
  casa: "Câmara dos Deputados" | "Senado Federal";
  nomeOficial: string;
  emailInstitucional: string;
  fonteUrl: string;
  conferencia: string;
  envioHabilitado: false;
};
type Pendente = {
  situacao: "pendente" | "indisponivel" | "nao_aplicavel";
  motivo: string;
  fonteUrl: string | null;
  envioHabilitado: false;
};
export type ResultadoContato = Localizado | Pendente;

function normalizar(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Za-z0-9 ]/g, " ").toUpperCase().replace(/\s+/g, " ").trim();
}
function emailOficial(email: unknown, dominio: string): email is string {
  return typeof email === "string" && /^[a-z0-9._%+-]+@[a-z0-9.-]+$/i.test(email) && email.toLowerCase().endsWith("@" + dominio);
}
async function obterJson<T>(url: string): Promise<T> {
  const resposta = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", signal: AbortSignal.timeout(13000) });
  if (!resposta.ok) throw new Error("Consulta institucional indisponível");
  return await resposta.json() as T;
}
type DeputadoResumo = { id: number; nome: string; siglaUf: string };
type DeputadoDetalhe = {
  nomeCivil?: string;
  ultimoStatus?: { situacao?: string; siglaUf?: string; email?: string; gabinete?: { email?: string } };
};
async function consultarCamara(pessoa: Candidatura): Promise<ResultadoContato> {
  const base = "https://dadosabertos.camara.leg.br/api/v2/deputados";
  const fonte = "https://www.camara.leg.br/deputados/quem-sao";
  // O nome eleitoral pode ser diferente do nome parlamentar. Consultar também
  // o nome civil e, quando disponível, um nome próprio distintivo.
  const nomeCivilDistintivo = pessoa.nomeCompleto.split(/\s+/)
    .find(parte => normalizar(parte).length >= 5 &&
      !["JOSE", "MARIA", "SILVA", "SOUZA", "SANTOS", "OLIVEIRA", "PEREIRA", "COSTA", "FILHO", "JUNIOR", "JUNIORA"].includes(normalizar(parte))) || "";
  const termos = [...new Set([pessoa.nomeUrna.trim(), pessoa.nomeCompleto.trim(), nomeCivilDistintivo].filter(Boolean))];
  const retornos = await Promise.allSettled(termos.map(async nome => {
    const query = new URLSearchParams({ nome, itens: "100" });
    const resposta = await obterJson<{ dados?: DeputadoResumo[]; links?: { rel?: string }[] }>(base + "?" + query.toString());
    if (!Array.isArray(resposta.dados)) throw new Error("Formato inesperado na API da Câmara");
    if (Array.isArray(resposta.links) && resposta.links.some(link => link.rel === "next")) {
      throw new Error("Consulta com mais de uma página");
    }
    return resposta.dados;
  }));
  if (retornos.some(item => item.status === "rejected")) return {
    situacao: "indisponivel",
    motivo: "Uma das consultas oficiais por nome eleitoral ou civil falhou ou teve resultados demais. Não foi possível conferir todos os possíveis registros.",
    fonteUrl: fonte, envioHabilitado: false
  };
  const ids = new Map<number, DeputadoResumo>();
  for (const retorno of retornos) {
    if (retorno.status !== "fulfilled") continue;
    for (const item of retorno.value) {
      if (item.siglaUf === pessoa.uf && Number.isInteger(item.id) && item.id > 0) ids.set(item.id, item);
    }
  }
  const resumos = [...ids.values()];
  if (resumos.length > 40) return {
    situacao: "pendente",
    motivo: "Há muitos possíveis parlamentares com nomes semelhantes neste estado. A conferência precisa ser refinada manualmente.",
    fonteUrl: fonte, envioHabilitado: false
  };
  if (!resumos.length) return {
    situacao: "pendente",
    motivo: "Não foram localizados parlamentares do mesmo estado nas pesquisas pelo nome eleitoral e pelo nome civil. Isso não prova ausência de mandato.",
    fonteUrl: fonte, envioHabilitado: false
  };
  const detalhes = await Promise.allSettled(resumos.map(item => obterJson<{ dados?: DeputadoDetalhe }>(base + "/" + item.id)));
  const correspondencias: Localizado[] = [];
  detalhes.forEach((resultado, index) => {
    if (resultado.status !== "fulfilled") return;
    const info = resultado.value.dados;
    const status = info?.ultimoStatus;
    if (!info || !status) return;
    const email = status.email || status.gabinete?.email;
    if (normalizar(info.nomeCivil || "") !== normalizar(pessoa.nomeCompleto) ||
        status.siglaUf !== pessoa.uf ||
        normalizar(status.situacao || "") !== "EXERCICIO" ||
        !emailOficial(email, "camara.leg.br")) return;
    correspondencias.push({
      situacao: "encontrado", casa: "Câmara dos Deputados",
      nomeOficial: info.nomeCivil || "", emailInstitucional: email,
      fonteUrl: "https://www.camara.leg.br/deputados/" + resumos[index].id,
      conferencia: "Nome civil e UF coincidem exatamente; a API oficial informa exercício do mandato e e-mail institucional. Exige revisão final antes de qualquer envio.",
      envioHabilitado: false
    });
  });
  if (detalhes.some(item => item.status === "rejected")) return {
    situacao: "indisponivel",
    motivo: "A consulta à Câmara foi interrompida parcialmente. Não é seguro concluir que não existe um contato correspondente.",
    fonteUrl: fonte, envioHabilitado: false
  };
  if (correspondencias.length === 1) return correspondencias[0];
  return {
    situacao: "pendente",
    motivo: correspondencias.length > 1 ? "Identificação ambígua entre registros oficiais." : "Não foi possível confirmar, ao mesmo tempo, nome civil, UF, exercício do mandato e e-mail institucional.",
    fonteUrl: fonte, envioHabilitado: false
  };
}
type Senador = { IdentificacaoParlamentar?: {
  NomeCompletoParlamentar?: string; NomeParlamentar?: string; UfParlamentar?: string;
  EmailParlamentar?: string; CodigoParlamentar?: string | number;
}};
async function consultarSenado(pessoa: Candidatura): Promise<ResultadoContato> {
  const api = "https://legis.senado.leg.br/dadosabertos/senador/lista/atual.json";
  const fonte = "https://www25.senado.leg.br/web/senadores/em-exercicio/";
  const resposta = await obterJson<{ ListaParlamentarEmExercicio?: { Parlamentares?: { Parlamentar?: Senador[] | Senador } } }>(api);
  const base = resposta.ListaParlamentarEmExercicio?.Parlamentares?.Parlamentar;
  if (!base) throw new Error("Formato inesperado na API do Senado");
  const pessoas = Array.isArray(base) ? base : [base];
  const correspondencias = pessoas.filter(p => {
    const dados = p.IdentificacaoParlamentar;
    return normalizar(dados?.NomeCompletoParlamentar || "") === normalizar(pessoa.nomeCompleto) &&
      dados?.UfParlamentar === pessoa.uf && emailOficial(dados?.EmailParlamentar, "senado.leg.br");
  });
  if (correspondencias.length !== 1) return {
    situacao: "pendente",
    motivo: correspondencias.length > 1 ? "Correspondência ambígua." : "Nome civil, UF e e-mail institucional não foram confirmados conjuntamente na lista de senadores em exercício.",
    fonteUrl: fonte, envioHabilitado: false
  };
  const parlamentar = correspondencias[0].IdentificacaoParlamentar!;
  return {
    situacao: "encontrado",
    casa: "Senado Federal",
    nomeOficial: parlamentar.NomeCompletoParlamentar!,
    emailInstitucional: parlamentar.EmailParlamentar!,
    fonteUrl: fonte,
    conferencia: "Correspondência exata de nome civil e UF na lista oficial de senadores em exercício, com e-mail institucional. Exige revisão final antes de qualquer envio.",
    envioHabilitado: false
  };
}
export async function consultarContatoParlamentar(pessoa: Candidatura): Promise<ResultadoContato> {
  if (pessoa.cargo === "presidente") {
    return {
      situacao: "pendente",
      motivo: "Para a Presidência, o canal oficial Fale com o Presidente informa estar temporariamente fora do ar e oferece formulário alternativo. Consulte a página para verificar a disponibilidade atual. A Ouvidoria pelo Fala.BR atende manifestações a órgãos públicos, não equivale a contato pessoal com o presidente. Nenhuma dessas opções valida automaticamente o mandato ou habilita envio pelo Fora da Pauta.",
      fonteUrl: "https://falepr.presidencia.gov.br/index.php?idioma=br",
      envioHabilitado: false
    };
  }
  if (pessoa.cargo !== "deputado-federal" && pessoa.cargo !== "senador") {
    return { situacao: "nao_aplicavel", motivo: "Esta primeira etapa consulta deputados federais e senadores. Não há encaminhamento ativo para este cargo.", fonteUrl: null, envioHabilitado: false };
  }
  try {
    return pessoa.cargo === "deputado-federal" ? await consultarCamara(pessoa) : await consultarSenado(pessoa);
  } catch {
    return {
      situacao: "indisponivel",
      motivo: "Não foi possível consultar o serviço oficial agora. Nenhum contato foi considerado verificado.",
      fonteUrl: pessoa.cargo === "deputado-federal" ? "https://dadosabertos.camara.leg.br/" : "https://www12.senado.leg.br/dados-abertos/",
      envioHabilitado: false
    };
  }
}
