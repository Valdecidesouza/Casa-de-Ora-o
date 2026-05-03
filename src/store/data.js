import {
  GRUPOS,
  DEFAULT_LIDERES as LIDERES,
  DIAS_SEMANA,
  MESES,
  normalizarTexto,
  unicosPreservandoOrdem,
  getDiaSemana,
  isAllowedDay,
  getSemana,
  getSemanaInfo,
  formatDate,
} from '../shared/catalog';

export {
  GRUPOS,
  LIDERES,
  DIAS_SEMANA,
  MESES,
  normalizarTexto,
  unicosPreservandoOrdem,
  getDiaSemana,
  isAllowedDay,
  getSemana,
  getSemanaInfo,
  formatDate,
};

export const META_ALMAS_DOMINGO = 10;

export function getMesReferencia(dateStr) {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-').map(Number);
  return `${MESES[month - 1]} de ${year}`;
}

export function calcularDashboard(relatorios) {
  const porGrupo = {};
  const porLider = {};

  for (const relatorio of relatorios) {
    if (!porGrupo[relatorio.grupo]) {
      porGrupo[relatorio.grupo] = {
        grupo: relatorio.grupo,
        participantes: 0,
        naIgreja: 0,
        nucleos: 0,
        voluntarios: 0,
      };
    }
    porGrupo[relatorio.grupo].participantes += Number(relatorio.totalParticipantes) || 0;
    porGrupo[relatorio.grupo].naIgreja += Number(relatorio.totalIgreja) || 0;
    porGrupo[relatorio.grupo].nucleos += 1;
    porGrupo[relatorio.grupo].voluntarios += Number(relatorio.voluntarios) || 0;

    if (!porLider[relatorio.lider]) {
      porLider[relatorio.lider] = {
        lider: relatorio.lider,
        participantes: 0,
        naIgreja: 0,
        nucleos: 0,
        voluntarios: 0,
      };
    }
    porLider[relatorio.lider].participantes += Number(relatorio.totalParticipantes) || 0;
    porLider[relatorio.lider].naIgreja += Number(relatorio.totalIgreja) || 0;
    porLider[relatorio.lider].nucleos += 1;
    porLider[relatorio.lider].voluntarios += Number(relatorio.voluntarios) || 0;
  }

  return {
    porGrupo: Object.values(porGrupo).sort((a, b) => b.naIgreja - a.naIgreja),
    porLider: Object.values(porLider).sort((a, b) => b.naIgreja - a.naIgreja),
  };
}

export function verificarMetas(relatorios, semana) {
  const filtrados = semana ? relatorios.filter(relatorio => relatorio.semana === semana) : relatorios;
  const almasPorGrupo = {};

  for (const relatorio of filtrados) {
    if (!almasPorGrupo[relatorio.grupo]) almasPorGrupo[relatorio.grupo] = 0;
    almasPorGrupo[relatorio.grupo] += Number(relatorio.totalIgreja) || 0;
  }

  return GRUPOS.map(grupo => {
    const atual = almasPorGrupo[grupo] || 0;
    return {
      grupo,
      meta: META_ALMAS_DOMINGO,
      atual,
      atingiu: atual >= META_ALMAS_DOMINGO,
    };
  });
}

export function getSemanas(relatorios) {
  const mapa = new Map();

  for (const relatorio of relatorios) {
    const info = getSemanaInfo(relatorio.data);
    if (!info.label) continue;
    mapa.set(info.label, info.timestamp);
  }

  return [...mapa.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label]) => label);
}

export function getMeses(relatorios) {
  return [...new Set(relatorios.map(relatorio => getMesReferencia(relatorio.data)))].filter(Boolean).sort((a, b) => {
    const [mesA, anoA] = a.split(' de ');
    const [mesB, anoB] = b.split(' de ');
    const ordemA = Number(anoA) * 12 + MESES.indexOf(mesA);
    const ordemB = Number(anoB) * 12 + MESES.indexOf(mesB);
    return ordemB - ordemA;
  });
}

