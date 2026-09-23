import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/conheca-seu-candidato/*": [
      "./data/eleicoes/gerado/atuacao-candidatos/**/*.json",
    ],
    "/conheca-seu-candidato/*/*": [
      "./data/eleicoes/gerado/atuacao-candidatos/**/*.json",
    ],
  },
};

export default nextConfig;
