import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Menu,
  ShoppingBag,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { useCart } from '../../state/CartContext';
import { useTheme } from '../../state/ThemeContext';
import { Logo } from '../ui/Logo';

const navItems = [
  { to: '/catalog', label: 'Каталог' },
  { to: '/holidays', label: 'Праздники' },
  { to: '/how-it-works', label: 'Как это работает' },
  { to: '/contacts', label: 'Контакты' },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isStaff, isAdmin } = useAuth();
  const { count } = useCart();
  const { theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/85 backdrop-blur-xl">
      <div className="border-b border-line/50 bg-surface/60">
        <div className="container-page flex h-9 items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
          <span>Печатаем на 3D-принтере · небольшие партии</span>
          <span className="hidden sm:inline">{theme.data.dateLabel}</span>
        </div>
      </div>

      <div className="container-page flex h-[74px] items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Основная навигация">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-surface-2 text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/holidays"
            className="hidden items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-2 text-xs font-bold text-muted transition hover:border-accent/50 hover:text-ink xl:flex"
          >
            <Sparkles size={13} className="text-accent" />
            {theme.data.shortName}
          </Link>

          {user && (
            <Link
              to={isStaff ? (isAdmin ? '/admin' : '/manager') : '/account'}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink sm:flex"
            >
              {isStaff ? <LayoutDashboard size={17} /> : <UserRound size={17} />}
              <span className="max-w-28 truncate">{user.displayName}</span>
            </Link>
          )}

          {!user && (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-ink sm:flex"
            >
              <UserRound size={17} />
              Войти
            </Link>
          )}

          <Link
            to="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink transition hover:border-accent/50 hover:bg-surface-2"
            aria-label={`Корзина, товаров: ${count}`}
          >
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-extrabold text-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface text-ink lg:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-line/70 bg-bg/95 lg:hidden">
          <div className="container-page flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-ink transition hover:bg-surface-2"
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to={user ? (isStaff ? (isAdmin ? '/admin' : '/manager') : '/account') : '/login'}
              onClick={() => setMobileOpen(false)}
              className="rounded-2xl px-4 py-3 text-sm font-bold text-ink transition hover:bg-surface-2"
            >
              {user ? `Кабинет · ${user.displayName}` : 'Войти в аккаунт'}
            </Link>
            <div className="mt-2 flex items-center gap-2 rounded-2xl bg-surface-2 px-4 py-3 text-xs font-bold text-muted">
              <Sparkles size={14} className="text-accent" />
              Тема: {theme.data.name}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
