# Interações cidadão–pessoa pública: fluxo totalmente automatizado

**Diretriz aprovada:** nenhuma etapa rotineira exige que alguém do Fora da Pauta confira ou encaminhe manualmente mensagens ou respostas. A interface pública continua desativada até que o fluxo de ida e volta esteja tecnicamente testado.

## Caminho do cidadão

1. A pessoa seleciona a ficha política ou a matéria associada a uma **candidatura identificada com segurança**, dita ou escreve, revisa o texto e autoriza o envio.
2. O Fora da Pauta registra protocolo, destinatário e data, sem repassar identidade do Telegram, telefone ou e-mail do cidadão.
3. Um trabalhador assíncrono consulta o cadastro de contatos institucionais, associados ao **ID do agente político confirmado**, e procura canal oficial verificável e atual. Nunca identifica destinatário apenas pelo nome.
4. Quando há contato habilitado, sistema envia a mensagem automaticamente pelo serviço de e-mail transacional, com protocolo e endereço de resposta exclusivo. Não inventar que chegou ao político: diferenciar **aceita pelo provedor**, **entregue ao servidor do destinatário**, **falhou** e **lida/desconhecida**.
5. A resposta entra por webhook verificado e endereço individual por protocolo; o sistema busca o corpo da mensagem, valida correlação, remessa de endereço/domínio previamente cadastrado e autenticação do e-mail (quando disponível). Somente respostas com origem automática confiável são tratadas como resposta atribuída à pessoa pública/órgão. Mensagens ambíguas ou suspeitas **não** recebem essa atribuição.
6. A resposta válida é associada ao protocolo e enviada automaticamente **apenas ao mesmo chat do Telegram** que originou a solicitação, pela fila existente com proteção contra duplicidades.
7. Prazo de retorno configurável: sem resposta, registra `sem_resposta`, sem inventar retorno ou enviar cobranças ilimitadas.

## Sem contato válido, sem promessa falsa

- Cadastro inicial: e-mails públicos institucionais em fontes oficiais (Câmara, Senado, Poderes executivos e casas legislativas). Sincronizar mudanças e situação de exercício; não confundir candidatura com mandato. Ex.: dados abertos da Câmara e do Senado publicam e-mails parlamentares.
- Não há e-mail institucional obrigatoriamente disponível para **todos** os candidatos ou ex-candidatos; sem contato oficial o sistema retorna `nao_encaminhada` e informa o motivo ao cidadão.
- Não disparar por redes sociais ou números privados e não usar scraping para descobrir contatos particulares.
- Em falha temporária, efetuar retentativa limitada e automática; em estado incerto, registrar `incerto` e **não reenviar cegamente**.
- Validação de autenticidade não é possível para toda resposta. Mensagens de origem duvidosa ficam marcadas como `resposta_nao_verificada` internamente, sem serem apresentadas como resposta oficial.

## Proteção contra abusos e escala

- Limite por cidadão, por destinatário e por período; fila com controle de volume e cota do serviço de e-mails para não sobrecarregar gabinetes ou gerar spam.
- Evitar envio de identificação pessoal; bloquear anexos, links arriscados e conteúdo que possa gerar risco ou abuso. Critérios técnicos iguais independentemente da posição política do autor ou do destinatário.
- Logs mínimos, retenção limitada, política LGPD, exclusão/solicitação do titular e controle de acesso.
- Idempotência baseada no UUID do protocolo, referência do provedor e webhooks deduplicados. Trabalhos concorrentes devem ter travas no PostgreSQL.
- Métricas de aceitação, bounce, contato não localizado, respostas autenticadas, falhas, tentativas e tempo de retorno. Não calcular taxa de resposta com e-mails ainda não entregues.

## Dependências externas ainda não instaladas

1. Serviço capaz de **enviar e receber** e-mails com webhooks e autenticação, por exemplo Resend. Configuração de domínio/subdomínio próprio (evitar mexer nos MX existentes do domínio raiz), DNS e segredos.
2. Fonte de contatos por identidade política confirmada, com rastreabilidade da URL, data de atualização, tipo do mandato e verificação automática; iniciar com deputados federais e senadores, ampliar progressivamente.
3. Migração incremental no Neon para diretório de contatos, fila de envios, eventos do provedor e correlação de respostas. Fazer nova migração, mantendo **intactas** as tabelas de Telegram existentes.
4. Implementar trabalhador periódico + webhook de recepção com verificação de assinatura/autenticidade. Testar nos modos fictício, provedor sandbox e pequeno piloto real consentido.
5. Habilitar apresentação do formulário somente quando houver processo completo e limites/proteções suficientes: `FDP_INTERACOES_HABILITADAS=1` (atualmente ausente). A flag não deve ser usada para contornar pré-requisitos.

## Situação real em 23/10/2026

- Já existe formulário de voz/texto e registro da manifestação, painel manual, histórico e fila de respostas no Telegram; o **envio automático ao gabinete** e o **recebimento autenticado de respostas externas** ainda **não existem**.
- As tabelas `interacoes_politicas` e `interacoes_politicas_historico` foram instaladas no banco principal e validadas em banco isolado.
- **Não afirmar que o fluxo automático está ativo** e não liberar o formulário com promessa de encaminhamento até concluir as integrações.