export function calcularResumoMensal(relatorios, mesReferencia) {
  const filtrados = mesReferencia
    ? relatorios.filter(relatorio => getMesReferencia(relatorio.data) === mesReferencia)
    : relatorios;

  const totalNucleos = filtrados.length;
  const totalVoluntarios = filtrados.reduce((sum, relatorio) => sum + (Number(relatorio.voluntarios) || 0), 0);
  const totalParticipantes = filtrados.reduce((sum, relatorio) => sum + (Number(relatorio.totalParticipantes) || 0), 0);
  const totalIgreja = filtrados.reduce((sum, relatorio) => sum + (Number(relatorio.totalIgreja) || 0), 0);

  const grupos = {};
  const gruposPorSemana = {};

  for (const relatorio of filtrados) {
    if (!grupos[relatorio.grupo]) {
      grupos[relatorio.grupo] = {
        grupo: relatorio.grupo,
        nucleos: 0,
        voluntarios: 0,
        participantes: 0,
        naIgreja: 0,
      };
    }

    grupos[relatorio.grupo].nucleos += 1;
    grupos[relatorio.grupo].voluntarios += Number(relatorio.voluntarios) || 0;
    grupos[relatorio.grupo].participantes += Number(relatorio.totalParticipantes) || 0;
    grupos[relatorio.grupo].naIgreja += Number(relatorio.totalIgreja) || 0;

    if (!gruposPorSemana[relatorio.grupo]) gruposPorSemana[relatorio.grupo] = {};
    if (!gruposPorSemana[relatorio.grupo][relatorio.semana]) gruposPorSemana[relatorio.grupo][relatorio.semana] = 0;
    gruposPorSemana[relatorio.grupo][relatorio.semana] += Number(relatorio.totalIgreja) || 0;
  }

  const gruposOrdenados = Object.values(grupos).sort((a, b) => b.naIgreja - a.naIgreja || b.nucleos - a.nucleos);
  const grupoMaisNucleos = [...gruposOrdenados].sort((a, b) => b.nucleos - a.nucleos || b.naIgreja - a.naIgreja)[0] || null;
  const grupoMaisIgreja = [...gruposOrdenados].sort((a, b) => b.naIgreja - a.naIgreja || b.nucleos - a.nucleos)[0] || null;

  const evolucao = Object.entries(gruposPorSemana)
    .map(([grupo, semanas]) => {
      const entradas = Object.entries(semanas).sort((a, b) => {
        const semanaA = relatorios.find(relatorio => relatorio.grupo === grupo && relatorio.semana === a[0]);
        const semanaB = relatorios.find(relatorio => relatorio.grupo === grupo && relatorio.semana === b[0]);
        const timeA = semanaA ? getSemanaInfo(semanaA.data).timestamp : 0;
        const timeB = semanaB ? getSemanaInfo(semanaB.data).timestamp : 0;
        return timeA - timeB;
      });
      const inicial = entradas[0]?.[1] || 0;
      const final = entradas[entradas.length - 1]?.[1] || 0;
      return { grupo, crescimento: final - inicial, inicial, final };
    })
    .sort((a, b) => b.crescimento - a.crescimento);

  return {
    mesReferencia,
    totalNucleos,
    totalVoluntarios,
    totalParticipantes,
    totalIgreja,
    grupoMaisEvoluiu: evolucao[0] || null,
    grupoMaisNucleos,
    grupoMaisIgreja,
    grupos: gruposOrdenados,
  };
}

export function montarTextoCompartilhamentoMensal(resumo) {
  if (!resumo || !resumo.mesReferencia) return '';

  const linhasGrupos = resumo.grupos.length > 0
    ? resumo.grupos.map(grupo => (
      `• ${grupo.grupo}: ${grupo.nucleos} núcleos | ${grupo.voluntarios} voluntários | ${grupo.participantes} participantes | ${grupo.naIgreja} foram à igreja`
    ))
    : ['• Sem dados por grupo neste mês'];

  return [
    `Relatório mensal - ${resumo.mesReferencia}`,
    '',
    'Por grupo:',
    ...linhasGrupos,
    '',
    'Totais do mês:',
    `• Núcleos: ${resumo.totalNucleos}`,
    `• Voluntários: ${resumo.totalVoluntarios}`,
    `• Participantes: ${resumo.totalParticipantes}`,
    `• Foram à igreja: ${resumo.totalIgreja}`,
    '',
    `• Grupo que mais evoluiu: ${resumo.grupoMaisEvoluiu ? `${resumo.grupoMaisEvoluiu.grupo} (${resumo.grupoMaisEvoluiu.crescimento >= 0 ? '+' : ''}${resumo.grupoMaisEvoluiu.crescimento})` : 'Sem dados'}`,
    `• Grupo com mais núcleos: ${resumo.grupoMaisNucleos ? `${resumo.grupoMaisNucleos.grupo} (${resumo.grupoMaisNucleos.nucleos})` : 'Sem dados'}`,
    `• Grupo que mais levou à igreja: ${resumo.grupoMaisIgreja ? `${resumo.grupoMaisIgreja.grupo} (${resumo.grupoMaisIgreja.naIgreja})` : 'Sem dados'}`,
  ].join('\n');
}
