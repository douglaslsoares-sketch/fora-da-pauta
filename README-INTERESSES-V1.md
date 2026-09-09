# Campanha de Interesses — infraestrutura V1

Este pacote cria a primeira camada técnica da Campanha de Interesses:

- migration PostgreSQL da estrutura-base de auditoria;
- cliente de banco em `lib/interesses/db.ts`;
- endpoint `POST /api/interesses/session` para criar uma sessão auditável.

## Regra incorporada ao banco

A migration impede que uma resposta seja marcada como `approved` ou
`shown_to_user` quando existir uma afirmação factual sem evidência vinculada.

Princípio: **sem fonte, sem afirmação factual**.

## Dependência

Na raiz do projeto:

```powershell
npm install postgres
```

## Variável de ambiente

Adicionar ao `.env.local`:

```text
DATABASE_URL=postgresql://...
```

Não commite `.env.local`.

## Migration

Execute uma vez no PostgreSQL:

```text
db/migrations/001_interesses_auditoria.sql
```

## Teste do primeiro endpoint

Com `npm run dev` ativo:

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://localhost:3000/api/interesses/session" `
  -ContentType "application/json" `
  -Body '{"channel":"text"}'
```

O retorno deve conter `sessionId`, `createdAt`, `channel` e `status`.
