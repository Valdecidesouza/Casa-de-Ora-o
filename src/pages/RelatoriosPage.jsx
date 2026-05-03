import { useEffect, useMemo, useState } from 'react';
import { Trash2, Search, Filter, ChevronDown, AlertTriangle } from 'lucide-react';
import { GRUPOS, formatDate, getSemanas } from '../store/data';
import { listLideres, listRelatorios, removeRelatorio } from '../store/api';

export default function RelatoriosPage() {
  const [relatorios, setRelatorios] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [semana, setSemana] = useState('');
  const [grupo, setGrupo] = useState('');
  const [lider, setLider] = useState('');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const [relatoriosData, lideresData] = await Promise.all([listRelatorios(), listLideres()]);
        if (!active) return;
        setRelatorios(relatoriosData);
        setLideres(lideresData);
      } catch (nextError) {
        if (active) setError(nextError.message || 'Não foi possível carregar os relatórios.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const semanas = useMemo(() => getSemanas(relatorios), [relatorios]);

  const filtrados = useMemo(() => {
    return relatorios.filter(relatorio => {
      if (semana && relatorio.semana !== semana) return false;
      if (grupo && relatorio.grupo !== grupo) return false;
      if (lider && relatorio.lider !== lider) return false;
      if (busca) {
        const query = busca.toLowerCase();
        if (
          !relatorio.local?.toLowerCase().includes(query) &&
          !relatorio.nucleo?.toLowerCase().includes(query) &&
          !relatorio.lider?.toLowerCase().includes(query) &&
          !relatorio.grupo?.toLowerCase().includes(query)
        ) return false;
      }
      return true;
    }).sort((a, b) => b.data.localeCompare(a.data));
  }, [relatorios, semana, grupo, lider, busca]);

  async function handleDelete(id) {
    if (!confirm('Remover este relatório?')) return;

    try {
      await removeRelatorio(id);
      setRelatorios(current => current.filter(relatorio => relatorio.id !== id));
    } catch (nextError) {
      alert(nextError.message || 'Não foi possível remover o relatório.');
    }
  }

  function clearFilters() {
    setSemana('');
    setGrupo('');
    setLider('');
    setBusca('');
  }

  const hasFilters = semana || grupo || lider || busca;

  if (loading) {
    return <div className="px-4 py-12 text-center text-sm text-gray-500">Carregando relatórios...</div>;
  }

  if (error) {
    return (
      <div className="px-4 py-10 max-w-xl mx-auto">
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          <AlertTriangle size={18} /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Relatórios</h1>
          <p className="text-xs text-gray-500">{filtrados.length} registro{filtrados.length !== 1 ? 's' : ''} encontrado{filtrados.length !== 1 ? 's' : ''}</p>
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-brand-600 font-medium hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por líder, local, núcleo, grupo..."
          value={busca}
          onChange={event => setBusca(event.target.value)}
          className="input pl-9 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
        <div className="relative">
          <select value={semana} onChange={event => setSemana(event.target.value)} className="input text-sm appearance-none pr-8">
            <option value="">Todas as semanas</option>
            {semanas.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={grupo} onChange={event => setGrupo(event.target.value)} className="input text-sm appearance-none pr-8">
            <option value="">Todos os grupos</option>
            {GRUPOS.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select value={lider} onChange={event => setLider(event.target.value)} className="input text-sm appearance-none pr-8">
            <option value="">Todos os líderes</option>
            {lideres.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {filtrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Filter size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum relatório encontrado.</p>
          {hasFilters && <p className="text-xs mt-1">Tente ajustar os filtros.</p>}
        </div>
      ) : (
        <div className="space-y-3">
          {filtrados.map(relatorio => (
            <div key={relatorio.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="badge-grupo">{relatorio.grupo}</span>
                    <span className="text-xs text-gray-400">{relatorio.semana}</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm truncate">{relatorio.lider}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{relatorio.local} · {relatorio.nucleo}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-600">
                    <span>📅 {formatDate(relatorio.data)} ({relatorio.diaSemana})</span>
                    <span>👥 {relatorio.totalParticipantes} participantes</span>
                    <span>⛪ {relatorio.totalIgreja} na igreja</span>
                    <span>🤝 {relatorio.voluntarios} voluntários</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(relatorio.id)}
                  className="p-2 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                  title="Remover"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
