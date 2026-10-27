"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, useRef } from "react";
import { CandidateSelector } from "@/components/CandidateSelector";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import Link from "next/link";
import { HomeShareInvite } from "@/components/HomeShareInvite";
import {
  interpretarSelecao,
  lerSelecaoSerializada,
  observarSelecao,
  salvarSelecao,
  selecaoNoServidor,
  type PessoaSelecionada,
} from "@/lib/selecaoAcompanhamento";

type Etapa = "busca" | "selecionados" | "telegram";

function TelegramIcon({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M21.7 3.4 18.5 19c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6 12.8 1.2 11.3C.2 11 .2 10.3 1.4 9.8L20.2 2.6c.9-.3 1.7.2 1.5.8Z"
      />
    </svg>
  );
}

function ActivityIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19V10" />
      <path d="M9 19V5" />
      <path d="M14 19v-7" />
      <path d="M19 19V8" />
      <path d="M3 19h18" />
    </svg>
  );
}

function PeopleIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3.5 19c.5-3.5 2.5-5.5 5.5-5.5s5 2 5.5 5.5" />
      <path d="M14.5 14.5c2.8-.4 5 1.2 5.7 4.5" />
    </svg>
  );
}
export function VotouFiqueDeOlhoExperience() {
  const bruto = useSyncExternalStore(
    observarSelecao,
    lerSelecaoSerializada,
    selecaoNoServidor,
  );

  const selecionadas = useMemo(
    () => interpretarSelecao(bruto),
    [bruto],
  );

  const [inscricaoAtiva, setInscricaoAtiva] = useState(false);
  const [conferindoInscricao, setConferindoInscricao] = useState(true);
  const [idsConfirmados, setIdsConfirmados] = useState<string[]>([]);
  const [retornoTelegram, setRetornoTelegram] = useState(false);
  const [inscricaoGeral, setInscricaoGeral] = useState(false);
  const [novasEdicoesAtivas, setNovasEdicoesAtivas] = useState(false);

  useEffect(() => {
    if (selecionadas.length === 0 || conferindoInscricao || inscricaoAtiva) return;

    const controller = new AbortController();

    async function validarSelecaoSalva() {
      try {
        const response = await fetch(
          "/api/candidatos/eleitos/validar",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ids: selecionadas.map(
                (pessoa) => pessoa.id,
              ),
            }),
            signal: controller.signal,
          },
        );

        if (!response.ok) return;

        const data = (await response.json()) as {
          pessoas?: Omit<
            PessoaSelecionada,
            "eleicao"
          >[];
        };

        if (!Array.isArray(data.pessoas)) return;

        const validadas: PessoaSelecionada[] =
          data.pessoas.map((pessoa) => ({
            id: pessoa.id,
            eleicao: 2026,
            numero: pessoa.numero,
            nomeUrna: pessoa.nomeUrna,
            nomeCompleto: pessoa.nomeCompleto,
            cargo: pessoa.cargo,
            cargoLabel: pessoa.cargoLabel,
            uf: pessoa.uf,
            siglaPartido: pessoa.siglaPartido,
          }));

        if (
          JSON.stringify(selecionadas) !==
          JSON.stringify(validadas)
        ) {
          salvarSelecao(validadas);
        }
      } catch {
        if (controller.signal.aborted) return;
      }
    }

    void validarSelecaoSalva();

    return () => {
      controller.abort();
    };
  }, [selecionadas, conferindoInscricao, inscricaoAtiva]);

  const [etapa, setEtapa] = useState<Etapa>("busca");
  const [mostrarMinhasEscolhas, setMostrarMinhasEscolhas] = useState(false);
  const [busca, setBusca] = useState(0);
  const [aviso, setAviso] = useState("");
  const [avisoStorage, setAvisoStorage] = useState("");
  const [ativandoTelegram, setAtivandoTelegram] = useState(false);
  const [erroTelegram, setErroTelegram] = useState("");
  const [salvandoEscolhas, setSalvandoEscolhas] = useState(false);
  const [escolhasSalvas, setEscolhasSalvas] = useState(false);
  const edicoesLocaisPendentes = useRef(false);


  // O retorno do bot não basta para comprovar inscrição: consulte o servidor.
  useEffect(() => {
    const peloLink = new URLSearchParams(window.location.search).get("retorno") === "telegram";
    let peloNavegador = false;
    let somenteNovidades = false;
    try {
      peloNavegador = window.sessionStorage.getItem("fdp:telegram-retorno-votou") === "1";
      somenteNovidades = window.sessionStorage.getItem("fdp:telegram-inscricao-geral") === "1";
      if (peloNavegador) window.sessionStorage.removeItem("fdp:telegram-retorno-votou");
      if (peloLink || peloNavegador) window.sessionStorage.removeItem("fdp:telegram-inscricao-geral");
    } catch {
      // O navegador pode bloquear armazenamento; o link continua disponível.
    }
    if (peloLink || peloNavegador) {
      if (somenteNovidades || interpretarSelecao(lerSelecaoSerializada()).length === 0) {
        setInscricaoGeral(true);
      }
      setRetornoTelegram(true);
      setEtapa("telegram");
    }
  }, []);

  useEffect(() => {
    let montado = true;
    async function conferir() {
      try {
        const resposta = await fetch("/api/telegram/sessao", { cache: "no-store" });
        const dados = await resposta.json() as {
          ativo?: boolean;
          novasEdicoes?: boolean;
          ids?: string[];
          pessoas?: (PessoaSelecionada & { eleitoConfirmado?: boolean })[];
        };
        if (!montado) return;
        setInscricaoAtiva(dados.ativo === true);
        setNovasEdicoesAtivas(dados.ativo === true && dados.novasEdicoes === true);
        setIdsConfirmados(
          dados.ativo && Array.isArray(dados.ids)
            ? dados.ids.filter((id): id is string => typeof id === "string" && /^[0-9]{8,20}$/.test(id))
            : [],
        );
        if (dados.ativo && Array.isArray(dados.pessoas) &&
            !edicoesLocaisPendentes.current && (!inscricaoGeral || retornoTelegram)) {
          const pessoas = dados.pessoas.map(({ eleitoConfirmado, ...pessoa }) => pessoa);
          // Ao retornar pelo bot em outro navegador, recupera as escolhas
          // do servidor em vez de apresentar apenas a inscrição geral.
          if (retornoTelegram && inscricaoGeral && pessoas.length > 0) {
            setInscricaoGeral(false);
          }

          const atuais = interpretarSelecao(lerSelecaoSerializada());
          if (JSON.stringify(atuais) !== JSON.stringify(pessoas)) {
            salvarSelecao(pessoas);
          }
        }
      } catch {
        if (montado) {
          setInscricaoAtiva(false);
          setNovasEdicoesAtivas(false);
          setIdsConfirmados([]);
        }
      } finally {
        if (montado) setConferindoInscricao(false);
      }
    }
    void conferir();
    window.addEventListener("focus", conferir);
    return () => { montado = false; window.removeEventListener("focus", conferir); };
  }, [inscricaoGeral, retornoTelegram]);

  async function salvarAcompanhamentos() {
    if (selecionadas.length === 0 || salvandoEscolhas) return;
    setSalvandoEscolhas(true);
    setErroTelegram("");
    try {
      const resposta = await fetch("/api/telegram/sessao", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selecionadas.map(p => p.id) }),
      });
      if (!resposta.ok) throw Error("Falha ao registrar escolhas");
      edicoesLocaisPendentes.current = false;
      setIdsConfirmados((atuais) => [...new Set([...atuais, ...selecionadas.map((p) => p.id)])]);
      setEscolhasSalvas(true);
      setEtapa("telegram");
    } catch {
      setErroTelegram("Não foi possível salvar suas escolhas. Tente novamente.");
    } finally {
      setSalvandoEscolhas(false);
    }
  }

  const etapaAtual =
    selecionadas.length === 0 && etapa !== "busca" && !inscricaoGeral
      ? "busca"
      : etapa;

  const ultimaSelecionada =
    selecionadas.length > 0
      ? selecionadas[selecionadas.length - 1]
      : null;

  function gravar(pessoas: PessoaSelecionada[]) {
    const persistiu = salvarSelecao(pessoas);

    setAvisoStorage(
      persistiu
        ? ""
        : "Este navegador não permitiu salvar as escolhas. Elas serão mantidas apenas durante esta sessão.",
    );
  }

  async function ativarTelegram() {
    if (ativandoTelegram || (selecionadas.length === 0 && !inscricaoGeral)) return;
    setAtivandoTelegram(true);
    setErroTelegram("");
    try {
      const resposta = await fetch("/api/telegram/sessao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: inscricaoGeral ? [] : selecionadas.map(p => p.id) }),
      });
      const dados = await resposta.json() as { url?: string };
      if (!resposta.ok || typeof dados.url !== "string") throw Error("Falha");
      const url = new URL(dados.url);
      if (url.origin !== "https://t.me" ||
          url.pathname !== "/ForaDaPautaAcompanhaBot" ||
          !/^\?start=s_[A-Za-z0-9_-]{32}$/.test(url.search)) throw Error("Link incorreto");
      try {
        window.sessionStorage.setItem("fdp:telegram-retorno-votou", "1");
        if (inscricaoGeral) window.sessionStorage.setItem("fdp:telegram-inscricao-geral", "1");
        else window.sessionStorage.removeItem("fdp:telegram-inscricao-geral");
      } catch {
        // Retorno manual continua possível.
      }
      window.location.assign(url.toString());
    } catch {
      setErroTelegram("Não foi possível abrir o Telegram. Tente novamente.");
      setAtivandoTelegram(false);
    }
  }

  function selecionar(
    pessoa: Omit<PessoaSelecionada, "eleicao">,
  ) {
    const atuais = interpretarSelecao(
      lerSelecaoSerializada(),
    );

    if (atuais.some((item) => item.id === pessoa.id)) {
      return;
    }

    edicoesLocaisPendentes.current = true;
    setInscricaoGeral(false);
    setEscolhasSalvas(false);
    gravar([
      ...atuais,
      {
        ...pessoa,
        eleicao: 2026,
      },
    ]);

    setAviso(
      `${pessoa.nomeUrna} foi adicionado à sua lista.`,
    );

    setBusca((atual) => atual + 1);
    setEtapa("selecionados");
  }

  async function remover(pessoa: PessoaSelecionada) {
    setErroTelegram("");
    if (inscricaoAtiva) {
      try {
        const resposta = await fetch("/api/telegram/sessao", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: pessoa.id }),
        });
        if (!resposta.ok) throw Error("Falha ao cancelar acompanhamento");
      } catch {
        setErroTelegram("Não foi possível interromper o acompanhamento no Telegram. Tente novamente.");
        return;
      }
    }

    const novaLista = interpretarSelecao(
      lerSelecaoSerializada(),
    ).filter((item) => item.id !== pessoa.id);

    edicoesLocaisPendentes.current = true;
    setEscolhasSalvas(false);
    gravar(novaLista);

    if (novaLista.length === 0) {
      setEtapa("busca");
    }
  }

  function ListaSelecionadas({
    permitirRemocao = true,
  }: {
    permitirRemocao?: boolean;
  }) {
    return (
      <div className="mt-4 space-y-2">
        {selecionadas.map((pessoa) => (
          <div
            key={pessoa.id}
            className="flex items-center gap-3 rounded-2xl bg-black/[0.045] p-3"
          >
            <CandidatePhoto
              id={pessoa.id}
              name={pessoa.nomeUrna}
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-5">
                {pessoa.nomeUrna}
              </p>


              <p className="mt-1 text-sm leading-5 text-black/60">
                {pessoa.cargoLabel} · {pessoa.uf}
                <br />
                {pessoa.siglaPartido} · Nº {pessoa.numero}
              </p>
            </div>

            <Link
              href={`/conheca-seu-candidato/${pessoa.id}`}
              className="shrink-0 rounded-xl border border-black/20 bg-white px-3 py-2 text-center text-xs font-bold text-black hover:border-black/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFC400]"
              aria-label={`Ver ficha de ${pessoa.nomeUrna}`}
            >
              Ver ficha
            </Link>

            {permitirRemocao ? (
              <button
                type="button"
                onClick={() => void remover(pessoa)}
                aria-label={`Remover ${pessoa.nomeUrna}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-2xl text-black/45 hover:bg-black/5"
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
      </div>
    );
  }

  const escolhasConfirmadas =
    selecionadas.length > 0 &&
    selecionadas.every((pessoa) => idsConfirmados.includes(pessoa.id));
  const inscricaoConfirmada =
    inscricaoAtiva &&
    (inscricaoGeral
      ? novasEdicoesAtivas
      : (escolhasSalvas || escolhasConfirmadas));

  if (etapaAtual === "telegram" && inscricaoConfirmada) {
    return (
      <section className="mx-auto max-w-[760px] px-6 pb-14 pt-8">
        <h2 className="text-3xl font-bold">Pronto! Você está inscrito no Fora da Pauta.</h2>
        <p className="mt-4 leading-7">
          {inscricaoGeral
            ? "Você receberá pelo Telegram avisos sobre novas edições e publicações do Fora da Pauta."
            : "Você receberá pelo Telegram informações sobre a atuação das pessoas que escolheu, quando houver novas atualizações."}
        </p>
        {inscricaoGeral ? null : (
          <>
            <p className="mt-5 font-semibold">Você escolheu acompanhar:</p>
            <ListaSelecionadas permitirRemocao={false} />
          </>
        )}
        <section aria-labelledby="convite-titulo" className="mt-8 rounded-2xl bg-black p-6 text-white">
          <HomeShareInvite />
        </section>
        <button type="button" onClick={() => {
          setInscricaoGeral(false);
          setEtapa("busca");
          setEscolhasSalvas(false);
        }}
          className="mt-6 min-h-12 w-full rounded-2xl bg-black px-5 text-white">
          {inscricaoGeral ? "Escolher representantes para acompanhar" : "Acompanhar mais alguém"}
        </button>
      </section>
    );
  }

  if (retornoTelegram && !conferindoInscricao && !inscricaoAtiva) {
    return (
      <section className="mx-auto max-w-[760px] px-6 pb-14 pt-8">
        <h2 className="text-2xl font-bold">Vamos conferir sua inscrição</h2>
        <p className="mt-4 leading-7">
          Ainda não conseguimos vincular este navegador à sua inscrição no Telegram.
          Seus acompanhamentos continuam preservados no bot. Você pode fazer a confirmação
          pelo Telegram para reconhecer este navegador, sem criar outra inscrição.
        </p>
        <button type="button" onClick={() => window.location.reload()}
          className="mt-5 min-h-12 rounded-xl bg-black px-5 py-3 font-semibold text-white">
          Conferir novamente
        </button>
      </section>
    );
  }

  if (etapaAtual === "telegram") {
    return (
      <section className="mx-auto max-w-[760px] px-6 pb-14 pt-6">
        <div className="text-center">
          <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#e8f6ff] text-[#229ED9]">
            <TelegramIcon className="h-14 w-14" />
            <span className="absolute -left-4 top-8 h-1 w-7 rotate-6 rounded-full bg-[#FFC400]" />
            <span className="absolute -right-4 top-4 h-1 w-6 -rotate-[25deg] rounded-full bg-[#FFC400]" />
            <span className="absolute -right-6 top-12 h-1 w-7 rotate-6 rounded-full bg-[#FFC400]" />
          </div>

          <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.045em]">
            {inscricaoAtiva ? "Confirme suas escolhas." : "Conecte o Fora da Pauta ao Telegram."}
          </h2>
        </div>

        {inscricaoGeral ? (
          <p className="mt-8 leading-7">
            Você vai receber avisos sobre novas edições e publicações do Fora da Pauta.
            Não é necessário escolher nenhum representante.
          </p>
        ) : (
          <>
            <p className="mt-8 font-semibold">Você escolheu acompanhar:</p>
            <ListaSelecionadas permitirRemocao={false} />
          </>
        )}

        <section aria-labelledby="porque-telegram" className="mt-7 rounded-2xl border border-black/15 bg-white p-5 sm:p-6">
          <h3 id="porque-telegram" className="text-2xl font-bold leading-tight tracking-[-0.035em]">
            A informação chega até você.
          </h3>
          <p className="mt-4 text-base leading-7 text-black/75">
            Entre o trabalho, a casa e os compromissos do dia a dia, nem sempre
            sobra tempo para acompanhar o que acontece na política.
          </p>
          <p className="mt-3 text-base leading-7 text-black/75">
            Por isso, o Fora da Pauta leva a informação até você, pelo Telegram.
          </p>
          <p className="mt-3 text-base leading-7 text-black/75">
            {inscricaoGeral
              ? "Quando houver novas edições e publicações do Fora da Pauta, você recebe um aviso pelo Telegram."
              : "Quando houver novidades verificadas sobre as pessoas que você escolher acompanhar, você recebe um aviso, com a fonte da informação."}
          </p>
          <p className="mt-4 text-base font-semibold leading-7">
            Assim, você fica sabendo do que acontece sem precisar parar o seu dia para procurar.
          </p>
        </section>

        {conferindoInscricao ? (
          <p role="status" className="mt-5">Conferindo sua inscrição no Telegram...</p>
        ) : inscricaoAtiva && !inscricaoGeral ? (
          <div className="mt-6">
            <p>Seu Telegram já está ativado. Basta salvar suas escolhas.</p>
            <button type="button" onClick={() => void salvarAcompanhamentos()}
              disabled={salvandoEscolhas}
              className="mt-4 min-h-16 w-full rounded-2xl bg-[#229ED9] px-5 font-semibold text-white">
              {salvandoEscolhas ? "Salvando..." : "Salvar escolhidos no Telegram"}
            </button>
          </div>
        ) : (
        <>
        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#FFC400] bg-[#fffaf0] p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFC400]/30">
            <TelegramIcon className="h-5 w-5" />
          </div>

          <p className="text-sm leading-6">
            {inscricaoGeral
              ? "Abra o Telegram para vincular este navegador. Se você já está inscrito, suas escolhas serão preservadas."
              : "Conecte este navegador ao Telegram. Se você já está inscrito, seus acompanhamentos serão preservados."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void ativarTelegram()}
          disabled={
            ativandoTelegram ||
            (selecionadas.length === 0 && !inscricaoGeral)
          }
          className="mt-4 flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#229ED9] px-5 text-base font-semibold text-white disabled:cursor-wait disabled:opacity-70"
        >
          <TelegramIcon className="h-7 w-7" />
          <span>
            {ativandoTelegram
              ? "Abrindo Telegram..."
              : (
                <>
                  Ativar notificações
                  <br />
                  no Telegram
                </>
              )}
          </span>
        </button>

        </>
        )}
        {erroTelegram ? (
          <p className="mt-3 text-center text-sm font-medium text-red-700">
            {erroTelegram}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => {
            setBusca((atual) => atual + 1);
            setInscricaoGeral(false);
            setEtapa(inscricaoGeral ? "busca" : "selecionados");
          }}
          className="mt-3 min-h-13 w-full rounded-2xl bg-black/[0.07] px-5 py-3 font-semibold"
        >
          {inscricaoGeral ? "Escolher representantes para acompanhar" : "Acompanhar mais alguém"}
        </button>

        {avisoStorage ? (
          <p role="alert" className="mt-5 text-sm text-black/60">
            {avisoStorage}
          </p>
        ) : null}
      </section>
    );
  }

  if (etapaAtual === "selecionados") {
    return (
      <section className="mx-auto max-w-[760px] px-6 pb-14 pt-7">
        {ultimaSelecionada ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 font-semibold text-emerald-950">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-sm text-white">
                ✓
              </span>
              Você selecionou:
            </p>

            <div className="mt-4 flex items-center gap-3">
              <CandidatePhoto
                id={ultimaSelecionada.id}
                name={ultimaSelecionada.nomeUrna}
              />

              <div>
                <p className="font-semibold">
                  {ultimaSelecionada.nomeUrna}
                </p>
                <p className="mt-1 text-sm leading-5 text-black/65">
                  {ultimaSelecionada.cargoLabel} ·{" "}
                  {ultimaSelecionada.uf}
                  <br />
                  {ultimaSelecionada.siglaPartido} · Nº{" "}
                  {ultimaSelecionada.numero}
                </p>
              </div>
            </div>
            <Link
              href={`/conheca-seu-candidato/${ultimaSelecionada.id}`}
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-black/20 bg-white px-4 py-2 text-xs font-bold text-black"
            >
              Ver ficha
            </Link>
          </div>
        ) : null}

        <h2 className="mt-7 text-3xl font-bold leading-tight tracking-[-0.04em]">
          Quer acompanhar mais alguém?
        </h2>

        <p className="mt-2 text-base leading-6 text-black/65">
          Procure outra pessoa pelo nome ou pelo número de candidatura.
        </p>

        <CandidateSelector
          key={`mais-${busca}`}
          mode="follow"
          selectedIds={selecionadas.map((item) => item.id)}
          onSelect={selecionar}
        />

        <div className="mt-7 border-t border-black/10 pt-6">
          <h3 className="text-xl font-bold">
            Sua lista atual ({selecionadas.length})
          </h3>

          <ListaSelecionadas />
        </div>
        {erroTelegram ? <p role="alert" className="mt-3 text-sm text-red-700">{erroTelegram}</p> : null}

        <button
          type="button"
          onClick={() => { setEtapa("telegram"); setEscolhasSalvas(false); }}
          className="mt-7 flex min-h-14 w-full items-center justify-center gap-4 rounded-2xl bg-black px-5 font-semibold text-white"
        >
          <span>Continuar</span>
          <span aria-hidden="true" className="text-2xl">
            ›
          </span>
        </button>

        {avisoStorage ? (
          <p role="alert" className="mt-5 text-sm text-black/60">
            {avisoStorage}
          </p>
        ) : null}

        <p role="status" className="sr-only">
          {aviso}
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="bg-black text-white">
        <div className="mx-auto max-w-[760px] px-6 pb-8 pt-8">
          <h1 className="text-[clamp(3rem,13vw,6.5rem)] font-bold leading-[0.93] tracking-[-0.06em]">
            <span className="block text-[#FFC400]">Fique de Olho</span>
          </h1>

          <p className="mt-6 max-w-xl text-xl leading-7 text-white/90">
            Acompanhe a atuação de quem participa da política, tenha sido eleito ou não.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
            Entenda como as decisões são tomadas: o que faz a Presidência,
            o que decide o Congresso e qual é o papel do Judiciário.
            Escolha quem você quer acompanhar e receba as informações pelo Telegram.
          </p>
        </div>
      </section>

      <section className="votou-search-stage mx-auto max-w-[760px] px-6 pb-12 pt-7">
        {!conferindoInscricao && inscricaoAtiva ? (
          selecionadas.length > 0 ? (
            <div className="votou-intro-only mb-7">
              <p className="mb-3 text-center text-sm text-black/75">
                {selecionadas.length === 1
                  ? "Você acompanha 1 pessoa."
                  : `Você acompanha ${selecionadas.length} pessoas.`}
              </p>
              <button
                type="button"
                onClick={() => setMostrarMinhasEscolhas((anterior) => !anterior)}
                aria-expanded={mostrarMinhasEscolhas}
                aria-controls="minhas-escolhas-inline"
                className="min-h-12 w-full rounded-2xl bg-black/[0.07] px-5 py-3 text-sm font-semibold"
              >
                {mostrarMinhasEscolhas ? "Ocultar minhas escolhas" : "Ver minhas escolhas"}
              </button>
              {mostrarMinhasEscolhas ? (
                <div id="minhas-escolhas-inline" className="mt-3">
                  <ListaSelecionadas />
                </div>
              ) : null}
            </div>
          ) : (
            <p className="votou-intro-only mb-7 rounded-2xl bg-black/[0.05] px-5 py-4 text-center text-sm text-black/75">
              Você ainda não acompanha nenhuma pessoa.
            </p>
          )
        ) : null}

        <h2 className="text-3xl font-bold leading-tight tracking-[-0.04em]">
          {!conferindoInscricao && inscricaoAtiva && selecionadas.length > 0
            ? "Quem mais você quer acompanhar?"
            : "Quem você quer acompanhar?"}
        </h2>

        <CandidateSelector
          key={`busca-${busca}`}
          mode="follow"
          selectedIds={selecionadas.map((item) => item.id)}
          onSelect={selecionar}
        />

        {!conferindoInscricao && !novasEdicoesAtivas ? (
        <div className="mt-7 rounded-2xl border border-black/15 p-5">
          <p className="font-semibold">Receba as novidades do Fora da Pauta</p>
          <p className="mt-2 text-sm leading-6 text-black/65">
            Você pode receber avisos de novas edições e publicações pelo Telegram,
            mesmo sem escolher representantes. Se já acompanha alguém, suas escolhas
            continuam ativas e não serão canceladas.
          </p>
          <button
            type="button"
            onClick={() => {
              setInscricaoGeral(true);
              setEscolhasSalvas(false);
              setEtapa("telegram");
            }}
            className="mt-4 min-h-14 w-full rounded-2xl bg-black px-5 py-3 font-semibold text-white"
          >
            Receber as novidades do Fora da Pauta
          </button>
        </div>
        ) : null}

        <p role="status" className="sr-only">
          {aviso}
        </p>
      </section>
    </>
  );
}
