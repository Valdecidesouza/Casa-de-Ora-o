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

  // ✅ FUNÇÃO CERTA DE APAGAR (SÓ UMA)
  async function handleDelete(id) {
    const confirmar = confirm('Remover este relatório?');
    if (!confirmar) return;

    try {
      await removeRelatorio(id);

      // remove da tela sem recarregar
      setRelatorios(current =>
        current.filter(relatorio => relatorio.id !== id)
      );

    } catch (error) {
      alert('Erro ao apagar');
    }
  }

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const [relatoriosData, lideresData] = await Promise.all([
          listRelatorios(),
          listLideres()
        ]);

        if (!active) return;

        setRelatorios(relatoriosData);
        setLideres(lideresData);

      } catch (error) {
        if (active) setError('Erro ao carregar dados');
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
    return relatorios
      .filter(relatorio => {
        if (semana && relatorio.semana !== semana) return false;
        if (grupo && relatorio.grupo !== grupo) return false;
        if (lider && relatorio.lider !== lider) return false;

        if (busca) {
          const q = busca.toLowerCase();
          if (
            !relatorio.local?.toLowerCase().includes(q) &&
            !relatorio.nucleo?.toLowerCase().includes(q) &&
            !relatorio.lider?.toLowerCase().includes(q) &&
            !relatorio.grupo?.toLowerCase().includes(q)
          ) return false;
        }

        return true;
      })
      .sort((a, b) => b.data.localeCompare(a.data));
  }, [relatorios, semana, grupo, lider, busca]);

  function clearFilters() {
    setSemana('');
    setGrupo('');
    setLider('');
    setBusca('');
  }

  const hasFilters = semana || grupo || lider || busca;

  if (loading) {
    return <div className="text-center py-10">Carregando...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">

      <h1 className="font-bold mb-2">Relatórios ({filtrados.length})</h1>

      <input
        placeholder="Buscar..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="input mb-3"
      />

      {hasFilters && (
        <button onClick={clearFilters}>
          Limpar filtros
        </button>
      )}

      {filtrados.map(relatorio => (
        <div key={relatorio.id} className="border p-3 mb-2 rounded">

          <p><b>{relatorio.lider}</b></p>
          <p>{relatorio.grupo}</p>
          <p>{formatDate(relatorio.data)}</p>

          {/* ✅ BOTÃO APAGAR FUNCIONANDO */}
          <button
            onClick={() => handleDelete(relatorio.id)}
            className="text-red-500 mt-2"
          >
            🗑 Apagar
          </button>

        </div>
      ))}

    </div>
  );
}