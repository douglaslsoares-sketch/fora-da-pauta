import postgres from "postgres";

// Produção mantém a conexão existente. Nas prévias, nunca permita que a
// ausência do banco de testes provoque uma conexão acidental à produção.
const isPreview = process.env.VERCEL_ENV === "preview";
const connectionString = isPreview
  ? process.env.FDP_TESTES_DATABASE_URL
  : process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(isPreview
    ? "Banco de testes não configurado para a prévia (FDP_TESTES_DATABASE_URL)."
    : "DATABASE_URL não configurada. Defina a conexão PostgreSQL existente do Fora da Pauta.");
}

if (isPreview && process.env.DATABASE_URL &&
    normalizeConnectionIdentity(connectionString) === normalizeConnectionIdentity(process.env.DATABASE_URL)) {
  throw new Error("O banco de prévia não pode compartilhar a conexão da produção.");
}

function normalizeConnectionIdentity(value: string) {
  const url = new URL(value);
  url.searchParams.delete("schema");
  return url.toString();
}

// Em prévias, alterações administrativas só são permitidas na ramificação
// de revisão e quando o banco isolado possui host diferente do oficial.
// Sem essas garantias, o painel permanece somente para consulta.
export function administrativeDatabaseWritesAllowed() {
  if (process.env.VERCEL_ENV !== "preview") return true;
  if (process.env.VERCEL_GIT_COMMIT_REF !== "revisao-admin-20261113") return false;
  const testUrl = process.env.FDP_TESTES_DATABASE_URL;
  const productionUrl = process.env.DATABASE_URL;
  if (!testUrl || !productionUrl) return false;
  try {
    const test = new URL(testUrl);
    const production = new URL(productionUrl);
    return ["postgres:", "postgresql:"].includes(test.protocol)
      && test.hostname !== production.hostname;
  } catch {
    return false;
  }
}

function normalizeDatabaseUrl(value: string) {
  const url = new URL(value);

  // DATABASE_URL já existia no projeto com ?schema=public,
  // formato compatível com Prisma.
  // O pacote `postgres` não aceita `schema` como parâmetro
  // de conexão, então removemos apenas esse parâmetro.
  url.searchParams.delete("schema");

  return url.toString();
}

export const sql = postgres(normalizeDatabaseUrl(connectionString), {
  max: 10,
});
