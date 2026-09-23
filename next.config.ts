import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  outputFileTracingIncludes: {
    "/api/candidatos/*": [
      "./data/eleicoes/gerado/candidaturas-2026.json",
    ],

    "/campanhas/*/candidatos": [
      "./data/eleicoes/gerado/candidaturas-2026.json",
    ],

    "/conheca-seu-candidato/*": [
      "./data/eleicoes/gerado/candidaturas-2026.json",
      "./data/eleicoes/gerado/identidades-politicas.json",
      "./data/eleicoes/gerado/atuacao-candidatos/**/*.json",
    ],

    "/conheca-seu-candidato/*/*": [
      "./data/eleicoes/gerado/candidaturas-2026.json",
      "./data/eleicoes/gerado/atuacao-candidatos/**/*.json",
    ],

    "/eleicoes-2026": [
      "./data/eleicoes/gerado/candidaturas-2026.json",
    ],

    "/eleicoes-2026/candidatos/*": [
      "./data/eleicoes/gerado/candidaturas-2026.json",
    ],
  },
};

export default nextConfig;