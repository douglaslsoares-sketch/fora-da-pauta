import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Candidatura } from "./tipos";

const arquivoCandidaturas = join(
  process.cwd(),
  "data",
  "eleicoes",
  "gerado",
  "candidaturas-2026.json",
);

export const candidaturas =
  JSON.parse(
    readFileSync(
      arquivoCandidaturas,
      "utf8",
    ),
  ) as Candidatura[];