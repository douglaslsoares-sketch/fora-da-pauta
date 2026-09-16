import Image from "next/image";
import Link from "next/link";

import { EditorialModalTrigger } from "@/components/EditorialModalTrigger";
import { HomeReadingButton } from "@/components/HomeReadingButton";

export default function Home() {
  return (
    <main
      id="home-reading"
      className="min-h-screen bg-[#eeeee9] text-[#151515]"
    >

      {/* ABERTURA */}

      <section className="bg-black px-5 py-16 text-white sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFC400]">
            Edição especial de pré-lançamento
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.055em] sm:text-7xl">
            Conheça o Fora da Pauta
          </h1>

          <p className="mt-8 max-w-3xl text-2xl font-semibold leading-9 text-white">
            Informação para entender o que acontece e formar sua própria avaliação.
          </p>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/65">
            O Fora da Pauta é um canal direto de informação e esclarecimento
            com as pessoas. Os assuntos são pesquisados, documentados e
            apresentados com fontes para que cada pessoa possa compreender o
            que aconteceu, acompanhar o que muda e chegar às próprias conclusões.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/65">
            A proposta é não depender de publicidade, de grandes financiadores
            nem da disputa por alcance nas plataformas para decidir o que merece
            ser pesquisado e publicado.
          </p>

          <div className="mt-9">
            <HomeReadingButton />
          </div>

          <div
            data-editorial-ignore
            className="mt-5 flex flex-col gap-3 sm:flex-row"
          >
            <EditorialModalTrigger
              className="inline-flex min-h-12 items-center justify-center border border-white/25 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/60 hover:text-white"
            />

            <Link
              href="/participacao-e-sustentabilidade"
              className="inline-flex min-h-12 items-center justify-center border border-white/25 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/60 hover:text-white"
            >
              Sustentabilidade e Participação
            </Link>
          </div>

        </div>
      </section>


      {/* O QUE É */}

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
            O que é
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            Informação para entender. Espaço para participar.
          </h2>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-black/65">
            O Fora da Pauta é um projeto independente de informação,
            esclarecimento e participação aberta, baseado em fatos, documentos,
            evidências e fontes verificáveis.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-black/65">
            O objetivo não é dizer o que você deve pensar, em quem deve votar
            ou qual conclusão deve adotar. É oferecer informação organizada,
            contextualizada e verificável para que você possa formar sua própria
            avaliação.
          </p>


          <div className="mt-10 grid gap-4 md:grid-cols-3">

            <div className="border border-black/15 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                Informação
              </p>

              <h3 className="mt-3 text-xl font-semibold">
                O que pode ser verificado?
              </h3>

              <p className="mt-3 text-sm leading-7 text-black/60">
                A pesquisa parte do que pode ser verificado: fatos, documentos,
                registros e fontes. O que foi verificado, alegado, contestado
                ou ainda não confirmado deve aparecer como tal.
              </p>
            </div>


            <div className="border border-black/15 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                Participação
              </p>

              <h3 className="mt-3 text-xl font-semibold">
                Incluir o povo no debate
              </h3>

              <p className="mt-3 text-sm leading-7 text-black/60">
                As pessoas podem sugerir assuntos, perguntar, comentar e
                participar das discussões. A participação pode ser anônima
                e organizada dentro da própria plataforma.
              </p>
            </div>


            <div className="border border-black/15 p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                Independência
              </p>

              <h3 className="mt-3 text-xl font-semibold">
                Uma pessoa, uma cota
              </h3>

              <p className="mt-3 text-sm leading-7 text-black/60">
                Cada pessoa poderá assumir no máximo uma cota, de mesmo valor.
                Contribuir ajuda a sustentar o projeto, mas não compra influência,
                prioridade editorial ou acesso privilegiado.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ESPINHA DORSAL */}

      <section className="bg-black px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFC400]">
            Espinha Dorsal
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            A informação não começa do zero.
          </h2>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">
            Documentos, decisões, falas, votos, acontecimentos e atualizações
            são organizados em ordem cronológica. Assim, é possível reconstruir
            o caminho de um assunto, entender o contexto e conferir as fontes.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/65">
            É uma linha do tempo viva: cresce para a frente, com novos
            acontecimentos, e também para trás, quando registros anteriores
            são localizados e documentados.
          </p>

          <Link
            href="/espinha-dorsal"
            className="mt-8 inline-flex min-h-12 items-center justify-center border border-white/25 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/60 hover:text-white"
          >
            Ver Espinha Dorsal
          </Link>

        </div>
      </section>


      {/* CANAL DIRETO */}

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
            Canal direto
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            O ponto de encontro é aqui.
          </h2>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-black/65">
            O Fora da Pauta é o ponto de encontro do projeto. É aqui que
            permanecem os conteúdos, documentos, fontes, cronologias e espaços
            de participação.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-black/65">
            O Telegram é o canal de notificação. Quando houver novidade,
            ele avisa e conduz a pessoa de volta ao Fora da Pauta.
          </p>

          <div className="mt-8 border-l-4 border-[#FFC400] pl-5">
            <p className="max-w-3xl text-lg font-semibold leading-8">
              O Telegram avisa. O Fora da Pauta reúne, organiza e preserva
              a informação e a participação.
            </p>
          </div>

        </div>
      </section>


      {/* SUSTENTABILIDADE */}

      <section className="bg-black px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFC400]">
            Sustentabilidade
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            Contribuir não compra influência.
          </h2>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">
            Antes de cada período, o Fora da Pauta apresentará quanto precisa
            para funcionar e por quanto tempo. O valor necessário será dividido
            em cotas de mesmo valor.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/65">
            Cada pessoa poderá assumir no máximo uma cota naquele período.
            A contribuição ajuda a sustentar o projeto, mas não dá prioridade,
            influência editorial, acesso privilegiado nem maior poder de participação.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/65">
            Participar do Fora da Pauta não depende de contribuição financeira.
          </p>

          <Link
            href="/participacao-e-sustentabilidade"
            className="mt-8 inline-flex min-h-12 items-center justify-center border border-white/25 px-6 py-3 text-sm font-semibold text-white/85 transition hover:border-white/60 hover:text-white"
          >
            Sustentabilidade e Participação
          </Link>

        </div>
      </section>


      {/* EM QUE PONTO ESTAMOS */}

      <section className="border-t border-white/15 bg-black px-5 py-16 text-white sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto w-full max-w-5xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFC400]">
            Em que ponto estamos
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            O projeto ainda está em <span className="whitespace-nowrap">pré-lançamento</span>
          </h2>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/65">
            O Fora da Pauta ainda não iniciou sua operação regular.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/65">
            Antes do lançamento oficial, ainda precisamos concluir a estrutura
            jurídica, contábil e operacional, fechar o orçamento do primeiro
            período e publicar de forma clara como funcionarão a sustentação
            e a prestação de contas.
          </p>


          <div className="mt-10 divide-y divide-white/15 border-y border-white/15">

            <div className="flex gap-4 py-5">
              <span
                aria-hidden="true"
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#FFC400]"
              />

              <div>
                <p className="font-semibold">
                  Linha Editorial definida
                </p>

                <p className="mt-1 text-sm leading-6 text-white/50">
                  Os princípios que orientam pesquisa, publicação e participação
                  já estão documentados.
                </p>
              </div>
            </div>


            <div className="flex gap-4 py-5">
              <span
                aria-hidden="true"
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#FFC400]"
              />

              <div>
                <p className="font-semibold">
                  Princípios de sustentabilidade definidos
                </p>

                <p className="mt-1 text-sm leading-6 text-white/50">
                  O modelo prevê cotas de mesmo valor, no máximo uma por pessoa.
                  Contribuir não compra influência, prioridade ou participação
                  privilegiada.
                </p>
              </div>
            </div>


            <div className="flex gap-4 py-5">
              <span
                aria-hidden="true"
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-white/50"
              />

              <div>
                <p className="font-semibold">
                  Estrutura de funcionamento em conclusão
                </p>

                <p className="mt-1 text-sm leading-6 text-white/50">
                  A estrutura jurídica, contábil e operacional e o orçamento
                  do primeiro período ainda precisam ser concluídos antes da
                  operação regular.
                </p>
              </div>
            </div>


            <div className="flex gap-4 py-5">
              <span
                aria-hidden="true"
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full border border-white/50"
              />

              <div>
                <p className="font-semibold">
                  Contribuições ainda não abertas
                </p>

                <p className="mt-1 text-sm leading-6 text-white/50">
                  Nenhuma contribuição financeira está sendo solicitada nesta fase.
                </p>
              </div>
            </div>

          </div>


          <Link
            href="/participacao-e-sustentabilidade"
            className="mt-9 inline-flex items-center gap-3 text-sm font-semibold text-[#FFC400] transition hover:text-white"
          >
            Veja como o projeto pretende se sustentar
            <span aria-hidden="true">→</span>
          </Link>

        </div>
      </section>


      {/* COMO PARTICIPAR */}


