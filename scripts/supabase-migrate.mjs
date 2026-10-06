/**
 * Aplica as migrations SQL do projeto (supabase/migrations/*.sql) no banco
 * Supabase, em ordem alfabética, usando a conexão direta do .env.
 *
 * Uso: npm run db:push
 *
 * Importante: o schema de produção é o dos arquivos .sql — o Prisma aqui
 * apenas modela/valida e NÃO deve executar `prisma db push`/`migrate dev`
 * (destruiriam o schema `auth` do Supabase).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Lê o .env sem depender de carregadores externos. */
function carregarEnvs() {
  const env = {};
  const conteudo = readFileSync(join(raiz, ".env"), "utf8");
  for (const linha of conteudo.split(/\r?\n/)) {
    const match = linha.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let valor = match[2].trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    env[match[1]] = valor;
  }
  return env;
}

const envs = carregarEnvs();
const url = envs.DIRECT_URL || envs.DATABASE_URL;

if (!url) {
  console.error("Defina DIRECT_URL (ou DATABASE_URL) no .env.");
  process.exit(1);
}

const pasta = join(raiz, "supabase", "migrations");
const arquivos = readdirSync(pasta)
  .filter((arquivo) => arquivo.endsWith(".sql"))
  .sort();

if (arquivos.length === 0) {
  console.error(`Nenhuma migration encontrada em ${pasta}.`);
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });

try {
  await client.connect();
  console.log(`Conectado. Aplicando ${arquivos.length} migration(s)...`);
  for (const arquivo of arquivos) {
    const sql = readFileSync(join(pasta, arquivo), "utf8");
    console.log(`⚙️  Aplicando ${arquivo}...`);
    await client.query(sql);
  }
  console.log("✔ Migrations aplicadas com sucesso.");
} catch (erro) {
  console.error(`✖ Falha ao aplicar migrations: ${erro.message}`);
  process.exit(1);
} finally {
  await client.end();
}