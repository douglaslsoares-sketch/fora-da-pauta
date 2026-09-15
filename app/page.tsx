import Link from "next/link";

import {
  PreLaunchExperience,
} from "@/components/PreLaunchExperience";

import {
  PublicQuestionsExperience,
} from "@/components/PublicQuestionsExperience";

import {
  PreLaunchShareCard,
} from "@/components/PreLaunchShareCard";

import {
  getProjectTimelineEvents,
} from "@/data/espinha-dorsal-projeto";

function dataBrasil(
  date: string,
) {
  const [
    ano,
    mes,
    dia,
  ] = date.split("-");

  return `${dia}/${mes}/${ano}`;
}

export default function Home() {
  const eventos =
    getProjectTimelineEvents()
      .slice(
        0,
        4,
      );

  return (
    <main
      id="prelaunch-reading"
      className="min-h-screen bg-[#eeeee9] text-[#151515]"
    >
      <section
        id="abertura"
        data-prelaunch-step="abertura"
        className="bg-black px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFC400]">
            Pré-lançamento
          </p>

          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
            Um espaço público de fala, escuta, informação e participação.
          </h1>

          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/70">
            As pessoas trazem suas dúvidas, sugestões, experiências e opiniões.
            O Fora da Pauta organiza, verifica, documenta e apresenta o que pode
            ser verificado.
          </p>

          <p className="mt-4 text-lg font-semibold text-white">
            A opinião pertence às pessoas.
          </p>

          <PreLaunchExperience />
        </div>
      </section>

      <section
        id="origem"
        data-prelaunch-step="origem"
        className="px-5 py-9 sm:px-8 sm:py-12 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Uma ideia que vem de longe
          </p>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-black/65">
            Essa ideia vem sendo construída há muitos anos. Durante muito tempo,
            essas conversas aconteciam com uma pessoa por vez. O Fora da Pauta
            tornou possível ampliar essa conversa: falar com muitas pessoas,
            ouvi-las e construir um espaço em que elas também possam participar.
          </p>
        </div>
      </section>

      <section
        id="principios"
        data-prelaunch-step="principios"
        className="border-y border-black/15 bg-white/35 px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Princípios
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            O Fora da Pauta não diz o que você deve pensar.
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-black/65">
            O Fora da Pauta não é acusatório nem promocional. É documental.
            A pergunta que orienta a verificação é: o que pode ser verificado?
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-black/65">
            O projeto mostra o que pode ser verificado e abre espaço para que as
            pessoas falem por si mesmas. A decisão política, eleitoral ou pessoal
            continua pertencendo à própria pessoa.
          </p>

          <div className="mt-7 border-l-4 border-[#FFC400] pl-5">
            <p className="font-semibold leading-7">
              A participação pública é anônima: a identidade de quem participa
              não é exibida publicamente.
            </p>
          </div>
        </div>
      </section>

      <section
        id="participacao"
        data-prelaunch-step="participacao"
        className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Participação
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Você fala. O sistema mostra o que entendeu. Você confere.
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-black/65">
            Sugestões de temas, comentários e perguntas poderão ser feitos por
            áudio. A pessoa fala livremente; o sistema interpreta; a pessoa
            confirma, corrige ou completa. Só então a manifestação é registrada.
          </p>

          <h3 className="mt-9 text-2xl font-semibold tracking-[-0.035em]">
            A conversa começa nas pessoas.
          </h3>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-black/65">
            Não haverá uma lista de assuntos para escolher. Os temas poderão
            nascer da fala livre das pessoas. Quando as sugestões forem
            organizadas por tema, o Fora da Pauta mostrará quantas pessoas
            mencionaram cada assunto, o percentual correspondente e a base usada
            no cálculo.
          </p>

          <div className="mt-8 border-l-4 border-[#FFC400] pl-5">
            <p className="font-semibold leading-7">
              Não basta ouvir. É preciso mostrar o que foi feito com aquilo que foi ouvido.
            </p>
          </div>
        </div>
      </section>

      <section
        id="espinha-dorsal"
        data-prelaunch-step="espinha-dorsal"
        className="bg-black px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFC400]">
            Desde o começo
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Espinha Dorsal do Fora da Pauta
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
            Quem participa deve poder acompanhar como as coisas acontecem. O
            princípio é registrar todos os acontecimentos do projeto, do mais
            recente para o mais antigo, preservando os detalhes que precisem ser
            protegidos por privacidade ou dever legal.
          </p>

          <div className="mt-9 border-t border-white/15">
            {eventos.map(
              (evento) => (
                <article
                  key={evento.id}
                  className="grid gap-2 border-b border-white/15 py-5 sm:grid-cols-[120px_1fr] sm:gap-7"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#FFC400]">
                      {dataBrasil(
                        evento.date,
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {evento.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-white/50">
                      {evento.description}
                    </p>
                  </div>
                </article>
              ),
            )}
          </div>

          <Link
            href="/espinha-dorsal"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#FFC400]"
          >
            Ver Espinha Dorsal completa
            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>

      <section
        id="sustentacao"
        data-prelaunch-step="sustentacao"
        className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Sustentabilidade
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Uma pessoa. Uma cota. 12 meses.
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-black/65">
            A participação no Fora da Pauta não depende de contribuição
            financeira. O modelo de sustentabilidade em construção prevê uma
            contribuição voluntária, limitada a uma cota por pessoa em cada período
            de 12 meses.
          </p>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-black/65">
            O objetivo é distribuir os custos entre o maior número possível de
            pessoas que queiram contribuir, sem que contribuir mais dê mais
            influência.
          </p>

          <div className="mt-8 bg-black p-6 text-white sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFC400]">
              Qual deve ser o valor?
            </p>

            <p className="mt-3 text-xl font-semibold leading-8">
              A proposta é buscar a menor cota compatível com os custos reais e
              consultar as pessoas interessadas em contribuir antes de defini-la.
            </p>

            <p className="mt-3 text-sm leading-7 text-white/55">
              Se o valor precisar mudar para mais ou para menos, haverá nova
              consulta antes da alteração.
            </p>
          </div>

          <p className="mt-6 max-w-3xl text-sm leading-7 text-black/50">
            Ao fim de cada período de 12 meses, eventual sobra será apresentada na
            Prestação de Contas. O mecanismo de devolução ou de permanência
            voluntária para o período seguinte só será adotado depois de validação
            jurídica e contábil.
          </p>

          <Link
            href="/participacao-e-sustentabilidade"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
          >
            Ver Sustentabilidade e Prestação de Contas
            <span aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </section>

      <section
        id="onde-estamos"
        data-prelaunch-step="onde-estamos"
        className="border-y border-black/15 bg-white/35 px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Agora
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Situação atual
          </h2>

          <div className="mt-7 divide-y divide-black/10 border-y border-black/10">
            <div className="flex items-center justify-between gap-5 py-4">
              <p className="font-medium">
                Consulta jurídica preventiva
              </p>
              <p className="text-sm font-semibold">
                Contato inicial enviado
              </p>
            </div>

            <div className="flex items-center justify-between gap-5 py-4">
              <p className="font-medium">
                Custos dos próximos 12 meses
              </p>
              <p className="text-sm font-semibold text-black/45">
                Em apuração
              </p>
            </div>

            <div className="flex items-center justify-between gap-5 py-4">
              <p className="font-medium">
                Valor da cota
              </p>
              <p className="text-sm font-semibold text-black/45">
                Ainda não definido
              </p>
            </div>

            <div className="flex items-center justify-between gap-5 py-4">
              <p className="font-medium">
                Participação financeira
              </p>
              <p className="text-sm font-semibold text-black/45">
                Ainda não aberta
              </p>
            </div>
          </div>

          <p className="mt-6 text-sm leading-7 text-black/45">
            Primeiro se conhece o custo. Depois se sabe quantas pessoas são
            necessárias para dividi-lo.
          </p>
        </div>
      </section>

      <section
        id="perguntas"
        data-prelaunch-step="perguntas"
        className="border-y border-black/15 bg-white/35 px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/40">
            Participação
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            Ficou alguma dúvida?
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-black/65">
            Faça sua pergunta por áudio sobre o Fora da Pauta. Você fala, o
            sistema mostra o que entendeu e você confere antes de enviar.
          </p>

          <p className="mt-4 max-w-3xl text-base leading-7 text-black/55">
            Depois do envio, você receberá um link para acompanhar sua pergunta
            e voltar diretamente à resposta quando ela for publicada.
          </p>

          <div className="mt-8 border-l-4 border-[#FFC400] pl-5">
            <p className="font-semibold leading-7">
              Quando houver interesse público, a pergunta e a resposta também poderão ser publicadas abaixo.
            </p>
          </div>

          <PublicQuestionsExperience />
        </div>
      </section>

      <section
        id="fechamento"
        data-prelaunch-step="fechamento"
        className="px-5 py-14 sm:px-8 sm:py-20 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-3xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-5xl">
            É gente, como a gente,
            <br />
            que faz a diferença.
          </p>

          <div className="mt-6 h-1 w-16 bg-[#FFC400]" />

          <p className="mt-6 max-w-3xl text-xl leading-9 text-black/60 sm:text-2xl">
            Quanto mais gente participa, mais gente a gente alcança.
          </p>
        </div>
      </section>

      <section
        id="compartilhar"
        data-prelaunch-step="compartilhar"
        className="px-5 py-12 sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <PreLaunchShareCard />
        </div>
      </section>

      <section
        id="acompanhar"
        data-prelaunch-step="acompanhar"
        className="bg-black px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-10"
      >
        <div className="mx-auto w-full max-w-4xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FFC400]">
            Continue acompanhando
          </p>

          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">
            O Telegram avisa.
          </h2>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
            O Telegram é somente um canal de notificação. O conteúdo, os
            documentos, o histórico, as perguntas e os espaços de participação
            ficam no site.
          </p>

          <p className="mt-4 font-semibold leading-7">
            O Fora da Pauta registra, explica e abre a participação.
          </p>

          <a
            href="https://t.me/foradapauta"
            target="_blank"
            rel="noreferrer"
            data-prelaunch-action="telegram"
            className="mt-7 inline-flex min-h-12 items-center justify-center bg-[#FFC400] px-6 py-3 text-sm font-semibold text-black transition hover:bg-[#e9b300]"
          >
            Entrar no Telegram
          </a>
        </div>
      </section>

    </main>
  );
}