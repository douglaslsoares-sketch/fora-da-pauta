// Identificadores de candidaturas TSE, não números eleitorais nem identidades consolidadas.
// TODO antes da publicação: validar resultado oficial e restringir a seleção aos eleitos.
export type PessoaSelecionada = {
  id: string;
  eleicao: 2026;
  nomeUrna: string;
  nomeCompleto: string;
  numero: number;
  cargo: string;
  cargoLabel: string;
  uf: string;
  siglaPartido: string;
};

export const SELECAO_STORAGE_KEY = "fora-da-pauta:acompanhamento:v1";
const SELECAO_EVENT = "fora-da-pauta:acompanhamento-alterado";
let selecaoEmMemoria: string | undefined;

export function lerSelecaoSerializada(): string | null {
  if (typeof window === "undefined") return null;
  if (selecaoEmMemoria !== undefined) return selecaoEmMemoria;
  try {
    return window.localStorage.getItem(SELECAO_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function interpretarSelecao(bruto: string | null): PessoaSelecionada[] {
  if (!bruto) return [];
  try {
    const dados: unknown = JSON.parse(bruto);
    if (!dados || typeof dados !== "object") return [];
    const registro = dados as Record<string, unknown>;
    if (registro.versao !== 1 || !Array.isArray(registro.pessoas)) return [];
    const ids = new Set<string>();
    const pessoas: PessoaSelecionada[] = [];
    for (const item of registro.pessoas) {
      if (!item || typeof item !== "object") continue;
      const pessoa = item as Record<string, unknown>;
      if (
        typeof pessoa.id !== "string" || !/^\d+$/.test(pessoa.id) ||
        pessoa.eleicao !== 2026 || !Number.isSafeInteger(pessoa.numero) ||
        typeof pessoa.numero !== "number" || pessoa.numero < 0 ||
        !["nomeUrna", "nomeCompleto", "cargo", "cargoLabel", "uf", "siglaPartido"].every(
          (campo) => typeof pessoa[campo] === "string" && (pessoa[campo] as string).trim().length > 0,
        ) || ids.has(pessoa.id)
      ) continue;
      ids.add(pessoa.id);
      pessoas.push({
        id: pessoa.id, eleicao: 2026, numero: pessoa.numero,
        nomeUrna: pessoa.nomeUrna as string, nomeCompleto: pessoa.nomeCompleto as string,
        cargo: pessoa.cargo as string, cargoLabel: pessoa.cargoLabel as string,
        uf: pessoa.uf as string, siglaPartido: pessoa.siglaPartido as string,
      });
    }
    return pessoas;
  } catch {
    return [];
  }
}

export function salvarSelecao(pessoas: PessoaSelecionada[]): boolean {
  const serializado = JSON.stringify({ versao: 1, pessoas });
  let persistiu = true;
  try {
    window.localStorage.setItem(SELECAO_STORAGE_KEY, serializado);
    selecaoEmMemoria = undefined;
  } catch {
    selecaoEmMemoria = serializado;
    persistiu = false;
  }
  window.dispatchEvent(new Event(SELECAO_EVENT));
  return persistiu;
}

export function observarSelecao(notificar: () => void): () => void {
  function aoMudarStorage(event: StorageEvent) {
    if (event.key === SELECAO_STORAGE_KEY || event.key === null) notificar();
  }
  window.addEventListener(SELECAO_EVENT, notificar);
  window.addEventListener("storage", aoMudarStorage);
  return () => {
    window.removeEventListener(SELECAO_EVENT, notificar);
    window.removeEventListener("storage", aoMudarStorage);
  };
}

export function selecaoNoServidor(): null {
  return null;
}
