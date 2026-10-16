/**
 * Popula o banco com itens e movimentações mockados (prefixo MOCK-)
 * para visualizar dashboard, listagens, paginação e estoque baixo.
 *
 * Uso: npm run db:seed
 *
 * Idempotente: remove apenas registros MOCK-* e reinsere.
 * Não apaga itens cadastrados pela loja.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const PREFIXO = "MOCK-";
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

/** Horas atrás → timestamp ISO (UTC). */
function ha(horas) {
  return new Date(Date.now() - horas * 60 * 60 * 1000).toISOString();
}

/**
 * @typedef {{
 *   codigo: string;
 *   nome: string;
 *   modelo: string;
 *   descricao: string | null;
 *   medidas: number;
 *   qtd: number;
 *   valor?: number | null;
 *   criadoHa: number;
 * }} ItemSeed
 */

/** @type {ItemSeed[]} */
const DIAFRAGMAS = [
  {
    codigo: `${PREFIXO}D-1001`,
    nome: "Diafragma hidrovácuo 8\"",
    modelo: "Gol, Voyage, Parati",
    descricao: "Diafragma 8 polegadas para linha VW",
    medidas: 203,
    qtd: 18,
    criadoHa: 240,
  },
  {
    codigo: `${PREFIXO}D-1002`,
    nome: "Diafragma hidrovácuo 9\"",
    modelo: "Uno, Palio, Siena",
    descricao: "Diafragma 9 polegadas linha Fiat",
    medidas: 229,
    qtd: 11,
    criadoHa: 220,
  },
  {
    codigo: `${PREFIXO}D-1003`,
    nome: "Diafragma hidrovácuo 7\"",
    modelo: "Celta, Corsa, Prisma",
    descricao: null,
    medidas: 178,
    qtd: 2,
    criadoHa: 200,
  },
  {
    codigo: `${PREFIXO}D-1004`,
    nome: "Diafragma hidrovácuo 10\"",
    modelo: "S10, Blazer",
    descricao: "Aplicação picape e SUV Chevrolet",
    medidas: 254,
    qtd: 7,
    criadoHa: 180,
  },
  {
    codigo: `${PREFIXO}D-1005`,
    nome: "Diafragma hidrovácuo Toyota",
    modelo: "Corolla, Fielder",
    descricao: "Reposição original equivalente",
    medidas: 210,
    qtd: 1,
    criadoHa: 160,
  },
  {
    codigo: `${PREFIXO}D-1006`,
    nome: "Diafragma hidrovácuo Ford",
    modelo: "Ka, Fiesta, EcoSport",
    descricao: null,
    medidas: 195,
    qtd: 14,
    criadoHa: 150,
  },
  {
    codigo: `${PREFIXO}D-1007`,
    nome: "Diafragma hidrovácuo Honda",
    modelo: "Civic, Fit, City",
    descricao: "Borracha reforçada",
    medidas: 215,
    qtd: 0,
    criadoHa: 140,
  },
  {
    codigo: `${PREFIXO}D-1008`,
    nome: "Diafragma hidrovácuo Renault",
    modelo: "Sandero, Logan, Duster",
    descricao: "Linha Renault 2008+",
    medidas: 200,
    qtd: 9,
    criadoHa: 130,
  },
  {
    codigo: `${PREFIXO}D-1009`,
    nome: "Diafragma hidrovácuo Hyundai",
    modelo: "HB20, Creta",
    descricao: null,
    medidas: 208,
    qtd: 5,
    criadoHa: 110,
  },
  {
    codigo: `${PREFIXO}D-1010`,
    nome: "Diafragma hidrovácuo Jeep",
    modelo: "Renegade, Compass",
    descricao: "Medida reforçada",
    medidas: 240,
    qtd: 4,
    criadoHa: 96,
  },
  {
    codigo: `${PREFIXO}D-1011`,
    nome: "Diafragma hidrovácuo Peugeot",
    modelo: "208, 2008, 308",
    descricao: "Linha PSA",
    medidas: 198,
    qtd: 6,
    criadoHa: 72,
  },
  {
    codigo: `${PREFIXO}D-1012`,
    nome: "Diafragma hidrovácuo Nissan",
    modelo: "March, Versa, Kicks",
    descricao: null,
    medidas: 205,
    qtd: 8,
    criadoHa: 48,
  },
  {
    codigo: `${PREFIXO}D-1013`,
    nome: "Diafragma hidrovácuo Mitsubishi",
    modelo: "L200, Pajero",
    descricao: "Uso pesado",
    medidas: 260,
    qtd: 3,
    criadoHa: 36,
  },
  {
    codigo: `${PREFIXO}D-1014`,
    nome: "Diafragma hidrovácuo VW T-Cross",
    modelo: "T-Cross, Nivus, Polo",
    descricao: "Geração MQB",
    medidas: 212,
    qtd: 13,
    criadoHa: 24,
  },
];

