# Auditoria pré-publicação — fichas, varredura e históricos

Status: diagnóstico inicial do código; **não é comprovação de execução em produção**.

## Princípios obrigatórios
- Ponte entre informação e entendimento; resenha informativa, sem opinião institucional.
- Não atribuir relevância ou irrelevância em nome do leitor.
- Preservar versões, declarações, análises e fontes com atribuição clara; distinguir documento, alegação, opinião e desdobramento.
- Realizar varredura **diária** das fontes públicas cadastradas, com relatório de execução e indicação explícita das fontes ainda não cobertas.
- Não anunciar cobertura universal: fontes inacessíveis ou ainda não integradas devem constar como lacunas.

## Evidências verificadas no repositório principal
1. `docs/metodologia/matriz-ficha-candidato.md`: oito eixos documentais, ficha viva, cronologia e proibição de classificar atualizações como relevantes/irrelevantes.
2. `.github/workflows/atualizar-atuacao-camara.yml`: agendamento a cada quatro horas; depende de execução bem-sucedida e dados coletados.
3. `.github/workflows/atualizar-atuacao-cldf.yml`: agendamento a cada quatro horas, condicionado a `CLDF_ATUALIZACAO_ATIVADA`.
4. `.github/workflows/processar-avisos-telegram.yml`: agendamento de avisos a cada 15 minutos, condicionado a `TELEGRAM_AVISOS_ATIVADOS`.
5. `lib/telegram/coletar-novidades.ts`: coleta novidades a partir de dados locais de atuação e dossiês; processa até dez candidaturas por execução. Não implementa, por si, pesquisa diária em imprensa, redes e todas as fontes oficiais.
6. `app/historico/[id]/page.tsx`: mostra votações e proposições; ainda não agrega toda a cronologia dos dossiês.

## Lacunas a resolver antes da aprovação final
- Inventário versionado de fontes, abrangendo Executivo, Legislativo, Judiciário nos níveis disponíveis, diários oficiais, imprensa tradicional/alternativa, rádio, televisão, portais, redes e especialistas.
- Conectores por fonte com limites de acesso documentados; captura de URL, autor, data de publicação, data de consulta, conteúdo/trecho permitido, tipo de registro e pessoa/tema associado.
- Relatório diário verificável: fontes esperadas, consultadas, com sucesso, falhas, sem novidades e não cobertas; alertas de atraso e reprocessamento.
- Deduplicação sem apagar versões independentes; histórico de correções e desdobramentos.
- Ampliação da página de histórico para os oito eixos, preservando documentos, alegações, respostas, fontes e datas.
- Auditoria da cobertura real de fichas: campos ausentes devem aparecer como 'ainda não documentado', nunca como dados inventados.
- Testes de ponta a ponta em prévia isolada: visitante novo, inscrito, ficha, histórico, pergunta por texto/voz, revisão editorial, notificações personalizadas e publicação geral aprovada.
- Validar que nenhum teste envie avisos reais não autorizados e que o site oficial não seja alterado antes da aprovação.

## Critério de aceite
Não considerar concluído até existirem relatórios reais de pelo menos uma execução diária completa sobre as fontes cadastradas, testes automatizados e testes manuais da experiência, com lacunas declaradas. Cobertura deve ser ampliada continuamente sem filtragem por conveniência.

## Evidência de coleta real — 05/11/2026

- GitHub Actions: https://github.com/douglaslsoares-sketch/fora-da-pauta/actions/runs/42093905049
- Execução concluída com sucesso; teste local, consulta real à API e envio do artefato concluídos.
- Log da consulta: `modo=consulta-api`, `status=sucesso`, `quantidade=100`, `inicio=2026-11-05T19:26:40.575Z`, `fim=2026-11-05T19:26:42.371Z`.
- Artefato de resultados: `coleta-camara-42093905049`, ID `13446051860` (retido por 30 dias).
- Limite: apenas uma amostra de 100 proposições da API, sem identificação de autoria nesta etapa; **não alimentar automaticamente fichas de políticos sem vínculo documental verificado**.
- Ainda não há prova de coleta diária abrangente nem de integração com históricos.

## Evidência de autoria — 05/11/2026

- Execução: https://github.com/douglaslsoares-sketch/fora-da-pauta/actions/runs/42109339197
- API da Câmara: 100 proposições consultadas com sucesso.
- Autoria: 20 consultas realizadas, 20 respostas processadas com sucesso, 0 falhas, conforme log da execução.
- Artefato: `verificacao-autorias-42109339197`, ID `13452599268`.
- **Limite:** êxito da consulta não significa que todos os registros contenham deputados identificáveis nem que já exista vínculo com as fichas do Fora da Pauta. Nenhum vínculo foi publicado automaticamente.

## Diagnóstico de vínculos de autoria — 05/11/2026

- Execução real: https://github.com/douglaslsoares-sketch/fora-da-pauta/actions/runs/42111607202
- 20 consultas de autoria bem-sucedidas; 20 registros de autoria; 11 deputados distintos identificados por ID oficial.
- 0 vínculos encontrados na tabela `vinculos-camara-identidades.json` para a amostra; todos os 20 registros de autoria ficaram sem correspondência.
- IDs distintos sem correspondência na amostra: 153423, 220573, 204472, 220623, 220559, 204534, 220557, 204372, 220687, 88256, 220560.
- **Não concluir que os deputados não existem no banco de identidades.** É necessário verificar se a tabela de vínculos está incompleta ou desatualizada, e confirmar a correspondência com registros de identidade antes de adicionar qualquer vínculo.
- Nenhuma alteração foi feita nos vínculos existentes nem nas fichas públicas.

### Identidade de Duda Salabert — conferência documental (05/11/2026)

- Câmara: deputada ID `220623`, nome civil `DUDA SALABERT ROSA` (https://www.camara.leg.br/deputados/220623).
- Candidatura 2022: TSE `130001606697`, identidade local `politico-53f9882aecdfb406ce4b8511c428289e`, em revisão.
- Candidatura 2026: TSE `130002539728`, identidade local `politico-d0c14890e50d932c5bd6592b2230606e`, em revisão.
- Vínculo atual da Câmara aponta para `politico-2233b5e6baf14e12a6079c35741ac73e`, ausente do cadastro de identidades.
- A continuidade das candidaturas é corroborada por fontes eleitorais públicas; **não alterar automaticamente os identificadores existentes** até avaliar outras referências internas, dependências e testes de regressão.
- Execução local de auditoria: https://github.com/douglaslsoares-sketch/fora-da-pauta/actions/runs/42119233292.
- Pendência: decidir identidade canônica com migração auditável, preservando histórico de 2022 e 2026; nenhuma mudança em produção.

### Auditoria geral de integridade dos vínculos da Câmara — 05/11/2026

- Execução: https://github.com/douglaslsoares-sketch/fora-da-pauta/actions/runs/42131462865
- Foram examinados **566 vínculos**: **24 apontam para identidades ausentes** no cadastro atual; **nenhum ID da Câmara aparece duplicado**.
- A execução foi sinalizada como falha de propósito pelo verificador, pois detectou inconsistências; não é falha de coleta ou de execução do script.
- Duda Salabert (Câmara `220623`) está entre os 24. Existem candidaturas de 2022 e 2026 em duas identidades separadas, ambas `EM_REVISAO`.
- **Bloqueio de publicação**: não associar automaticamente atividades parlamentares a identidades inexistentes ou candidaturas em revisão; exigir reconciliação documentada e testes.
