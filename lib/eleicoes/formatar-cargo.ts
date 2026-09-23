export function formatarCargo(cargo: string) {
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