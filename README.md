# EdCar Estoque

Sistema interno de controle de estoque da loja **EdCar Hidrovácuo**: cadastro, consulta, edição e baixa de **Diafragmas** e **Peças de Reposição e Reparo**, com histórico completo de movimentações.

Reescrito do zero com **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase**, pronto para produção.

---

## Funcionalidades

- Autenticação com Supabase Auth (login, cadastro e logout) **100% no navegador**, sessão no `localStorage`
- Rotas protegidas por guards em client components (sem cookies e sem middleware)
- Duas categorias de estoque: **Diafragma** (`/estoque/diafragma`) e **Peças** (`/estoque/pecas`)
- CRUD completo de itens com formulário validado (Zod + react-hook-form)
- Busca por nome, código ou modelo, paginação e itens por página (20/50)
- **Baixa atômica** via função SQL `dar_baixa` (trava a linha, valida o saldo e grava o movimento)
- Dashboard com totais, valor do estoque, itens com estoque baixo e últimas movimentações
- Row Level Security: leitura e escrita apenas para usuários autenticados
- Interface responsiva (sidebar colapsável, listagem em tabela no desktop e cartões no mobile)
- Feedback com `sonner` (toasts), estados de vazio, erro e de carregamento (`loading.tsx`)

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Estilos | Tailwind CSS 4 + shadcn/ui (radix-nova) + lucide-react |
| Formulários | react-hook-form + @hookform/resolvers + Zod |
| Dados | Supabase (Postgres, Auth, RLS) via `supabase-js` |
| Modelagem | Prisma (`prisma/schema.prisma` + `prisma/migrations`) |
| Qualidade | ESLint 9 (flat config), `tsc --noEmit` |

---

## Requisitos

