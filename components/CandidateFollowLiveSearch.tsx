"use client";

import { useEffect, useState } from "react";
import { CandidatePhoto } from "@/components/CandidatePhoto";

type Politico = {
  id: string;
  nomeUrna: string;
  cargoLabel: string;
  uf: string;
  siglaPartido: string;
  numero: number;
};

type RespostaBusca = {
  resultados: Politico[];
  total: number;
  totalPaginas: number;
};

type Props = {
  selectedIds: readonly string[];
  busy?: boolean;
  onSelect: (politico: Politico) => void;
  onDeselect: (politico: Politico) => void;
};

/**
 * Pesquisa ao digitar, específica do aplicativo Políticos.
 * Conserva a API e as regras de elegibilidade da seleção já existente.
 */
export function CandidateFollowLiveSearch({
  selectedIds,
  busy = false,
  onSelect,
  onDeselect,
}: Props) {
  const [nome, setNome] = useState("");
  const [resultados, setResultados] = useState<Politico[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);

  const termo = nome.trim();
  const podeBuscar = termo.length >= 2;

  useEffect(() => {
    if (!podeBuscar) {
      setResultados([]);
      setTotal(0);
      setTotalPaginas(0);
      setCarregando(false);
      setErro("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setCarregando(true);
      setErro("");

      try {
        const parametros = new URLSearchParams({
          q: termo,
          pagina: String(pagina),
          escopo: "acompanhamento",
        });
        const resposta = await fetch(
          `/api/candidatos/buscar?${parametros.toString()}`,
          { signal: controller.signal, cache: "no-store" },
        );
        if (!resposta.ok) throw Error("Busca temporariamente indisponível.");

        const dados = (await resposta.json()) as RespostaBusca;
        if (
          !Array.isArray(dados.resultados) ||
          !Number.isFinite(dados.total) ||
          !Number.isFinite(dados.totalPaginas)
        ) {
          throw Error("Resposta de busca inválida.");
        }
        if (controller.signal.aborted) return;

        setResultados(atuais => {
          if (pagina === 1) return dados.resultados;
          const ids = new Set(atuais.map(item => item.id));
          return [
            ...atuais,
            ...dados.resultados.filter(item => !ids.has(item.id)),
          ];
        });
        setTotal(dados.total);
        setTotalPaginas(dados.totalPaginas);
      } catch {
        if (!controller.signal.aborted) {
          setErro("Não foi possível pesquisar. Tente novamente.");
          setResultados([]);
          setTotal(0);
        }
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [termo, pagina, tentativa, podeBuscar]);

  function digitar(valor: string) {
    setNome(valor);
    setResultados([]);
    setPagina(1);
    setTotal(0);
    setTotalPaginas(0);
    setErro("");
    setCarregando(valor.trim().length >= 2);
  }

  return (
    <div className="mt-5">
      <label htmlFor="busca-politico-ao-digitar" className="sr-only">
        Nome do político
      </label>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-black/60"
        >
          ⌕
        </span>
        <input
          id="busca-politico-ao-digitar"
          type="search"
          value={nome}
          onChange={evento => digitar(evento.target.value)}
          placeholder="Digite um nome"
          autoComplete="off"
          aria-controls="resultados-politicos-ao-digitar"
          className="min-h-14 w-full rounded-2xl border border-black/20 bg-white py-3 pl-12 pr-4 text-base text-black caret-black outline-none placeholder:text-black/40 focus:border-[#FFC400] focus:ring-2 focus:ring-[#FFC400]"
        />
      </div>

      <div
        id="resultados-politicos-ao-digitar"
        className="mt-5"
        aria-live="polite"
        aria-busy={carregando}
      >
        {!podeBuscar && (
          <p className="text-sm leading-6 text-slate-300">
            Digite pelo menos duas letras para ver os políticos.
          </p>
        )}

        {podeBuscar && carregando && (
          <p role="status" className="text-sm text-slate-300">
            Procurando políticos...
          </p>
        )}

        {podeBuscar && erro && !carregando && (
          <div className="rounded-xl border border-[#FFC400] p-4">
            <p role="alert" className="text-sm text-white">{erro}</p>
            <button
              type="button"
              className="mt-3 text-sm font-semibold text-[#FFC400] underline"
              onClick={() => setTentativa(atual => atual + 1)}
            >
              Tentar novamente
            </button>
          </div>
        )}

        {podeBuscar && !carregando && !erro && total === 0 && (
          <p className="rounded-xl border border-[#344760] p-4 text-sm text-slate-300">
            Nenhum político encontrado. Tente outra parte do nome.
          </p>
        )}

        {podeBuscar && !erro && resultados.length > 0 && (
          <>
            <p className="mb-3 text-sm text-slate-300">
              {total} {total === 1 ? "político encontrado" : "políticos encontrados"}
            </p>
            <div className="space-y-3" aria-label="Resultados da pesquisa">
              {resultados.map(politico => {
                const selecionado = selectedIds.includes(politico.id);
                return (
                  <div
                    key={politico.id}
                    className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#344760] bg-white p-3 text-black shadow-sm"
                  >
                    <CandidatePhoto id={politico.id} name={politico.nomeUrna} />
                    <div className="min-w-[100px] flex-[1_1_125px]">
                      <p className="text-[15px] font-bold leading-5 text-slate-950">
                        {politico.nomeUrna}
                      </p>
                      <p className="mt-2 text-sm leading-5 text-slate-600">
                        {politico.cargoLabel} · {politico.uf}
                        <span className="block">
                          {politico.siglaPartido} · Nº {politico.numero}
                        </span>
                      </p>
                    </div>
                    {selecionado ? (
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span className="inline-flex min-h-10 items-center rounded-xl bg-green-600 px-3 py-2 text-xs font-bold text-white" aria-label={`Você está acompanhando ${politico.nomeUrna}`}>
                          ✓ Acompanhando
                        </span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onDeselect(politico)}
                          className="min-h-9 rounded-lg px-1 py-2 text-right text-xs font-semibold text-slate-600 underline underline-offset-2 disabled:opacity-50"
                        >
                          Deixar de acompanhar
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onSelect(politico)}
                        className="min-h-11 shrink-0 rounded-xl bg-[#FFC400] px-3 py-3 text-xs font-bold text-black disabled:opacity-50"
                      >
                        Acompanhar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {pagina < totalPaginas && (
              <button
                type="button"
                disabled={carregando}
                onClick={() => {
                  setCarregando(true);
                  setPagina(atual => atual + 1);
                }}
                className="mt-4 min-h-12 w-full rounded-xl border border-[#4c677e] bg-[#152d45] px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                Mostrar mais resultados
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
