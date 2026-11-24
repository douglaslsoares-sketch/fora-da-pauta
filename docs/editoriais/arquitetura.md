# Editoriais — isolamento
- Rotas públicas: /editoriais; administração: /admin/editoriais; APIs: /api/editoriais.
- Componentes, dados e bibliotecas exclusivos nos diretórios editoriais.
- Publicações reutilizam as tabelas editoriais existentes public.admin_artigos e relacionadas; inscrições PWA usam schema editoriais e conexão EDITORIAIS_DATABASE_URL. Não duplicar artigos.
- Nenhuma dependência das tabelas, inscrições ou rotas de Políticos.
- Autenticação central do ecossistema; autorização verificada em cada operação administrativa.
- Manifesto, ícone e escopo de service worker próprios.
- Publicações começam como rascunhos. Envio de avisos somente após publicação autorizada.
- Migração, credenciais, autenticação, envio push e testes ainda pendentes.
