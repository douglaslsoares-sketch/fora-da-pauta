"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { criarMensagemDeCompartilhamento } from "./shareMessage";

type PaginaSalva = {
  url: string;
  titulo: string;
  salvaEm: string;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<
    | {
        outcome?: string;
      }
    | void
  >;
};

const STORAGE_KEY =
  "fora-da-pauta:ler-depois:v1";

const STORAGE_EVENT =
  "fora-da-pauta:ler-depois-alterado";

const INSTALL_HINT_KEY =
  "fora-da-pauta:mostrar-instalacao";

const INSTALL_EVENT =
  "fora-da-pauta:mostrar-instalacao";

function lerPaginasSalvas(): PaginaSalva[] {
  try {
    const bruto =
      window.localStorage.getItem(STORAGE_KEY);

    if (!bruto) {
      return [];
    }

    const paginas =
      JSON.parse(bruto) as PaginaSalva[];

    if (!Array.isArray(paginas)) {
      return [];
    }

    return paginas.filter(
      (pagina) =>
        pagina &&
        typeof pagina.url === "string" &&
        typeof pagina.titulo === "string" &&
        typeof pagina.salvaEm === "string",
    );
  } catch {
    return [];
  }
}

export default function LerDepoisFlutuante() {
  const pathname = usePathname();
  const router = useRouter();

  const [
    painelAberto,
    setPainelAberto,
  ] = useState(false);

  const [
    mensagem,
    setMensagem,
  ] = useState("");

  const [
    compartilhamentoAberto,
    setCompartilhamentoAberto,
  ] = useState(false);

  const [
    statementCompartilhamento,
    setStatementCompartilhamento,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    quantidade,
    setQuantidade,
  ] = useState(0);

  const [
    installPrompt,
    setInstallPrompt,
  ] =
    useState<InstallPromptEvent | null>(
      null,
    );

  const [
    instalado,
    setInstalado,
  ] = useState(false);

  useEffect(() => {
    const atualizarQuantidade = () => {
      setQuantidade(
        lerPaginasSalvas().length,
      );
    };

    atualizarQuantidade();

    window.addEventListener(
      "storage",
      atualizarQuantidade,
    );

    window.addEventListener(
      STORAGE_EVENT,
      atualizarQuantidade,
    );

    return () => {
      window.removeEventListener(
        "storage",
        atualizarQuantidade,
      );

      window.removeEventListener(
        STORAGE_EVENT,
        atualizarQuantidade,
      );
    };
  }, []);

  useEffect(() => {
    const navigatorComStandalone =
      navigator as Navigator & {
        standalone?: boolean;
      };

    const estaInstalado =
      window.matchMedia(
        "(display-mode: standalone)",
      ).matches ||
      navigatorComStandalone.standalone ===
        true;

    setInstalado(estaInstalado);

    const prepararInstalacao = (
      event: Event,
    ) => {
      event.preventDefault();

      setInstallPrompt(
        event as InstallPromptEvent,
      );
    };

    const confirmarInstalacao = () => {
      setInstallPrompt(null);
      setInstalado(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      prepararInstalacao,
    );

    window.addEventListener(
      "appinstalled",
      confirmarInstalacao,
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        prepararInstalacao,
      );

      window.removeEventListener(
        "appinstalled",
        confirmarInstalacao,
      );
    };
  }, []);

  function salvarPaginaAtual() {
    if (pathname === "/ler-depois") {
      setMensagem(
        "Esta é a sua lista de páginas guardadas.",
      );

      return;
    }

    try {
      const paginas =
        lerPaginasSalvas();

      const url =
        window.location.href.split("#")[0];

      const titulo =
        document.title
          .replace(
            " | Fora da Pauta",
            "",
          )
          .trim() ||
        "Fora da Pauta";

      const paginaAtual: PaginaSalva = {
        url,
        titulo,
        salvaEm:
          new Date().toISOString(),
      };

      const semDuplicata =
        paginas.filter(
          (pagina) =>
            pagina.url !== url,
        );

      const atualizadas = [
        paginaAtual,
        ...semDuplicata,
      ];

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(atualizadas),
      );

      window.dispatchEvent(
        new Event(STORAGE_EVENT),
      );

      setMensagem(
        "Página guardada neste celular.",
      );
    } catch {
      setMensagem(
        "Não foi possível guardar esta página.",
      );
    }
  }

  function abrirPainel() {
    salvarPaginaAtual();
    setCompartilhamentoAberto(false);
    setCopied(false);
    setPainelAberto(true);
  }

  function obterStatementDaPagina() {
    const elemento =
      document.querySelector<HTMLElement>(
        "[data-share-statement]",
      );

    const statement =
      elemento?.dataset.shareStatement?.trim();

    if (statement) {
      return statement;
    }

    return (
      document.title
        .replace(
          " | Fora da Pauta",
          "",
        )
        .trim() ||
      "Fora da Pauta"
    );
  }

  function abrirCompartilhamento() {
    setStatementCompartilhamento(
      obterStatementDaPagina(),
    );

    setCopied(false);
    setCompartilhamentoAberto(true);
  }

  async function copiarMensagem() {
    const statement =
      statementCompartilhamento ||
      obterStatementDaPagina();

    const message =
      criarMensagemDeCompartilhamento(
        statement,
        window.location.href,
      );

    try {
      await navigator.clipboard.writeText(
        message,
      );

      setCopied(true);

      window.setTimeout(
        () => setCopied(false),
        2000,
      );
    } catch {
      setMensagem(
        "Não foi possível copiar a mensagem.",
      );
    }
  }

  async function adicionarATelaInicial() {
    /*
     * A instalação precisa acontecer a partir da própria
     * página /ler-depois, que possui manifesto e identidade
     * instalável exclusivos.
     *
     * Em outra página do Fora da Pauta, primeiro fazemos
     * uma navegação completa para /ler-depois.
     */
    if (pathname !== "/ler-depois") {
      try {
        window.sessionStorage.setItem(
          INSTALL_HINT_KEY,
          "1",
        );
      } catch {
        // Continua normalmente.
      }

      setPainelAberto(false);

      window.location.assign(
        "/ler-depois?instalar=1",
      );

      return;
    }

    if (instalado) {
      setMensagem(
        "O Ler depois já está instalado neste aparelho.",
      );

      return;
    }

    /*
     * Chrome/Edge:
     * se o navegador disponibilizou o prompt da PWA
     * exclusiva do Ler depois, usamos esse prompt.
     */
    if (installPrompt) {
      try {
        await installPrompt.prompt();

        setInstallPrompt(null);

        return;
      } catch {
        setInstallPrompt(null);
      }
    }

    /*
     * Safari/iOS e navegadores sem beforeinstallprompt:
     * mostra as instruções manuais já existentes.
     */
    try {
      window.sessionStorage.setItem(
        INSTALL_HINT_KEY,
        "1",
      );
    } catch {
      // Continua normalmente.
    }

    window.dispatchEvent(
      new Event(INSTALL_EVENT),
    );

    setPainelAberto(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirPainel}
        aria-label="Guardar para ler depois"
        className="fixed right-4 z-50 inline-flex items-center gap-2 rounded-full bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-black/20 sm:hidden"
        style={{
          bottom:
            "calc(env(safe-area-inset-bottom) + 1rem)",
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path
            d="M7 4.75A1.75 1.75 0 0 1 8.75 3h6.5A1.75 1.75 0 0 1 17 4.75V21l-5-3.25L7 21V4.75Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <span>Ler depois</span>

        {quantidade > 0 && (
          <span className="flex min-w-5 items-center justify-center rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-black">
            {quantidade}
          </span>
        )}
      </button>

      {painelAberto && (
        <div className="fixed inset-0 z-[70] sm:hidden">
          <button
            type="button"
            aria-label="Fechar"
            onClick={() =>
              setPainelAberto(false)
            }
            className="absolute inset-0 bg-black/25"
          />

          <section
            role="dialog"
            aria-modal="true"
            aria-label="Ler depois"
            className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#eeeee9] p-5 shadow-2xl"
            style={{
              paddingBottom:
                "calc(env(safe-area-inset-bottom) + 1rem)",
            }}
          >
            <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-black/15" />

            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
              Fora da Pauta
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">
              Ler depois
            </h2>

            <p
              aria-live="polite"
              className="mt-2 text-sm leading-6 text-black/55"
            >
              {mensagem}
            </p>

            <div className="mt-5 grid gap-2">
              {pathname !==
                "/ler-depois" && (
                <button
                  type="button"
                  onClick={() => {
                    setPainelAberto(
                      false,
                    );

                    router.push(
                      "/ler-depois",
                    );
                  }}
                  className="rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white"
                >
                  Ver minha lista
                </button>
              )}

              <button
                type="button"
                onClick={abrirCompartilhamento}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
              >
                Compartilhar esta página
              </button>

              {compartilhamentoAberto && (
                <div className="rounded-2xl border border-black/8 bg-white p-5">
                  <p className="text-[17px] leading-8 text-black/65">
                    {statementCompartilhamento}
                  </p>

                  <p className="mt-3 text-sm leading-6 text-black/45">
                    O link desta página será incluído automaticamente na mensagem.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={copiarMensagem}
                      className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
                    >
                      {copied
                        ? "Mensagem copiada ✓"
                        : "Copiar mensagem"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCompartilhamentoAberto(
                          false,
                        );

                        setCopied(false);
                      }}
                      className="px-3 py-3 text-sm font-medium text-black/50"
                    >
                      Fechar compartilhamento
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={
                  adicionarATelaInicial
                }
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
              >
                {instalado
                  ? "Ler depois instalado"
                  : "Adicionar à tela inicial"}
              </button>

              <button
                type="button"
                onClick={() =>
                  setPainelAberto(false)
                }
                className="px-4 py-2 text-sm font-medium text-black/50"
              >
                Fechar
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
