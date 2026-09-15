import { readFile } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
  const caminho = path.join(
    process.cwd(),
    "docs",
    "linha-editorial.md",
  );

  const markdown = await readFile(
    caminho,
    "utf8",
  );

  return new Response(markdown, {
    headers: {
      "Content-Type":
        "text/markdown; charset=utf-8",
      "Cache-Control":
        "no-store, max-age=0",
    },
  });
}
