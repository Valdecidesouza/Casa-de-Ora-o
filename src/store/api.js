const LEGACY_RELATORIOS_KEY = 'relatorios_casas_oracao';
const LEGACY_LIDERES_KEY = 'lideres_casas_oracao';
const MIGRATION_KEY = 'relatorios_casas_oracao_migrated_v3';

async function fetchJson(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Não foi possível concluir a operação.');
  }

  return data;
}

export async function listRelatorios() {
  const data = await fetchJson('/api/relatorios');
  return data.relatorios || [];
}

export async function createRelatorio(relatorio) {
  const data = await fetchJson('/api/relatorios', {
    method: 'POST',
    body: JSON.stringify(relatorio),
  });
  return data.relatorio;
}

export async function removeRelatorio(id) {
  await fetchJson(`/api/relatorios?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function listLideres() {
  const data = await fetchJson('/api/lideres');
  return data.lideres || [];
}

function readLegacyArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export async function migrateLegacyLocalData() {
  if (typeof window === 'undefined') return false;
  if (localStorage.getItem(MIGRATION_KEY) === 'done') return false;

  const relatorios = readLegacyArray(LEGACY_RELATORIOS_KEY);
  const lideres = readLegacyArray(LEGACY_LIDERES_KEY);

  if (relatorios.length === 0 && lideres.length === 0) {
    localStorage.setItem(MIGRATION_KEY, 'done');
    return false;
  }

  await fetchJson('/api/migrate', {
    method: 'POST',
    body: JSON.stringify({ relatorios, lideres }),
  });

  localStorage.removeItem(LEGACY_RELATORIOS_KEY);
  localStorage.removeItem(LEGACY_LIDERES_KEY);
  localStorage.setItem(MIGRATION_KEY, 'done');
  return true;
}
