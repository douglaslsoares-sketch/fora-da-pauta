# Renato Freitas — primeira apuração editorial (RASCUNHO, NÃO PUBLICAR)

**Preparado em:** 16/10/2026  
**Estado:** pesquisa para revisão editorial. **Nenhum dado deste documento é publicado automaticamente no site e nenhuma notificação é autorizada.**

## Identidade eleitoral que deve ser vinculada ao acompanhamento

- Nome eleitoral: **Renato Freitas**; nome completo: **Renato de Almeida Freitas Junior**.
- Eleição 2026: candidato a **deputado federal no Paraná**, partido **PT**, número **1333**.
- Arquivos de apuração eleitoral reproduzidos por serviços baseados no TSE indicam **115.227 votos** e situação **eleito por quociente partidário (QP)**.
- Identificador de candidatura **160002536522** **confirmado diretamente** em `data/eleicoes/gerado/candidaturas-2026.json` na `main` do Fora da Pauta, entre **19.655** candidaturas. O registro confere nome, PT, nº **1333**, cargo **deputado-federal** e UF **PR**. A base interna preserva estado eleitoral antigo (`situacao: nao-informada`, `situacaoTse: #NE`, extração de 17/08/2026), portanto **não serve para confirmar o resultado de outubro**. Antes de notificações, ainda falta conferir que os acompanhamentos específicos do bot usam o MESMO `candidatura_id` em produção. Não foi consultado banco privado.

Fontes da identificação:
- https://www1.folha.uol.com.br/poder/eleicoes/candidatos/2026/pr/deputado-federal/renato-freitas-160002536522.shtml
- https://www.analistas.com.br/eleicoes/2026/pr/deputado-federal/renato-freitas-160002536522
- https://www.assembleia.pr.leg.br/deputados/perfil/renato-freitas (biografia institucional, com conteúdo sob responsabilidade da assessoria do deputado).

## Primeira informação documentada para a ficha

**Título proposto:** Comissão de Cultura aprova projeto de Renato Freitas sobre o Sarau Periférico.

**Fato, em 08/06/2026:** a Comissão de Cultura da Assembleia Legislativa do Paraná aprovou, entre outros, o **Projeto de Lei nº 23/2026**, de autoria de Renato Freitas (PT), relacionado à inclusão do Sarau Periférico em calendário oficial de eventos. Segundo a notícia institucional da Assembleia, o Sarau é relacionado ao Mês da Consciência Negra, realizado no mês de novembro na região de Curitiba.

**Registro anterior, em 05/05/2026:** o extrato da ata da 10ª reunião ordinária da Comissão de Constituição e Justiça (item 38) atribui o PL nº 23/2026 a Renato Freitas e registra parecer favorável aprovado por unanimidade.

**Status comprovado com os documentos abaixo:** aprovação em duas comissões. **Não há, nas fontes consultadas para esta minuta, comprovação de aprovação definitiva em plenário, sanção ou transformação em lei.** Não escrever «virou lei», «criou o calendário» ou equivalente.

### Fonte oficial — Comissão de Cultura

Assembleia Legislativa do Paraná, Diretoria de Comunicação, notícia de 08/06/2026 intitulada «Comissão de Cultura aprova projetos que valorizam o montanhismo e promovem o turismo seguro nas trilhas paranaenses».

https://www.assembleia.pr.leg.br/comunicacao/noticias/comissao-cultura-aprova-projetos-valorizam-montanhismo-promo

### Fonte oficial — CCJ

Assembleia Legislativa do Paraná, *Extrato da ata da 10ª reunião ordinária da CCJ, de 05/05/2026*, item 38, PL 23/2026.

https://storage.assembleia.pr.leg.br/ccj/1778008823_0_EXTRATO%20DA%2010%C2%AA%20REUNI%C3%83O%20ORDIN%C3%81RIA%20%28Resultado%20da%20Sess%C3%A3o%29.pdf

### Ponto de divergência documental a esclarecer antes da publicação

O extrato da CCJ descreve a inclusão do Sarau Periférico no calendário **do município de Curitiba**, enquanto a notícia da Comissão de Cultura o enquadra entre propostas de inclusão no calendário **do Estado do Paraná**. Não substituir essas versões por uma certeza não demonstrada. Consultar a íntegra atualizada do PL 23/2026 e sua tramitação para esclarecer a redação e o âmbito da proposta.

**Outro projeto distinto:** há matéria na Câmara Municipal de Curitiba sobre iniciativa de autoria de Giorgia Prates, Angelo Vanhoni e Professora Angela, também relativa ao Sarau Periférico. Não confundir a proposta municipal com o PL 23/2026 da Alep.

https://legado.curitiba.pr.leg.br/informacao/noticias/comissao-de-educacao-e-contraria-ao-projeto-que-oficializa-o-sarau-periferico

## Sugestão de dados para futura ficha (somente após revisão)

