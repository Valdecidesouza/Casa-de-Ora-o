import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  ChevronDown,
  TrendingUp,
  Users,
  Church,
  Trophy,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
  Share2,
  Copy,
} from 'lucide-react';
import {
  calcularDashboard,
  verificarMetas,
  getSemanas,
  getMeses,
  calcularResumoMensal,
  montarTextoCompartilhamentoMensal,
  META_ALMAS_DOMINGO,
} from '../store/data';
import { listRelatorios } from '../store/api';

const MEDALS = ['🥇', '🥈', '🥉'];

function StatCard({ icon: Icon, label, value, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 min-w-0">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">{children}</h2>;
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map(item => (
        <p key={item.dataKey} style={{ color: item.color }}>{item.name}: {item.value}</p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [semana, setSemana] = useState('');
  const [mes, setMes] = useState('');
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        const data = await listRelatorios();
        if (active) setRelatorios(data);
      } catch (nextError) {
        if (active) setError(nextError.message || 'Não foi possível carregar o dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const semanas = useMemo(() => getSemanas(relatorios), [relatorios]);
  const meses = useMemo(() => getMeses(relatorios), [relatorios]);
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  const canCopy = typeof navigator !== 'undefined' && navigator.clipboard?.writeText;

  useEffect(() => {
    if (!mes && meses.length > 0) {
      setMes(meses[0]);
    }
  }, [meses, mes]);

  const filtrados = useMemo(() => (
    semana ? relatorios.filter(item => item.semana === semana) : relatorios
  ), [semana, relatorios]);

  const { porGrupo } = useMemo(() => calcularDashboard(filtrados), [filtrados]);
  const metas = useMemo(() => verificarMetas(relatorios, semana), [relatorios, semana]);
  const resumoMensal = useMemo(() => calcularResumoMensal(relatorios, mes), [relatorios, mes]);

  const totalParticipantes = filtrados.reduce((sum, item) => sum + (Number(item.totalParticipantes) || 0), 0);
  const totalIgreja = filtrados.reduce((sum, item) => sum + (Number(item.totalIgreja) || 0), 0);
  const totalNucleos = filtrados.length;
  const totalVoluntarios = filtrados.reduce((sum, item) => sum + (Number(item.voluntarios) || 0), 0);
  const ranking = [...porGrupo].sort((a, b) => b.naIgreja - a.naIgreja).slice(0, 10);

  async function handleShareMensal() {
    const texto = montarTextoCompartilhamentoMensal(resumoMensal);
    if (!texto) return;

    try {
      if (canNativeShare) {
        await navigator.share({
          title: `Resumo mensal - ${resumoMensal.mesReferencia}`,
          text: texto,
        });
        setShareMessage('Resumo mensal compartilhado com sucesso.');
        return;
      }

      if (canCopy) {
        await navigator.clipboard.writeText(texto);
        setShareMessage('Resumo mensal copiado. Agora é só colar onde quiser.');
        return;
      }

      setShareMessage('Este aparelho não permite compartilhar automaticamente.');
    } catch (shareError) {
      if (shareError?.name !== 'AbortError') {
        setShareMessage('Não foi possível compartilhar agora.');
      }
    }
  }

  useEffect(() => {
    if (!shareMessage) return undefined;
    const timer = setTimeout(() => setShareMessage(''), 3000);
    return () => clearTimeout(timer);
  }, [shareMessage]);

  if (loading) {
    return <div className="px-4 py-12 text-center text-sm text-gray-500">Carregando dashboard...</div>;
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
    <div className="px-4 pb-10 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-lg font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs text-gray-500">Visão geral dos núcleos</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full sm:w-auto">
          <div className="relative min-w-0">
            <select
              value={semana}
              onChange={event => setSemana(event.target.value)}
              className="input text-xs py-2 pl-3 pr-8 appearance-none"
            >
              <option value="">Todas as semanas</option>
              {semanas.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="relative min-w-0">
            <select
              value={mes}
              onChange={event => setMes(event.target.value)}
              className="input text-xs py-2 pl-3 pr-8 appearance-none"
            >
              <option value="">Selecione o mês</option>
              {meses.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Church} label="Núcleos" value={totalNucleos} color="brand" />
        <StatCard icon={Users} label="Participantes" value={totalParticipantes} color="green" />
        <StatCard icon={TrendingUp} label="Foram à Igreja" value={totalIgreja} color="amber" />
        <StatCard icon={HeartHandshake} label="Voluntários" value={totalVoluntarios} color="rose" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 overflow-hidden">
        <SectionTitle>Participantes por Grupo</SectionTitle>
        {porGrupo.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum dado para exibir</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[320px] h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porGrupo} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="grupo" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="participantes" name="Participantes" fill="#4263eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="naIgreja" name="Foram à Igreja" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <SectionTitle>Detalhes por Grupo</SectionTitle>
        {porGrupo.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum dado</p>
        ) : (
          <div className="overflow-x-auto -mx-1">
            <table className="w-full min-w-[520px] text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-2 text-gray-500 font-medium">Grupo</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Núcleos</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Voluntários</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Participantes</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-medium">Foram à Igreja</th>
                </tr>
              </thead>
              <tbody>
                {porGrupo.map(item => (
                  <tr key={item.grupo} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-2 px-2 font-medium text-gray-800">
                      <span className="badge-grupo">{item.grupo}</span>
                    </td>
                    <td className="py-2 px-2 text-right text-gray-700">{item.nucleos}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{item.voluntarios}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{item.participantes}</td>
                    <td className="py-2 px-2 text-right text-gray-700">{item.naIgreja}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={16} className="text-amber-500" />
          <SectionTitle>Ranking de Grupos</SectionTitle>
        </div>
        <p className="text-xs text-gray-400 mb-3 -mt-2">Ordenado por total de pessoas que foram à igreja</p>
        {ranking.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum dado</p>
        ) : (
          <div className="space-y-2">
            {ranking.map((item, index) => (
              <div
                key={item.grupo}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
                  index === 0 ? 'bg-amber-50 border border-amber-100' :
                  index === 1 ? 'bg-gray-50 border border-gray-100' :
                  index === 2 ? 'bg-orange-50 border border-orange-100' :
                  'bg-white border border-gray-50'
                }`}
              >
                <span className="text-xl w-7 text-center flex-shrink-0">
                  {MEDALS[index] || <span className="text-sm text-gray-400 font-bold">{index + 1}</span>}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.grupo}</p>
                  <p className="text-xs text-gray-500">{item.nucleos} núcleo{item.nucleos !== 1 ? 's' : ''} · {item.participantes} participantes · {item.voluntarios} voluntários</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-brand-600">{item.naIgreja}</p>
                  <p className="text-[10px] text-gray-400">na igreja</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <AlertCircle size={16} className="text-brand-600" />
          <SectionTitle>Metas Semanais</SectionTitle>
        </div>
        <p className="text-xs text-gray-400 mb-3 -mt-1">
          Meta por grupo: {META_ALMAS_DOMINGO} almas no domingo
          {semana && <span> · {semana}</span>}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {metas.map(item => (
            <div
              key={item.grupo}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 border text-xs ${
                item.atingiu
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {item.atingiu
                ? <CheckCircle2 size={14} className="text-green-600 flex-shrink-0" />
                : <AlertCircle size={14} className="text-red-500 flex-shrink-0" />}
              <div className="min-w-0">
                <p className="font-semibold">{item.grupo}</p>
                <p className="text-[10px] opacity-80">
                  {item.atingiu
                    ? `Meta atingida (${item.atual}/${item.meta} almas)`
                    : `Meta não atingida (${item.atual}/${item.meta} almas)`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <SectionTitle>Resumo Mensal</SectionTitle>
            <p className="text-xs text-gray-400 -mt-2">Compartilha grupo por grupo e os destaques do mês.</p>
          </div>
          <button
            type="button"
            onClick={handleShareMensal}
            disabled={!resumoMensal.mesReferencia}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white text-sm font-semibold px-4 py-2 transition-colors"
          >
            {canNativeShare ? <Share2 size={16} /> : <Copy size={16} />} Compartilhar resumo
          </button>
        </div>

        {shareMessage && (
          <div className="bg-brand-50 text-brand-700 border border-brand-100 rounded-xl px-3 py-2 text-xs mb-3">
            {shareMessage}
          </div>
        )}

        {!resumoMensal.mesReferencia ? (
          <p className="text-sm text-gray-400 text-center py-6">Nenhum mês disponível para compartilhar.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-[11px] text-gray-500">Núcleos no mês</p>
                <p className="text-lg font-bold text-gray-800">{resumoMensal.totalNucleos}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-[11px] text-gray-500">Voluntários</p>
                <p className="text-lg font-bold text-gray-800">{resumoMensal.totalVoluntarios}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-[11px] text-gray-500">Participantes</p>
                <p className="text-lg font-bold text-gray-800">{resumoMensal.totalParticipantes}</p>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-[11px] text-gray-500">Foram à igreja</p>
                <p className="text-lg font-bold text-gray-800">{resumoMensal.totalIgreja}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-xl border border-green-100 bg-green-50 px-3 py-3 text-sm text-green-800">
                <p className="text-[11px] uppercase tracking-wide font-semibold opacity-80">Grupo que mais evoluiu</p>
                <p className="font-bold mt-1">{resumoMensal.grupoMaisEvoluiu?.grupo || 'Sem dados'}</p>
                <p className="text-xs mt-1">{resumoMensal.grupoMaisEvoluiu ? `Cresceu ${resumoMensal.grupoMaisEvoluiu.crescimento >= 0 ? '+' : ''}${resumoMensal.grupoMaisEvoluiu.crescimento} pessoas entre a primeira e a última semana do mês.` : 'Sem dados suficientes para calcular.'}</p>
              </div>
              <div className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-3 text-sm text-brand-800">
                <p className="text-[11px] uppercase tracking-wide font-semibold opacity-80">Mais núcleos no mês</p>
                <p className="font-bold mt-1">{resumoMensal.grupoMaisNucleos?.grupo || 'Sem dados'}</p>
                <p className="text-xs mt-1">{resumoMensal.grupoMaisNucleos ? `${resumoMensal.grupoMaisNucleos.nucleos} núcleos registrados.` : 'Sem dados suficientes.'}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                <p className="text-[11px] uppercase tracking-wide font-semibold opacity-80">Mais pessoas à igreja</p>
                <p className="font-bold mt-1">{resumoMensal.grupoMaisIgreja?.grupo || 'Sem dados'}</p>
                <p className="text-xs mt-1">{resumoMensal.grupoMaisIgreja ? `${resumoMensal.grupoMaisIgreja.naIgreja} pessoas no mês.` : 'Sem dados suficientes.'}</p>
              </div>
            </div>

            <div className="overflow-x-auto -mx-1">
              <table className="w-full min-w-[560px] text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Grupo</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium">Núcleos</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium">Voluntários</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium">Participantes</th>
                    <th className="text-right py-2 px-2 text-gray-500 font-medium">Foram à Igreja</th>
                  </tr>
                </thead>
                <tbody>
                  {resumoMensal.grupos.map(item => (
                    <tr key={item.grupo} className="border-b border-gray-50">
                      <td className="py-2 px-2 font-medium text-gray-800">
                        <span className="badge-grupo">{item.grupo}</span>
                      </td>
                      <td className="py-2 px-2 text-right text-gray-700">{item.nucleos}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{item.voluntarios}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{item.participantes}</td>
                      <td className="py-2 px-2 text-right text-gray-700">{item.naIgreja}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
