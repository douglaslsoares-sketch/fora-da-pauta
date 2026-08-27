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

  useEffect(() => {
    setPaginas(
      lerPaginasSalvas(),
    );

    const mostrar = () => {
      setMostrarInstalacao(true);

      try {
        window.sessionStorage.removeItem(
          INSTALL_HINT_KEY,
        );
      } catch {
        // Nada a fazer.
      }
    };

    try {
      const parametros =
        new URLSearchParams(
          window.location.search,
        );

      const pediuInstalacao =
        parametros.get("instalar") === "1";

      const veioDaSessao =
        window.sessionStorage.getItem(
          INSTALL_HINT_KEY,
        ) === "1";

      if (
        pediuInstalacao ||
        veioDaSessao
      ) {
        mostrar();
      }
    } catch {
      // Nada a fazer.
    }

    window.addEventListener(
      INSTALL_EVENT,
      mostrar,
    );

    return () => {
      window.removeEventListener(
        INSTALL_EVENT,
        mostrar,
      );
    };
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
            Tela inicial
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
            Criar o ícone Ler depois
          </h2>

          <p className="mt-3 text-sm leading-6 text-black/60">
            Abra o menu de compartilhamento do navegador e escolha{" "}
            <strong>
              Adicionar à Tela de Início
            </strong>
            . Se o navegador mostrar{" "}
            <strong>
              Instalar app
            </strong>
            , essa opção também pode ser usada.
          </p>

          <p className="mt-3 text-xs leading-5 text-black/45">
            O atalho abrirá diretamente esta lista do Fora da Pauta.
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
