"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const HOME = "/#opcoes";
function destinoSeguro(path: string) {
  if (path === "/qr-code-fora-da-pauta") return "/ha-mais-para-entender";
  if (path === "/edicoes") return HOME;
  if (path.startsWith("/campanhas/")) return "/edicoes";
  return HOME;
}

/** Retorna à origem interna; em artigos prioriza a lista, nunca um site externo. */
export function BotaoFecharRodape() {
  const pathname = usePathname();
  const router = useRouter();
  const [origem, setOrigem] = useState<string | null>(null);

  useEffect(() => {
    try {
      const registrada = sessionStorage.getItem("fdp-navegacao-origem");
      const atual = sessionStorage.getItem("fdp-navegacao-atual");
      if (atual === pathname && registrada?.startsWith("/") && !registrada.startsWith("//")) {
        setOrigem(registrada);
      } else {
        setOrigem(null);
      }
    } catch { setOrigem(null); }
  }, [pathname]);

  function fechar() {
    const padrao = destinoSeguro(pathname);
    // A lista de artigos sempre fecha para o menu; artigo sempre fecha para a lista.
    if (pathname === "/edicoes" || pathname.startsWith("/campanhas/")) {
      router.push(padrao);
      return;
    }
    if (pathname === "/qr-code-fora-da-pauta") { router.push("/ha-mais-para-entender"); return; }
    if (origem && origem !== pathname && !origem.startsWith("/api/")) {
      router.push(origem === "/" ? HOME : origem);
      return;
    }
    router.push(padrao);
  }

  return <div className="mt-10 flex justify-center pb-8">
    <button type="button" onClick={fechar}
      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-lg bg-[#c62828] px-8 py-3 text-lg font-bold text-white hover:bg-[#a71d1d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
      <span aria-hidden="true">✕</span> Fechar
    </button>
  </div>;
}
