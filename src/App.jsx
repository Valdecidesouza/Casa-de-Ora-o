import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';
import RelatoriosPage from './pages/RelatoriosPage';
import { migrateLegacyLocalData } from './store/api';

function BootstrapScreen({ message }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-6 py-5 text-center max-w-sm w-full">
        <p className="text-sm font-semibold text-gray-800 mb-2">Preparando sistema</p>
        <p className="text-xs text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        await migrateLegacyLocalData();
      } catch (error) {
        console.error('Falha ao migrar dados locais antigos:', error);
      } finally {
        if (active) setReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!ready) {
    return <BootstrapScreen message="Migrando dados antigos e conectando com o banco." />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="novo" element={<FormPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
