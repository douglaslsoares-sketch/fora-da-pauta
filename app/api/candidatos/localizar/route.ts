import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

export const runtime = "nodejs";

const requestSchema = z.object({
  nome: z.string().trim().min(1).max(200),
  cargo: z.string().trim().max(100).nullable().optional(),
  partido: z.string().trim().max(100).nullable().optional(),
  estado: z.string().trim().max(100).nullable().optional(),
  municipio: z.string().trim().max(150).nullable().optional(),
});

type CandidateRow = {
  id: string;
  eleicao: number;
  nomeUrna: string;
  nomeCompleto: string;
  numero: number;
  cargo: string;
  uf: string;
  partido: string;
  siglaPartido: string;
  situacao: string;
  situacaoTse: string;
  fonteOficial: string;
  ultimaVerificacao: string;
};

let candidateCache: CandidateRow[] | null = null;

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase();
}

function normalizeCargo(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = normalizeText(value);

  const aliases: Record<string, string> = {
    PRESIDENTE: "PRESIDENTE",
    "PRESIDENTE DA REPUBLICA": "PRESIDENTE",

    "VICE PRESIDENTE": "VICE PRESIDENTE",
    "VICE PRESIDENTE DA REPUBLICA": "VICE PRESIDENTE",

    GOVERNADOR: "GOVERNADOR",
    "VICE GOVERNADOR": "VICE GOVERNADOR",

    SENADOR: "SENADOR",
    SENADORA: "SENADOR",

    "DEPUTADO FEDERAL": "DEPUTADO FEDERAL",
    "DEPUTADA FEDERAL": "DEPUTADO FEDERAL",

    "DEPUTADO ESTADUAL": "DEPUTADO ESTADUAL",
    "DEPUTADA ESTADUAL": "DEPUTADO ESTADUAL",

    "DEPUTADO DISTRITAL": "DEPUTADO DISTRITAL",
    "DEPUTADA DISTRITAL": "DEPUTADO DISTRITAL",

    PREFEITO: "PREFEITO",
    PREFEITA: "PREFEITO",

    VEREADOR: "VEREADOR",
    VEREADORA: "VEREADOR",
  };

  return aliases[normalized] ?? normalized;
}

const stateMap: Record<string, string> = {
  ACRE: "AC",
  ALAGOAS: "AL",
  AMAPA: "AP",
  AMAZONAS: "AM",
  BAHIA: "BA",
  CEARA: "CE",
  "DISTRITO FEDERAL": "DF",
  "ESPIRITO SANTO": "ES",
  GOIAS: "GO",
  MARANHAO: "MA",
  "MATO GROSSO": "MT",
  "MATO GROSSO DO SUL": "MS",
  "MINAS GERAIS": "MG",
  PARA: "PA",
  PARAIBA: "PB",
  PARANA: "PR",
  PERNAMBUCO: "PE",
  PIAUI: "PI",
  "RIO DE JANEIRO": "RJ",
  "RIO GRANDE DO NORTE": "RN",
  "RIO GRANDE DO SUL": "RS",
  RONDONIA: "RO",
  RORAIMA: "RR",
  "SANTA CATARINA": "SC",
  "SAO PAULO": "SP",
  SERGIPE: "SE",
  TOCANTINS: "TO",
  BRASIL: "BR",
};

function normalizeUf(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = normalizeText(value);

  if (/^[A-Z]{2}$/.test(normalized)) {
    return normalized;
  }

  return stateMap[normalized] ?? normalized;
}

function nameScore(
  query: string,
  candidate: CandidateRow,
) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return 0;
  }

  const ballotName = normalizeText(candidate.nomeUrna);
  const fullName = normalizeText(candidate.nomeCompleto);

  if (
    normalizedQuery === ballotName ||
    normalizedQuery === fullName
  ) {
    return 100;
  }

  if (
    ballotName.includes(normalizedQuery) ||
    fullName.includes(normalizedQuery)
  ) {
    return 90;
  }

  const queryTokens = normalizedQuery
    .split(" ")
    .filter(Boolean);

  const ballotTokens = new Set(
    ballotName.split(" ").filter(Boolean),
  );

  const fullTokens = new Set(
    fullName.split(" ").filter(Boolean),
  );

  const allInBallot =
    queryTokens.length > 0 &&
    queryTokens.every((token) =>
      ballotTokens.has(token),
    );

  const allInFullName =
    queryTokens.length > 0 &&
    queryTokens.every((token) =>
      fullTokens.has(token),
    );

  if (
    queryTokens.length >= 2 &&
    (allInBallot || allInFullName)
  ) {
    return 80;
  }

  if (
    queryTokens.length === 1 &&
    (
      ballotTokens.has(queryTokens[0]) ||
      fullTokens.has(queryTokens[0])
    )
  ) {
    return 70;
  }

  return 0;
}

async function loadCandidates() {
  if (candidateCache) {
    return candidateCache;
  }

  const filePath = path.join(
    process.cwd(),
    "data",
    "eleicoes",
    "gerado",
    "candidaturas-2026.json",
  );

  const raw = await readFile(filePath, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(
      "A base de candidaturas não possui o formato esperado.",
    );
  }

  candidateCache = parsed as CandidateRow[];

  return candidateCache;
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const parsedRequest = requestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json(
        {
          error:
            "Os dados confirmados não são suficientes para localizar o candidato.",
        },
        { status: 400 },
      );
    }

    const {
      nome,
      cargo,
      partido,
      estado,
      municipio,
    } = parsedRequest.data;

    const candidates = await loadCandidates();

    const normalizedCargo = normalizeCargo(cargo);
    const normalizedParty = partido
      ? normalizeText(partido)
      : null;
    const normalizedUf = normalizeUf(estado);

    const matches = candidates
      .map((candidate) => ({
        candidate,
        score: nameScore(nome, candidate),
      }))
      .filter(({ candidate, score }) => {
        if (score <= 0) {
          return false;
        }

        if (
          normalizedCargo &&
          normalizeCargo(candidate.cargo) !==
            normalizedCargo
        ) {
          return false;
        }

        if (normalizedParty) {
          const fullParty =
            normalizeText(candidate.partido);

          const partyAcronym =
            normalizeText(candidate.siglaPartido);

          if (
            normalizedParty !== fullParty &&
            normalizedParty !== partyAcronym
          ) {
            return false;
          }
        }

        if (
          normalizedUf &&
          normalizeUf(candidate.uf) !== normalizedUf
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const results = matches.map(
      ({ candidate, score }) => ({
        ...candidate,
        score,
        dossieDisponivel: false,
      }),
    );

    const status =
      results.length === 0
        ? "none"
        : results.length === 1
          ? "one"
          : "multiple";

    return NextResponse.json({
      status,
      total: results.length,
      results,
      municipioInformado: municipio ?? null,
      observacao:
        municipio
          ? "O município informado foi preservado, mas a base geral das Eleições 2026 não possui campo de município para comparação."
          : null,
    });
  } catch (error) {
    console.error(
      "Falha ao localizar candidato:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Não foi possível consultar a base eleitoral neste momento.",
      },
      { status: 500 },
    );
  }
}