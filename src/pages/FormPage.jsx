import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Send, Church } from 'lucide-react';
import { GRUPOS, getDiaSemana, isAllowedDay, getSemana, formatDate } from '../store/data';
import { createRelatorio, listLideres } from '../store/api';

const INITIAL = {
  data: '',
  grupo: '',
  lider: '',
  nucleo: '',
  local: '',
  voluntarios: '',
  totalParticipantes: '',
  totalIgreja: '',
};

export default function FormPage() {
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [lideres, setLideres] = useState([]);

  const diaSemana = getDiaSemana(form.data);
  const semana = getSemana(form.data);
  const diaPermitido = form.data ? isAllowedDay(form.data) : true;

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await listLideres();
        if (active) setLideres(data);
      } catch (error) {
        console.error('Falha ao carregar líderes:', error);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: '' }));
    setSaveError('');
  }

  function validate() {
    const nextErrors = {};
    if (!form.data) nextErrors.data = 'Informe a data';
    else if (!isAllowedDay(form.data)) nextErrors.data = 'Envios apenas de terça a sábado';
    if (!form.grupo) nextErrors.grupo = 'Selecione o grupo';
    if (!form.lider.trim()) nextErrors.lider = 'Informe o nome do líder';
    if (!form.nucleo.trim()) nextErrors.nucleo = 'Informe o núcleo';
    if (!form.local.trim()) nextErrors.local = 'Informe o local';
    if (form.voluntarios === '' || isNaN(Number(form.voluntarios)) || Number(form.voluntarios) < 0) {
      nextErrors.voluntarios = 'Informe o número de voluntários';
    }
    if (form.totalParticipantes === '' || isNaN(Number(form.totalParticipantes)) || Number(form.totalParticipantes) < 0) {
      nextErrors.totalParticipantes = 'Informe o total de participantes';
    }
    if (form.totalIgreja === '' || isNaN(Number(form.totalIgreja)) || Number(form.totalIgreja) < 0) {
      nextErrors.totalIgreja = 'Informe o total que foram à igreja';
    }
    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      setSaving(true);
      setSaveError('');
      await createRelatorio(form);
      setLideres(await listLideres());
      setSuccess(true);
      setForm(INITIAL);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setSaveError(error.message || 'Não foi possível salvar o relatório.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
          <Church className="text-white" size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-800">Novo Relatório</h1>
          <p className="text-xs text-gray-500">Registrar casa de oração</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
          <CheckCircle size={18} /> Relatório enviado com sucesso!
        </div>
      )}

      {saveError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
          <AlertTriangle size={18} /> {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="label">Data <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="data"
            value={form.data}
            onChange={handleChange}
            className={`input ${errors.data ? 'border-red-400 bg-red-50' : ''}`}
          />
          {form.data && (
            <div className={`flex items-center gap-1.5 mt-1 text-xs font-medium ${diaPermitido ? 'text-brand-600' : 'text-red-500'}`}>
              {diaPermitido ? (
                <>
                  <CheckCircle size={13} /> {diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)} · {semana} · {formatDate(form.data)}
                </>
              ) : (
                <>
                  <AlertTriangle size={13} /> Envio bloqueado para {diaSemana} – apenas terça a sábado
                </>
              )}
            </div>
          )}
          {errors.data && <p className="field-error">{errors.data}</p>}
        </div>

        <div>
          <label className="label">Grupo <span className="text-red-500">*</span></label>
          <select name="grupo" value={form.grupo} onChange={handleChange} className={`input ${errors.grupo ? 'border-red-400 bg-red-50' : ''}`}>
            <option value="">Selecione o grupo</option>
            {GRUPOS.map(grupo => <option key={grupo} value={grupo}>{grupo}</option>)}
          </select>
          {errors.grupo && <p className="field-error">{errors.grupo}</p>}
        </div>

        <div>
          <label className="label">Nome do Líder <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="lider"
            list="lideres-sugeridos"
            placeholder="Digite ou selecione o nome do líder"
            value={form.lider}
            onChange={handleChange}
            className={`input ${errors.lider ? 'border-red-400 bg-red-50' : ''}`}
          />
          <datalist id="lideres-sugeridos">
            {lideres.map(lider => <option key={lider} value={lider} />)}
          </datalist>
          <p className="text-[11px] text-gray-400 mt-1">Nomes novos ficam salvos no banco e entram na lista para sempre.</p>
          {errors.lider && <p className="field-error">{errors.lider}</p>}
        </div>

        <div>
          <label className="label">Núcleo <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="nucleo"
            placeholder="Ex: Núcleo 3 ou Bairro Jardim"
            value={form.nucleo}
            onChange={handleChange}
            className={`input ${errors.nucleo ? 'border-red-400 bg-red-50' : ''}`}
          />
          {errors.nucleo && <p className="field-error">{errors.nucleo}</p>}
        </div>

        <div>
          <label className="label">Local (Casa de Oração) <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="local"
            placeholder="Endereço ou nome da casa"
            value={form.local}
            onChange={handleChange}
            className={`input ${errors.local ? 'border-red-400 bg-red-50' : ''}`}
          />
          {errors.local && <p className="field-error">{errors.local}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Voluntários <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="voluntarios"
              min="0"
              placeholder="0"
              value={form.voluntarios}
              onChange={handleChange}
              className={`input ${errors.voluntarios ? 'border-red-400 bg-red-50' : ''}`}
            />
            {errors.voluntarios && <p className="field-error">{errors.voluntarios}</p>}
          </div>
          <div>
            <label className="label">Total Participantes <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="totalParticipantes"
              min="0"
              placeholder="0"
              value={form.totalParticipantes}
              onChange={handleChange}
              className={`input ${errors.totalParticipantes ? 'border-red-400 bg-red-50' : ''}`}
            />
            {errors.totalParticipantes && <p className="field-error">{errors.totalParticipantes}</p>}
          </div>
          <div>
            <label className="label">Foram à Igreja <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="totalIgreja"
              min="0"
              placeholder="0"
              value={form.totalIgreja}
              onChange={handleChange}
              className={`input ${errors.totalIgreja ? 'border-red-400 bg-red-50' : ''}`}
            />
            {errors.totalIgreja && <p className="field-error">{errors.totalIgreja}</p>}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300 text-white font-semibold rounded-xl py-3 transition-colors mt-2"
        >
          <Send size={17} /> {saving ? 'Salvando...' : 'Enviar Relatório'}
        </button>
      </form>
    </div>
  );
}
