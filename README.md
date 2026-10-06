# EdCar Estoque

Sistema interno de controle de estoque da loja **EdCar Hidrovácuo**: cadastro, consulta, edição e baixa de **Diafragmas** e **Peças de Reposição e Reparo**, com histórico completo de movimentações.

Reescrito do zero com **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Supabase**, pronto para produção.

---

## Funcionalidades

- Autenticação com Supabase Auth (login, cadastro e logout) e sessão em cookies
- Rotas protegidas e refresh de sessão via `src/proxy.ts` (middleware do Next 16)
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
| Dados | Supabase (Postgres, Auth, RLS) via `@supabase/ssr` / `supabase-js` |
| Modelagem | Prisma (`prisma/schema.prisma`, apenas validação/schema) |
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

# 3) Criar as tabelas, políticas e a função dar_baixa
#    aplica supabase/migrations/*.sql (no Supabase, via conexão direta do .env)
npm run db:push
#    (idempotente: pode rodar de novo. NÃO use `prisma db push`/`migrate dev`
#    — a gestão de schema é via SQL; o Prisma aqui só modela e valida.)

# 4) Subir em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` — sem sessão você é redirecionado para `/login`.

### Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`) |
| `npm run db:validate` | Valida o schema do Prisma (usa `DATABASE_URL`) |
| `npm run db:push` | Aplica as migrations SQL no Supabase (idempotente) |

---

## Variáveis de ambiente

`.env.example`:

```bash
# Públicas (seguras no browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...

# Opcional — só para o Prisma CLI
DATABASE_URL=postgresql://...
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

- **Rota**: `src/app/(auth)/cadastro/page.tsx` → componente `CadastroForm` → Server Action `cadastroAction`
- **Schema de persistência**: tabela `public.profiles` (migration `0002_profiles.sql`), criada pelo trigger `on_auth_user_created` em `auth.users` e com RLS de dono (`auth.uid() = id`).
- **Modelo Prisma**: `Profile` (`prisma/schema.prisma`).

### Rota de login — `/login`

- **Rota**: `src/app/(auth)/login/page.tsx` → `LoginForm` → `loginAction` (`supabase.auth.signInWithPassword`)
- Após autenticar, `garantirPerfil()` garante a linha em `profiles` (fallback do trigger).

### Schema de sessão

| Camada | Onde | Conteúdo |
| --- | --- | --- |
| Cookie | `sb-<projeto>-auth-token` | access/refresh token (gerenciado por `@supabase/ssr`) |
| Renovação | `src/proxy.ts` | `getUser()` a cada request + redirect de rotas |
| Leitura | `getSessao()` em `src/lib/auth.ts` | `SessaoAtual` (`src/types/auth.ts`): `userId`, `email`, `expiraEm`, `restantesEmSegundos`, `contaCriadaEm`, `emailConfirmado` |
| Proteção de rotas | `requireUser()` | `PerfilUsuario` (`id`, `nome`, `email`, `telefone`, `avatarUrl`) |
| Banco | `auth.users` / `auth.sessions` | modelados como `AuthUser` / `AuthSession` no Prisma (somente leitura/documentação) |

---

## Estrutura

```
src/
├── actions/            Server Actions (auth, itens, baixa)
├── app/
│   ├── (auth)/         /login e /cadastro (layout split com aside)
│   ├── (dashboard)/    / , /estoque/[categoria] + loading.tsx
│   ├── globals.css     tema EdCar (Tailwind 4 + variáveis)
│   ├── layout.tsx      html lang pt-BR + Toaster
│   └── not-found.tsx
├── components/
│   ├── auth/           formulários e aside de autenticação
│   ├── dashboard/      sidebar, header, cards do resumo
│   ├── estoque/        toolbar, data table e diálogos
│   └── ui/             componentes shadcn/ui
├── hooks/use-mobile.ts
├── lib/
│   ├── auth.ts         requireUser()
│   ├── constants.ts    rótulos, limites, tamanhos de página
│   ├── format.ts       moeda BRL, máscaras, datas
│   ├── queries.ts      listagem paginada e resumo do dashboard
│   ├── supabase/       clientes server/browser + env
│   └── validators.ts   schemas Zod (item, baixa, auth, searchParams)
├── proxy.ts            middleware: refresh de sessão + redirecionamentos
└── types/              Item, StockMovement, Database, ActionResult

prisma/schema.prisma    modelagem (validação)
supabase/migrations/    0001_init.sql (tabelas, RLS, índices, dar_baixa)
```

---

## Segurança

- Cookies de sessão gerenciados pelo `@supabase/ssr` (proxy renova o token)
- RLS habilitado nas tabelas `items` e `stock_movements`
- Função `dar_baixa(uuid, integer)` executada apenas por `authenticated`
- Validação de entrada no servidor (Zod) mesmo com o formulário já validado no cliente
- Busca com escape de curingas (`%`, `_`, `\`) para evitar comportamento inesperado no `ILIKE`

---

## Fluxo de estoque

| Ação | Movimento gravado |
| --- | --- |
| Cadastro de item com saldo > 0 | `entrada` (saldo anterior 0) |
| Baixa pelo modal | `baixa` (via `dar_baixa`, com lock de linha) |
| Edição que altera o saldo | `ajuste` (saldo anterior → posterior) |
