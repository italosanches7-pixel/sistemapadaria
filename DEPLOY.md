# Como colocar o sistema no ar (passo a passo)

Este guia não exige conhecimento técnico. São dois cadastros gratuitos e alguns
cliques. No total leva uns 10-15 minutos.

Você vai criar conta em dois serviços:
1. **Neon** — onde os dados (vendas, produtos, usuários) ficam guardados.
2. **Vercel** — onde o sistema (as telas) fica publicado, com um link para acessar.

---

## Parte 1 — Criar o banco de dados na Neon

1. Acesse **https://neon.tech** e clique em **Sign up**. Pode entrar com sua conta do
   GitHub para facilitar (o mesmo GitHub onde está o repositório `sistemapadaria`).
2. Depois de entrar, clique em **Create a project** (ou "New Project").
3. Dê um nome, por exemplo `sistemapadaria`, e clique em **Create**.
4. Na tela do projeto, procure por **Connection string** (ou vá em **Dashboard →
   Connect**). Se aparecer a opção **Pooled connection**, deixe-a marcada/selecionada
   — ela é a mais indicada para este tipo de aplicação.
5. Clique no ícone de copiar ao lado da connection string. Ela é algo como:
   ```
   postgresql://usuario:senha@algum-endereco.neon.tech/nomedobanco?sslmode=require
   ```
6. **Guarde esse texto** (cole num bloco de notas por enquanto) — vamos usá-lo na Parte 2.

---

## Parte 2 — Publicar o sistema na Vercel

1. Acesse **https://vercel.com** e clique em **Sign up**. Escolha **Continue with
   GitHub** e autorize (assim a Vercel enxerga seus repositórios).
2. No painel da Vercel, clique em **Add New... → Project**.
3. Encontre o repositório **sistemapadaria** na lista e clique em **Import**.
4. Antes de clicar em "Deploy", procure a seção **Environment Variables** (variáveis
   de ambiente) e adicione as duas abaixo, uma de cada vez (nome à esquerda, valor
   à direita):

   | Nome | Valor |
   |---|---|
   | `DATABASE_URL` | a connection string que você copiou da Neon na Parte 1 |
   | `JWT_SECRET` | qualquer frase longa e aleatória, só sua — por exemplo: `padaria-2026-troque-por-outra-frase-bem-longa-e-secreta` |

   > Você **não** precisa definir login e senha de administrador aqui. Você vai criar
   > essa conta na primeira vez que abrir o sistema (veja a Parte 3).

5. Clique em **Deploy**. A Vercel vai instalar tudo, preparar o banco de dados
   automaticamente (criar as tabelas e alguns produtos de exemplo) e publicar o
   sistema. Isso leva 1-3 minutos.
6. Quando aparecer "Congratulations", clique no link/preview para abrir o sistema.
   A Vercel também te dá uma URL fixa (algo como `sistemapadaria.vercel.app`) — é
   esse link que você vai usar no dia a dia, inclusive salvando como favorito no
   navegador do PC da padaria.

---

## Parte 3 — Primeiro acesso

1. Abra a URL gerada pela Vercel.
2. Como ainda não existe nenhuma conta, o sistema abre automaticamente a tela de
   **Primeiro acesso**. Preencha seu nome, escolha um login (ex: `admin`) e uma
   senha, confirme a senha e clique em **Criar administrador e entrar**. Pronto —
   você já entra como administrador.
   > Guarde bem esse login e senha: é a conta que comanda o sistema.
3. Vá em **Produtos** e cadastre os produtos reais da sua padaria (o sistema já
   vem com alguns produtos de exemplo — pode desativá-los ou deixar).
4. Vá em **Usuários** e cadastre um login para cada atendente que vai operar o
   caixa. Aproveite para criar um **segundo administrador** de segurança (veja as
   perguntas comuns abaixo).
5. Pronto — o caixa já pode ser usado no PC do balcão.

---

## Perguntas comuns

**Isso tem algum custo?**
Não, os planos gratuitos da Neon e da Vercel cobrem tranquilamente o uso de uma
padaria. Se um dia o negócio crescer muito, pode ser necessário migrar para um
plano pago — mas isso está longe da realidade inicial.

**Um atendente esqueceu a senha, e agora?**
Simples: entre como administrador, vá em **Usuários**, clique em **Redefinir senha**
na linha do atendente, digite uma senha nova e clique em Salvar. Pronto — ele já
pode entrar com a nova senha. Não precisa de e-mail nem de nada extra.

**Dica de segurança: tenha um segundo administrador.**
Logo no primeiro acesso, vá em **Usuários** e cadastre um segundo usuário com papel
**Administrador** (pode ser você mesmo com outro login, ou uma pessoa de confiança).
Assim, se um administrador esquecer a senha, o outro consegue redefini-la pelo painel
— exatamente como no caso do atendente acima.

**Esqueci a senha do administrador e não tenho um segundo admin, e agora?**
Nesse caso a recuperação é mais trabalhosa, porque não há ninguém no sistema com
permissão para redefinir. A forma recomendada de se prevenir é cadastrar um segundo
admin **antes** de precisar (veja a dica acima). Se mesmo assim ficar trancado para
fora, me chame para um ajuste pontual no banco de dados. Observação: a tela de
**Primeiro acesso** só aparece enquanto o sistema não tem **nenhum** usuário — depois
que a primeira conta é criada, ela fica desativada por segurança.

**Como faço para atualizar o sistema no futuro (novas funcionalidades)?**
Basta pedir as alterações — assim que o código for atualizado no repositório
`sistemapadaria`, a Vercel publica a nova versão automaticamente, sem precisar
repetir estes passos.
