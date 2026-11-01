import { Suspense } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Boxes,
  ClipboardList,
  LayoutDashboard,
  LayoutTemplate,
  Palette,
  Settings,
  Users,
} from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { PageLoader } from '../ui/PageLoader';

const navItems = [
  { to: '/admin', label: 'Обзор', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Заказы', icon: ClipboardList },
  { to: '/admin/products', label: 'Товары', icon: Boxes },
  { to: '/admin/templates', label: 'Шаблоны', icon: LayoutTemplate },
  { to: '/admin/themes', label: 'Праздники', icon: Palette },
  { to: '/admin/users', label: 'Пользователи', icon: Users },
  { to: '/admin/settings', label: 'Настройки', icon: Settings },
  { to: '/admin/guide', label: 'Инструкция', icon: BookOpen },
];

export function AdminShell() {
  const { user } = useAuth();

  return (
    <section className="container-page py-8">
      <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-start">
        <aside className="surface-card sticky top-28 p-3">
          <div className="px-3 py-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">Админ-панель</p>
            <p className="mt-1 truncate font-display text-lg font-semibold">{user?.displayName}</p>
          </div>
          <nav className="mt-1 flex gap-1 overflow-x-auto no-scrollbar lg:flex-col" aria-label="Админ-навигация">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-2.5 rounded-2xl px-3 py-2.5 text-xs font-bold transition ${
                    isActive ? 'bg-accent text-white' : 'text-muted hover:bg-surface-2 hover:text-ink'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-2 border-t border-line pt-2">
            <NavLink to="/manager" className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-xs font-bold text-muted transition hover:bg-surface-2 hover:text-ink">
              <ClipboardList size={16} /> Кабинет менеджера
            </NavLink>
            <NavLink to="/" className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-xs font-bold text-muted transition hover:bg-surface-2 hover:text-ink">
              <ArrowLeft size={16} /> На сайт
            </NavLink>
          </div>
        </aside>
        <div className="min-w-0">
          <Suspense fallback={<PageLoader label="Загружаем раздел…" />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
