export const GRUPOS = [
  'EVG',
  'Arimateia',
  'FJU',
  'Calebe',
  'Saúde',
  'Resgate',
  'UNP',
  'FTU',
  'Batismo',
  'GSU',
  'DTC',
  'Terapia',
];

export const DEFAULT_LIDERES = [
  'Obreira Maria',
  'Obreiro Marcos',
  'Obreira Andreia Carla',
  'Obreiro Ricardo',
  'Obreira Cleo',
  'Obreira Benedita',
  'Obreira Jussara',
  'Obreiro Lucas',
  'Obreiro Mateus',
  'Obreira Alice',
  'Obreira Emily',
  'Obreira Sabrina',
  'Fátima',
  'Obreira Simone',
  'Obreira Rita',
  'Obreira Alessandra',
  'Ananda Ribeiro',
  'Obreira jamily',
  'Dna Marlete',
  'Obreiro Evandro',
  'Tatiane',
  'Obreira Marcia',
  'Obreiro Yuri',
  'Obreira Gracinete',
  'Obreiro Gaio',
];

export const DIAS_SEMANA = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
export const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function parseDate(dateStr) {
  const [year, month, day] = String(dateStr).split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateFromParts(year, month, day) {
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

function formatDateFromDate(date) {
  return formatDateFromParts(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getTuesdayStart(date) {
  const copy = new Date(date);
  const distance = (copy.getDay() + 7 - 2) % 7;
  copy.setDate(copy.getDate() - distance);
  return copy;
}

export function normalizarTexto(valor) {
  return String(valor || '').replace(/\s+/g, ' ').trim();
}

export function unicosPreservandoOrdem(...listas) {
  const vistos = new Set();
  const resultado = [];

  for (const lista of listas) {
    for (const item of lista) {
      const texto = normalizarTexto(item);
      if (!texto) continue;

      const chave = texto.toLocaleLowerCase('pt-BR');
      if (vistos.has(chave)) continue;

      vistos.add(chave);
      resultado.push(texto);
    }
  }

  return resultado;
}

export function getDiaSemana(dateStr) {
  if (!dateStr) return '';
  const data = parseDate(dateStr);
  return DIAS_SEMANA[data.getDay()];
}

export function isAllowedDay(dateStr) {
  const dia = getDiaSemana(dateStr);
  return ['terça', 'quarta', 'quinta', 'sexta', 'sábado'].includes(dia);
}

export function getSemanaInfo(dateStr) {
  if (!dateStr) {
    return { label: '', numero: 0, inicio: '', fim: '', mes: '', timestamp: 0 };
  }

  const data = parseDate(dateStr);
  const semanaInicio = getTuesdayStart(data);
  const semanaFim = addDays(semanaInicio, 4);
  const firstDayOfMonth = new Date(data.getFullYear(), data.getMonth(), 1);
  const primeiraSemanaInicio = getTuesdayStart(firstDayOfMonth);
  const diffMs = semanaInicio.getTime() - primeiraSemanaInicio.getTime();
  const numero = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1;
  const mes = MESES[data.getMonth()];
  const inicio = formatDateFromDate(semanaInicio);
  const fim = formatDateFromDate(semanaFim);

  return {
    label: `${numero}ª Semana – ${mes} (${inicio} a ${fim})`,
    numero,
    inicio,
    fim,
    mes,
    timestamp: semanaInicio.getTime(),
  };
}

export function getSemana(dateStr) {
  return getSemanaInfo(dateStr).label;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const data = parseDate(dateStr);
  return formatDateFromDate(data);
}
