# Gastos

Site pessoal de controle de gastos (acesso restrito, login único), com import
de fatura/extrato (OFX/PDF), categorização automática e uma API de
integração para sincronizar lançamentos com o vault Obsidian.

Stack: Next.js (App Router) + TypeScript + PostgreSQL (Prisma) + Auth.js.

## Setup local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Copie `.env.example` para `.env` e preencha:
   - `DATABASE_URL` / `DIRECT_URL`: connection strings do Postgres (veja
     "Banco de dados" abaixo — local ou Neon).
   - `AUTH_SECRET`: gere com `openssl rand -base64 32`.
   - `SEED_USER_EMAIL` / `SEED_USER_PASSWORD`: credenciais do seu login.
   - `INTEGRATION_API_KEY_PLAINTEXT`: chave usada pela integração com o
     vault (se deixar em branco, o `seed` gera uma aleatória e imprime no
     terminal — guarde-a, pois só aparece uma vez).

3. Aplique as migrations e rode o seed (cria o usuário único, a API key e
   as regras de categorização iniciais):

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

## Banco de dados

**Opção A — Postgres local temporário (sem instalar nada):**

```bash
npx prisma dev
```

Isso sobe um Postgres local e imprime a `DATABASE_URL`/`DIRECT_URL` para
colar no `.env`. Útil só para desenvolvimento — os dados não persistem
entre reinícios do comando.

**Opção B — Neon (usado em produção):**

1. Crie um projeto em [neon.tech](https://neon.tech) (free tier).
2. Copie as duas connection strings do painel: a *pooled* (com `-pooler`
   no host) vai em `DATABASE_URL`, a *direct* vai em `DIRECT_URL`.

⚠️ A migration `prisma/migrations/20260915134711_init/migration.sql` foi
editada manualmente para tornar o índice de `dedupe_hash` **parcial**
(`WHERE status = 'ativo'`) — o Prisma não suporta índices parciais no
schema. **Não rode `prisma migrate dev`** depois de editar o schema sem
revisar o SQL gerado, ou essa condição pode ser perdida; use sempre
`prisma migrate deploy` para aplicar migrations já existentes (é isso que
os comandos abaixo e o deploy usam).

## Deploy (Vercel + Neon)

1. Crie o banco no Neon (veja acima).
2. Importe o repositório na Vercel e configure as variáveis de ambiente
   (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `SEED_USER_EMAIL`,
   `SEED_USER_PASSWORD`, `INTEGRATION_API_KEY_PLAINTEXT`) em Production.
3. Rode as migrations contra o banco de produção (localmente, apontando
   `.env` para as strings do Neon, ou via um passo de build):

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. Depois do primeiro seed, você pode remover `SEED_USER_PASSWORD` e
   `INTEGRATION_API_KEY_PLAINTEXT` das variáveis de ambiente — só o hash
   fica salvo no banco, os valores em texto puro não são mais necessários
   (guarde a API key gerada em outro lugar seguro).
5. Deploy: `vercel deploy --prod` (ou push para o branch conectado).
6. Teste o login em `/login` e a API de integração:

   ```bash
   curl -X POST https://SEU-DOMINIO/api/integration/transactions \
     -H "Authorization: Bearer SUA_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"tipo":"Saída","valor":10,"categoria":"Alimentação","descricao":"teste","data":"2026-01-01"}'
   ```

## Integração com o vault Obsidian

A API `/api/integration/transactions` (autenticada por `Authorization:
Bearer <API_KEY>`, não pela sessão de usuário) é o ponto de sincronização
com o vault:

- `POST` cria um lançamento com `origem: "vault"`. Aceita `external_id`
  para retry idempotente — reenviar o mesmo `external_id`/dados não cria
  duplicata, retorna o registro existente com `duplicate: true`.
- `GET ?since=<ISO>&limit=` retorna lançamentos criados pelo site ou por
  import de fatura (`origem` site/import_fatura) desde o cursor `since`,
  para o Claude Code no vault escrever as linhas `.md` correspondentes.
  Nunca devolve lançamentos com `origem: "vault"`, para não ecoar de volta
  o que o próprio vault enviou.

O procedimento de sincronização em si (quando puxar, onde guardar o
cursor `.sync-state.json`, como escrever as linhas Markdown) é operacional
— vive como instrução no vault, não como código deste repositório. Veja o
plano de implementação original para o desenho completo desse fluxo.

**Limitação atual:** só criação sincroniza nos dois sentidos. Editar um
lançamento depois (ex.: confirmar um checkbox no site) não atualiza a
linha `.md` já escrita no vault — isso fica para uma iteração futura.
