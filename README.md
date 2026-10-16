# EdCar Estoque

Sistema interno de controle de estoque da loja **EdCar Hidrovácuo**: cadastro, consulta, edição e baixa de **Diafragmas** e **Peças de Reposição e Reparo**, com histórico completo de movimentações.

Reescrito do zero com **Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Prisma**, com **autenticação própria (bcrypt + JWT)** e **API REST** em Route Handlers, pronto para produção.

---

## Funcionalidades

- **Autenticação própria** (e-mail + senha): senha com hash `bcrypt`, sessão com **JWT** assinado no servidor e registrada na tabela `sessions`
- Rotas de API REST em `src/app/api` consumidas pelo cliente via `fetch` com `Authorization: Bearer <token>`
- Rotas protegidas por guards em client components (sem cookies e sem middleware)
- Duas categorias de estoque: **Diafragma** (`/estoque/diafragma`) e **Peças** (`/estoque/pecas`)
- CRUD completo de itens com formulário validado (Zod + react-hook-form)
- Busca por nome, código ou modelo, paginação e itens por página (20/50)
- **Baixa atômica** via `POST /api/items/[id]/baixa` (transação Prisma com validação de saldo e gravação do movimento)
- Dashboard com totais, valor do estoque, itens com estoque baixo e últimas movimentações
- Interface responsiva (sidebar colapsável, listagem em tabela no desktop e cartões no mobile)
- Feedback com `sonner` (toasts), estados de vazio, erro e de carregamento (`loading.tsx`)

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Estilos | Tailwind CSS 4 + shadcn/ui (radix-nova) + lucide-react |
| Formulários | react-hook-form + @hookform/resolvers + Zod |
| Autenticação | `bcryptjs` (hash de senha) + `jsonwebtoken` (JWT) + tabelas `users`/`sessions` |
| API | Route Handlers (`src/app/api`) + Zod (validação no servidor) |
| Dados | PostgreSQL via **Prisma Client** (`@prisma/client`) |
| Modelagem | Prisma (`prisma/schema.prisma` + `prisma/migrations`) |
| Qualidade | ESLint 9 (flat config), `tsc --noEmit` |

---

## Requisitos

