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