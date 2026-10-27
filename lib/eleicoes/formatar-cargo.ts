export type GeneroGramatical = "masculino" | "feminino";

export function formatarCargo(cargo: string, genero?: GeneroGramatical) {
  const normalizado = cargo
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");

  const cargos: Record<string, string> = {
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

  if (genero === "feminino") {
    const femininos: Record<string, string> = {
      presidente: "Presidenta da República",
      "vice-presidente": "Vice-Presidenta da República",
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
    if (femininos[normalizado]) return femininos[normalizado];
  }

  if (cargos[normalizado]) {
    return cargos[normalizado];
  }

  return normalizado
    .split("-")
    .filter(Boolean)
    .map(
      (parte) =>
        parte.charAt(0).toUpperCase() +
        parte.slice(1),
    )
    .join(" ");
}