# Continuidade — Projeto Fora da Pauta

Atualizado em: 27/08/2026

Este arquivo existe para permitir a retomada do projeto mesmo que o histórico de uma conversa do ChatGPT não esteja disponível.

## Como retomar

Antes de qualquer alteração:

1. Abrir o projeto no VS Code.
2. Executar `git status --short`.
3. Executar `git log -3 --oneline`.
4. Confirmar que o repositório está limpo.
5. Ler este arquivo antes de continuar o desenvolvimento.

Projeto local:

`C:\Users\dougl\Documents\fora-da-pauta-enxuto\fora-da-pauta`

Repositório:

`https://github.com/douglaslsoares-sketch/fora-da-pauta.git`

Branch de produção:

`main`

Conta GitHub atual:

`douglaslsoares-sketch`

Não utilizar a conta antiga `naoeseuorg-maker`.

## Preferência operacional

As alterações no Fora da Pauta devem ser feitas por blocos PowerShell prontos para colar no terminal do VS Code.

Fluxo preferido:

- conferir estado do Git;
- validar os trechos esperados;
- criar backup quando houver alteração relevante;
- alterar por PowerShell, sem edição manual;
- executar as validações pertinentes;
- conferir `git diff --check`;
- conferir `git status --short`;
- somente depois registrar commit e fazer push.

Evitar arquivos ZIP de substituição.

## Estado geral do projeto

Stack:

- Next.js 16.2.6
- App Router
- TypeScript
- Tailwind
- GitHub
- Vercel

Rotas principais existentes:

- `/`
- `/campanhas/escala-6x1`
- `/campanhas/compare-os-dados`
- `/campanhas/[slug]/candidatos`
- `/eleicoes-2026`
- `/ler-depois`

Existe um aviso conhecido e não bloqueante do Next.js sobre dois `package-lock.json`:

- `C:\Users\dougl\package-lock.json`
- `C:\Users\dougl\Documents\fora-da-pauta-enxuto\fora-da-pauta\package-lock.json`

Esse aviso não deve ser confundido com falha de build.

---

# 1. Aplicativo Ler depois

Esta etapa está considerada concluída.

Entrada do aplicativo:

`https://www.foradapauta.org/ler-depois`

O domínio principal `foradapauta.org` continua sendo o domínio institucional do Fora da Pauta.

A PWA Ler depois está isolada em `/ler-depois`.

Manifest:

`public/ler-depois/manifest.webmanifest`

Configuração importante:

- `id`: `/ler-depois`
- `start_url`: `/ler-depois`
- `scope`: `/ler-depois`
- `display`: `standalone`

O aplicativo instalado no Android aparece como:

`Fora da Pauta`

Ícone:

`LER DEPOIS`

A tela instalada abre diretamente `/ler-depois` em modo standalone.

## Regra do botão Ler depois

O botão flutuante aparece somente na primeira visita a uma página comum.

Ao visitar a página pela primeira vez, ela já é registrada como visitada.

Se a pessoa sair sem salvar, o botão não volta a aparecer na segunda visita.

Em `/ler-depois`, o botão flutuante não aparece.

Se o aplicativo já estiver instalado, a confirmação de salvamento permanece aberta normalmente e não oferece nova instalação.

Commits relevantes:

- `06f6863` Mantem confirmacao do Ler depois aberta
- `5f53052` Isola aplicativo Ler depois em sua rota
- `2f029d6` Exibe Ler depois somente na primeira visita
- `367dc98` Oculta instalação quando Ler depois já está instalado
- `e17ff23` Reforça confirmação após instalar Ler depois
- `12f5d55` Orienta como localizar Ler depois após instalação

Não reabrir essa etapa sem uma nova necessidade.

---

# 2. Campanha Fim da escala 6x1

A narrativa da página foi reformulada em 27/08/2026.

Commit:

`d820fc2 Torna campanha 6x1 mais clara`

## Problema que motivou a mudança

Percebeu-se que muitas pessoas podem não compreender imediatamente a expressão "fim da escala 6x1".

A página agora explica primeiro, de forma concreta, a diferença entre os dois modelos.

## Comparação principal

Título:

`O que você prefere?`

6x1:

- 6 dias de trabalho
- 1 dia de folga

OU

5x2:

- 5 dias de trabalho
- 2 dias de folga
- COM O MESMO SALÁRIO

Resumo:

Um dia a menos de trabalho por semana e um dia a mais de folga, mantendo o salário.

## Estrutura atual dos cartões

1. O que está sendo proposto?
2. Por que há quem defenda a mudança?
3. Quais são as preocupações?
4. Evidências
5. Onde a proposta está agora?
6. Quem se posicionou sobre esta pauta?
7. Compartilhamento
8. Adquirir camiseta

A página inclui fontes clicáveis.

Foi criada a estrutura reutilizável:

`components/CampaignComparison.tsx`

A narrativa permanece em:

`data/campanhas.ts`

## Situação legislativa registrada na página

Na atualização de 27/08/2026:

- a Câmara aprovou a PEC 221/2019 em dois turnos em 27/05/2026;
- o texto aprovado prevê jornada máxima de 40 horas semanais em cinco dias;
- prevê dois dias de descanso;
- prevê ausência de redução salarial decorrente da mudança;
- a proposta segue em tramitação no Senado;
- encontra-se na CCJ;
- relator: senador Omar Aziz;
- a mudança ainda não está em vigor.

A página deve sempre distinguir proposta em tramitação de lei vigente.

---

# 3. Nova camiseta comparativa 6x1 × 5x2

A camiseta antiga da campanha continua existindo.

A nova arte é uma opção adicional na loja, não uma substituição.

Serão usados dois produtos na Montink:

