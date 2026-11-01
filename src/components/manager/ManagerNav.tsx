import { Boxes, ClipboardList } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/manager', label: 'Заказы', icon: ClipboardList, end: true },
  { to: '/manager/products', label: 'Товары', icon: Boxes },
];

export function ManagerNav() {
  return (
    <nav className="container-page mt-6 flex flex-wrap gap-2" aria-label="Кабинет менеджера">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition ${
              isActive
                ? 'border-accent bg-accent text-white'
                : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-ink'
            }`
          }
        >
          <item.icon size={15} />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
