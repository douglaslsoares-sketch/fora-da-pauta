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
