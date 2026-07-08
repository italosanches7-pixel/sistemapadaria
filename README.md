# Sistema de Caixa para Padaria

Sistema de PDV (ponto de venda) para uma padaria: atendentes registram vendas
detalhadas (item a item, com forma de pagamento) durante seus turnos de caixa, e é
possível consultar relatórios de vendas por dia, semana, quinzena e mês.

Não é necessário nenhum conhecimento técnico para **usar** o sistema depois de
publicado. Para colocar o sistema no ar (deploy), siga o guia em **[DEPLOY.md](./DEPLOY.md)** — é um
passo a passo simples, sem jargão técnico.

## O que o sistema faz

- **Login por usuário**: cada atendente tem seu próprio login e senha.
- **Turno de caixa**: o atendente abre o caixa informando o fundo de troco, registra
  vendas durante o turno, e fecha o caixa no fim informando o valor contado — o
  sistema mostra se bateu ou não com o esperado (isso é apenas informativo, nunca
  bloqueia nada).
- **Vendas detalhadas**: cada venda registra os produtos, quantidades e a forma de
  pagamento (dinheiro, pix, débito ou crédito).
- **Relatórios**: filtros rápidos por hoje / semana / quinzena / mês (ou um intervalo
  de datas customizado), com faturamento, ticket médio, quebra por forma de
  pagamento e por operador, e ranking dos produtos mais vendidos.
- **Administração**: um usuário Administrador cadastra produtos e usuários, e é o
  único que pode cancelar uma venda já registrada.

## Tecnologia usada

- [Next.js](https://nextjs.org) (React + TypeScript) — frontend e backend no mesmo projeto.
- [PostgreSQL](https://www.postgresql.org) com [Prisma](https://www.prisma.io) — banco de dados.
- Autenticação própria com senha criptografada (bcrypt) e sessão segura (JWT em cookie).
- [Vitest](https://vitest.dev) — testes automatizados das regras de negócio.

## Rodando o projeto localmente (para desenvolvedores)

Pré-requisitos: Node.js 20+ e um banco PostgreSQL.

```bash
npm install
cp .env.example .env   # preencha DATABASE_URL, JWT_SECRET, ADMIN_LOGIN, ADMIN_SENHA
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

Acesse `http://localhost:3000` e entre com o usuário administrador definido no `.env`.

### Testes

```bash
npm run test
```

## Deploy (colocar no ar)

Veja o passo a passo completo, sem necessidade de conhecimento técnico, em
**[DEPLOY.md](./DEPLOY.md)**.