- `candidaturaId`: **160002536522**, confirmado com base pública do projeto; **vínculo com assinaturas do bot ainda não verificado**.
- `evento.id`: `2026-06-08-pl23-sarau-periferico-comissao-cultura`
- `evento.data.inicio`: `2026-06-08`
- `evento.data.rotulo`: `8 de junho de 2026`
- `evento.titulo`: `Comissão de Cultura aprova projeto de Renato Freitas sobre Sarau Periférico`
- `evento.resumo`: `Em 8 de junho de 2026, a Comissão de Cultura da Assembleia Legislativa do Paraná aprovou o Projeto de Lei nº 23/2026, apresentado pelo deputado Renato Freitas, relacionado à inclusão do Sarau Periférico em calendário oficial de eventos. O projeto havia recebido parecer favorável na CCJ em 5 de maio. Os documentos consultados não confirmam a sanção da proposta.`
- `evento.eixos`: `["exercicio-cargo", "linha-do-tempo", "fontes-atualizacoes"]`
- `evento.natureza`: `["documentado"]`
- `evento.fontes`: links oficiais da Comissão de Cultura e da ata da CCJ.
- **`avisoTelegram`: não definir.** A pesquisa não é a publicação. Se o registro vier a ser publicado, a marcação e a data editorial só poderão ser criadas em etapa deliberada, após conferir o estado final da matéria, publicar a ficha e calcular os destinatários elegíveis.

## Portões antes de publicar e enviar aviso

1. **ID confirmado no projeto: 160002536522.** Ainda confirmar, em consulta autorizada e somente leitura, a correspondência com os acompanhamentos já existentes do Telegram; não extrapolar do nome na urna.
2. Conferir a íntegra e a tramitação mais recente do PL 23/2026, inclusive eventual votação final, arquivamento ou sanção, e resolver/divulgar a divergência entre as duas fontes oficiais.
3. Revisar a precisão e a relevância da notícia histórica para o público, explicando a diferença entre **data do fato** e **data em que a ficha foi atualizada**.
4. Criar e revisar dossiê e fonte no projeto sem `avisoTelegram`; validar links da página.
5. Se houver decisão editorial favorável, executar uma prévia com número de destinatários; só então aprovar marcação para aviso e publicar de modo controlado.

*Esta pesquisa não constitui publicação no site, não gera notificações e não autoriza enviar mensagens a qualquer usuário.*

## Revisão complementar — 16/10/2026

**Identidade eleitoral:** conferida diretamente na base de candidaturas presente na `main` (19.655 registros). A candidatura de Renato Freitas aparece uma única vez, ID `160002536522`, nome completo RENATO DE ALMEIDA FREITAS JUNIOR, cargo deputado federal, PT, número 1333, PR. A associação exata com a tabela de acompanhamentos do Telegram não foi testada (sem conexão ao banco de produção).

**Eleição:** consulta externa que reproduz os arquivos de totalização do TSE registra 115.227 votos e situação 'Eleito por QP' no primeiro turno de 04/10/2026. Fonte: https://www.analistas.com.br/eleicoes/2026/pr/deputado-federal/renato-freitas-160002536522. Tratar como *resultado eleitoral reportado por base secundária*, até confirmação direta do arquivo oficial do TSE.

**PL 23/2026:** foram confirmadas documentalmente a aprovação do parecer na CCJ (05/05/2026) e a aprovação em Comissão de Cultura (08/06/2026), mas **a tramitação mais recente e a íntegra da proposição não puderam ser obtidas na pesquisa legislativa da Alep**. A plataforma de consulta abre uma aplicação JavaScript com erro no acesso disponibilizado. A divergência entre 'calendário do município' e 'calendário do estado' permanece.

**Não confundir com a proposta municipal da Câmara de Curitiba:** número 005.00005.2026, autoria de Giorgia Prates, com coautoria de Angelo Vanhoni e Professora Angela, que teve parecer contrário em comissão municipal. Fonte oficial: https://legado.curitiba.pr.leg.br/informacao/noticias/comissao-de-educacao-e-contraria-ao-projeto-que-oficializa-o-sarau-periferico

### Texto editorial sugerido — assunto histórico, não alerta automático

**Título:** Projeto de Renato Freitas sobre Sarau Periférico avança em duas comissões da Assembleia do Paraná.

**Resumo:** Em 5 de maio de 2026, a Comissão de Constituição e Justiça da Assembleia Legislativa do Paraná aprovou parecer favorável ao Projeto de Lei 23/2026, de autoria de Renato Freitas. Em 8 de junho, a Comissão de Cultura também aprovou a proposta, relacionada ao reconhecimento do Sarau Periférico, manifestação cultural realizada em novembro na região de Curitiba. Nos documentos disponíveis para esta checagem, não foi possível confirmar se a matéria passou pelo plenário ou se virou lei. As fontes da própria Assembleia divergem sobre o calendário municipal ou estadual referido na descrição do projeto.

**Avaliação de relevância:** trata-se de **registro histórico** já ocorrido em junho, não de novidade legislativa verificada em outubro. **Não marcar `avisoTelegram` apenas porque o registro passou a constar da ficha agora.** Para o primeiro ensaio de notificações reais, escolher fato recente, material e verificado, com publicação editorial e destinatários aprovados separadamente.

**Situação:** APENAS RASCUNHO DE PESQUISA. Sem publicação, sem fila, sem Telegram.