- T-shirt
- Oversized

A Montink utiliza a mesma área de aplicação da arte nos dois modelos, portanto será usada a mesma escala gráfica.

## Texto definitivo da arte

O QUE VOCÊ PREFERE?

6x1

6 dias de trabalho  
1 dia de folga

OU

5x2

5 dias de trabalho  
2 dias de folga

COM O MESMO SALÁRIO

---

Veja quem defende essa mudança.

QR Code

## Decisões visuais

- `COM O MESMO SALÁRIO` sem aspas.
- Preferir essa formulação a `SEM REDUZIR SALÁRIO` na camiseta.
- O `OU` fica central e subordinado aos blocos 6x1 e 5x2.
- A frase final é `Veja quem defende essa mudança.`
- QR Code abaixo da chamada.
- Arte branca, tipografia preta, forte e limpa.
- A versão final foi considerada visualmente aprovada.

Na página explicativa pode ser usada a formulação tecnicamente mais precisa:

`sem redução de salário`

---

# 4. Reeleição dos candidatos

Etapa concluída e publicada em 27/08/2026.

Commit:

`38f51c9 Identifica candidatos em reeleicao`

## Definição adotada

`Reeleição` significa:

A pessoa ocupa atualmente o mesmo cargo que está disputando na eleição de 2026.

Não significa apenas que a pessoa já exerceu algum cargo político anteriormente.

## Não usar "Primeira candidatura"

Foi descartado usar `Primeira candidatura` como oposto de `Reeleição`.

Uma pessoa pode não concorrer à reeleição e ainda possuir longa trajetória política.

## Filtros disponíveis

- Todos
- Reeleição
- Não concorre à reeleição

Texto explicativo:

`Reeleição significa que a pessoa ocupa atualmente o mesmo cargo que está disputando em 2026.`

## Contagens validadas da campanha 6x1

Todos:

`345`

Reeleição:

`310`

Não concorre à reeleição:

`35`

## Regra técnica atual

A base de candidaturas de 2026 vem dos dados oficiais do TSE.

Arquivo:

`data/eleicoes/gerado/candidaturas-2026.json`

Ela informa o cargo disputado, mas não informa diretamente o mandato atual.

Foi criada uma camada separada:

`data/eleicoes/reeleicao.ts`

A classificação usa evidência de que a pessoa exercia mandato de deputado federal em 2026.

Para os posicionamentos gerados a partir da votação nominal da PEC 221/2019:

- se a pessoa votou como deputado federal e concorre novamente a deputado federal em 2026 → `Reeleição`;
- se votou como deputado federal e concorre a senador, governador, deputado estadual ou outro cargo → `Não concorre à reeleição`.

Também existem seis posicionamentos manuais validados.

Quatro possuem evidência de votação nominal da Câmara.

Gleisi Hoffmann e Pedro Lupion tiveram o mandato de deputado federal confirmado adicionalmente por fonte oficial da Câmara para o período 2023–2027.

## Comportamento dos filtros

Inicialmente, clicar em um filtro fazia a página voltar para o topo.

Isso foi corrigido.

Os links de filtro usam:

`scroll={false}`

Agora, ao alternar entre:

- Todos
- Reeleição
- Não concorre à reeleição

a página permanece na região da lista e apenas atualiza o resultado.

Esse comportamento foi testado no celular e aprovado.

---

# 5. Dados eleitorais e atualização

Arquivos principais:

`data/eleicoes/tipos.ts`

`data/eleicoes/candidaturas.ts`

`data/eleicoes/index.ts`

`data/eleicoes/reeleicao.ts`

`data/eleicoes/posicionamentos.ts`

`data/eleicoes/posicionamentos-pec221-gerados.ts`

`data/eleicoes/gerado/candidaturas-2026.json`

Scripts principais:

`scripts/atualizar-eleicoes.ps1`

`scripts/atualizar-tse-2026.ps1`

`scripts/baixar-candidaturas-tse.ps1`

`scripts/importar-candidaturas-2026.ps1`

`scripts/cruzar-pec221-candidaturas-2026.ps1`

`scripts/gerar-posicionamentos-pec221.ps1`

`scripts/auditar-eleicoes.ps1`

Comando existente no `package.json`:

`npm run eleicoes:atualizar`

A base de candidaturas utiliza dados oficiais do TSE.

Os votos da PEC 221 utilizam dados da Câmara dos Deputados.

---

# 6. Estado do Git ao final de 27/08/2026

Últimos commits importantes:

`38f51c9 Identifica candidatos em reeleicao`

`d820fc2 Torna campanha 6x1 mais clara`

Antes deste documento, `main` e `origin/main` estavam sincronizadas em:

`38f51c9`

O repositório estava limpo.

---

# 7. Próxima retomada

Não há correção pendente na funcionalidade de reeleição ou na nova narrativa da campanha 6x1.

Ao retomar, primeiro verificar se existe uma nova prioridade definida pelo usuário.

Se o trabalho continuar na parte eleitoral, manter os princípios:

- informação factual e documentada;
- fonte identificável;
- não inferir posição política apenas por partido ou ideologia;
- não classificar alguém como reeleição sem evidência do mandato atual;
- separar trajetória política, candidatura atual e posição sobre uma pauta;
- não recomendar diretamente em quem votar;
- permitir que o usuário consulte evidências e tire suas próprias conclusões.

---

# Regra de segurança deste documento

Este arquivo é um registro de continuidade.

Ele não substitui:

- o histórico do Git;
- os arquivos de código;
- os dados oficiais;
- as fontes citadas pelo projeto.

Quando houver divergência entre este documento e o código atualmente versionado, verificar primeiro o histórico do Git e os arquivos da versão mais recente.