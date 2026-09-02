"use client";

import { useEffect } from "react";

export function ControleBuscaEleicoes() {
  useEffect(() => {
    const formulario =
      document.querySelector<HTMLFormElement>(
        "[data-eleicoes-form]",
      );

    const resultados =
      document.querySelector<HTMLElement>(
        "[data-eleicoes-resultados]",
      );

    if (!formulario) {
      return;
    }

    const form = formulario;

    const cargo =
      form.querySelector<HTMLSelectElement>(
        'select[name="cargo"]',
      );

    const uf =
      form.querySelector<HTMLSelectElement>(
        'select[name="uf"]',
      );

    const q =
      form.querySelector<HTMLInputElement>(
        'input[name="q"]',
      );

    let novaPesquisaIniciada = false;

    function haResultadosVisiveis() {
      return Boolean(
        resultados &&
        !resultados.hidden &&
        resultados.textContent?.trim(),
      );
    }

    function esconderResultados() {
      if (resultados) {
        resultados.hidden = true;
      }
    }

    function limparPesquisaAnterior() {
      if (cargo) {
        cargo.value = "";
      }

      if (uf) {
        uf.value = "";
      }

      if (q) {
        q.value = "";
      }
    }

    function iniciarNovaPesquisa() {
      if (
        novaPesquisaIniciada ||
        !haResultadosVisiveis()
      ) {
        return;
      }

      limparPesquisaAnterior();
      esconderResultados();

      novaPesquisaIniciada = true;
    }

    function aoFocar(event: Event) {
      const alvo =
        event.target;

      if (
        !(
          alvo instanceof HTMLInputElement ||
          alvo instanceof HTMLSelectElement
        )
      ) {
        return;
      }

      if (
        alvo.name !== "cargo" &&
        alvo.name !== "uf" &&
        alvo.name !== "q"
      ) {
        return;
      }

      iniciarNovaPesquisa();
    }

    function aoAlterar(event: Event) {
      const alvo =
        event.target;

      if (
        !(
          alvo instanceof HTMLInputElement ||
          alvo instanceof HTMLSelectElement
        )
      ) {
        return;
      }

      esconderResultados();

      novaPesquisaIniciada = true;

      // Nome/partido e cargo/estado sao modos
      // diferentes de pesquisa.
      if (
        alvo.name === "q" &&
        alvo.value.trim() !== ""
      ) {
        if (cargo) {
          cargo.value = "";
        }

        if (uf) {
          uf.value = "";
        }
      }

      // Cargo e estado podem ser usados juntos.
      // Ao usar qualquer um deles, limpamos apenas
      // a pesquisa por nome/partido.
      if (
        (alvo.name === "cargo" ||
          alvo.name === "uf") &&
        alvo.value !== ""
      ) {
        if (q) {
          q.value = "";
        }
      }
    }

    form.addEventListener(
      "focusin",
      aoFocar,
    );

    form.addEventListener(
      "input",
      aoAlterar,
    );

    form.addEventListener(
      "change",
      aoAlterar,
    );

    return () => {
      form.removeEventListener(
        "focusin",
        aoFocar,
      );

      form.removeEventListener(
        "input",
        aoAlterar,
      );

      form.removeEventListener(
        "change",
        aoAlterar,
      );
    };
  }, []);

  return null;
}