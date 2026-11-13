import { createHash } from "node:crypto";
import { entregasPublicadas } from "@/data/entregas-publicadas";

function assinatura(conteudo: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(conteudo))
    .digest("hex")
    .slice(0, 20);
}

// O acervo editorial anterior está arquivado, sem edições públicas.
export const versaoEdicoes = null;
export const totalEdicoesPublicas = 0;

export const versaoEntregas = entregasPublicadas.length > 0
  ? assinatura(entregasPublicadas)
  : null;
export const totalEntregasPublicadas = entregasPublicadas.length;
