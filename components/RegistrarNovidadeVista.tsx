"use client";

import { useEffect } from "react";

type Secao = "edicoes" | "entregas";
export const chaveNovidade = (secao: Secao) => `fora-da-pauta:novidade-vista:v1:${secao}`;

/**
 * Um acesso a pagina marca a versao atual como vista apenas neste navegador.
 * Publicacoes futuras alteram a versao, reativando o aviso na home.
 */
export function RegistrarNovidadeVista({
  secao,
  versao,
}: {
  secao: Secao;
  versao: string | null;
}) {
  useEffect(() => {
    if (!versao) return;
    try {
      window.localStorage.setItem(chaveNovidade(secao), versao);
    } catch {
      // O navegador pode bloquear o armazenamento local.
    }
  }, [secao, versao]);

  return null;
}
