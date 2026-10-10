import { NextRequest, NextResponse } from "next/server";

import { candidaturas } from "@/data/eleicoes/candidaturas";
import { eleitos2026 } from "@/data/eleicoes/eleitos";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";

const TAMANHO_PAGINA = 40;

function normalizar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function nomeCorresponde(
  nome: string,
  termo: string,
) {
  const palavrasNome =
    normalizar(nome)
      .split(/\s+/)
      .filter(Boolean);

  const palavrasTermo =
    normalizar(termo)
      .split(/\s+/)
      .filter(Boolean);

  return palavrasTermo.every(
    (parte) =>
      palavrasNome.some(
        (palavra) =>
          palavra.startsWith(parte),
      ),
  );
}

export async function GET(
  request: NextRequest,
) {
  const { searchParams } =
    new URL(request.url);

  const termo =
    normalizar(
      searchParams.get("q") ?? "",
    );

  const cargo =
    searchParams.get("cargo") ?? "";

  const escopo =
    searchParams.get("escopo") ?? "";

  const uf =
    (
      searchParams.get("uf") ?? ""
    ).toUpperCase();

  const paginaInformada =
    Number.parseInt(
      searchParams.get("pagina") ?? "1",
      10,
    );

  const paginaSolicitada =
    Number.isFinite(paginaInformada) &&
    paginaInformada > 0
      ? paginaInformada
      : 1;

  if (
    termo.length < 2 &&
    !cargo &&
    !uf
  ) {
    return NextResponse.json({
      resultados: [],
      total: 0,
      pagina: 1,
      totalPaginas: 0,
    });
  }

  const base =
    escopo === "eleitos"
      ? eleitos2026
      : candidaturas;

  const encontrados =
    base
      .filter((candidate) => {
        if (
          cargo &&
          candidate.cargo !== cargo
        ) {
          return false;
        }

        if (
          uf &&
          candidate.uf !== uf
        ) {
          return false;
        }

        if (!termo) {
          return true;
        }

        const correspondeAoNome =
          nomeCorresponde(
            `${candidate.nomeUrna} ${candidate.nomeCompleto}`,
            termo,
          );

        const correspondeASigla =
          normalizar(
            candidate.siglaPartido,
          ) === termo;

        const correspondeAoNumero =
          String(
            candidate.numero,
          ) === termo;

        return (
          correspondeAoNome ||
          correspondeASigla ||
          correspondeAoNumero
        );
      })
      .sort((a, b) =>
        a.nomeUrna.localeCompare(
          b.nomeUrna,
          "pt-BR",
        ),
      );

  const total =
    encontrados.length;

  const totalPaginas =
    total === 0
      ? 0
      : Math.ceil(
          total / TAMANHO_PAGINA,
        );

  const pagina =
    totalPaginas === 0
      ? 1
      : Math.min(
          paginaSolicitada,
          totalPaginas,
        );

  const inicio =
    (pagina - 1) *
    TAMANHO_PAGINA;

  const resultados =
    encontrados
      .slice(
        inicio,
        inicio + TAMANHO_PAGINA,
      )
      .map((candidate) => ({
        id: candidate.id,
        nomeUrna: candidate.nomeUrna,
        nomeCompleto:
          candidate.nomeCompleto,
        numero: candidate.numero,
        cargo: candidate.cargo,
        cargoLabel:
          formatarCargo(
            candidate.cargo,
          ),
        uf: candidate.uf,
        siglaPartido:
          candidate.siglaPartido,
      }));

  return NextResponse.json({
    resultados,
    total,
    pagina,
    totalPaginas,
  });
}