- Node.js 20+
- Um banco **PostgreSQL** (ex.: [Supabase](https://supabase.com)). O app usa apenas a **conexão Postgres** — não usa o Supabase Auth nem `supabase-js`.

---

## Como rodar

```bash
# 1) Instalar dependências
npm install

# 2) Configurar o ambiente
cp .env.example .env
# edite .env com a DATABASE_URL/DIRECT_URL do seu Postgres e um JWT_SECRET forte

# 3) Aplicar o schema (Prisma Migrate)
npm run db:deploy
#    Banco já existente (SQL antigo já aplicado): npm run db:baseline
#    NÃO use `prisma db push` nem `prisma migrate dev` — veja a seção Schema.

# 4) (opcional) Popular itens e movimentações mockados para visualização
npm run db:seed

# 5) Subir em modo desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` — sem sessão você é redirecionado para `/login`. Crie a primeira conta em `/cadastro`.

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
| `npm run db:generate` | Regenera o Prisma Client |
| `npm run db:migrate -- nome` | Gera SQL em `prisma/migrations` a partir do schema (não aplica) |
| `npm run db:deploy` | Aplica migrations pendentes no banco (`prisma migrate deploy`) |
| `npm run db:status` | Mostra quais migrations já foram aplicadas |
| `npm run db:baseline` | Marca `0_init` como já aplicada (banco que já tinha o SQL antigo) |
| `npm run db:seed` | Insere itens/movimentações mockados (`MOCK-*`) para visualização |

---

## Variáveis de ambiente

`.env.example`:

```bash
# Prisma CLI + runtime. Use a URL direta (porta 5432), não o pooler 6543.
DATABASE_URL=postgresql://postgres.[ref]:[senha]@db.[ref].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres.[ref]:[senha]@db.[ref].supabase.co:5432/postgres

# Segredo usado para assinar os tokens JWT de sessão (forte e aleatório).
JWT_SECRET=troque-esta-chave-secreta
```

> **JWT_SECRET é obrigatório em produção.** Se ficar ausente, o código usa um
> segredo de desenvolvimento e emite um aviso — nunca use esse fallback fora
> do ambiente local.
>
> As variáveis `NEXT_PUBLIC_SUPABASE_*` são legado do modelo anterior de
> autenticação e **não** são mais usadas pelo app.

---

## Autenticação e sessão

### Fluxo

1. O usuário se cadastra em `/cadastro` (`CadastroForm`) ou entra em `/login` (`LoginForm`).
2. O formulário chama `POST /api/auth/cadastro` ou `POST /api/auth/login`.
3. A rota valida os dados (Zod), faz hash/comparação da senha (`bcrypt`), grava (ou lê) a linha em `users` e cria uma linha em `sessions`.
4. A resposta devolve `{ user, token }`; o `SessionProvider` guarda o **JWT** no `localStorage` (chave `token`).
5. As requisições seguintes enviam `Authorization: Bearer <token>`; `getAuthenticatedUser` (`src/lib/api-auth.ts`) valida a assinatura do JWT **e** confirma que a sessão ainda existe e não expirou em `sessions`.

### Cadastro — `/cadastro`

| Campo | Origem | Persistência |
| --- | --- | --- |
| `nome` | formulário (`cadastroFormSchema`) | `users.nome` |
| `email` | formulário | `users.email` (único, lowercase) |
| `telefone` | formulário (opcional, máscara `(00) 00000-0000`) | `users.telefone` |
| `avatar` | arquivo local (opcional, JPG/PNG/WebP, ≤128×128) | `users.avatar_url` (data URL base64 ou URL) |
| `senha` | formulário (mín. 6) | `users.senha_hash` (bcrypt, salt 12 — nunca em texto puro) |

### Sessão (client-side)

| Camada | Onde | Conteúdo |
| --- | --- | --- |
| Persistência | `localStorage` (chave `token`) | JWT de sessão (7 dias) |
| Provider | `src/components/session/session-provider.tsx` | `useSessao()`: `carregando`, `perfil`, `token`, `definirSessao`, `sair` |
| Reidratação | `GET /api/auth/me` no boot | recarrega o `perfil` a partir do token salvo |
| Guards | `(auth)/layout.tsx` e `(dashboard)/layout.tsx` | redirecionam conforme o estado da sessão |
| Logout | `POST /api/auth/logout` + `clearToken()` | apaga a sessão no banco e o token local |

---

## API (REST)

Todas as rotas de itens/dashboard exigem `Authorization: Bearer <token>`.
Erros retornam `{ "error": "mensagem" }` com o status HTTP correspondente.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/api/auth/cadastro` | Cria o usuário, abre sessão e devolve `{ user, token }` |
| `POST` | `/api/auth/login` | Autentica e devolve `{ user, token }` |
| `GET` | `/api/auth/me` | Perfil do usuário autenticado (usado para reidratar a sessão) |
| `POST` | `/api/auth/logout` | Encerra a sessão (remove o token de `sessions`) |
| `GET` | `/api/items` | Lista paginada. Filtros: `categoria`, `q`, `campo` (`nome`/`codigo`/`modelo`), `pagina`, `tamanho` |
| `POST` | `/api/items` | Cria item (registra movimento `entrada` se o saldo inicial > 0) |
| `GET` | `/api/items/[id]` | Detalhe do item |
| `PUT` | `/api/items/[id]` | Atualiza item (registra movimento `ajuste` se o saldo mudar) |
| `DELETE` | `/api/items/[id]` | Exclui item |
| `POST` | `/api/items/[id]/baixa` | Baixa atômica `{ quantidade }` → `{ saldo }` |
| `GET` | `/api/dashboard` | Totais, valor do estoque, itens baixos e últimas movimentações |

O cliente usa os helpers de `src/lib/api/client.ts` (`apiGet`, `apiPost`, `apiPut`, `apiDelete`, `createItemApi`, `updateItemApi`, `deleteItemApi`, `baixaItemApi`) e os fetchers de `src/lib/queries.ts` (`buscarListagem`, `buscarResumoDashboard`).

---

## Estrutura

```
src/
├── app/
│   ├── api/                    Route Handlers (REST)
│   │   ├── auth/               cadastro, login, me, logout
│   │   ├── items/              listagem/criação e [id] (GET/PUT/DELETE) + [id]/baixa
│   │   └── dashboard/
│   ├── (auth)/                 /login e /cadastro (layout split com aside)
│   ├── (dashboard)/            / , /estoque/[categoria] + loading.tsx
│   ├── globals.css             tema EdCar (Tailwind 4 + variáveis)
│   ├── layout.tsx              html lang pt-BR + SessionProvider + Toaster
│   └── not-found.tsx
├── components/
│   ├── auth/                   formulários e aside de autenticação
│   ├── dashboard/              sidebar, header, cards do resumo
│   ├── estoque/                toolbar, data table e diálogos
│   ├── session/                SessionProvider + useSessao
│   └── ui/                     componentes shadcn/ui
├── hooks/use-mobile.ts
├── lib/
│   ├── api-auth.ts             valida o Bearer + a sessão (getAuthenticatedUser)
│   ├── api/                    client HTTP (client.ts) e serializers (DTOs)
│   ├── auth/                   hash (bcrypt), jwt (jsonwebtoken), client (localStorage)
│   ├── auth-error.ts           mapAuthError (mensagens pt-BR)
│   ├── avatar.ts               processamento e validação da foto de perfil
│   ├── constants.ts            rótulos, limites, tamanhos de página
│   ├── estoque-events.ts       evento de refresh pós-mutação
│   ├── format.ts               moeda BRL, máscaras, datas
│   ├── prisma.ts               instância única do PrismaClient
│   ├── queries.ts              listagem paginada e resumo do dashboard (via API)
│   ├── utils.ts                utilitários gerais
│   └── validators.ts           schemas Zod (item, baixa, auth, searchParams)
└── types/                      Item, StockMovement, Auth, ActionResult

scripts/
├── criar-migration.mjs         gera SQL de migration via diff do banco (sem shadow DB)
└── seed.mjs                    dados mockados (MOCK-*)

prisma/
├── schema.prisma               fonte da verdade das tabelas public
└── migrations/                 SQL versionado (DDL Prisma + RLS/funções/triggers)
```

---

## Schema (Prisma + Postgres)

O Prisma descreve o schema `public` do app. O runtime usa **Prisma Client** com a conexão direta do Postgres.

Modelos:

- `Item` — itens de estoque (`categoria`, `codigo`, `nome`, `modelo`, `medidas`, `qtd_estoque`, `valor`).
- `StockMovement` — histórico (`entrada`/`baixa`/`ajuste`), com FK para `Item` (`onDelete: Cascade`) e para `User` (`onDelete: SetNull`).
- `User` — usuários da autenticação própria (`nome`, `email` único, `telefone`, `avatar_url`, `senha_hash`).
- `Session` — sessões emitidas (`token` único, `expires_at`), FK para `User` (`onDelete: Cascade`).

> A baseline `0_init` ainda contém objetos do modelo anterior (tabela `profiles`,
> políticas de RLS, função `dar_baixa`, `handle_new_user`). Eles permanecem no
> banco por compatibilidade, mas **não** são usados pela autenticação atual.

### Como atualizar o schema

1. Edite `prisma/schema.prisma` (coluna, tabela, índice btree, enum).
2. Gere o SQL **sem aplicar**: `npm run db:migrate -- nome_curto`
3. Abra `prisma/migrations/<timestamp>_nome/migration.sql` e revise (o diff compara o banco real e pode sugerir remover objetos que o Prisma não modela).
4. Aplique: `npm run db:deploy`
5. Regenere o client se for usar Prisma Client: `npm run db:generate`

Mudança só de trigger/função (sem alterar o `schema.prisma`): crie a pasta `prisma/migrations/<timestamp>_nome/` na mão, escreva o `migration.sql` e rode `npm run db:deploy`.

---

## Segurança

- Senhas com `bcrypt` (salt 12) em `users.senha_hash` — nunca em texto puro
- JWT assinado no servidor (`jsonwebtoken`, HS256, TTL de 7 dias) com `JWT_SECRET`
- Cada requisição protegida valida o JWT **e** a linha correspondente em `sessions` (`getAuthenticatedUser`), permitindo revogar sessões no logout
- Token trafegado no header `Authorization: Bearer`; nada de cookies
- Validação de entrada no servidor (Zod) mesmo com o formulário já validado no cliente

---

## Fluxo de estoque

| Ação | Movimento gravado |
| --- | --- |
| Cadastro de item com saldo > 0 | `entrada` (saldo anterior 0) |
| Baixa pelo modal | `baixa` (via `POST /api/items/[id]/baixa`, transação Prisma com validação de saldo) |
| Edição que altera o saldo | `ajuste` (saldo anterior → posterior) |
