import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { sql } from "@/lib/interesses/db";
import { hashSessao, inscricaoAtiva, tokenSessao } from "@/lib/telegram/sessao-site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "O que você quer fazer? | Fora da Pauta",
  description: "Escolha sua próxima ação no Fora da Pauta.",
  robots: { index: false, follow: false },
};

type Opcao = {
  titulo: string;
  descricao: string;
  href: string;
  exigeEscolhas?: boolean;
};

const opcoes: Opcao[] = [
  { titulo: "Acompanhar pessoas", descricao: "Escolha pessoas para acompanhar pelo Telegram.", href: "/votou-fique-de-olho" },
  { titulo: "Minhas escolhas", descricao: "Consulte ou remova as pessoas que você acompanha.", href: "/votou-fique-de-olho?minhas=1", exigeEscolhas: true },
  { titulo: "Ver ficha política", descricao: "Pesquise uma pessoa e consulte sua ficha.", href: "/votou-fique-de-olho" },
  { titulo: "Edições já publicadas", descricao: "Leia ou ouça as edições disponíveis.", href: "/edicoes" },
  { titulo: "Página inicial", descricao: "Voltar ao Fora da Pauta.", href: "/" },
];

async function obterSituacao() {
  const token = await tokenSessao();
  if (!token || !(await inscricaoAtiva(token))) {
    return { autenticado: false, acompanhamentos: 0 };
  }

  const linhas = await sql<{ quantidade: number }[]>`
    SELECT count(DISTINCT a.candidatura_id)::integer AS quantidade
    FROM public.telegram_sessoes_site s
    JOIN public.telegram_acompanhamentos a
      ON a.telegram_chat_id = s.telegram_chat_id
    WHERE s.sessao_hash = ${hashSessao(token)}
      AND s.telegram_chat_id IS NOT NULL
      AND s.expira_at > now()
      AND a.status IN ('ativo', 'aguardando_eleicao', 'nao_eleito')
      AND a.cancelled_at IS NULL
  `;

  return { autenticado: true, acompanhamentos: linhas[0]?.quantidade ?? 0 };
}

export default async function OpcoesTelegram() {
  const { autenticado, acompanhamentos } = await obterSituacao();
  const temEscolhas = autenticado && acompanhamentos > 0;

  return (
    <main className="min-h-[calc(100svh-58px)] bg-white px-5 pb-16 pt-9 text-black sm:pt-14">
      <section className="mx-auto max-w-[600px]">
        <div className="mb-9 flex flex-col items-center gap-3 text-center">
          <Image
            src="/marca/fora-da-pauta-icone.svg"
            alt=""
            width={66}
            height={66}
            className="h-[66px] w-[66px]"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold uppercase tracking-[0.13em]">Fique de Olho</p>
        </div>
        <h1 className="text-center text-[clamp(28px,5vw,38px)] font-bold leading-tight tracking-[-0.045em]">
          O que você quer fazer agora?
        </h1>
        <p className="mx-auto mb-8 mt-4 max-w-[42ch] text-center text-base leading-7 text-black/65">
          {temEscolhas
            ? `Você acompanha ${acompanhamentos} ${acompanhamentos === 1 ? "pessoa" : "pessoas"}. Escolha uma opção.`
            : autenticado
              ? "Você já está de olho. Quando escolher alguém para acompanhar, a opção Minhas escolhas será liberada."
              : "Escolha uma opção. Para acessar suas escolhas, abra este menu a partir da inscrição vinculada ao Telegram."}
        </p>
        <nav aria-label="Opções do Fora da Pauta" className="flex flex-col gap-4">
          {opcoes.map((item) => {
            const desativado = item.exigeEscolhas && !temEscolhas;

            if (desativado) {
              return (
                <div
                  key={item.titulo}
                  aria-disabled="true"
                  className="flex min-h-20 cursor-not-allowed flex-col justify-center rounded-xl border border-black/15 bg-[#f1f1f1] px-6 py-4 text-black/45"
                >
                  <span className="text-lg font-bold">{item.titulo} <span aria-hidden="true">🔒</span></span>
                  <span className="mt-1 text-sm">
                    {autenticado ? "Disponível quando você acompanhar alguém." : "Disponível depois de confirmar sua inscrição neste navegador."}
                  </span>
                </div>
              );
            }

            return (
              <Link key={item.titulo} href={item.href}
                className="flex min-h-20 flex-col justify-center rounded-xl border border-[#e2b100] bg-[#ffd700] px-6 py-4 text-black transition hover:bg-[#f3cc00] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-black">
                <span className="text-lg font-bold">{item.titulo} <span aria-hidden="true">→</span></span>
                <span className="mt-1 text-sm text-black/70">{item.descricao}</span>
              </Link>
            );
          })}
        </nav>
      </section>
    </main>
  );
}
