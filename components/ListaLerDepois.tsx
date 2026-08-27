"use client";

import {
  useEffect,
  useState,
} from "react";

type PaginaSalva = {
  url: string;
  titulo: string;
  salvaEm: string;
};

const STORAGE_KEY =
  "fora-da-pauta:ler-depois:v1";

const STORAGE_EVENT =
  "fora-da-pauta:ler-depois-alterado";

function lerPaginasSalvas(): PaginaSalva[] {
  try {
    const bruto =
      window.localStorage.getItem(STORAGE_KEY);

    if (!bruto) {
      return [];
    }

    const paginas =
      JSON.parse(bruto) as PaginaSalva[];

    return Array.isArray(paginas)
      ? paginas
      : [];
  } catch {
    return [];
  }
}

function gravarPaginas(
  paginas: PaginaSalva[],
) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(paginas),
  );

  window.dispatchEvent(
    new Event(STORAGE_EVENT),
  );
}

function formatarData(valor: string) {
  const data = new Date(valor);

  if (
    Number.isNaN(data.getTime())
  ) {
    return "";
  }

  return data.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  );
}

function caminhoDaPagina(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return url;
  }
}

export default function ListaLerDepois() {
  const [
    paginas,
    setPaginas,
  ] = useState<PaginaSalva[]>([]);

  const [
    mostrarInstalacao,
    setMostrarInstalacao,
  ] = useState(false);

  const [
    tipoInstalacao,
    setTipoInstalacao,
  ] = useState<
    "ios" | "mac-safari" | "android" | "generico"
  >("generico");

  useEffect(() => {
    setPaginas(
      lerPaginasSalvas(),
    );

    const parametros =
      new URLSearchParams(
        window.location.search,
      );

    if (
      parametros.get("instalar") !== "1"
    ) {
      return;
    }

    const userAgent =
      navigator.userAgent;

    const plataforma =
      navigator.platform ?? "";

    const ehIOS =
      /iPad|iPhone|iPod/i.test(
        userAgent,
      ) ||
      (
        plataforma === "MacIntel" &&
        navigator.maxTouchPoints > 1
      );

    const ehAndroid =
      /Android/i.test(userAgent);

    const ehSafari =
      /Safari/i.test(userAgent) &&
      !/Chrome|CriOS|Edg|OPR|Firefox|FxiOS/i.test(
        userAgent,
      );

    const ehMac =
      /Mac/i.test(plataforma);

    if (ehIOS) {
      setTipoInstalacao("ios");
    } else if (
      ehMac &&
      ehSafari
    ) {
      setTipoInstalacao(
        "mac-safari",
      );
    } else if (ehAndroid) {
      setTipoInstalacao(
        "android",
      );
    } else {
      setTipoInstalacao(
        "generico",
      );
    }

    setMostrarInstalacao(true);
  }, []);
  function removerPagina(url: string) {
    const atualizadas =
      paginas.filter(
        (pagina) =>
          pagina.url !== url,
      );

    gravarPaginas(atualizadas);
    setPaginas(atualizadas);
  }

  function limparLista() {
    gravarPaginas([]);
    setPaginas([]);
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 pb-28 sm:px-6 sm:py-12">
      <a
        href="/"
        className="text-xs font-semibold uppercase tracking-[0.18em] text-black/40"
      >
        Fora da Pauta
      </a>

      <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em]">
        Ler depois
      </h1>

      <p className="mt-4 max-w-xl text-sm leading-6 text-black/55">
        As páginas marcadas ficam guardadas neste navegador e neste aparelho.
      </p>

      {mostrarInstalacao && (
        <section className="mt-6 rounded-[24px] border border-black/10 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/40">
            Instalar Ler depois
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
            Adicionar à tela inicial
          </h2>

          {tipoInstalacao === "ios" && (
            <p className="mt-3 text-sm leading-6 text-black/60">
              Toque em{" "}
              <strong>Compartilhar</strong>
              {" "}e depois em{" "}
              <strong>
                Adicionar à Tela de Início
              </strong>
              .
            </p>
          )}

          {tipoInstalacao === "mac-safari" && (
            <p className="mt-3 text-sm leading-6 text-black/60">
              No Safari, abra{" "}
              <strong>Arquivo</strong>
              {" "}e escolha{" "}
              <strong>
                Adicionar ao Dock
              </strong>
              .
            </p>
          )}

          {tipoInstalacao === "android" && (
            <p className="mt-3 text-sm leading-6 text-black/60">
              Abra o menu do navegador e escolha{" "}
              <strong>
                Instalar app
              </strong>
              {" "}ou{" "}
              <strong>
                Adicionar à tela inicial
              </strong>
              .
            </p>
          )}

          {tipoInstalacao === "generico" && (
            <p className="mt-3 text-sm leading-6 text-black/60">
              Abra o menu do navegador e procure por{" "}
              <strong>
                Instalar
              </strong>
              {" "}ou{" "}
              <strong>
                Adicionar à tela inicial
              </strong>
              .
            </p>
          )}

          <p className="mt-3 text-xs leading-5 text-black/45">
            Depois de instalado, o ícone
            Ler depois abrirá diretamente esta lista.
          </p>

          <button
            type="button"
            onClick={() =>
              setMostrarInstalacao(false)
            }
            className="mt-4 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
          >
            Entendi
          </button>
        </section>
      )}
      <section className="mt-7">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-semibold">
            {paginas.length === 0
              ? "Nenhuma página guardada"
              : paginas.length === 1
                ? "1 página guardada"
                : `${paginas.length} páginas guardadas`}
          </p>

          {paginas.length > 0 && (
            <button
              type="button"
              onClick={limparLista}
              className="text-xs font-semibold text-black/40 underline underline-offset-4"
            >
              Limpar lista
            </button>
          )}
        </div>

        {paginas.length === 0 ? (
          <div className="mt-4 rounded-[26px] bg-white p-6">
            <p className="text-sm leading-6 text-black/55">
              Ao encontrar algo que queira guardar, toque no botão{" "}
              <strong>
                Ler depois
              </strong>{" "}
              no canto inferior da tela.
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {paginas.map(
              (pagina) => (
                <article
                  key={pagina.url}
                  className="rounded-[26px] bg-white p-5"
                >
                  <p className="text-xs font-medium text-black/35">
                    {formatarData(
                      pagina.salvaEm,
                    )}
                  </p>

                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                    {pagina.titulo}
                  </h2>

                  <p className="mt-2 truncate text-xs text-black/40">
                    {caminhoDaPagina(
                      pagina.url,
                    )}
                  </p>

                  <div className="mt-5 flex items-center gap-3">
                    <a
                      href={pagina.url}
                      className="rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
                    >
                      Abrir
                    </a>

                    <button
                      type="button"
                      onClick={() =>
                        removerPagina(
                          pagina.url,
                        )
                      }
                      className="rounded-full border border-black/10 px-4 py-2 text-xs font-semibold text-black/55"
                    >
                      Remover
                    </button>
                  </div>
                </article>
              ),
            )}
          </div>
        )}
      </section>
    </main>
  );
}
