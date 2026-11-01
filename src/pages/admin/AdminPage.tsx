import { ArrowRight, BookOpen, Boxes, ClipboardList, Palette, Settings, Sparkles, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../../core/container';
import { Money } from '../../core/domain/Money';
import { useTheme } from '../../state/ThemeContext';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/format';

export function AdminPage() {
  const { theme, themes } = useTheme();
  const stats = services.orders.stats();
  const products = services.catalog.list();
  const users = services.users.list();
  const recentOrders = services.orders.listAll().slice(0, 5);
  const customThemes = themes.filter((item) => item.data.isCustom);

  const cards = [
    { label: 'Заказы', value: stats.total, note: `${stats.newOrders} новых`, icon: ClipboardList, to: '/admin/orders' },
    { label: 'Выручка', value: Money.from(stats.revenue).format(), note: 'подтверждённые оплаты', icon: TrendingUp, to: '/admin/orders' },
    { label: 'Товары', value: products.length, note: 'в каталоге', icon: Boxes, to: '/admin/products' },
    { label: 'Пользователи', value: users.length, note: 'зарегистрировано', icon: Users, to: '/admin/users' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow mb-3">Обзор</span>
          <h1 className="display-title text-3xl sm:text-4xl">Всё под контролем</h1>
          <p className="mt-2 text-sm text-muted">Заказы, каталог, темы и пользователи — в одном месте.</p>
        </div>
        <Link to="/admin/themes" className="btn-secondary px-4 py-2.5 text-xs">
          <Palette size={15} /> Тема: {theme.data.shortName}
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.label} to={card.to} className="surface-card surface-card-hover p-4">
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <card.icon size={18} />
              </span>
              <ArrowRight size={15} className="text-muted" />
            </div>
            <p className="mt-4 font-display text-2xl font-semibold">{card.value}</p>
            <p className="text-xs font-bold">{card.label}</p>
            <p className="mt-1 text-[10px] text-muted">{card.note}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="surface-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="display-title text-xl">Последние заказы</h2>
              <p className="text-xs text-muted">Свежие заявки покупателей</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-bold text-accent hover:underline">Все заказы →</Link>
          </div>
          <div className="mt-4 divide-y divide-line">
            {recentOrders.map((order) => (
              <Link key={order.data.id} to="/admin/orders" className="flex items-center justify-between gap-3 py-3 transition hover:text-accent">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">{order.data.number}</span>
                    <StatusBadge status={order.data.status} />
                  </div>
                  <p className="mt-1 truncate text-xs text-muted">{order.data.customerName} · {formatDate(order.data.createdAt)}</p>
                </div>
                <p className="font-display text-sm font-semibold">{Money.from(order.data.total).format()}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div className="surface-card p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Sparkles size={18} />
              </span>
              <div>
                <h2 className="display-title text-lg">Праздничная тема</h2>
                <p className="text-xs text-muted">Сейчас на сайте</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-line p-3">
              <div className="flex gap-1.5">
                {[theme.data.palette.accent, theme.data.palette.accent2, theme.data.palette.heroGlow, theme.data.palette.surface2].map((color, index) => (
                  <span key={`${color}-${index}`} className="h-6 flex-1 rounded-full" style={{ background: color }} />
                ))}
              </div>
              <p className="mt-3 text-sm font-extrabold">{theme.data.name}</p>
              <p className="mt-0.5 text-xs text-muted">{theme.data.dateLabel}</p>
            </div>
            <Link to="/admin/themes" className="btn-secondary mt-3 w-full py-2.5 text-xs">
              <Palette size={15} /> Сменить тему
            </Link>
            {customThemes.length > 0 && <p className="mt-2 text-center text-[10px] text-muted">Своих тем: {customThemes.length}</p>}
          </div>

          <div className="surface-card p-5">
            <h2 className="display-title text-lg">Быстрые действия</h2>
            <div className="mt-3 grid gap-2">
              <Link to="/admin/products" className="flex items-center justify-between rounded-2xl border border-line px-3 py-2.5 text-xs font-bold transition hover:border-accent/50 hover:bg-surface-2">
                Добавить товар <ArrowRight size={14} className="text-accent" />
              </Link>
              <Link to="/admin/templates" className="flex items-center justify-between rounded-2xl border border-line px-3 py-2.5 text-xs font-bold transition hover:border-accent/50 hover:bg-surface-2">
                Настроить шаблоны <ArrowRight size={14} className="text-accent" />
              </Link>
              <Link to="/admin/settings" className="flex items-center justify-between rounded-2xl border border-line px-3 py-2.5 text-xs font-bold transition hover:border-accent/50 hover:bg-surface-2">
                Контакты и доставка <Settings size={14} className="text-accent" />
              </Link>
              <Link to="/admin/guide" className="flex items-center justify-between rounded-2xl border border-line px-3 py-2.5 text-xs font-bold transition hover:border-accent/50 hover:bg-surface-2">
                Инструкция для команды <BookOpen size={14} className="text-accent" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
