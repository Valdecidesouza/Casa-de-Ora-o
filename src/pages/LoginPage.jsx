import { useState } from 'react';
import logo from '../assets/logo.png';

export default function LoginPage({ onLogin }) {

  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [modoCadastro, setModoCadastro] = useState(false);

  // 🔐 LOGIN
  function entrar() {
    const usuario = user.trim().toLowerCase();
    const senha = pass.trim();

    // 👉 admin padrão sempre funciona
    if (usuario === 'admin' && senha === 'admin') {
      localStorage.setItem('logado', 'true');
      onLogin();
      return;
    }

    // 👉 usuários cadastrados
    const users = JSON.parse(localStorage.getItem('users') || '[]');

    const existe = users.find(u => u.user === usuario && u.pass === senha);

    if (existe) {
      localStorage.setItem('logado', 'true');
      onLogin();
      return;
    }

    alert('Login errado');
  }

  // 🧑‍💻 CADASTRO
  function cadastrar() {
    const usuario = user.trim().toLowerCase();
    const senha = pass.trim();

    if (!usuario || !senha) {
      alert('Preencha tudo');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');

    // 👉 evita duplicado
    const jaExiste = users.find(u => u.user === usuario);

    if (jaExiste) {
      alert('Usuário já existe');
      return;
    }

    users.push({ user: usuario, pass: senha });

    localStorage.setItem('users', JSON.stringify(users));

    alert('Conta criada!');
    setModoCadastro(false);
    setUser('');
    setPass('');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-sm">

        {/* 🔥 LOGO */}
        <div className="flex justify-center mb-4">
          <img src={logo} alt="logo" className="h-24 object-contain" />
        </div>

        {/* 🔥 TÍTULO */}
        <h2 className="text-center text-lg font-bold text-gray-800 mb-4">
          {modoCadastro ? 'Criar Conta' : 'Bem-vindo 👋'}
        </h2>

        {/* INPUT USUÁRIO */}
        <input
          placeholder="Usuário"
          value={user}
          onChange={e => setUser(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {/* INPUT SENHA */}
        <input
          placeholder="Senha"
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />

        {/* BOTÃO */}
        {modoCadastro ? (
          <button
            onClick={cadastrar}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition"
          >
            Criar Conta
          </button>
        ) : (
          <button
            onClick={entrar}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition"
          >
            Entrar
          </button>
        )}

        {/* TROCAR MODO */}
        <p
          onClick={() => setModoCadastro(!modoCadastro)}
          className="text-center text-xs text-blue-500 mt-3 cursor-pointer"
        >
          {modoCadastro ? 'Já tenho conta' : 'Criar conta'}
        </p>

        {/* DICA */}
        {!modoCadastro && (
          <p className="text-center text-xs text-gray-400 mt-2">
            admin / admin
          </p>
        )}

      </div>

    </div>
  );
}