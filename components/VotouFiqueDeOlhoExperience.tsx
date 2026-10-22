"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, useRef } from "react";
import { CandidateSelector } from "@/components/CandidateSelector";
import { CandidatePhoto } from "@/components/CandidatePhoto";
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
  const [busca, setBusca] = useState(0);
  const [aviso, setAviso] = useState("");
  const [avisoStorage, setAvisoStorage] = useState("");
  const [ativandoTelegram, setAtivandoTelegram] = useState(false);
  const [erroTelegram, setErroTelegram] = useState("");
  const [salvandoEscolhas, setSalvandoEscolhas] = useState(false);
  const [escolhasSalvas, setEscolhasSalvas] = useState(false);
  const edicoesLocaisPendentes = useRef(false);
  const [eleitosConfirmados, setEleitosConfirmados] = useState<string[]>([]);

  // O retorno do bot não basta para comprovar inscrição: consulte o servidor.
  useEffect(() => {
    const peloLink = new URLSearchParams(window.location.search).get("retorno") === "telegram";
    let peloNavegador = false;
    try {
      peloNavegador = window.sessionStorage.getItem("fdp:telegram-retorno-votou") === "1";
      if (peloNavegador) window.sessionStorage.removeItem("fdp:telegram-retorno-votou");
    } catch {
      // O navegador pode bloquear armazenamento; o link continua disponível.
    }
    if (peloLink || peloNavegador) {
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
          ids?: string[];
          pessoas?: (PessoaSelecionada & { eleitoConfirmado?: boolean })[];
        };
        if (!montado) return;
        setInscricaoAtiva(dados.ativo === true);
        setIdsConfirmados(
          dados.ativo && Array.isArray(dados.ids)
            ? dados.ids.filter((id): id is string => typeof id === "string" && /^[0-9]{8,20}$/.test(id))
            : [],
        );
        if (dados.ativo && Array.isArray(dados.pessoas) && !edicoesLocaisPendentes.current) {
          const pessoas = dados.pessoas.map(({ eleitoConfirmado, ...pessoa }) => pessoa);
          setEleitosConfirmados(dados.pessoas.filter(p => p.eleitoConfirmado).map(p => p.id));
          const atuais = interpretarSelecao(lerSelecaoSerializada());
          if (JSON.stringify(atuais) !== JSON.stringify(pessoas)) {
            salvarSelecao(pessoas);
          }
        }
      } catch {
        if (montado) {
          setInscricaoAtiva(false);
          setIdsConfirmados([]);
        }
      } finally {
        if (montado) setConferindoInscricao(false);
      }
    }
    void conferir();
    window.addEventListener("focus", conferir);
    return () => { montado = false; window.removeEventListener("focus", conferir); };
  }, []);

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
    selecionadas.length === 0 && etapa !== "busca"
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
    if (ativandoTelegram || selecionadas.length === 0) return;
    setAtivandoTelegram(true);
    setErroTelegram("");
    try {
      const resposta = await fetch("/api/telegram/sessao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selecionadas.map(p => p.id) }),
      });
      const dados = await resposta.json() as { url?: string };
      if (!resposta.ok || typeof dados.url !== "string") throw Error("Falha");
      const url = new URL(dados.url);
      if (url.origin !== "https://t.me" ||
          url.pathname !== "/ForaDaPautaAcompanhaBot" ||
          !/^\?start=s_[A-Za-z0-9_-]{32}$/.test(url.search)) throw Error("Link incorreto");
      try {
        window.sessionStorage.setItem("fdp:telegram-retorno-votou", "1");
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

              {inscricaoAtiva && !eleitosConfirmados.includes(pessoa.id) ? (
                <p className="mt-1 text-xs text-amber-700">Eleição não confirmada na base atual</p>
              ) : null}
              <p className="mt-1 text-sm leading-5 text-black/60">
                {pessoa.cargoLabel} · {pessoa.uf}
                <br />
                {pessoa.siglaPartido} · Nº {pessoa.numero}
              </p>
            </div>

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

  if (etapaAtual === "telegram" && inscricaoAtiva && (escolhasSalvas || escolhasConfirmadas)) {
    return (
      <section className="mx-auto max-w-[760px] px-6 pb-14 pt-8">
        <h2 className="text-3xl font-bold">Pronto! Você está inscrito.</h2>
        <p className="mt-4 leading-7">
          A partir de agora, você receberá pelo Telegram as informações sobre a atuação dos
          representantes que escolheu, quando houver novas atualizações.
        </p>
        <p className="mt-5 font-semibold">Você escolheu acompanhar:</p>
        <ListaSelecionadas permitirRemocao={false} />
        <section aria-labelledby="convite-titulo" className="mt-8 rounded-2xl bg-black p-6 text-white">
          <HomeShareInvite />
        </section>
        <button type="button" onClick={() => { setEtapa("selecionados"); setEscolhasSalvas(false); }}
          className="mt-6 min-h-12 w-full rounded-2xl bg-black px-5 text-white">
          Acompanhar mais alguém
        </button>
      </section>
    );
  }

  if (retornoTelegram && !conferindoInscricao && !inscricaoAtiva) {
    return (
      <section className="mx-auto max-w-[760px] px-6 pb-14 pt-8">
        <h2 className="text-2xl font-bold">Vamos conferir sua inscrição</h2>
        <p className="mt-4 leading-7">
          Não conseguimos reconhecer sua inscrição neste navegador. Se você já confirmou no
          bot, abra o Fique de Olho no mesmo navegador em que fez suas escolhas.
          Seus acompanhamentos não foram cancelados.
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

          <h2 className="mt-5 font-bold leading-[1.02] tracking-[-0.045em]">
            <span className="block text-4xl">
              Pronto.
            </span>
            <span className="mt-1 block whitespace-nowrap text-[clamp(1.75rem,8.4vw,2.25rem)]">
              Agora fique de olho.
            </span>
          </h2>
        </div>

        <p className="mt-8 font-semibold">
          Você escolheu acompanhar:
        </p>

        <ListaSelecionadas permitirRemocao={false} />

        {conferindoInscricao ? (
          <p role="status">Conferindo sua inscrição no Telegram...</p>
        ) : inscricaoAtiva ? (
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
            Confirme a inscrição no Telegram. Seus escolhidos serão registrados automaticamente.
          </p>
        </div>

        <details className="group mt-4 rounded-2xl border border-black/15 bg-white">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden">
            <span>Vai usar outro número neste celular?</span>
            <span aria-hidden="true" className="shrink-0 text-xl transition-transform group-open:rotate-180">
              ⌄
            </span>
          </summary>
          <div className="border-t border-black/10 px-4 pb-4 pt-3 text-sm leading-6">
            <p>
              Se o Telegram já está instalado com outro número, você não precisa
              instalar o aplicativo novamente nem sair da conta atual.
            </p>
            <ol className="mt-3 list-decimal space-y-2 pl-5">
              <li>Abra o Telegram e entre no menu da sua conta.</li>
              <li>Escolha <strong>Adicionar conta</strong> e cadastre o segundo número.</li>
              <li>Confirme esse número no Telegram e selecione a nova conta.</li>
              <li>Volte a esta página e toque em <strong>Ativar notificações no Telegram</strong>.</li>
            </ol>
            <p className="mt-3 font-medium">
              Suas escolhas ficam guardadas neste navegador. Antes de ativar,
              confira se a segunda conta está selecionada no Telegram.
            </p>
          </div>
        </details>

        <button
          type="button"
          onClick={() => void ativarTelegram()}
          disabled={
            ativandoTelegram ||
            selecionadas.length === 0
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
            setEtapa("selecionados");
          }}
          className="mt-3 min-h-13 w-full rounded-2xl bg-black/[0.07] px-5 py-3 font-semibold"
        >
          Acompanhar mais alguém
        </button>

        <a
          href="/"
          className="mt-6 block text-center text-sm underline underline-offset-4"
        >
          ‹ &nbsp; Voltar para o site
        </a>

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
              Você está acompanhando:
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
          </div>
        ) : null}

        <h2 className="mt-7 text-3xl font-bold leading-tight tracking-[-0.04em]">
          Quer acompanhar mais alguém?
        </h2>

        <p className="mt-2 text-base leading-6 text-black/65">
          Digite o nome ou o número de outra pessoa para adicionar à sua lista.
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
            Acompanhe a atuação de quem foi eleito.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/75">
            Entenda como as decisões são tomadas: o que faz a Presidência,
            o que decide o Congresso e qual é o papel do Judiciário.
            Escolha quem você quer acompanhar e receba as informações pelo Telegram.
          </p>
        </div>
      </section>

      <section className="votou-search-stage mx-auto max-w-[760px] px-6 pb-12 pt-7">
        <h2 className="text-3xl font-bold leading-tight tracking-[-0.04em]">
          Quem você quer acompanhar?
        </h2>

        <CandidateSelector
          key={`busca-${busca}`}
          mode="follow"
          selectedIds={selecionadas.map((item) => item.id)}
          onSelect={selecionar}
        />

        {selecionadas.length > 0 ? (
          <button
            type="button"
            onClick={() => setEtapa("selecionados")}
            className="votou-intro-only mt-5 min-h-12 w-full rounded-2xl bg-black/[0.07] px-5 py-3 text-sm font-semibold"
          >
            Ver minhas escolhas ({selecionadas.length})
          </button>
        ) : null}

        <p role="status" className="sr-only">
          {aviso}
        </p>
      </section>
    </>
  );
}
