# Validação real — áudio e Telegram (30/10/2026)

Branch integrada no PR #110. Não promover à produção antes de validar os dois percursos.

## Comprovado por testes automatizados
- Build Vercel READY; quatro conjuntos de testes GitHub Actions aprovados.
- Testes com PostgreSQL efêmero: MP3 reutilizado sob concorrência; limite de gerações preservado; aviso fictício retido até a confirmação e enviado depois.
- Esses resultados ainda não equivalem a um teste real com API de voz e Telegram.

## Restrições verificadas
- O acesso autenticado à Preview foi negado com 403 read_protection_bypass. A proteção da Vercel está ativa para domínios de preview.
- OPENAI_API_KEY só existe no target production, não em preview.
- TELEGRAM_BOT_TOKEN e DATABASE_URL existem em preview, mas ainda não foi confirmado que sejam isolados de produção. Não fazer disparos até comprovar isolamento.
- O botão de conclusão enviado pelo webhook aponta diretamente ao domínio oficial. Testar o retorno na Preview exige configuração segura de URL específica de teste ou uma publicação controlada aprovada.

## Percurso real de áudio (pendente)
1. Atualizar autorização do conector Vercel para o projeto e preview, sem desativar a proteção.
2. Criar uma chave de voz dedicada a ensaio, com limite baixo, e configurar somente na preview apropriada. Não copiar nem expor a credencial de produção.
3. Garantir banco PostgreSQL isolado de produção para a preview.
4. Requisitar duas vezes o mesmo texto editorial curto ao endpoint /api/audio/ler; exigir MP3, primeiro cabeçalho X-FDP-Audio-Cache: gerado e segundo: reutilizado; comparar arquivos e ouvir ritmo, acolhimento e fidelidade. Não inserir dados pessoais.

## Percurso real do Telegram (pendente)
1. Ter banco de ensaio e bot distinto do ForaDaPautaAcompanhaBot de produção; nunca redirecionar o webhook do bot público para testes.
2. Configurar URL de retorno própria da preview, validada contra host autorizado, antes de testar.
3. No celular de voluntário com sua conta Telegram habitual, iniciar inscrição pela Preview e abrir o bot de ensaio.
4. Verificar que o aviso fictício fica pendente antes de Concluir a inscrição; clicar no botão; verificar volta à Preview, confirmação e envio do aviso fictício somente depois.
5. Verificar comando /concluir e impedir uso repetido do mesmo código.

## Critério de liberação
Status: validação real PENDENTE por acesso protegido, falta de chave Preview e isolamento de bot/banco ainda não confirmado. Não fazer merge nem promover à produção sem completar a verificação.
