import { useState } from 'react';
import LoginPage from './pages/LoginPage';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import FormPage from './pages/FormPage';
import RelatoriosPage from './pages/RelatoriosPage';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {

  // 🔐 estado de login
  const [logado, setLogado] = useState(
    localStorage.getItem('logado') === 'true'
  );

  // ✅ quando loga
  function handleLogin() {
    localStorage.setItem('logado', 'true');
    setLogado(true);
  }

  // 🚪 quando sai
  function handleLogout() {
    localStorage.removeItem('logado');
    setLogado(false);
  }

  // 🚫 NÃO LOGADO → LOGIN
  if (!logado) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ✅ LOGADO → SISTEMA
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Layout onLogout={handleLogout} />}>
          <Route index element={<DashboardPage />} />
          <Route path="novo" element={<FormPage />} />
          <Route path="relatorios" element={<RelatoriosPage />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}