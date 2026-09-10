# Leitura em Áudio dos Conteúdos

## Finalidade

A leitura em áudio é uma funcionalidade global de acessibilidade e
acompanhamento dos conteúdos editoriais do Fora da Pauta.

Ela não pertence a uma página ou campanha específica.

Deve constituir uma capacidade comum da estrutura do projeto.

---

## Regra geral

> **Todo conteúdo editorial textual do Fora da Pauta deve, sempre que
> tecnicamente possível, oferecer leitura em áudio sincronizada com o
> texto, preservando ao mesmo tempo a possibilidade de leitura convencional.**

A implementação deve ser global e reutilizável.

Novas páginas editoriais devem nascer compatíveis com essa
funcionalidade sem exigir uma implementação independente para cada
edição.

---

## Escopo

A funcionalidade deve ser disponibilizada, entre outros, em:

- edições do Fora da Pauta;
- matérias e artigos;
- explicações temáticas;
- Ficha do Candidato;
- biografias;
- históricos;
- cronologias;
- posicionamentos acompanhados de texto explicativo;
- Linha Editorial;
- documentos metodológicos apresentados ao público;
- demais conteúdos editoriais textuais.

---

## O que deve ser narrado

A leitura deve abranger o conteúdo editorial propriamente dito.

Isso inclui, conforme a página:

- títulos;
- subtítulos;
- introduções;
- parágrafos;
- explicações;
- citações;
- itens textuais;
- contextualizações;
- notas editoriais;
- informações documentais que integrem o conteúdo apresentado.

---

## O que não precisa ser narrado

Elementos puramente funcionais da interface não fazem parte,
por padrão, da leitura editorial.

Exemplos:

- menus;
- botões;
- filtros;
- campos de busca;
- controles do player;
- comandos de navegação;
- elementos decorativos;
- textos técnicos destinados exclusivamente à interface.

Isso evita transformar a leitura de uma matéria em uma narração
da interface do site.

---

## Sincronização com o texto

A leitura em áudio deve ser acompanhada visualmente no próprio texto.

Enquanto determinado trecho estiver sendo narrado, esse trecho deve
receber identificação visual temporária.

O destaque deve:

- acompanhar o avanço da narração;
- utilizar a identidade visual do Fora da Pauta;
- ser perceptível sem prejudicar a legibilidade;
- desaparecer ou avançar quando a leitura prosseguir.

O amarelo oficial `#FFC400` poderá ser utilizado como elemento de
identificação, respeitando contraste e legibilidade.

A sincronização deve ocorrer preferencialmente por blocos semânticos,
como parágrafos, itens ou trechos equivalentes, evitando destaques
excessivamente fragmentados.

---

## Controles mínimos

A experiência de leitura deve oferecer, sempre que tecnicamente
possível:

- iniciar;
- pausar;
- continuar;
- encerrar;
- avançar para o próximo trecho;
- voltar ao trecho anterior;
- visualizar o progresso;
- controlar a velocidade da reprodução.

A reprodução nunca deve começar automaticamente.

A decisão de ouvir pertence ao usuário.

---

## Miniplayer

Depois que a reprodução for iniciada, os controles essenciais devem
permanecer acessíveis enquanto a pessoa percorre a página.

Preferencialmente, deverá existir um miniplayer discreto e persistente,
sem impedir a leitura do conteúdo.

O miniplayer poderá exibir:

- reproduzir ou pausar;
- título do conteúdo;
- progresso;
- trecho anterior;
- próximo trecho;
- velocidade;
- encerramento da reprodução.

---

## Linha Editorial em modal

Quando a Linha Editorial for aberta a partir de uma edição ou de outra
página, a pessoa não deve ser obrigada a abandonar o conteúdo que
estava consultando.

O acesso deverá ocorrer preferencialmente em modal ou camada equivalente.

O modal deve permitir:

- leitura do resumo dos princípios editoriais;
- acesso ao texto completo;
- leitura em áudio;
- acompanhamento sincronizado do texto;
- fechamento simples;
- retorno ao mesmo ponto da página anterior.

Fechar o modal não deve reiniciar a página nem deslocar
desnecessariamente a posição de leitura do usuário.

---

## Continuidade da leitura

Sempre que tecnicamente possível, ações normais de navegação dentro do
conteúdo não devem interromper desnecessariamente a experiência.

Ao pausar e continuar, a leitura deve retomar do ponto correspondente.

Ao fechar definitivamente a reprodução, o destaque sincronizado deve
ser removido.

---

## Fidelidade ao conteúdo

O áudio deve corresponder ao texto editorial apresentado.

A funcionalidade de leitura não deve:

- resumir silenciosamente;
- acrescentar interpretações;
- alterar o sentido;
- inserir opinião;
- omitir trechos editoriais sem indicação;
- transformar uma afirmação documental em comentário.

Texto e áudio são duas formas de acesso ao mesmo conteúdo.

---

## Atualizações do texto

Quando um conteúdo for corrigido ou atualizado, a leitura em áudio deve
utilizar a versão atual do texto.

Não devem existir versões editoriais independentes de texto e áudio que
possam divergir entre si.

Sempre que possível, o áudio deve ser produzido a partir da mesma fonte
textual utilizada para renderizar a página.

---

## Acessibilidade

Os controles devem possuir identificação compreensível para tecnologias
assistivas.

A funcionalidade deve respeitar:

- navegação por teclado;
- foco visível;
- identificação de controles;
- contraste;
- legibilidade;
- preferência do usuário;
- ausência de reprodução automática.

A leitura em áudio complementa outras medidas de acessibilidade e não
as substitui.

---

## Arquitetura

A funcionalidade deve ser implementada por meio de componentes globais
e reutilizáveis.

Conceitualmente:

CONTEÚDO EDITORIAL
        │
        ▼
ESTRUTURA DE LEITURA
        │
        ├── texto original
        ├── divisão em trechos
        ├── reprodução de áudio
        ├── sincronização
        ├── estado da reprodução
        └── controles
                │
        ┌───────┼────────┐
        ▼       ▼        ▼
     Edições   Fichas   Linha Editorial
        │
        └──────── demais conteúdos

A funcionalidade não deve ser recriada individualmente em cada página.

---

## Regra para novos conteúdos

Todo novo componente ou template destinado à apresentação de conteúdo
editorial textual deve ser concebido de forma compatível com o sistema
global de leitura em áudio.

Assim, a leitura por áudio passa a ser requisito estrutural do projeto,
e não um recurso acrescentado posteriormente página por página.

---

## Princípio

> **O texto permanece sendo o registro editorial principal. O áudio é
> outra forma de acesso ao mesmo conteúdo.**

> **Quem prefere ler, lê. Quem prefere ouvir, ouve. Quem deseja acompanhar
> os dois, pode fazê-los simultaneamente.**

