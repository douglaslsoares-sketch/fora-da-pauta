# Porta de publicação — Fora da Pauta

**Estado em 26/10/2026: NÃO AUTORIZADO PARA DIVULGAÇÃO.**

A aprovação de layout ou uma execução verde de testes unitários
não comprovam que o serviço efetivamente acompanha pessoas.

## Testes mínimos para autorizar divulgação

1. **Identificação:** confirmar a pessoa exata com ID eleitoral/institucional e
   nome público, sem classificar homônimos como uma mesma pessoa.
2. **Atualização contínua:** executar a coleta de atos oficiais ao menos
   duas vezes, em momentos diferentes, confirmando que os dados novos
   chegam às fichas e que os antigos não são repetidos.
3. **Notícias e declarações:** testar leitura real e monitoramento de fontes;
   menções não verificadas são apenas dados internos, não fatos atribuídos.
   Entrevistas e cortes precisam de fonte original, data e contexto.
4. **Resenha:** gerar texto curto e texto de ficha a partir da mesma evidência,
   conferindo que cada afirmação relevante corresponde a registro documentado.
   Falhas ou alegações ambíguas não podem virar conclusão sobre intenção,
   culpa, apoio, realização ou voto.
5. **Telegram:** usar uma pessoa de teste com seu Telegram habitual, confirmar
   inscrição, seleção opcional de representantes, entrega da notificação
   sobre um evento real, link para a ficha e comando de cancelamento.
6. **Sem duplicações:** repetir coleta e envio; nenhuma notícia antiga pode
   ser reenviada como nova. Em falha de comunicação, preservar o estado
   incerto e evitar repetição não controlada.
7. **Integridade:** verificar dashboard/log dos coletores, erros reais de rede,
   datas de última execução e recuperação de falhas, inclusive Câmara e CLDF.
8. **Publicação:** aprovar visual em computador/celular e deploy de
   validação isolado; promover domínio apenas depois do aceite dos
   testes anteriores.

## Evidências atualmente disponíveis

- O fluxo de avisos do Telegram já existe, mas uma execução com zero
  avisos enviados não comprova entrega ponta a ponta.
- A coleta de Câmara tem workflow; houve interrupção de arquivo CSV
  em 26/10/2026. A proposta de correção está na PR #40.
- O monitor de menções institucionais desta PR roda em teste com
  RSS/Atom de fontes públicas, tem critério conservador de nomes
  e não escreve em fichas nem notifica assinantes.
- A geração de resenhas por IA está isolada na PR #38 como
  rascunho sem permissão de publicação.
- O novo layout da home está na PR #39, sem publicação oficial.

A autorização de divulgação exige **evidência de funcionamento real**,
não apenas existência de código. Não unir PRs nem promover produção
enquanto houver requisito crítico sem comprovação.

## Verificação da branch de integração — 26/10/2026

Branch: `feature/integracao-fichas-resenhas-telegram-20261026`

**Concluídos em teste automatizado:**
- 7 workflows de integração, interface, monitor, resenhas e coleta aprovados na PR #42;
- encadeamento real dos módulos de preparação editorial, fila simulada e Telegram falso, com duas entregas de teste e sem mensagens duplicadas;
- consulta real a três feeds institucionais em PR #41: 30 notícias e 3 menções preliminares, sem publicação nas fichas;
- tratamento de download interrompido da Câmara preparado e testado, mas ainda não incorporado à coleta oficial.

**Bloqueadores que permanecem:**
- monitor de notícias deliberadamente desativado até homologação editorial e ativação controlada;
- notícia/entrevista/vídeo não se torna automaticamente registro documental verificado na ficha;
- produção de resenha pela IA ainda em modo de rascunho sem validação factual automática;
- nenhuma comprovação de uma nova publicação de evento para ficha e notificação no Telegram REAL de uma pessoa inscrita;
- nenhuma homologação ponta a ponta do ciclo recorrente da coleta da Câmara após a correção;
- falta conferir integrações, versões e o domínio de validação antes de promover.

**Decisão de release: BLOQUEADO.** Não interpretar aprovação de testes simulados como autorização para divulgação.

## Validação adicional — compilação integral e continuidade de coleta

- A compilação Next.js de toda a aplicação passou em GitHub Actions na
  execução 40351058283, utilizando URL fictícia inacessível do PostgreSQL
  apenas para carregar os módulos durante o build. **Não houve consulta
  nem teste com banco real.**
- O novo teste do monitor executa duas coletas consecutivas com três
  respostas institucionais simuladas. Verifica idempotência, data de
  última verificação e preservação dos arquivos quando uma fonte falha.
- A consulta real dos feeds foi demonstrada separadamente, mas o agendamento
  de coleta continua desativado para produção.
- A rota de Telegram já possui testes de fila simulada; ainda falta um
  recebimento **real** por uma pessoa de teste, com inscrição e
  cancelamento verificados.
- O sistema de menções não faz extração factual confiável de entrevistas,
  vídeos ou falas. Não está pronto para atribuí-las como posicionamentos.

**A liberação pública permanece bloqueada.** Compilação e simulação
não substituem verificação com fonte nova e assinante real.

## Inscrição geral para edições — validação preparatória

- A rota autenticada de processamento da fila passou a preparar, na mesma
  inscrição Telegram, os avisos da categoria `edicoes`.
- O catálogo `data/edicoes/avisos-aprovados.ts` permanece **vazio**.
  Uma página na home, uma data em `campaigns` ou um rascunho de IA
  não autorizam aviso.
- Uma edição precisa de publicação explicitamente aprovada, data com fuso,
  endereço correto e fonte HTTPS original. Mensagens futuras ficam bloqueadas.
- O registro na fila deve conferir `created_at` e `updated_at` da
  preferência, e o processamento confirma o estado ativo no momento de enviar.
- Testes simulados verificam assinante anterior versus posterior à publicação,
  cancelamento, deduplicação e primeira execução com catálogo vazio.
- **Não ativar a primeira edição** até confirmar conteúdo final, áudio,
  fontes, página pública e recebimento no Telegram real de uma pessoa de teste.

A aprovação automática de edições, notícias ou denúncias **não** foi habilitada.
A divulgação continua bloqueada até os requisitos de campo serem atendidos.
