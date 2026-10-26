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
