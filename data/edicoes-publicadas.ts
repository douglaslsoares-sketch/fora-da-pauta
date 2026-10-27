import { campaigns } from "@/data/campanhas";

/**
 * Conteúdos existentes que foram retirados da divulgação editorial.
 * Uma data de publicação isolada não deve tornar essas páginas visíveis
 * no catálogo, na home ou nas sugestões de leitura.
 */
const edicoesForaDoCatalogo = new Set([
  "seus-interesses",
  "fim-escala-6x1",
  "compare-os-dados",
]);

/** Única fonte para exibição pública das edições, da mais recente à mais antiga. */
export function getPublishedEditions() {
  return campaigns
    .filter(
      (campaign) =>
        Boolean(campaign.publishedAt) &&
        !edicoesForaDoCatalogo.has(campaign.slug),
    )
    .sort((a, b) =>
      (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""),
    );
}

export function formatEditionDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T12:00:00Z`));
}