{/* ACOMPANHAR */}


{/* ACOMPANHAR PELO TELEGRAM */}

<section
        id="acompanhar-telegram"
        className="bg-[#eeeee9] px-5 py-16 text-[#151515] sm:px-8 sm:py-20 lg:px-10"
      >
        <div className="mx-auto w-full max-w-5xl">

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
            Continue acompanhando
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] sm:text-5xl">
            Entre no Telegram para acompanhar o Fora da Pauta.
          </h2>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-black/65">
            O Telegram é o canal de notificação do projeto. É por lá que você
            recebe os avisos de novas publicações e atualizações, com o link
            para voltar ao Fora da Pauta.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-black/65">
            Depois de entrar, você também receberá o link para compartilhar
            o projeto com outras pessoas.
          </p>

          <p className="mt-4 max-w-3xl font-medium leading-8">
            A informação, os documentos, o histórico e a participação ficam
            no Fora da Pauta. O Telegram faz a ligação entre você e a plataforma.
          </p>

          <a
            data-editorial-ignore
            href="https://t.me/foradapauta"
            target="_blank"
            rel="noreferrer"
            aria-label="Entrar no canal do Fora da Pauta no Telegram"
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#FFC400] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b300]"
          >
            Entrar no Telegram
          </a>

        </div>
      </section>

      {/* RODAPÉ */}

      <footer className="bg-black px-5 py-6 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl items-end justify-between gap-6">

          <Image
            src="/marca/fora-da-pauta-branca.png"
            alt="Fora da Pauta"
            width={160}
            height={115}
            className="h-auto w-[66px]"
          />

          <p className="text-right text-xs font-semibold uppercase tracking-[0.12em] text-[#FFC400]">
            Há mais para entender.
          </p>

        </div>
      </footer>
    </main>
  );
}