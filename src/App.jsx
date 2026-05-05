import { useState } from 'react';
import LoginPage from './pages/LoginPage';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';
import RelatoriosPage from './pages/RelatoriosPage';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {

  const [logado, setLogado] = useState(
    localStorage.getItem('logado') === 'true'
  );

  // 🚫 NÃO LOGADO → MOSTRA LOGIN
  if (!logado) {
    return <LoginPage onLogin={() => setLogado(true)} />;
  }

  // ✅ LOGADO → ENTRA NO SISTEMA
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="novo" element={<FormPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}