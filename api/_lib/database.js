import { mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { createClient } from '@libsql/client';
import {
  DEFAULT_LIDERES,
  getDiaSemana,
  getSemana,
  isAllowedDay,
  normalizarTexto,
  unicosPreservandoOrdem,
} from '../../src/shared/catalog.js';

const LOCAL_DB_DIR = '/home/user/app/.data';
const LOCAL_DB_URL = `file:${LOCAL_DB_DIR}/relatorio-semanal.db`;

let client;
let schemaPromise;

function getDatabaseConfig() {
  if (process.env.TURSO_DATABASE_URL) {
    return {
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    };
  }

  if (process.env.VERCEL) {
    throw new Error('As variáveis TURSO_DATABASE_URL e TURSO_AUTH_TOKEN precisam ser configuradas na Vercel.');
  }

  return { url: LOCAL_DB_URL };
}

async function ensureClient() {
  if (client) return client;

  const config = getDatabaseConfig();
  if (config.url.startsWith('file:')) {
    await mkdir(LOCAL_DB_DIR, { recursive: true });
  }

  client = createClient(config.authToken
    ? { url: config.url, authToken: config.authToken }
    : { url: config.url });

  return client;
}

async function ensureSchema() {
  if (schemaPromise) return schemaPromise;

  schemaPromise = (async () => {
    const db = await ensureClient();

    await db.execute(`
      CREATE TABLE IF NOT EXISTS lideres (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        criado_em TEXT NOT NULL
      )
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS relatorios (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        semana TEXT NOT NULL,
        dia_semana TEXT NOT NULL,
        grupo TEXT NOT NULL,
        lider TEXT NOT NULL,
        nucleo TEXT NOT NULL,
        local TEXT,
        voluntarios INTEGER NOT NULL,
        total_participantes INTEGER NOT NULL,
        total_igreja INTEGER NOT NULL,
        criado_em TEXT NOT NULL
      )
    `);

    await db.execute('CREATE INDEX IF NOT EXISTS idx_relatorios_data ON relatorios (data DESC)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_relatorios_semana ON relatorios (semana)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_relatorios_lider ON relatorios (lider)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_relatorios_grupo ON relatorios (grupo)');

    for (const nome of DEFAULT_LIDERES) {
      await db.execute({
        sql: 'INSERT OR IGNORE INTO lideres (nome, criado_em) VALUES (?, ?)',
        args: [nome, new Date().toISOString()],
      });
    }
  })();

  return schemaPromise;
}

function toInteger(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`O campo ${fieldName} precisa ser um número igual ou maior que zero.`);
  }
  return Math.trunc(parsed);
}

// 🔥 CORRIGIDO AQUI
function normalizeRelatorioInput(input) {
  const data = normalizarTexto(input.data);
  const grupo = normalizarTexto(input.grupo);
  const lider = normalizarTexto(input.lider);
  const nucleo = normalizarTexto(input.nucleo);

  // ✅ APENAS UMA VEZ
  const local = normalizarTexto(input.local) || '';

  if (!data) throw new Error('Informe a data.');
  if (!isAllowedDay(data)) throw new Error('Envios apenas de terça a sábado.');
  if (!grupo) throw new Error('Selecione o grupo.');
  if (!lider) throw new Error('Informe o nome do líder.');
  if (!nucleo) throw new Error('Informe o núcleo.');

  return {
    id: normalizarTexto(input.id) || randomUUID(),
    data,
    semana: getSemana(data),
    diaSemana: getDiaSemana(data),
    grupo,
    lider,
    nucleo,
    local,
    voluntarios: toInteger(input.voluntarios, 'voluntarios'),
    totalParticipantes: toInteger(input.totalParticipantes, 'totalParticipantes'),
    totalIgreja: toInteger(input.totalIgreja, 'totalIgreja'),
    criadoEm: normalizarTexto(input.criadoEm) || new Date().toISOString(),
  };
}

