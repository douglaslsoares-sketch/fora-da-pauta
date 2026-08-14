# Fora da Pauta

Projeto enxuto para páginas individuais ligadas às estampas do Fora da Pauta.

## Como funciona

- Cada camiseta corresponde a uma campanha.
- Cada campanha tem uma URL própria em `/campanhas/[slug]`.
- O layout é único e reaproveitado em todas as campanhas.
- O conteúdo de cada campanha fica em `data/campanhas.ts`.
- A página tem dois cartões expansíveis e um cartão para a loja.

## Nova campanha

Adicione um novo objeto ao array `campaigns` em `data/campanhas.ts`, definindo `slug`, título, mensagem, textos e `storeUrl`.

Exemplo de URL:

`/campanhas/escala-6x1`

## Desenvolvimento

```bash
npm install
npm run dev
```

## Estrutura

```text
app/
  campanhas/[slug]/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  CampaignPage.tsx
  ExpandableCard.tsx
  StoreCard.tsx
data/
  campanhas.ts
public/
  icon.png
  robots.txt
```
