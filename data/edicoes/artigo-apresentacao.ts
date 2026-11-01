import type { Campaign } from "@/data/campanhas";

/**
 * Texto institucional de apresentação do Fora da Pauta.
 * É fixado em primeiro lugar na listagem de edições, sem número de edição.
 * Referências documentais são datadas; os exemplos não implicam intenção
 * ou favorecimento sem evidência específica.
 */
export const artigoApresentacao: Campaign = {
  slug: "quem-decide-o-que-chega-ate-voce",
  brand: "Fora da Pauta",
  title: "Quem decide o que chega até você?",
  statement: "Por que existe o Fora da Pauta: política, mídia, plataformas digitais e a ponte entre a informação e o entendimento.",
  publishedAt: "2026-11-01",
  sections: [
    {
      title: "Você já reparou em uma coisa?",
      paragraphs: [
        "Uma notícia aparece na televisão. Um vídeo surge no celular. Certo assunto domina as manchetes durante dias. Outro, mesmo importante, recebe pouca atenção.",
        "**Quem decide o que vira notícia? Quem escolhe o que aparece na sua tela? E o que pode estar ficando de fora?**",
        "Para entender como o jogo é jogado, precisamos olhar não apenas para as decisões políticas, mas também para o caminho que a informação percorre antes de chegar até nós.",
      ],
    },
    {
      title: "As decisões que afetam a nossa vida",
      paragraphs: [
        "Governos, parlamentos, tribunais e outras instituições tomam decisões que afetam salários, aposentadorias, impostos, saúde, educação, trabalho e o uso do dinheiro público.",
        "Nem sempre temos tempo para acompanhar cada votação, ler documentos ou ouvir diferentes explicações. Muitas vezes, tudo o que chega até nós é uma manchete ou um trecho de vídeo.",
        "Mas **receber uma informação não é o mesmo que compreender o que ela significa**. É preciso perguntar quem decidiu, por quê, com quais consequências e com base em quais fatos.",
      ],
    },
    {
      title: "Quem escolhe o que vira notícia?",
      paragraphs: [
        "Jornais, emissoras de rádio e televisão e portais precisam selecionar assuntos, definir manchetes, escolher entrevistados e decidir quanto espaço dar a cada acontecimento. Essas escolhas fazem parte do jornalismo, mas também podem ser examinadas e questionadas.",
        "Grandes grupos de comunicação têm proprietários e podem manter negócios e relações em outros setores da sociedade. Por isso, vale conhecer **quem controla os veículos**, como se financiam e quais interesses podem influenciar suas escolhas editoriais.",
        "Um exemplo documentado: o Monitoramento da Propriedade da Mídia, publicado em **2017** pelo Intervozes e pela Repórteres Sem Fronteiras, analisou 50 veículos de grande audiência no Brasil e identificou 26 grupos proprietários. O estudo apontou riscos relacionados à concentração da mídia. **É um retrato daquele período, não um levantamento atualizado de 2026.**",
        "Isso não significa que toda reportagem seja manipulada nem que todos os jornalistas trabalhem do mesmo modo. Significa que a notícia também pode ser lida com perguntas: **quem está contando essa história, quais fontes foram ouvidas e quais perspectivas não apareceram?**",
      ],
      references: [
        {
          label: "Intervozes — Monitoramento da Propriedade de Mídia no Brasil (pesquisa de 2017)",
          url: "https://intervozes.org.br/projeto/afinal-quem-controla-a-midia-no-brasil-quem-sao-os-donos-dos-50-maiores-veiculos-de-midias/",
        },
        {
          label: "Repórteres Sem Fronteiras — resultados do levantamento brasileiro (31/10/2017)",
          url: "https://rsf.org/pt-br/oligop%C3%B3lios-de-m%C3%ADdia-controlados-por-poucas-fam%C3%ADlias-rep%C3%B3rteres-sem-fronteiras-e-o-intervozes-0",
        },
      ],
    },
    {
      title: "E quem escolhe o que você vê na internet?",
      paragraphs: [
        "Na internet, qualquer pessoa pode publicar. Mas publicar não significa alcançar todo mundo.",
        "As grandes plataformas digitais usam sistemas de recomendação para organizar o que aparece nos feeds, sugerir vídeos e distribuir publicações. Também estabelecem regras que podem limitar a visibilidade ou remover conteúdos.",
        "Isso dá às plataformas uma influência importante sobre **a circulação da informação**. Um assunto pode receber enorme exposição; outro pode ter alcance reduzido por muitos motivos, entre eles os critérios de recomendação, o comportamento do público e decisões de moderação.",
        "**Poucas visualizações, por si só, não provam censura ou perseguição política.** Para afirmar que uma plataforma favoreceu ou prejudicou deliberadamente um conteúdo, precisamos de evidências sobre aquele caso.",
        "Em **21 de agosto de 2026**, o Comitê Gestor da Internet no Brasil aprovou diretrizes recomendando mais transparência sobre moderação, recomendação e monetização de conteúdos. A UNESCO também publicou, em 2023, orientações internacionais de governança das plataformas voltadas à liberdade de expressão e ao acesso à informação.",
      ],
      references: [
        {
          label: "CGI.br — Diretrizes para Regulação de Plataformas de Redes Sociais (Resolução 2026/082)",
          url: "https://www.cgi.br/resolucoes/documento/2026/082/",
        },
        {
          label: "UNESCO — Guidelines for the Governance of Digital Platforms (2023)",
          url: "https://www.unesco.org/en/articles/guidelines-governance-digital-platforms",
        },
      ],
    },
    {
      title: "Quem controla as plataformas?",
      paragraphs: [
        "Outra pergunta faz parte dessa conversa: muitas das principais plataformas usadas no Brasil são controladas por empresas sediadas no exterior. Isso levanta questões sobre **soberania digital, transparência, proteção de direitos e participação dos brasileiros nas regras que afetam sua comunicação**.",
        "Não basta defender que uma informação circule. Também precisamos compreender quem administra os caminhos pelos quais ela circula e como essas decisões podem ser acompanhadas e questionadas.",
      ],
      references: [
        {
          label: "CGI.br — Diretrizes sobre soberania, transparência e direitos nas plataformas (2026)",
          url: "https://www.cgi.br/resolucoes/documento/2026/082/",
        },
      ],
    },
    {
      title: "Então, qual é o papel do Fora da Pauta?",
      paragraphs: [
        "O Fora da Pauta nasce para **aproximar as pessoas de informações e análises que ajudam a compreender as decisões políticas e a maneira como elas são comunicadas**.",
        "Não pretendemos competir com os grandes jornais, nem fingir que temos todas as respostas. Vamos procurar documentos, fontes originais, estudos e análises de comunicadores e especialistas. E mostrar de onde veio cada informação importante.",
        "Quando apresentarmos a interpretação de um analista, diremos de quem é. Quando houver uma afirmação que ainda precisa ser comprovada, deixaremos isso claro. **Fatos, opiniões e alegações não são a mesma coisa.**",
        "Também vamos observar a cobertura da mídia e o papel das plataformas digitais: o que recebe destaque, o que fica de fora e quais explicações podem ajudar a compreender essas diferenças.",
      ],
    },
    {
      title: "Uma ponte entre a informação e o entendimento",
      paragraphs: [
        "Imagine duas pessoas conversando. Uma delas encontrou informações que a outra ainda não teve oportunidade de conhecer. Em vez de impor sua opinião, compartilha as fontes, explica o que entendeu, escuta dúvidas e abre espaço para novas perguntas.",
        "**É essa relação que queremos construir.** Sem falar de cima para baixo. Sem tratar ninguém como incapaz. E sem pedir que você aceite uma conclusão só porque alguém a afirmou.",
        "O Fora da Pauta não existe para pensar por você. Existe para ajudar você a encontrar elementos para **pensar por si mesmo**.",
        "Nosso site será um lugar para consultar os artigos e suas fontes. Pelo Telegram, você poderá receber avisos das novas edições. É uma forma de construir um vínculo mais direto, embora ainda dependamos das regras dessa plataforma.",
      ],
    },
    {
      title: "Nosso compromisso",
      paragraphs: [
        "Vamos perguntar, pesquisar, comparar e explicar. Quando houver diferenças entre fontes, vamos mostrá-las. Quando errarmos, vamos corrigir. E você sempre poderá consultar as referências para formar sua própria avaliação.",
        "**Conhecer é importante. Entender é fundamental.**",
        "**FORA DA PAUTA — HÁ MAIS PARA ENTENDER.**",
      ],
    },
  ],
};
