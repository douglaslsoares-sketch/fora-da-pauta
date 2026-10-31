import { NextRequest, NextResponse } from "next/server";

import { candidaturasPorId } from "@/lib/eleicoes/acompanhamento-politico";
import { formatarCargo } from "@/lib/eleicoes/formatar-cargo";


export async function POST(
  request: NextRequest,
) {
  let corpo: unknown;

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json(
      { erro: "JSON inválido." },
      { status: 400 },
    );
  }

  if (
    !corpo ||
    typeof corpo !== "object" ||
    !Array.isArray(
      (corpo as Record<string, unknown>).ids,
    )
  ) {
    return NextResponse.json(
      { erro: "Lista de IDs inválida." },
      { status: 400 },
    );
  }

  const idsInformados =
    (corpo as { ids: unknown[] }).ids;

  const ids = Array.from(
    new Set(
      idsInformados.filter(
        (id): id is string =>
          typeof id === "string" &&
          /^\d+$/.test(id),
      ),
    ),
  ).slice(0, 100);

  const pessoas = [];

  for (const id of ids) {
    const pessoa = candidaturasPorId.get(id);

    if (!pessoa) continue;

    pessoas.push({
      id: pessoa.id,
      nomeUrna: pessoa.nomeUrna,
      nomeCompleto: pessoa.nomeCompleto,
      numero: pessoa.numero,
      cargo: pessoa.cargo,
      cargoLabel: formatarCargo(
        pessoa.cargo,
        pessoa.id === "210002534604" ? "feminino" : pessoa.genero,
      ),
      uf: pessoa.uf,
      siglaPartido:
        pessoa.siglaPartido,
    });
  }

  return NextResponse.json({
    pessoas,
  });
}
