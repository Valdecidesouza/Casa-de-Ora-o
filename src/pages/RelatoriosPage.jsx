import { useEffect, useMemo, useState } from 'react';
import { listLideres, listRelatorios, removeRelatorio } from '../store/api';
import { formatDate } from '../store/data';

export default function RelatoriosPage() {

  const [relatorios, setRelatorios] = useState([]);
  const [lideres, setLideres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [busca, setBusca] = useState('');
  const [editando, setEditando] = useState(null);

  // 🗑 APAGAR (rápido sem reload)
  async function handleDelete(id) {
    const ok = confirm('Remover?');
    if (!ok) return;

    await removeRelatorio(id);

    // 🔥 remove da tela instantâneo
    setRelatorios(r => r.filter(item => item.id !== id));
  }

  // 🧹 LIMPAR TUDO (rápido)
  async function limparTudo() {
    const ok = confirm("APAGAR TODOS?");
    if (!ok) return;

    await fetch('/api/relatorios/all', { method: 'DELETE' });

    setRelatorios([]);
  }

  // 🔄 CARREGAR DADOS
  useEffect(() => {
    (async () => {
      try {
        const [r, l] = await Promise.all([
          listRelatorios(),
          listLideres()
        ]);

        setRelatorios(r);
        setLideres(l);

      } catch {
        setError('Erro');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🔍 FILTRO RÁPIDO
  const filtrados = useMemo(() => {
    const buscaLower = busca.toLowerCase();

    return relatorios.filter(r =>
      r.lider?.toLowerCase().includes(buscaLower)
    );
  }, [relatorios, busca]);

  if (loading) return <div>⏳ Carregando...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-4">

      <h1>Relatórios ({filtrados.length})</h1>

      <input
        placeholder="Buscar..."
        value={busca}
        onChange={e => setBusca(e.target.value)}
      />

      <button onClick={limparTudo} className="ml-2 text-red-600">
        🧹 Limpar tudo
      </button>

      {filtrados.map(relatorio => (
        <div key={relatorio.id} className="border p-3 mt-2">

          <p><b>{relatorio.lider}</b></p>
          <p>{relatorio.grupo}</p>
          <p>{formatDate(relatorio.data)}</p>

          {/* ✏️ EDITAR */}
          <button onClick={() => setEditando(relatorio)}>
            ✏️ Editar
          </button>

          {/* 🗑 APAGAR */}
          <button
            onClick={() => handleDelete(relatorio.id)}
            className="text-red-500 ml-2"
          >
            🗑
          </button>

        </div>
      ))}

      {/* 🔥 MODAL EDITAR */}
      {editando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

          <div className="bg-white p-4 rounded">

            <h2>Editar</h2>

            <input
              value={editando.lider}
              onChange={e =>
                setEditando({ ...editando, lider: e.target.value })
              }
            />

            <br />

            <button
              onClick={async () => {

                const res = await fetch('/api/relatorios', {
                  method: 'POST',
                  body: JSON.stringify(editando)
                });

                const data = await res.json();

                // 🔥 ATUALIZA NA TELA SEM RECARREGAR
                setRelatorios(old =>
                  old.map(item =>
                    item.id === data.relatorio.id ? data.relatorio : item
                  )
                );

                setEditando(null);
              }}
            >
              Salvar
            </button>

            <button onClick={() => setEditando(null)}>
              Cancelar
            </button>

          </div>

        </div>
      )}

    </div>
  );
}