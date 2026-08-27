export * from "./tipos";
export * from "./pautas";
export * from "./candidaturas";
export * from "./reeleicao";

export { posicionamentos as posicionamentosManuais } from "./posicionamentos";
export { posicionamentosGerados } from "./posicionamentos-pec221-gerados";

import { posicionamentos as posicionamentosManuais } from "./posicionamentos";
import { posicionamentosGerados } from "./posicionamentos-pec221-gerados";

export const posicionamentos = [
  ...posicionamentosManuais,
  ...posicionamentosGerados,
];
