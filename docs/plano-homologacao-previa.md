# Plano de homologação integral — Fora da Pauta

**Estado:** preparação; não autoriza publicação, campanha, merge ou envios reais.

## Regra de lançamento
Campanha e publicação das alterações dependem de prévia navegável, testes completos e aprovação explícita do responsável. Uma verificação automática bem-sucedida não substitui a experiência real do usuário.

## Condição principal: conteúdo confiável e cobertura comprovada

A navegação é requisito necessário, **mas não suficiente**. A autorização de lançamento exige auditoria do back-end, dos processos de coleta e do conteúdo que o público realmente encontrará.

- [ ] Definir campos obrigatórios e critérios de suficiência para cada tipo de ficha (identificação, cargos, eleições, atuação, votações, projetos, declarações, histórico, fontes e datas).
- [ ] Medir a cobertura real de todas as pessoas pesquisáveis: total de fichas, campos preenchidos, dados verificados, lacunas, desatualizações e identidades em revisão. Não confundir presença de um campo com veracidade.
- [ ] Conferir amostras diretamente nas fontes primárias e investigar inconsistências; executar testes de regressão para vínculos entre pessoas, candidaturas e IDs oficiais.
- [ ] Demonstrar que a coleta e a atualização realmente funcionam em execução controlada, com registros de sucesso, falhas, abrangência e data da última consulta.
- [ ] Impedir publicação de atribuições incertas ou não comprovadas. Distinguir claramente dado ausente, dado não divulgado e falha de coleta; nunca inventar preenchimento.
- [ ] Auditar também edições, entregas do governo, atividades do presidente e demais conteúdos: fonte, contexto, data, atribuição e correções.
- [ ] Validar a experiência real de busca por pessoas diferentes, inclusive casos difíceis e pouco conhecidos, para verificar se a ficha responde ao que o leitor precisa.
- [ ] Publicar somente quando a cobertura exigida estiver demonstrada e o responsável aprovar explicitamente. Caso a cobertura integral não seja viável, apresentar relatório das lacunas e solicitar decisão; nunca presumir aprovação.

## Condições para liberar a prévia
- [ ] URL isolada da produção, apontando para a versão de testes; verificar qual commit está implantado.
- [ ] Compilação, testes automatizados e navegação sem erros graves.
- [ ] Conferir segredos, banco e integração Telegram: testes não podem enviar notificações reais nem alterar dados de produção sem autorização.
- [ ] Resolver ou isolar as 24 ligações da Câmara com identidades inexistentes; não atribuir autoria ao cadastro errado.
- [ ] Investigar falha do backup diário e comprovar restauração antes de qualquer mudança sensível.
- [ ] Validar acessibilidade básica e celular.

## Roteiro guiado de teste com o responsável
- [ ] Primeiro visitante: home, artigo permanente, ouvir, compartilhar pelo WhatsApp, Quero conhecer, inscrição no Telegram, retorno à segunda parte da home, opções.
- [ ] Visitante já inscrito: acesso direto às opções, sem convite redundante; voltar ao início, compartilhar e navegar.
- [ ] Telegram: mensagens, links, botões e retorno; usar ambiente de teste para evitar disparos públicos.
- [ ] Acompanhar pessoas: busca, seleção, ver minhas escolhas, ficha, histórico, fechar ficha, voltar.
- [ ] Fichas: dados, concordância, fontes, ausência de mistura de identidades, visual no celular.
- [ ] Edições e colunas: abrir, ouvir narração, compartilhar, histórico e retorno.
- [ ] Entregas do governo e O dia do Presidente: verificar páginas e histórico conforme escopo implementado.
- [ ] Agenda presidencial de amanhã: simular mensagem da véspera, data, fonte e atualizações, sem ativar envio.
- [ ] Camiseta e loja: imagens, logo, botões, navegação e rastreio (sem compra real involuntária).
- [ ] Layout: olho/logo, cabeçalhos, botões, contraste, rolagem, instalação PWA e comportamento em tela pequena.
- [ ] Repetir teste em celular e computador; registrar cada falha, corrigir e testar novamente.

## Critério de aprovação
O responsável percorre o roteiro, confirma os resultados e autoriza separadamente: (1) publicação do site e (2) início da campanha. Até lá, ambos bloqueados.