/** @type {ItemSeed[]} */
const PECAS = [
  {
    codigo: `${PREFIXO}P-2001`,
    nome: "Kit reparo hidrovácuo completo",
    modelo: "Gol, Voyage, Parati",
    descricao: "Kit com diafragma, anéis e vedações",
    medidas: 203,
    qtd: 10,
    valor: 189.9,
    criadoHa: 230,
  },
  {
    codigo: `${PREFIXO}P-2002`,
    nome: "Válvula check hidrovácuo",
    modelo: "Uno, Palio, Siena",
    descricao: "Válvula unidirecional",
    medidas: 18,
    qtd: 25,
    valor: 42.5,
    criadoHa: 210,
  },
  {
    codigo: `${PREFIXO}P-2003`,
    nome: "Anel de vedação hidrovácuo",
    modelo: "Celta, Corsa",
    descricao: null,
    medidas: 12,
    qtd: 2,
    valor: 8.9,
    criadoHa: 190,
  },
  {
    codigo: `${PREFIXO}P-2004`,
    nome: "Cilindro mestre de freio",
    modelo: "S10, Blazer",
    descricao: "Cilindro simples",
    medidas: 28,
    qtd: 6,
    valor: 320,
    criadoHa: 175,
  },
  {
    codigo: `${PREFIXO}P-2005`,
    nome: "Servo freio recondicionado",
    modelo: "Corolla, Fielder",
    descricao: "Unidade revisada com garantia",
    medidas: 230,
    qtd: 1,
    valor: 780,
    criadoHa: 165,
  },
  {
    codigo: `${PREFIXO}P-2006`,
    nome: "Mangueira de vácuo",
    modelo: "Ka, Fiesta",
    descricao: "Mangueira 8mm reforçada",
    medidas: 8,
    qtd: 40,
    valor: 15.75,
    criadoHa: 155,
  },
  {
    codigo: `${PREFIXO}P-2007`,
    nome: "Tampa do reservatório de fluido",
    modelo: "Civic, Fit",
    descricao: null,
    medidas: 55,
    qtd: 0,
    valor: 27.4,
    criadoHa: 145,
  },
  {
    codigo: `${PREFIXO}P-2008`,
    nome: "Haste do servo freio",
    modelo: "Sandero, Logan",
    descricao: "Haste regulável",
    medidas: 120,
    qtd: 8,
    valor: 64.9,
    criadoHa: 135,
  },
  {
    codigo: `${PREFIXO}P-2009`,
    nome: "Kit anéis O-ring hidrovácuo",
    modelo: "HB20, Creta",
    descricao: "Jogo com 12 anéis",
    medidas: 10,
    qtd: 16,
    valor: 22,
    criadoHa: 120,
  },
  {
    codigo: `${PREFIXO}P-2010`,
    nome: "Flange do hidrovácuo",
    modelo: "Renegade, Compass",
    descricao: "Flange de alumínio",
    medidas: 95,
    qtd: 4,
    valor: 145.5,
    criadoHa: 100,
  },
  {
    codigo: `${PREFIXO}P-2011`,
    nome: "Pino de acionamento",
    modelo: "208, 2008",
    descricao: null,
    medidas: 42,
    qtd: 12,
    valor: 19.9,
    criadoHa: 88,
  },
  {
    codigo: `${PREFIXO}P-2012`,
    nome: "Mola de retorno do servo",
    modelo: "March, Versa",
    descricao: "Mola helicoidal",
    medidas: 60,
    qtd: 9,
    valor: 31.2,
    criadoHa: 70,
  },
  {
    codigo: `${PREFIXO}P-2013`,
    nome: "Junta da câmara de vácuo",
    modelo: "L200, Pajero",
    descricao: "Junta de papelão especial",
    medidas: 250,
    qtd: 7,
    valor: 18.6,
    criadoHa: 58,
  },
  {
    codigo: `${PREFIXO}P-2014`,
    nome: "Reservatório de fluido de freio",
    modelo: "T-Cross, Nivus, Polo",
    descricao: "Reservatório com sensor",
    medidas: 110,
    qtd: 5,
    valor: 96.8,
    criadoHa: 46,
  },
  {
    codigo: `${PREFIXO}P-2015`,
    nome: "Sensor de nível do fluido",
    modelo: "Gol, Voyage",
    descricao: null,
    medidas: 22,
    qtd: 3,
    valor: 54,
    criadoHa: 40,
  },
  {
    codigo: `${PREFIXO}P-2016`,
    nome: "Filtro de ar do hidrovácuo",
    modelo: "Uno, Palio",
    descricao: "Filtro esponjoso",
    medidas: 35,
    qtd: 21,
    valor: 12.5,
    criadoHa: 32,
  },
  {
    codigo: `${PREFIXO}P-2017`,
    nome: "Parafuso de fixação do servo",
    modelo: "Celta, Corsa, Prisma",
    descricao: "Jogo com 4 parafusos",
    medidas: 14,
    qtd: 30,
    valor: 9.9,
    criadoHa: 28,
  },
  {
    codigo: `${PREFIXO}P-2018`,
    nome: "Câmara traseira do hidrovácuo",
    modelo: "S10, Blazer",
    descricao: "Carcaça traseira",
    medidas: 254,
    qtd: 2,
    valor: 210,
    criadoHa: 20,
  },
  {
    codigo: `${PREFIXO}P-2019`,
    nome: "Kit reparo cilindro mestre",
    modelo: "Ka, Fiesta, EcoSport",
    descricao: "Gaxetas e copos",
    medidas: 22,
    qtd: 14,
    valor: 48.3,
    criadoHa: 16,
  },
  {
    codigo: `${PREFIXO}P-2020`,
    nome: "Conexão de vácuo plástica",
    modelo: "Civic, Fit, City",
    descricao: null,
    medidas: 10,
    qtd: 18,
    valor: 7.5,
    criadoHa: 12,
  },
  {
    codigo: `${PREFIXO}P-2021`,
    nome: "Tampa da câmara dianteira",
    modelo: "Sandero, Logan, Duster",
    descricao: "Tampa com flange",
    medidas: 200,
    qtd: 4,
    valor: 168,
    criadoHa: 8,
  },
  {
    codigo: `${PREFIXO}P-2022`,
    nome: "Kit vedação completa hidrovácuo",
    modelo: "HB20, Creta, i30",
    descricao: "Jogo completo de vedações",
    medidas: 208,
    qtd: 6,
    valor: 112.9,
    criadoHa: 4,
  },
];

