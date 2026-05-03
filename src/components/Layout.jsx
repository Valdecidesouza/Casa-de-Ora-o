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
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm">⛪</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-800 leading-tight">Casas de Oração</h1>
            <p className="text-[10px] text-gray-400 leading-tight">Relatório Semanal</p>
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