function mapRelatorioRow(row) {
  return {
    id: row.id,
    data: row.data,
    semana: getSemana(row.data),
    diaSemana: row.dia_semana,
    grupo: row.grupo,
    lider: row.lider,
    nucleo: row.nucleo,
    local: row.local,
    voluntarios: Number(row.voluntarios) || 0,
    totalParticipantes: Number(row.total_participantes) || 0,
    totalIgreja: Number(row.total_igreja) || 0,
    criadoEm: row.criado_em,
  };
}

export async function listLideres() {
  await ensureSchema();
  const db = await ensureClient();
  const result = await db.execute('SELECT nome FROM lideres ORDER BY id ASC');
  return unicosPreservandoOrdem(DEFAULT_LIDERES, result.rows.map(row => row.nome));
}

export async function saveLider(nome) {
  await ensureSchema();
  const db = await ensureClient();
  const lider = normalizarTexto(nome);
  if (!lider) return listLideres();

  await db.execute({
    sql: 'INSERT OR IGNORE INTO lideres (nome, criado_em) VALUES (?, ?)',
    args: [lider, new Date().toISOString()],
  });

  return listLideres();
}

export async function listRelatorios() {
  await ensureSchema();
  const db = await ensureClient();
  const result = await db.execute(`
    SELECT id, data, semana, dia_semana, grupo, lider, nucleo, local,
           voluntarios, total_participantes, total_igreja, criado_em
    FROM relatorios
    ORDER BY data DESC, criado_em DESC
  `);
  return result.rows.map(mapRelatorioRow);
}

export async function createRelatorio(input, options = {}) {
  await ensureSchema();
  const db = await ensureClient();
  const relatorio = normalizeRelatorioInput(input);

  await saveLider(relatorio.lider);

  await db.execute({
    sql: options.ignoreExisting
      ? `INSERT OR IGNORE INTO relatorios (
           id, data, semana, dia_semana, grupo, lider, nucleo, local,
           voluntarios, total_participantes, total_igreja, criado_em
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      : `INSERT INTO relatorios (
           id, data, semana, dia_semana, grupo, lider, nucleo, local,
           voluntarios, total_participantes, total_igreja, criado_em
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      relatorio.id,
      relatorio.data,
      relatorio.semana,
      relatorio.diaSemana,
      relatorio.grupo,
      relatorio.lider,
      relatorio.nucleo,
      relatorio.local,
      relatorio.voluntarios,
      relatorio.totalParticipantes,
      relatorio.totalIgreja,
      relatorio.criadoEm,
    ],
  });

  return relatorio;
}

export async function deleteRelatorio(id) {
  await ensureSchema();
  const db = await ensureClient();
  await db.execute({
    sql: 'DELETE FROM relatorios WHERE id = ?',
    args: [id],
  });
}

export async function migrateLegacyData(payload) {
  const lideres = Array.isArray(payload.lideres) ? payload.lideres : [];
  const relatorios = Array.isArray(payload.relatorios) ? payload.relatorios : [];

  for (const lider of lideres) {
    await saveLider(lider);
  }

  for (const relatorio of relatorios) {
    await createRelatorio(relatorio, { ignoreExisting: true });
  }

  return {
    lideres: await listLideres(),
    relatorios: await listRelatorios(),
  };
}

export async function updateRelatorio(id, input) {
  await ensureSchema();
  const db = await ensureClient();

  const relatorio = normalizeRelatorioInput({ ...input, id });

  await db.execute({
    sql: `
      UPDATE relatorios SET
        data = ?,
        semana = ?,
        dia_semana = ?,
        grupo = ?,
        lider = ?,
        nucleo = ?,
        local = ?,
        voluntarios = ?,
        total_participantes = ?,
        total_igreja = ?
      WHERE id = ?
    `,
    args: [
      relatorio.data,
      relatorio.semana,
      relatorio.diaSemana,
      relatorio.grupo,
      relatorio.lider,
      relatorio.nucleo,
      relatorio.local,
      relatorio.voluntarios,
      relatorio.totalParticipantes,
      relatorio.totalIgreja,
      id,
    ],
  });

  return relatorio;
}

export async function deleteAllRelatorios() {
  await ensureSchema();
  const db = await ensureClient();
  await db.execute('DELETE FROM relatorios');
}