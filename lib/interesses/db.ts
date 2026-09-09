import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL não configurada. Defina a conexão PostgreSQL existente do Fora da Pauta."
  );
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
