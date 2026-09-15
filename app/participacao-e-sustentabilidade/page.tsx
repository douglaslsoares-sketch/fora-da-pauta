import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sustentabilidade e Participação",
  description:
    "Como participação, sustentabilidade distribuída e prestação de contas se relacionam no Fora da Pauta.",
};

export default function ParticipacaoESustentabilidadePage() {
  return (
    <main className="min-h-screen bg-[#eeeee9] text-[#151515]">
      <section className="px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <div className="mx-auto w-full max-w-3xl">

          {/* ABERTURA */}

          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
            Como o projeto se sustenta
          </p>

          <h1 className="mt-4 text-5xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-7xl">
            Sustentabilidade e Participação
          </h1>

          <p className="mt-8 text-xl leading-9 text-black/70">
            Participação popular e sustentabilidade econômica não são duas
            coisas separadas.
          </p>

          <p className="mt-5 text-lg leading-8 text-black/65">
            O Fora da Pauta busca crescer pela ampliação da participação,
            e não pelo aumento da contribuição individual.
          </p>

          <div className="mt-9 border-l-4 border-[#FFC400] pl-5">
            <p className="text-lg font-semibold leading-8">
              Quanto mais pessoas sustentam o projeto, menos cada pessoa
              precisa sustentar.
            </p>
          </div>


          {/* PARTICIPAÇÃO */}

          <section className="mt-16 border-t border-black/15 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Participação
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Participar não exige contribuir
            </h2>

            <p className="mt-5 text-base leading-8 text-black/65">
              Qualquer pessoa pode acompanhar, compartilhar, sugerir
              conteúdos e participar do Fora da Pauta sem contribuição
              financeira.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              A contribuição financeira é voluntária e é apenas uma das
              formas de participar.
            </p>

            <div className="mt-8 bg-black px-6 py-7 text-white sm:px-8">
              <p className="text-sm uppercase tracking-[0.18em] text-[#FFC400]">
                Em resumo
              </p>

              <p className="mt-3 text-xl font-semibold leading-8">
                Acompanhar, compartilhar e, se quiser, contribuir.
              </p>
            </div>
          </section>


          {/* IDENTIDADE */}

          <section className="mt-16 border-t border-black/15 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Identidade na participação
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Você pode participar sem expor seu nome
            </h2>

            <p className="mt-5 text-base leading-8 text-black/65">
              Ao aceitar participar, cada pessoa recebe uma identidade
              pública própria e permanente dentro do Fora da Pauta.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              Ela não informa nome, sexo, localização, data de entrada ou
              condição financeira.
            </p>

            <div className="mt-7 border border-black/15 bg-white/35 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black/45">
                Exemplo
              </p>

              <p className="mt-3 font-mono text-2xl font-semibold tracking-[0.08em]">
                FP-7A3F-91C2-B8D4
              </p>

              <p className="mt-4 text-sm leading-7 text-black/55">
                O código é aleatório. Ele permite reconhecer uma pessoa
                nas conversas sem exigir que sua identidade civil seja
                exposta publicamente.
              </p>
            </div>

            <p className="mt-5 text-base leading-8 text-black/65">
              Contribuir financeiramente ou não contribuir não altera essa
              identidade nem dá mais poder de participação.
            </p>
          </section>


          {/* SUSTENTAÇÃO */}

          <section className="mt-16 border-t border-black/15 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Sustentabilidade distribuída
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              O custo é dividido, não concentrado
            </h2>

            <p className="mt-5 text-base leading-8 text-black/65">
              O projeto apresenta seus custos e busca distribuí-los entre
              uma base ampla de participantes da sustentação.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              A lógica é simples:
            </p>

            <div className="mt-7 bg-black px-6 py-7 text-white sm:px-8">
              <p className="text-sm uppercase tracking-[0.18em] text-[#FFC400]">
                Regra de referência
              </p>

              <p className="mt-3 text-xl font-semibold leading-8">
                custo do período ÷ participantes da sustentação =
                cota individual
              </p>
            </div>

            <p className="mt-6 text-base leading-8 text-black/65">
              O modelo foi pensado para crescer pela ampliação da base de
              participantes, e não pelo aumento da contribuição de cada
              pessoa.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              A contribuição financeira não compra acesso, influência,
              prioridade editorial ou maior visibilidade no debate.
            </p>
          </section>


          {/* ESTRUTURA DOS CUSTOS */}

          <section className="mt-16 border-t border-black/15 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Para onde vai o dinheiro
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Três grupos de custos
            </h2>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="border border-black/15 p-5">
                <p className="font-semibold">
                  Execução
                </p>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  Estrutura responsável por executar o projeto, produzir,
                  publicar, manter e atualizar seu conteúdo e seus serviços.
                </p>
              </div>

              <div className="border border-black/15 p-5">
                <p className="font-semibold">
                  Operação
                </p>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  Tecnologia, ferramentas, serviços, contabilidade,
                  jurídico, comunicação e demais despesas necessárias.
                </p>
              </div>

              <div className="border border-black/15 p-5">
                <p className="font-semibold">
                  Licença da marca
                </p>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  Valor correspondente à licença de uso da marca
                  Fora da Pauta.
                </p>
              </div>
            </div>

            <p className="mt-7 text-base leading-8 text-black/65">
              Marca, operação e execução são funções distintas. A estrutura
              que executa o projeto pode ser substituída sem que o projeto
              deixe de ser o Fora da Pauta.
            </p>
          </section>


          {/* CUSTOS CONHECIDOS */}

          <section className="py-16 sm:py-20">

            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Custos conhecidos
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              O que já tem valor definido
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-8 text-black/65">
              O Fora da Pauta só apresenta valor para aquilo cujo custo já é
              efetivamente conhecido.
            </p>

            <p className="mt-3 max-w-3xl text-base leading-8 text-black/65">
              Serviço ainda não contratado não recebe uma estimativa pública.
              Enquanto o preço não estiver definido, ele aparece apenas como{" "}
              <strong>“A definir”</strong>.
            </p>

            <div className="mt-8 overflow-x-auto border border-black/15">

              <table className="w-full min-w-[720px] border-collapse text-left">

                <thead className="bg-black text-white">

                  <tr>

                    <th className="px-5 py-4 text-sm font-semibold">
                      Item
                    </th>

                    <th className="px-5 py-4 text-sm font-semibold">
                      Situação
                    </th>

                    <th className="px-5 py-4 text-right text-sm font-semibold">
                      Mensal
                    </th>

                    <th className="px-5 py-4 text-right text-sm font-semibold">
                      Anual
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-black/10 text-sm">

                  <tr>

                    <td className="px-5 py-4">
                      ChatGPT
                    </td>

                    <td className="px-5 py-4 text-black/50">
                      Em uso — custo conhecido
                    </td>

                    <td className="px-5 py-4 text-right">
                      R$ 107,78
                    </td>

                    <td className="px-5 py-4 text-right">
                      R$ 1.293,36
                    </td>

                  </tr>


                  <tr>

                    <td className="px-5 py-4">
                      Canva / ferramenta de imagem
                    </td>

                    <td className="px-5 py-4 text-black/50">
                      Em uso — custo conhecido
                    </td>

                    <td className="px-5 py-4 text-right">
                      R$ 35,00
                    </td>

                    <td className="px-5 py-4 text-right">
                      R$ 420,00
                    </td>

                  </tr>


                  <tr>

                    <td className="px-5 py-4">
                      OpenAI — uso adicional / API
                    </td>

                    <td className="px-5 py-4 text-black/50">
                      Em uso — custo variável
                    </td>

                    <td className="px-5 py-4 text-right">
                      R$ 26,60
                      <span className="block text-[11px] text-black/40">
                        referência atual
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right text-black/35">
                      —
                    </td>

                  </tr>


                  <tr>

                    <td className="px-5 py-4">
                      Domínio
                    </td>

                    <td className="px-5 py-4 text-black/50">
                      Contratado
                    </td>

                    <td className="px-5 py-4 text-right text-black/35">
                      —
                    </td>

                    <td className="px-5 py-4 text-right">
                      R$ 109,99
                    </td>

                  </tr>


                  <tr className="font-semibold">

                    <td className="px-5 py-4">
                      Licença de uso da marca Fora da Pauta
                    </td>

                    <td className="px-5 py-4 font-normal text-black/50">
                      Valor definido pelo titular, sujeito à validação jurídica e contábil
                    </td>

                    <td className="px-5 py-4 text-right">
                      R$ 1.621,00
                    </td>

                    <td className="px-5 py-4 text-right">
                      R$ 19.452,00
                    </td>

                  </tr>

                </tbody>

              </table>

            </div>


            <div className="mt-7 border-l-4 border-[#FFC400] pl-5">

              <p className="max-w-3xl text-base font-semibold leading-7">
                Estes valores não formam ainda o orçamento do primeiro período.
              </p>

              <p className="mt-2 max-w-3xl text-sm leading-7 text-black/50">
                Não apresentaremos um total enquanto custos necessários ainda
                estiverem sem definição.
              </p>

            </div>

          </section>


          {/* CUSTOS A DEFINIR */}

          <section className="border-t border-black/10 py-16 sm:py-20">

            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Custos a definir
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              O que ainda precisa ser contratado
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-8 text-black/65">
              Estes itens poderão integrar o orçamento, mas ainda não recebem
              valor porque seu custo efetivo não está definido.
            </p>


            <div className="mt-8 grid gap-3 sm:grid-cols-2">

              {[
                "Execução do projeto",
                "Plataforma / loja",
                "Assessoria jurídica",
                "Contabilidade",
                "Comunicação / assessoria de imprensa",
                "Taxas financeiras e meios de pagamento",
              ].map((item) => (

                <div
                  key={item}
                  className="flex items-center justify-between gap-5 border border-black/15 px-5 py-4"
                >

                  <span className="text-sm font-medium">
                    {item}
                  </span>

                  <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.14em] text-black/40">
                    A definir
                  </span>

                </div>

              ))}

            </div>


            <p className="mt-6 max-w-3xl text-sm leading-7 text-black/50">
              Quando um desses serviços tiver preço efetivamente definido,
              a informação poderá ser incorporada ao orçamento.
            </p>

          </section>


          {/* IMPLANTAÇÃO */}

          <section className="border-t border-black/10 py-16 sm:py-20">

            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Implantação
            </p>

            <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Primeiro se fecha o orçamento. Depois se define a cota.
            </h2>

            <p className="mt-5 max-w-3xl text-base leading-8 text-black/65">
              A proposta continua sendo reunir participantes suficientes para
              cobrir o custo do primeiro período de funcionamento.
            </p>

            <p className="mt-3 max-w-3xl text-base leading-8 text-black/65">
              Mas o valor da cota e a quantidade de participantes necessários
              só serão definidos depois que os custos do período estiverem
              efetivamente conhecidos.
            </p>


            <div className="mt-8 border border-black/15 bg-black p-6 text-white sm:p-8">

              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFC400]">
                Regra
              </p>

              <p className="mt-3 max-w-3xl text-xl font-semibold leading-8">
                custo efetivo do período ÷ participantes da sustentação =
                cota individual
              </p>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/55">
                Sem orçamento fechado, não há cota oficial nem número oficial
                de participantes necessários.
              </p>

            </div>

          </section>

          {/* PRE-LANCAMENTO */}

          <section className="mt-16 border-t border-black/15 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Pré-lançamento
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Quando a campanha estiver pronta
            </h2>

            <p className="mt-5 text-base leading-8 text-black/65">
              Depois de fechado o orçamento do primeiro ano e validados os
              mecanismos jurídicos, contábeis e financeiros, a campanha de
              implantação deverá mostrar de forma simples quanto é necessário
              reunir e quantas pessoas são necessárias para dividir esse custo.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="border border-black/15 bg-white/30 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                  Custo do primeiro ano
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  A definir
                </p>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  Será publicado depois do fechamento do orçamento.
                </p>
              </div>

              <div className="border border-black/15 bg-white/30 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                  Cota de implantação
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  A definir
                </p>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  O valor será calculado antes da abertura da campanha.
                </p>
              </div>

              <div className="border border-black/15 bg-white/30 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                  Participantes necessários
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  A definir
                </p>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  Resultado do custo dividido pela cota definida.
                </p>
              </div>

              <div className="border border-black/15 bg-white/30 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                  Participantes confirmados
                </p>

                <p className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
                  Campanha ainda não aberta
                </p>

                <p className="mt-2 text-sm leading-6 text-black/50">
                  Quando houver campanha, este número deverá ser atualizado
                  de forma transparente.
                </p>
              </div>
            </div>


            <div className="mt-8 bg-black px-6 py-7 text-white sm:px-8">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#FFC400]">
                Quando estiver em andamento
              </p>

              <div className="mt-5 grid gap-6 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-white/55">
                    Necessários
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    —
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/55">
                    Confirmados
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    —
                  </p>
                </div>

                <div>
                  <p className="text-sm text-white/55">
                    Ainda faltam
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    —
                  </p>
                </div>
              </div>
            </div>


            <h3 className="mt-10 text-xl font-semibold tracking-[-0.02em]">
              E se a quantidade necessária não for alcançada?
            </h3>

            <p className="mt-4 text-base leading-8 text-black/65">
              Essa regra deverá existir antes de qualquer arrecadação.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              A campanha deverá informar previamente o que acontecerá com
              os valores recebidos caso não seja possível reunir participantes
              suficientes para colocar o projeto em funcionamento.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              A forma de devolução, eventual prazo, responsabilidade pela
              arrecadação e demais procedimentos dependerão da solução
              jurídica, contábil e da plataforma escolhida.
            </p>

            <div className="mt-8 border-l-4 border-[#FFC400] pl-5">
              <p className="text-base font-semibold leading-7">
                A regra vem antes da arrecadação. Quem participa deve saber
                previamente o que acontece em cada cenário.
              </p>
            </div>
          </section>

          {/* COTA */}

          <section className="mt-16 border-t border-black/15 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Participação financeira
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Uma participação não compra mais influência
            </h2>

            <p className="mt-5 text-base leading-8 text-black/65">
              O modelo pretende trabalhar com uma cota financeira por
              participante em cada período de sustentação, conforme a
              estrutura jurídica e operacional que vier a ser validada.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              Uma pessoa não poderá ampliar sua influência editorial ou
              política no projeto simplesmente contribuindo com mais
              dinheiro.
            </p>

            <div className="mt-8 border-l-4 border-[#FFC400] pl-5">
              <p className="text-base font-semibold leading-7">
                Contribuir ajuda a sustentar o projeto. Não compra poder
                sobre ele.
              </p>
            </div>
          </section>


          {/* COMUNICAÇÃO */}

          <section className="mt-16 border-t border-black/15 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Acompanhar o projeto
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Informação sem cansar
            </h2>

            <p className="mt-5 text-base leading-8 text-black/65">
              O Fora da Pauta poderá utilizar um canal de comunicação para
              avisar sobre novas edições e acontecimentos relevantes.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              A entrada nesse canal deverá ser voluntária. Contribuir
              financeiramente não significa ser inscrito automaticamente
              em mensagens ou grupos.
            </p>

            <div className="mt-8 bg-black px-6 py-7 text-white sm:px-8">
              <p className="text-xl font-semibold leading-8">
                A ideia é informar sem cansar.
              </p>
            </div>
          </section>


          {/* DIVULGAÇÃO */}

          <section className="mt-16 border-t border-black/15 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Fazer a informação circular
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              A divulgação apresenta; não convence
            </h2>

            <p className="mt-5 text-base leading-8 text-black/65">
              Quem se identifica com o projeto pode ajudar compartilhando
              edições, links, peças digitais ou materiais impressos.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              A comunicação deve apresentar o conteúdo e deixar cada pessoa
              decidir livremente se quer conhecer, participar ou contribuir.
            </p>

            <div className="mt-8 border-l-4 border-[#FFC400] pl-5">
              <p className="text-base font-semibold leading-7">
                A adesão deve ser espontânea. O projeto apresenta; cada
                pessoa decide.
              </p>
            </div>
          </section>


          {/* PRESTAÇÃO DE CONTAS */}

          <section
            id="prestacao-de-contas"
            className="mt-16 scroll-mt-32 border-t border-black/15 pt-12"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Transparência
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
              Prestação de Contas
            </h2>

            <p className="mt-5 text-base leading-8 text-black/65">
              Quem participa da sustentação deve conseguir saber quanto
              o projeto custa, para onde foi o dinheiro e o que aconteceu
              com eventual sobra.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              Os custos e pagamentos deverão ser apresentados de forma
              compreensível e rastreável.
            </p>

            <h3 className="mt-9 text-xl font-semibold tracking-[-0.02em]">
              E se sobrar dinheiro?
            </h3>

            <p className="mt-4 text-base leading-8 text-black/65">
              Depois de pagos os custos do período, eventual saldo
              remanescente deverá ser dividido igualmente entre os
              participantes da sustentação daquele período.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              Cada participante poderá receber sua parcela de volta ou,
              se desejar, autorizar expressamente que ela permaneça no
              projeto como ajuda para o período seguinte.
            </p>

            <p className="mt-4 text-base leading-8 text-black/65">
              O saldo não deverá ser retido automaticamente.
            </p>

            <div className="mt-9 border-l-4 border-[#FFC400] pl-5">
              <p className="text-base font-semibold leading-7">
                O acesso é aberto. A contribuição é voluntária.
                A continuidade depende de sustentação.
              </p>
            </div>
          </section>


          {/* VALIDAÇÃO */}

          <section className="mt-16 border-t border-black/15 pt-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/45">
              Modelo em preparação
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.025em]">
              O funcionamento financeiro ainda será validado
            </h2>

            <p className="mt-5 text-sm leading-7 text-black/50">
              Valores, periodicidade, forma jurídica, conta responsável,
              mecanismos de arrecadação, devolução de saldo e demais
              procedimentos financeiros serão definidos após validação
              jurídica, contábil e operacional.
            </p>
          </section>

        </div>
      </section>
    </main>
  );
}