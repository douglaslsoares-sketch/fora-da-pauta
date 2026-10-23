# Interação cidadão–pessoa pública — preparação para ativação

## Situação

Implementação isolada na PR #34, com `FDP_INTERACOES_HABILITADAS` desabilitado por padrão.
Não considerar pronto para o público apenas porque o build e os testes passaram.

## Etapas obrigatórias antes de ativar

1. Criar backup recuperável do PostgreSQL de produção e confirmar a restauração em ambiente isolado. Não apagar nem modificar tabelas do Telegram existentes.
2. Revisar e aplicar `scripts/sql/interacoes-politicas.sql` em ambiente de teste.
3. Validar registro inicial, trilha de eventos e consulta de **somente** mensagens pertencentes ao Telegram autenticado. Testar também uma conta sem inscrição e outra com navegador diferente.
4. Validar o painel em `/admin/interacoes`, com acesso administrativo já existente. Conferir restrições, rejeição de mudanças de estado inválidas e que os IDs do Telegram nunca sejam exibidos.
5. Escolher uma pessoa pública com canal oficial confirmável, verificar fonte e contato, enviar uma pergunta de teste **com autorização do remetente**, documentar hora e comprovante do encaminhamento.
6. Inserir uma resposta *de teste* com origem e autoria verificadas, em ambiente isolado. Confirmar que apenas o remetente recebe a resposta no bot e que não há mensagens duplicadas, mesmo após repetir o processo da fila.
7. Verificar texto, privacidade e acessibilidade do formulário no celular; conferir botão contextual nas matérias relacionadas e na Ficha Política.
8. Apenas após todos os testes, aplicar a migração em produção, habilitar `FDP_INTERACOES_HABILITADAS=1` e validar gradualmente com uma conta de teste autorizada.

## Cuidados

- Uma mensagem `recebida` NÃO é uma mensagem `encaminhada`.
- Marcar `encaminhada` **somente** depois de realizar o envio supervisionado por contato oficial verificado.
- Marcar `respondida` **somente** com origem da resposta confirmada e autoria identificada.
- Mensagem sem retorno pode ser `sem_resposta`; nunca prometer resposta do representante.
- Em caso de falha incerta do Telegram, deixar como `incerto` e investigar, sem reenviar automaticamente.
- Não publicar textos privados nem dados de identificação dos remetentes.
- `FDP_INTERACOES_HABILITADAS` é a chave da exposição e do processamento de mensagens, e não substitui as verificações anteriores.

## Limitação atual

Não há nesta integração uma ação autorizada para executar SQL diretamente no banco conectado à produção. A migração **não foi aplicada**, e a chave **não foi ativada**.
