# Inventário operacional da varredura diária

O arquivo `data/fontes/inventario-varredura.json` é o ponto de partida para cadastrar fontes e identificar lacunas. **Não comprova que cada fonte esteja sendo varrida.**

## Estados do cadastro

- `coleta-parcial-existente`: há rotina identificada, sem comprovação de cobertura completa ou execução recente.
- `coleta-parcial-condicional`: rotina identificada, dependente de configuração.
- `script-existente-sem-agendamento-diario-comprovado`: existe código, mas não há prova de execução diária.
- `nao-integrado`: fonte institucional cadastrada sem conector operacional identificado.
- `fontes-individuais-a-cadastrar`: categoria aberta; faltam veículos, perfis e URLs específicos.

## O que falta para cumprir a promessa

1. Transformar cada fonte cadastrada em conector real de consulta e armazenamento, preservando atribuição e direitos de acesso.
2. Registrar por fonte `ultima_tentativa`, `ultima_execucao_bem_sucedida`, `itens_encontrados`, `erro`, `janela_de_cobertura` e `url`.
3. Executar diariamente e gerar relatório verificável, com alertas para fontes atrasadas.
4. Não substituir a coleta por mera checagem de disponibilidade do site: acessar uma página não significa percorrer suas publicações.
5. Relacionar registros a personagens, acontecimentos, documentos, versões e desdobramentos, sem classificação de relevância.
6. Expor lacunas de cobertura e não afirmar que todas as fontes foram consultadas quando não foram.

Este inventário é inicial, não exaustivo. Nenhum item `nao-integrado` deve ser anunciado como fonte já coberta.
