/** Cargos e resultados em linguagem natural, sem inferir gênero pelo nome. */
export type GeneroGramatical = "masculino" | "feminino";

const cargosMasculinos: Record<string, string> = {
  presidente: "Presidente da República",
  "vice-presidente": "Vice-Presidente da República",
  governador: "Governador",
  "vice-governador": "Vice-Governador",
  senador: "Senador",
  "1-suplente": "1º Suplente",
  "2-suplente": "2º Suplente",
  "deputado-federal": "Deputado Federal",
  "deputado-estadual": "Deputado Estadual",
  "deputado-distrital": "Deputado Distrital",
  prefeito: "Prefeito",
  "vice-prefeito": "Vice-Prefeito",
  vereador: "Vereador",
};

const cargosFemininos: Record<string, string> = {
  ...cargosMasculinos,
  governador: "Governadora",
  "vice-governador": "Vice-Governadora",
  senador: "Senadora",
  "1-suplente": "1ª Suplente",
  "2-suplente": "2ª Suplente",
  "deputado-federal": "Deputada Federal",
  "deputado-estadual": "Deputada Estadual",
  "deputado-distrital": "Deputada Distrital",
  prefeito: "Prefeita",
  "vice-prefeito": "Vice-Prefeita",
  vereador: "Vereadora",
};

export function formatarCargo(cargo: string, genero?: GeneroGramatical | null) {
  const normalizado = cargo.trim().toLowerCase().replace(/_/g, "-");
  const cargos = genero === "feminino" ? cargosFemininos : cargosMasculinos;

  if (cargos[normalizado]) return cargos[normalizado];

  return normalizado
    .split("-")
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

/**
 * Aplica concordância a um rótulo legível. O texto bruto do TSE é preservado
 * no campo original para permitir conferência com a fonte.
 */
export function formatarSituacaoEleitoral(
  situacao: string,
  genero?: GeneroGramatical | null,
) {
  const texto = situacao.trim().replace(/\s+/g, " ");
  if (genero !== "feminino") return texto;

  const termos: Record<string, string> = {
    reeleito: "reeleita",
    eleito: "eleita",
    indeferido: "indeferida",
    deferido: "deferida",
    substituido: "substituída",
    "substituído": "substituída",
    cancelado: "cancelada",
    falecido: "falecida",
  };

  return texto.replace(
    /reeleito|eleito|indeferido|deferido|substitu[ií]do|cancelado|falecido/giu,
    (original) => {
      const feminino = termos[original.toLocaleLowerCase("pt-BR")];
      if (!feminino) return original;
      if (original === original.toLocaleUpperCase("pt-BR")) {
        return feminino.toLocaleUpperCase("pt-BR");
      }
      if (original[0] === original[0].toLocaleUpperCase("pt-BR")) {
        return feminino[0].toLocaleUpperCase("pt-BR") + feminino.slice(1);
      }
      return feminino;
    },
  );
}
