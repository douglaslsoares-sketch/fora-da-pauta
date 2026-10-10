"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CandidateSelector } from "@/components/CandidateSelector";
import { CandidatePhoto } from "@/components/CandidatePhoto";
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

  useEffect(() => {
    if (selecionadas.length === 0) return;

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
  }, [selecionadas]);

  const [etapa, setEtapa] = useState<Etapa>("busca");
  const [busca, setBusca] = useState(0);
  const [aviso, setAviso] = useState("");
  const [avisoStorage, setAvisoStorage] = useState("");
  const [ativandoTelegram, setAtivandoTelegram] = useState(false);
  const [erroTelegram, setErroTelegram] = useState("");

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
    if (
      ativandoTelegram ||
      selecionadas.length === 0
    ) {
      return;
    }

    setAtivandoTelegram(true);
    setErroTelegram("");

    try {
      const response = await fetch(
        "/api/telegram/vinculo",
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
        },
      );

      const data = (await response.json()) as {
        url?: unknown;
      };

      if (
        !response.ok ||
        typeof data.url !== "string"
      ) {
        throw new Error(
          "Não foi possível preparar a ativação.",
        );
      }

      const telegramUrl = new URL(data.url);

      if (
        telegramUrl.protocol !== "https:" ||
        telegramUrl.hostname !== "t.me" ||
        telegramUrl.pathname !==
          "/ForaDaPautaAcompanhaBot"
      ) {
        throw new Error(
          "Link do Telegram inválido.",
        );
      }

      window.location.assign(
        telegramUrl.toString(),
      );
    } catch {
      setErroTelegram(
        "Não foi possível abrir o Telegram. Tente novamente.",
      );
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

  function remover(pessoa: PessoaSelecionada) {
    const novaLista = interpretarSelecao(
      lerSelecaoSerializada(),
    ).filter((item) => item.id !== pessoa.id);

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

            {permitirRemocao ? (
              <button
                type="button"
                onClick={() => remover(pessoa)}
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

        <div className="mt-6 flex items-center gap-4 rounded-2xl border border-[#FFC400] bg-[#fffaf0] p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFC400]/30">
            <TelegramIcon className="h-5 w-5" />
          </div>

          <p className="text-sm leading-6">
            Ao ativar, você poderá receber pelo Telegram as notificações do Fora da Pauta, inclusive sobre as pessoas escolhidas.
          </p>
        </div>

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

        <button
          type="button"
          onClick={() => setEtapa("telegram")}
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
            <span className="block">Votou?</span>
            <span className="mt-2 block whitespace-nowrap text-[#FFC400]">
              Fique de olho.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-xl leading-7 text-white/90">
            Acompanhe a atuação de quem foi eleito.
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

        <div className="votou-intro-only mt-8 space-y-5">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFC400]">
              <ActivityIcon className="h-5 w-5" />
            </div>
            <p className="pt-1 text-base leading-6">
              Receba informações sobre o que a pessoa está fazendo no mandato.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFC400]">
              <PeopleIcon className="h-5 w-5" />
            </div>
            <p className="pt-2 text-base leading-6">
              Você pode acompanhar mais de uma pessoa.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FFC400]">
              <TelegramIcon className="h-5 w-5" />
            </div>
            <p className="pt-1 text-base leading-6">
              As atualizações serão recebidas diretamente no Telegram.
            </p>
          </div>
        </div>

        <div className="votou-intro-only mt-8 rounded-2xl bg-black/[0.055] p-4">
          <p className="text-sm leading-6">
            ⓘ &nbsp; Informações com fontes.
            <br />
            Sem rótulos. Você decide.
          </p>
        </div>

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
