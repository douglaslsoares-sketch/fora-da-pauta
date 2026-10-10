import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { CargoEleitoral } from "./tipos";

export type Eleito2026 = {
  id: string;
  eleicao: number;
  nomeUrna: string;
  nomeCompleto: string;
  numero: number;
  cargo: CargoEleitoral;
  uf: string;
  partido: string;
  siglaPartido: string;
  codigoResultadoTse: string;
  resultadoTse: string;
  geradoEmTse: string;
  fonteOficial: string;
};

const arquivoEleitos = join(
  process.cwd(),
  "data",
  "eleicoes",
  "gerado",
  "eleitos-2026.json",
);

export const eleitos2026 =
  JSON.parse(
    readFileSync(
      arquivoEleitos,
      "utf8",
    ),
  ) as Eleito2026[];