- Node.js 20+
- Um projeto [Supabase](https://supabase.com)

---

## Como rodar

```bash
# 1) Instalar dependências
npm install

# 2) Configurar o ambiente
cp .env.example .env
# edite .env com a URL e a publishable key do seu projeto Supabase

# 3) Aplicar o schema (Prisma Migrate → Supabase)
npm run db:deploy
#    Banco já existente (SQL antigo já aplicado): npm run db:baseline
#    NÃO use `prisma db push` nem `prisma migrate dev` — veja a seção Schema.

# 4) (opcional) Popular itens e movimentações mockados para visualização
npm run db:seed

# 5) Subir em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` — sem sessão você é redirecionado para `/login`.

O seed (`npm run db:seed`) grava **14 diafragmas** e **22 peças** com prefixo `MOCK-`, incluindo estoque baixo, item zerado e histórico de entrada/baixa/ajuste. É idempotente: só remove e recria os registros `MOCK-*`, sem apagar cadastros da loja.

### Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm run db:validate` | Valida o `prisma/schema.prisma` |
| `npm run db:migrate -- nome` | Gera SQL em `prisma/migrations` a partir do schema (não aplica) |
| `npm run db:deploy` | Aplica migrations pendentes no Supabase (`prisma migrate deploy`) |
| `npm run db:status` | Mostra quais migrations já foram aplicadas |
| `npm run db:baseline` | Marca `0_init` como já aplicada (banco que já tinha o SQL antigo) |
| `npm run db:seed` | Insere itens/movimentações mockados (`MOCK-*`) para visualização |

---

## Variáveis de ambiente

`.env.example`:

```bash
# Públicas (seguras no browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Prisma CLI (migrations). Use a URL direta (porta 5432), não o pooler 6543.
DATABASE_URL=postgresql://postgres.[ref]:[senha]@db.[ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres.[ref]:[senha]@db.[ref].supabase.co:5432/postgres
```

> **Nunca** versione uma `service_role key`. Este app não usa service role:
> todas as operações passam pela sessão do usuário e pelas políticas de RLS.

---

## Cadastro e sessão

### Rota de cadastro — `/cadastro`

| Campo | Origem | Persistência |
| --- | --- | --- |
| `nome` | formulário (`cadastroFormSchema`) | `user_metadata.nome` → `profiles.nome` |
| `email` | formulário | `auth.users.email` → `profiles.email` (sincronizado por trigger) |
| `telefone` | formulário (máscara `(00) 00000-0000`) | `user_metadata.telefone` → `profiles.telefone` |
| `avatar` | arquivo local (opcional, JPG/PNG/WebP) | `user_metadata.avatar_url` (data URL base64, ≤128×128) → `profiles.avatar_url` |
| `senha` | formulário (mín. 6) | `auth.users.encrypted_password` (nunca em texto puro) |

- **Rota**: `src/app/(auth)/cadastro/page.tsx` → componente `CadastroForm`, que chama `supabase.auth.signUp` direto no navegador
- **Schema de persistência**: tabela `public.profiles` (SQL da baseline `0_init`), criada pelo trigger `handle_new_user` em `auth.users` (lê `user_metadata`) e com RLS de dono (`auth.uid() = id`).
- **Modelo Prisma**: `Profile` (`prisma/schema.prisma`).

### Rota de login — `/login`

- **Rota**: `src/app/(auth)/login/page.tsx` → `LoginForm`, que chama `supabase.auth.signInWithPassword` direto no navegador e redireciona para `/`.
- Após o login, o `SessionProvider` lê a sessão do `localStorage` e carrega o perfil (`profiles`).

### Sessão (client-side)

| Camada | Onde | Conteúdo |
| --- | --- | --- |
| Persistência | `localStorage` (`storageKey: edcar-sessao`) | access/refresh token (gerenciado pelo `supabase-js` no browser) |
| Provider | `src/components/session/session-provider.tsx` | `useSessao()`: `supabase`, `carregando`, `usuario`, `perfil`, `sair` |
| Guards | `(auth)/layout.tsx` e `(dashboard)/layout.tsx` | redirecionam conforme o estado da sessão |
| Server | `criarClienteAutenticado(accessToken)` (`src/lib/supabase/server.ts`) | monta o cliente com header `Authorization: Bearer` — sem cookies |
| Banco | `auth.users` / `auth.sessions` | gerenciados pelo Supabase Auth (não entram no schema Prisma) |

---

## Estrutura

```
src/
├── actions/            Server Actions (itens: create/update/delete/baixa)
├── app/
│   ├── (auth)/         /login e /cadastro (layout split com aside)
│   ├── (dashboard)/    / , /estoque/[categoria] + loading.tsx
│   ├── globals.css     tema EdCar (Tailwind 4 + variáveis)
│   ├── layout.tsx      html lang pt-BR + SessionProvider + Toaster
│   └── not-found.tsx
├── components/
│   ├── auth/           formulários e aside de autenticação
│   ├── dashboard/      sidebar, header, cards do resumo
│   ├── estoque/        toolbar, data table e diálogos
│   ├── session/        SessionProvider + useSessao
│   └── ui/             componentes shadcn/ui
├── hooks/use-mobile.ts
├── lib/
│   ├── auth-error.ts   mapAuthError (mensagens pt-BR)
│   ├── avatar.ts       processamento e validação da foto de perfil
│   ├── constants.ts    rótulos, limites, tamanhos de página
│   ├── estoque-events.ts  evento de refresh pós-mutação
│   ├── format.ts       moeda BRL, máscaras, datas
│   ├── queries.ts      listagem paginada e resumo do dashboard
│   ├── supabase/       clientes server/browser + env
│   └── validators.ts   schemas Zod (item, baixa, auth, searchParams)
└── types/              Item, StockMovement, Database, Auth, ActionResult

prisma/schema.prisma    fonte da verdade das tabelas public
prisma/migrations/      SQL versionado (DDL Prisma + RLS/funções)
```

---

## Schema (Prisma + Supabase)

O Prisma descreve **só o schema `public` do app** (`items`, `profiles`, `stock_movements`). Auth (`auth.users`, sessões) continua 100% com o Supabase Auth — modelar isso no Prisma e rodar `db push`/`migrate dev` pode alterar ou apagar tabelas internas.

Objetos que o Prisma **não** gera (e por isso vivem no SQL das migrations): RLS, GRANTs, triggers, `dar_baixa`, FKs para `auth.users`, CHECKs e índices GIN (`pg_trgm`).

### Como atualizar o schema

1. Edite `prisma/schema.prisma` (coluna, tabela, índice btree, enum).
2. Gere o SQL **sem aplicar**: `npm run db:migrate -- nome_curto`
3. Abra `prisma/migrations/<timestamp>_nome/migration.sql` e revise:
   - apague qualquer `DROP` em `auth.*`, políticas, funções, índices GIN ou FKs para `auth.users` (o diff compara o banco real e pode sugerir remover o que o Prisma não modela);
   - se criou tabela nova, copie o padrão de RLS/GRANT da baseline `0_init`.
4. Aplique: `npm run db:deploy`
5. Regenere o client se for usar Prisma Client: `npm run db:generate`

Mudança só de função/RLS/trigger (sem alterar o `schema.prisma`): crie a pasta `prisma/migrations/<timestamp>_nome/` na mão, escreva o `migration.sql` e rode `npm run db:deploy`.

Banco **novo**: só `npm run db:deploy`. Banco **já criado** pelo SQL antigo em `supabase/migrations`: `npm run db:baseline` uma vez (registra `0_init` sem reexecutar) e depois só `db:deploy` nas próximas.

---

## Segurança

- Sessão no `localStorage` do navegador (com access/refresh); o servidor nunca lê cookies de sessão
- Server Actions de itens recebem o access token e montam o cliente com `Authorization: Bearer` (`criarClienteAutenticado`)
- RLS habilitado nas tabelas `items` e `stock_movements` (leitura/escrita apenas de autenticados, dono por linha em `profiles`)
- Função `dar_baixa(uuid, integer)` (SQL na baseline Prisma) executada apenas por `authenticated`
- Validação de entrada no servidor (Zod) mesmo com o formulário já validado no cliente
- Busca com escape de curingas (`%`, `_`, `\`) para evitar comportamento inesperado no `ILIKE`

---

## Fluxo de estoque

| Ação | Movimento gravado |
| --- | --- |
| Cadastro de item com saldo > 0 | `entrada` (saldo anterior 0) |
| Baixa pelo modal | `baixa` (via `dar_baixa`, com lock de linha) |
| Edição que altera o saldo | `ajuste` (saldo anterior → posterior) |
