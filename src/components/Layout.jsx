import logo from '../assets/logo.png';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, PlusCircle } from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/novo', label: 'Novo', Icon: PlusCircle },
  { to: '/relatorios', label: 'Relatórios', Icon: ClipboardList },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="w-full px-4 py-5 flex items-center gap-4">
          <img src={logo} alt="logo" className="h-24 w-24 object-contain" />          
          <div>
            <div className="flex flex-col leading-tight">
  <h1 className="text-lg font-extrabold text-gray-800 tracking-tight">
    Núcleos de Oração
  </h1>

  <span className="text-xs text-brand-600 font-semibold">
    Relatório Semanal
  </span>
</div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pt-5">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="bg-white border-t border-gray-100 sticky bottom-0 z-10">
        <div className="max-w-3xl mx-auto flex">
          {nav.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-3 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'
                }`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
