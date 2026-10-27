import type { EdicaoAprovadaParaAviso } from "@/data/edicoes/avisos-aprovados";
import type { EventoNotificacao } from "./registrar-novidades";

const DATA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;
const IDENTIFICADOR = /^[a-z0-9][a-z0-9-]{1,79}$/;
const REVISAO = /^[a-z0-9][a-z0-9._-]{0,49}$/;

export function prepararAvisosEdicoes(
  edicoes: readonly EdicaoAprovadaParaAviso[],
  agora: Date = new Date(),
): EventoNotificacao[] {
  const vistos = new Set<string>();
  const eventos: EventoNotificacao[] = [];

  for (const edicao of edicoes) {
    if (
      !IDENTIFICADOR.test(edicao.slug) ||
      !REVISAO.test(edicao.revisao) ||
      !edicao.titulo.trim() || !edicao.resumo.trim() ||
      !DATA.test(edicao.publicadoEm) ||
      !Number.isFinite(Date.parse(edicao.publicadoEm)) ||
      edicao.fontes.length === 0 ||
      edicao.fontes.some(f => {
        try {
          const url = new URL(f.url);
          return !f.titulo.trim() || url.protocol !== "https:" ||
            url.username !== "" || url.password !== "";
        } catch {
          return true;
        }
      })
    ) {
      throw new Error("Edição aprovada para aviso com informações inválidas.");
    }

    const link = `https://www.foradapauta.org/campanhas/${edicao.slug}`;
    if (edicao.endereco !== link) {
      throw new Error("Endereço da edição não corresponde à página autorizada.");
    }

    const id = `edicao:${edicao.slug}:${edicao.revisao}`;
    if (vistos.has(id)) throw new Error("Edição/revisão repetida.");
    vistos.add(id);

    // Publicações agendadas só entram na fila depois da data editorial.
    if (Date.parse(edicao.publicadoEm) > agora.getTime()) continue;

    const fonte = edicao.fontes[0];
    const limitar = (v: string, max: number) => Array.from(v.trim()).slice(0, max).join("");
    const data = edicao.publicadoEm.slice(0, 10).split("-").reverse().join("/");
    const texto = [
      "Nova edição do Fora da Pauta",
      limitar(edicao.titulo, 180),
      limitar(edicao.resumo, 650),
      `Publicada em: ${data}`,
      `Confira a edição: ${link}`,
      `Fonte para conferir: ${limitar(fonte.titulo, 150)}\n${fonte.url}`,
      "Para interromper as novidades, envie /parar.",
    ].join("\n\n");

    eventos.push({ id, texto, publicadoEm: edicao.publicadoEm });
  }

  return eventos;
}
