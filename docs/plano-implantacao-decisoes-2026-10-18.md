# Fora da Pauta — controle das decisões (18/10/2026)

Este documento acompanha a implementação; não é declaração de funcionamento em produção.

## Estados
- **Preparado nesta ramificação**: código alterado, ainda sem build, testes ou confronto com a cópia local enviada.
- **Existente no GitHub**: há código identificado, mas execução em produção não verificada.
- **Pendente**: implementação ou apuração adicional necessária.

## Implementação
| Decisão | Situação | Critério antes de concluir |
| --- | --- | --- |
| Home curta com logo, “Há mais para entender”, “Como o jogo é jogado” e “Decisões que afetam a sua vida” | Preparado nesta ramificação | Revisar visual e responsividade |
| CTA único de inscrição geral no bot Telegram | Existente no GitHub | Testar inscrição em novo telefone e sessão existente |
| “Fique de Olho” como espaço permanente, separado da lista de edições | Preparado nesta ramificação | Confrontar com versão local, testar navegação |
| Ocultar campanha 6×1 da home, sem apagar a edição | Existente no GitHub | Confirmar no build |
| Listagem de edições por data, mais recentes primeiro | Existente no GitHub | Conferir campanha publicada e datas |
| Compartilhamento permanente da home pelo WhatsApp e dispositivo | Preparado nesta ramificação | Testar celular, navegador e textos |
| Fique de Olho: seleção de múltiplos representantes eleitos | Existente no GitHub | Validar resultados da busca e salvamento |
| Fique de Olho: salvar escolhas na mesma inscrição geral do Telegram | Existente no GitHub | Validar idempotência, sessão e retorno |
| Retirar “Acompanhar mais alguém” depois de concluir, oferecer retorno à página inicial | Preparado nesta ramificação | Testar que a escolha de vários nomes continua acessível ANTES da conclusão |
| Telegram: webhook, fila e fontes de novidades | Existente no GitHub | Testar ponta a ponta, secrets e agendamentos sem expor valores |
| Votações, falas, comissões, entrevistas, links e recortes com fonte | Parcial / pendente | Inventário de fontes por cargo e atualização verificável |
| Agenda do presidente: previsto versus realizado, decisões e impactos | Pendente | Fontes oficiais, modelo de publicação e periodicidade |
| STF: ministros, decisões, votos e manifestações com contextualização | Pendente | Fonte oficial e separação de cargos eleitos |
| Contato institucional de representantes e assistência à mensagem do cidadão | Pendente | Fontes verificáveis e envio somente pela própria pessoa |
| Dúvidas, denúncias e checagem com status e direito de resposta | Parcial / pendente | Ampliar sistema atual com moderação, privacidade e controles |
| Destinatários: resposta individual, seguidores do representante ou alcance geral | Pendente | Critério editorial de relevância, consentimento e proteção de dados |
| Artigo “O povo tem poder?” e explicação das camadas de poder econômico | Pendente | Texto e fontes; manter sanduíche fora da home |
| Faixas econômicas em R$, porcentagens e pessoas, com fonte e período | Pendente | Apuração documentada sem números no sanduíche |
| Quiz oral sem alternativas, com perguntas curtas e fontes | Pendente | Conteúdo sem afirmações ambíguas, acessibilidade e áudio |
| Ficha do candidato: patrimônio, trajetória, declarações, geopolítica e checagens | Parcial / pendente | Apuração individual com distinção entre alegação e comprovação |
| Editorial claro: fato, fonte, interpretação, grau de comprovação e resposta | Pendente transversal | Revisão editorial de cada entrega |

## Regras de segurança
1. **Não promover domínios públicos sem autorização**.
2. Não presumir que GitHub espelhe a pasta local do usuário: o ZIP não pôde ser aberto neste ambiente.
3. Não sobrescrever arquivos locais, fotos não rastreadas ou alterações pendentes.
4. Não colocar tokens, senhas ou outras credenciais no código.
5. Fazer build, lint e testes antes de qualquer integração à ramificação principal.
6. Comparar esta ramificação com a cópia local antes de aplicar suas mudanças ao projeto definitivo.
