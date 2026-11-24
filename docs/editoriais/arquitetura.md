# Editoriais — isolamento
- Rotas públicas: /editoriais; administração: /admin/editoriais; APIs: /api/editoriais.
- Componentes, dados e bibliotecas exclusivos nos diretórios editoriais.
- Banco configurado exclusivamente por EDITORIAIS_DATABASE_URL; schema editoriais.
- Nenhuma dependência das tabelas, inscrições ou rotas de Políticos.
- Autenticação central do ecossistema; autorização verificada em cada operação administrativa.
- Manifesto, ícone e escopo de service worker próprios.
- Publicações começam como rascunhos. Envio de avisos somente após publicação autorizada.
- Migração, credenciais, autenticação, envio push e testes ainda pendentes.
