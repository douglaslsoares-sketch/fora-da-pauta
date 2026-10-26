export type PlanoNovidades = {
  inicializacao: boolean;
  novosIds: string[];
  idsConhecidos: string[];
};

function validarIds(ids: readonly string[]): string[] {
  for (const id of ids) {
    if (typeof id !== "string" || !id || id !== id.trim()) {
      throw new Error("Identificador de evento inválido.");
    }
  }

  return [...new Set(ids)];
}

export function planejarNovidades(
  idsAtuais: readonly string[],
  idsConhecidos: readonly string[] | null,
): PlanoNovidades {
  const atuais = validarIds(idsAtuais);

  if (idsConhecidos === null) {
    return {
      inicializacao: true,
      novosIds: [],
      idsConhecidos: atuais,
    };
  }

  const conhecidos = new Set(validarIds(idsConhecidos));
  const novosIds = atuais.filter((id) => !conhecidos.has(id));

  return {
    inicializacao: false,
    novosIds,
    idsConhecidos: [...conhecidos, ...novosIds],
  };
}
export function prepararHistoricoPorGrupo(
  idsAtuais: readonly string[],
  idsConhecidos: readonly string[],
  prefixos: readonly string[],
) {
  const atuais = validarIds(idsAtuais);
  const conhecidos = new Set(validarIds(idsConhecidos));
  const idsRegistrar: string[] = [];

  for (const prefixo of prefixos) {
    if (!prefixo || prefixo !== prefixo.trim()) {
      throw new Error("Prefixo de histórico inválido.");
    }

    const marcador = `controle:historico:v1:${prefixo}`;
    const grupo = atuais.filter((id) => id.startsWith(prefixo));

    // Uma fonte sem registros ainda não teve sua primeira carga.
    if (grupo.length === 0 || conhecidos.has(marcador)) continue;

    for (const id of [...grupo, marcador]) {
      if (!conhecidos.has(id)) {
        conhecidos.add(id);
        idsRegistrar.push(id);
      }
    }
  }

  return {
    idsConhecidos: [...conhecidos],
    idsRegistrar,
  };
}
/**
 * Não confundir "fato recém-descoberto no CSV" com "fato recente".
 * Somente atos oficiais ocorridos nos últimos 14 dias, sem data
 * futura e com data completa válida, podem gerar aviso automático.
 * Os demais seguem na ficha e no histórico, mas não viram alertas.
 */
export function atoOficialRecente(
  ocorridoEm: string | undefined,
  agora: Date = new Date(),
): boolean {
  if (!ocorridoEm || !/^\d{4}-\d{2}-\d{2}$/.test(ocorridoEm)) {
    return false;
  }
  const instante = Date.parse(`${ocorridoEm}T00:00:00.000Z`);
  if (!Number.isFinite(instante) ||
      new Date(instante).toISOString().slice(0, 10) !== ocorridoEm) {
    return false;
  }

  const hojeUtc = Date.UTC(
    agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate(),
  );
  const idadeDias = Math.round((hojeUtc - instante) / 86_400_000);
  return idadeDias >= 0 && idadeDias <= 14;
}
