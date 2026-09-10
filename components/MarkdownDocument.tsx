import type { ReactNode } from "react";

function inlineMarkdown(text: string): ReactNode[] {
  return text
    .split(/(\*\*.*?\*\*)/g)
    .filter(Boolean)
    .map((parte, indice) => {
      if (parte.startsWith("**") && parte.endsWith("**")) {
        return (
          <strong key={indice} className="font-semibold text-black">
            {parte.slice(2, -2)}
          </strong>
        );
      }

      return parte;
    });
}

export function MarkdownDocument({ markdown }: { markdown: string }) {
  const linhas = markdown.replace(/\r\n/g, "\n").split("\n");
  const elementos: ReactNode[] = [];

  let i = 0;

  while (i < linhas.length) {
    const linha = linhas[i].trim();

    if (!linha) {
      i++;
      continue;
    }

    if (linha === "---") {
      elementos.push(
        <hr key={`hr-${i}`} className="my-10 border-0 border-t border-black/15" />
      );
      i++;
      continue;
    }

    if (linha.startsWith("# ")) {
      elementos.push(
        <h1
          key={`h1-${i}`}
          className="text-4xl font-semibold leading-[1.05] tracking-[-0.05em] sm:text-6xl"
        >
          {linha.slice(2)}
        </h1>
      );
      i++;
      continue;
    }

    if (linha.startsWith("## ")) {
      elementos.push(
        <h2
          key={`h2-${i}`}
          className="mt-12 text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl"
        >
          {linha.slice(3)}
        </h2>
      );
      i++;
      continue;
    }

    if (linha.startsWith(">")) {
      const partes: string[] = [];

      while (i < linhas.length && linhas[i].trim().startsWith(">")) {
        partes.push(linhas[i].trim().replace(/^>\s?/, ""));
        i++;
      }

      elementos.push(
        <blockquote
          key={`quote-${i}`}
          className="my-7 border-l-4 border-black pl-5 text-xl font-medium leading-8 text-black sm:text-2xl"
        >
          {inlineMarkdown(partes.join(" "))}
        </blockquote>
      );

      continue;
    }

    if (linha.startsWith("- ")) {
      const itens: string[] = [];

      while (i < linhas.length && linhas[i].trim().startsWith("- ")) {
        itens.push(linhas[i].trim().slice(2));
        i++;
      }

      elementos.push(
        <ul
          key={`ul-${i}`}
          className="my-6 list-disc space-y-2 pl-6 text-base leading-7 text-black/70"
        >
          {itens.map((item, indice) => (
            <li key={indice}>{inlineMarkdown(item)}</li>
          ))}
        </ul>
      );

      continue;
    }

    const paragrafo: string[] = [];

    while (i < linhas.length) {
      const atual = linhas[i].trim();

      if (
        !atual ||
        atual === "---" ||
        atual.startsWith("# ") ||
        atual.startsWith("## ") ||
        atual.startsWith(">") ||
        atual.startsWith("- ")
      ) {
        break;
      }

      paragrafo.push(atual);
      i++;
    }

    elementos.push(
      <p
        key={`p-${i}`}
        className="mt-5 text-base leading-8 text-black/70 sm:text-lg"
      >
        {inlineMarkdown(paragrafo.join(" "))}
      </p>
    );
  }

  return <div>{elementos}</div>;
}
