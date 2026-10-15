/**
 * Gera uma pasta prisma/migrations/<timestamp>_<nome>/migration.sql
 * comparando o banco atual (DIRECT_URL) com prisma/schema.prisma.
 *
 * Não aplica a migration (isso é `npm run db:deploy`).
 * Não usa shadow database — adequado ao Supabase hospedado.
 *
 * Uso: npm run db:migrate -- nome_da_mudanca
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

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

const nomeBruto = process.argv[2];
if (!nomeBruto) {
  console.error("Uso: npm run db:migrate -- nome_da_mudanca");
  process.exit(1);
}

const slug = nomeBruto
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_|_$/g, "");

if (!slug) {
  console.error("Informe um nome válido para a migration (letras/números).");
  process.exit(1);
}

const envs = carregarEnvs();
const url = envs.DIRECT_URL || envs.DATABASE_URL;
if (!url) {
  console.error("Defina DIRECT_URL (conexão direta, porta 5432) no .env.");
  process.exit(1);
}

const agora = new Date();
const ts = [
  agora.getUTCFullYear(),
  String(agora.getUTCMonth() + 1).padStart(2, "0"),
  String(agora.getUTCDate()).padStart(2, "0"),
  String(agora.getUTCHours()).padStart(2, "0"),
  String(agora.getUTCMinutes()).padStart(2, "0"),
  String(agora.getUTCSeconds()).padStart(2, "0"),
].join("");

const pastaRel = join("prisma", "migrations", `${ts}_${slug}`);
const schemaRel = join("prisma", "schema.prisma");

console.log("Calculando diff entre o banco e prisma/schema.prisma...");

const result = spawnSync(
  "npx",
  [
    "prisma",
    "migrate",
    "diff",
    "--from-url",
    url,
    "--to-schema-datamodel",
    schemaRel,
    "--script",
  ],
  { cwd: raiz, encoding: "utf8", shell: true },
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || "Falha no prisma migrate diff.");
  process.exit(result.status ?? 1);
}

const sql = (result.stdout || "").trim();
if (!sql || sql.includes("This is an empty migration")) {
  console.log("Nenhuma diferença de tabelas/colunas. Schema e banco já batem.");
  console.log(
    "Se a mudança for só SQL (RLS, função, trigger), crie a pasta em prisma/migrations e escreva o migration.sql na mão.",
  );
  process.exit(0);
}

const aviso = `-- Revise este SQL antes de aplicar (npm run db:deploy).
-- Remova qualquer DROP em auth.*, políticas RLS, funções, índices GIN
-- (pg_trgm) ou FKs para auth.users — o Prisma não os modela e o diff
-- pode sugerir apagá-los. Acrescente RLS/triggers se criou tabela nova.

`;

mkdirSync(join(raiz, pastaRel), { recursive: true });
writeFileSync(join(raiz, pastaRel, "migration.sql"), `${aviso}${sql}\n`);

const perigoso = /\bdrop\b/i.test(sql) || /\bauth\./i.test(sql);
console.log(`✔ Arquivo criado: ${pastaRel.replaceAll("\\", "/")}/migration.sql`);
if (perigoso) {
  console.log(
    "⚠ O SQL contém DROP ou referências a auth. Revise com cuidado antes do deploy.",
  );
} else {
  console.log("Próximo passo: revisar o arquivo e rodar npm run db:deploy");
}