const envs = carregarEnvs();
const url = envs.DIRECT_URL || envs.DATABASE_URL;

if (!url) {
  console.error("Defina DIRECT_URL (ou DATABASE_URL) no .env.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });

/**
 * @param {import('pg').Client} db
 * @param {'diafragma' | 'pecas'} categoria
 * @param {ItemSeed} item
 */
async function inserirItem(db, categoria, item) {
  const criado = ha(item.criadoHa);
  const { rows } = await db.query(
    `insert into public.items
      (categoria, codigo, nome, modelo, descricao, medidas, qtd_estoque, valor, created_at, updated_at)
     values ($1::public.categoria, $2, $3, $4, $5, $6, $7, $8, $9, $9)
     returning id, codigo, qtd_estoque`,
    [
      categoria,
      item.codigo,
      item.nome,
      item.modelo,
      item.descricao,
      item.medidas,
      item.qtd,
      item.valor ?? null,
      criado,
    ],
  );
  return rows[0];
}

/**
 * @param {import('pg').Client} db
 * @param {string} itemId
 * @param {'entrada' | 'baixa' | 'ajuste'} tipo
 * @param {number} quantidade
 * @param {number | null} anterior
 * @param {number | null} posterior
 * @param {string} quando
 */
async function inserirMovimento(
  db,
  itemId,
  tipo,
  quantidade,
  anterior,
  posterior,
  quando,
) {
  await db.query(
    `insert into public.stock_movements
      (item_id, tipo, quantidade, saldo_anterior, saldo_posterior, user_id, created_at)
     values ($1, $2::public.tipo_movimento, $3, $4, $5, null, $6)`,
    [itemId, tipo, quantidade, anterior, posterior, quando],
  );
}

try {
  await client.connect();
  await client.query("begin");

  await client.query("delete from public.items where codigo like $1", [
    `${PREFIXO}%`,
  ]);

  /** @type {Record<string, { id: string; qtd: number }>} */
  const ids = {};

  for (const item of DIAFRAGMAS) {
    const row = await inserirItem(client, "diafragma", item);
    ids[item.codigo] = { id: row.id, qtd: row.qtd_estoque };
  }
  for (const item of PECAS) {
    const row = await inserirItem(client, "pecas", item);
    ids[item.codigo] = { id: row.id, qtd: row.qtd_estoque };
  }

  // Histórico coerente com o saldo atual (entrada inicial + baixas/ajustes).
  const historias = [
    {
      codigo: `${PREFIXO}D-1001`,
      passos: [
        { tipo: "entrada", qtd: 20, haHoras: 238, de: 0, para: 20 },
        { tipo: "baixa", qtd: 2, haHoras: 30, de: 20, para: 18 },
      ],
    },
    {
      codigo: `${PREFIXO}D-1003`,
      passos: [
        { tipo: "entrada", qtd: 8, haHoras: 198, de: 0, para: 8 },
        { tipo: "baixa", qtd: 6, haHoras: 18, de: 8, para: 2 },
      ],
    },
    {
      codigo: `${PREFIXO}D-1005`,
      passos: [
        { tipo: "entrada", qtd: 4, haHoras: 158, de: 0, para: 4 },
        { tipo: "baixa", qtd: 3, haHoras: 10, de: 4, para: 1 },
      ],
    },
    {
      codigo: `${PREFIXO}D-1007`,
      passos: [
        { tipo: "entrada", qtd: 5, haHoras: 138, de: 0, para: 5 },
        { tipo: "baixa", qtd: 5, haHoras: 6, de: 5, para: 0 },
      ],
    },
    {
      codigo: `${PREFIXO}P-2001`,
      passos: [
        { tipo: "entrada", qtd: 12, haHoras: 228, de: 0, para: 12 },
        { tipo: "baixa", qtd: 2, haHoras: 14, de: 12, para: 10 },
      ],
    },
    {
      codigo: `${PREFIXO}P-2003`,
      passos: [
        { tipo: "entrada", qtd: 10, haHoras: 188, de: 0, para: 10 },
        { tipo: "ajuste", qtd: 8, haHoras: 40, de: 10, para: 2 },
      ],
    },
    {
      codigo: `${PREFIXO}P-2005`,
      passos: [
        { tipo: "entrada", qtd: 3, haHoras: 163, de: 0, para: 3 },
        { tipo: "baixa", qtd: 2, haHoras: 8, de: 3, para: 1 },
      ],
    },
    {
      codigo: `${PREFIXO}P-2007`,
      passos: [
        { tipo: "entrada", qtd: 6, haHoras: 143, de: 0, para: 6 },
        { tipo: "baixa", qtd: 6, haHoras: 3, de: 6, para: 0 },
      ],
    },
    {
      codigo: `${PREFIXO}P-2018`,
      passos: [
        { tipo: "entrada", qtd: 4, haHoras: 19, de: 0, para: 4 },
        { tipo: "baixa", qtd: 2, haHoras: 2, de: 4, para: 2 },
      ],
    },
  ];

  const comHistoria = new Set(historias.map((h) => h.codigo));

  for (const historia of historias) {
    const item = ids[historia.codigo];
    if (!item) continue;
    for (const passo of historia.passos) {
      await inserirMovimento(
        client,
        item.id,
        passo.tipo,
        passo.qtd,
        passo.de,
        passo.para,
        ha(passo.haHoras),
      );
    }
  }

  const demais = [...DIAFRAGMAS, ...PECAS].filter(
    (item) => !comHistoria.has(item.codigo) && item.qtd > 0,
  );
  for (const item of demais) {
    const row = ids[item.codigo];
    if (!row) continue;
    await inserirMovimento(
      client,
      row.id,
      "entrada",
      item.qtd,
      0,
      item.qtd,
      ha(item.criadoHa - 1),
    );
  }

  await client.query("commit");

  console.log(
    `✔ Seed concluído: ${DIAFRAGMAS.length} diafragmas, ${PECAS.length} peças e histórico MOCK-*.`,
  );
  console.log(
    "  Itens com estoque baixo (≤2): D-1003, D-1005, D-1007, P-2003, P-2005, P-2007, P-2018.",
  );
} catch (erro) {
  try {
    await client.query("rollback");
  } catch {
    /* ignore */
  }
  console.error(`✖ Falha no seed: ${erro.message}`);
  process.exit(1);
} finally {
  await client.end();
}
