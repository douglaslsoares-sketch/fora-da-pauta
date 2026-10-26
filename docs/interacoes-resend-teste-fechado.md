# Preparar teste fechado de e-mail — Resend

## Antes de conectar ao site público

A [política de uso aceitável do Resend](https://resend.com/legal/acceptable-use) (atualizada em 13/10/2026) proíbe envio não solicitado, incluindo cold outreach, e exige opt-in do destinatário. **Não presumir que endereço institucional público represente autorização pelo provedor.** Antes de qualquer envio a gabinete real, confirmar por escrito com o Resend se correspondência cívica solicitada por cidadãos a canais institucionais se enquadra em política permitida; ou adotar canais institucionais que tenham optado pelo recebimento. O aceite do cidadão remetente não substitui a permissão do destinatário para fins de uso do provedor.

## Teste técnico sem envio a políticos

1. Criar conta em https://resend.com/signup, sem compartilhar senha ou chave com terceiros/chat.
2. Configurar conta para experimentar somente com endereços de teste controlados. A página oficial de Resend permite usar endereço de recepção `*.resend.app` sem DNS; não alterar MX do domínio raiz `foradapauta.org`.
3. Confirmar na conta serviço de envio e endereço de entrada; usar endereço institucional próprio somente quando verificado.
4. Criar chave API **servidor**, nunca `NEXT_PUBLIC_*` e nunca enviar a chave no chat. Configurá-la como variável sensível em Vercel e serviço de webhook com segredo próprio apenas quando o fluxo passar testes.
5. Testar com um endereço próprio ou de teste e a `*.resend.app` para entrada; usar `delivered@resend.dev` e `bounced@resend.dev` para simular status.
6. Aplicar `scripts/sql/interacoes-automaticas.sql` **primeiro em ramo de teste Neon**, nunca em produção antes da revisão/backup.
7. Testar marcação correta da entrega, retorno, verificação da autenticidade, impossibilidade de acesso a mensagens de outros chats, deduplicação, limites de volume e falhas.
8. Corrigir os pontos de integração ainda não validados (webhook de recebimento real, autenticidade de respostas, cron e fila de notificações, contatos Câmara).
9. Somente após isso, preparar uma liberação restrita. `FDP_INTERACOES_AUTOMATICAS` e `FDP_INTERACOES_HABILITADAS` permanecem desativados.

## Observações importantes

- Uma entrega `email.delivered` significa aceitação pelo servidor destinatário, não leitura pelo político.
- O remetente visível de uma resposta pode ser pessoa/assessoria diferente do e-mail que recebeu; não autorizar a resposta apenas porque contém um protocolo. Uma assinatura de webhook prova origem do evento Resend, **não autoria do político**.
- Preferir subdomínio exclusivo para receber respostas; os MX da raiz podem pertencer a outro serviço.
- O plano grátis citado na página oficial do Resend é limitado; não supor que suporta milhões de mensagens.
- A demonstração deve evitar qualquer destinatário político real até consentimento institucional/validade do uso ser resolvido.
