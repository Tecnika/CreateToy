import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  CreditCard,
  Mail,
  Package,
  Search,
  Truck,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { services } from '../../core/container';
import { Money } from '../../core/domain/Money';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
} from '../../core/domain/OrderStatus';
import type { OrderStatus } from '../../core/domain/types';
import { useAuth } from '../../state/AuthContext';
import { StatusBadge } from '../ui/StatusBadge';
import { formatDate, formatDateTime, plural } from '../../utils/format';

const FILTERS: { id: string; label: string; match: (status: OrderStatus) => boolean }[] = [
  { id: 'all', label: 'Все', match: () => true },
  { id: 'new', label: 'Новые', match: (status) => status === 'new' },
  { id: 'active', label: 'В работе', match: (status) => !['new', 'completed', 'cancelled'].includes(status) },
  { id: 'completed', label: 'Завершённые', match: (status) => status === 'completed' },
  { id: 'cancelled', label: 'Отменённые', match: (status) => status === 'cancelled' },
];

const STATUS_OPTIONS: OrderStatus[] = [...ORDER_STATUS_ORDER, 'cancelled'];

export function OrdersManager() {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nextStatus, setNextStatus] = useState<OrderStatus>('contacted');
  const [statusNote, setStatusNote] = useState('');
  const [tracking, setTracking] = useState('');
  const [shipping, setShipping] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const orders = useMemo(() => services.orders.listAll(), [version]);
  const stats = useMemo(() => services.orders.stats(), [version]);
  const selected = orders.find((order) => order.data.id === selectedId) ?? null;

  const visible = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filterConfig = FILTERS.find((item) => item.id === filter) ?? FILTERS[0];
    return orders.filter((order) => {
      if (!filterConfig.match(order.data.status)) return false;
      if (!normalized) return true;
      return (
        order.data.number.toLowerCase().includes(normalized) ||
        order.data.customerName.toLowerCase().includes(normalized) ||
        order.data.customerEmail.toLowerCase().includes(normalized)
      );
    });
  }, [orders, filter, query]);

  function openOrder(id: string) {
    const order = orders.find((item) => item.data.id === id);
    setSelectedId(id);
    setNextStatus(order?.data.status === 'new' ? 'contacted' : 'contacted');
    setStatusNote('');
    setTracking(order?.data.trackingNumber ?? '');
    setShipping(order?.data.shippingCost ? String(order.data.shippingCost) : '');
    setMessage('');
    setError('');
  }

  function refresh() {
    setVersion((value) => value + 1);
  }

  function changeStatus() {
    if (!selected || !user) return;
    setError('');
    setMessage('');
    try {
      services.orders.updateStatus(selected.data.id, nextStatus, user.uid, statusNote.trim() || undefined);
      setMessage(`Статус изменён на «${ORDER_STATUS_LABELS[nextStatus]}».`);
      setStatusNote('');
      refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось изменить статус.');
    }
  }

  function confirmPayment() {
    if (!selected || !user) return;
    setError('');
    try {
      services.orders.updateStatus(selected.data.id, 'paid', user.uid, 'Оплата подтверждена менеджером');
      setMessage('Оплата подтверждена.');
      refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось подтвердить оплату.');
    }
  }

  function saveTracking() {
    if (!selected) return;
    setError('');
    try {
      services.orders.updateTracking(selected.data.id, tracking);
      setMessage('Трек-номер сохранён.');
      refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось сохранить трек-номер.');
    }
  }

  function saveShipping() {
    if (!selected) return;
    setError('');
    try {
      services.orders.updateShippingCost(selected.data.id, Number(shipping) || 0);
      setMessage('Стоимость доставки обновлена.');
      refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Не удалось сохранить доставку.');
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Всего заказов', value: stats.total, icon: Package },
          { label: 'Новых', value: stats.newOrders, icon: CreditCard },
          { label: 'В работе', value: stats.active, icon: Truck },
          { label: 'Оплачено, ₽', value: Money.from(stats.revenue).format(), icon: CheckCircle2 },
        ].map((card) => (
          <div key={card.label} className="surface-card flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
              <card.icon size={18} />
            </span>
            <div>
              <p className="font-display text-xl font-semibold">{card.value}</p>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="surface-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                  filter === item.id
                    ? 'border-accent bg-accent text-white'
                    : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-ink'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative lg:w-72">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input py-2.5 pl-10 text-xs"
              placeholder="Номер, имя или email"
            />
          </div>
        </div>

        <p className="mt-3 text-xs text-muted">
          Показано {visible.length} {plural(visible.length, 'заказ', 'заказа', 'заказов')}
        </p>

        <div className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line">
          {visible.length === 0 && <p className="bg-surface p-6 text-center text-sm text-muted">Заказов по фильтру нет.</p>}
          {visible.map((order) => (
            <button
              key={order.data.id}
              type="button"
              onClick={() => openOrder(order.data.id)}
              className={`flex w-full flex-col gap-2 bg-surface p-4 text-left transition hover:bg-surface-2/60 sm:flex-row sm:items-center sm:gap-4 ${
                selectedId === order.data.id ? 'bg-accent-soft/50' : ''
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-display text-sm font-semibold">{order.data.number}</span>
                  <StatusBadge status={order.data.status} />
                </div>
                <p className="mt-1 truncate text-xs text-muted">
                  {order.data.customerName} · {order.data.customerEmail}
                </p>
              </div>
              <div className="flex items-center justify-between gap-4 sm:justify-end">
                <div className="text-right">
                  <p className="font-display text-base font-semibold">{Money.from(order.data.total).format()}</p>
                  <p className="text-[10px] text-muted">{formatDate(order.data.createdAt)}</p>
                </div>
                <ChevronRight size={17} className="text-muted" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="surface-card overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-line bg-surface-2/50 p-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="display-title text-2xl">{selected.data.number}</h2>
                <StatusBadge status={selected.data.status} />
              </div>
              <p className="mt-1 text-xs text-muted">
                {formatDateTime(selected.data.createdAt)} · {selected.data.customerName}
              </p>
            </div>
            <button type="button" onClick={() => setSelectedId(null)} className="btn-icon h-9 w-9" aria-label="Закрыть заказ">
              <X size={16} />
            </button>
          </div>

          <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Состав</h3>
                <div className="mt-3 space-y-2">
                  {selected.data.items.map((item, index) => (
                    <div key={`${item.productId}-${index}`} className="rounded-2xl border border-line bg-surface-2/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="text-sm font-bold">{Money.from(item.total).format()}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {item.quantity} шт. × {Money.from(item.unitPrice).format()}
                      </p>
                      {item.configurationLabel && <p className="mt-1 text-[11px] leading-5 text-muted">{item.configurationLabel}</p>}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-sm font-bold">Итого</span>
                  <span className="font-display text-xl font-semibold">{Money.from(selected.data.total).format()}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-line p-3.5 text-xs leading-5">
                <p className="font-bold text-ink">Доставка</p>
                <p className="mt-1 text-muted">{selected.data.deliveryMethod || 'Не выбрана'} · {selected.data.address ? `${selected.data.address.city}, ${selected.data.address.street}, ${selected.data.address.house}` : 'адрес не указан'}</p>
                {selected.data.comment && (
                  <>
                    <p className="mt-3 font-bold text-ink">Комментарий</p>
                    <p className="mt-1 text-muted">{selected.data.comment}</p>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={`mailto:${selected.data.customerEmail}?subject=${encodeURIComponent(`Заказ ${selected.data.number}`)}`}
                  className="btn-secondary px-3 py-2 text-xs"
                >
                  <Mail size={14} /> Написать покупателю
                </a>
                <Link to={`/account/orders/${selected.data.id}`} className="btn-secondary px-3 py-2 text-xs">
                  Открыть карточку <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {(message || error) && (
                <p className={`rounded-2xl px-3.5 py-2.5 text-xs font-semibold ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {error || message}
                </p>
              )}

              <div className="rounded-2xl border border-line p-4">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Статус</h3>
                <div className="mt-3 flex gap-2">
                  <select
                    className="select py-2.5 text-xs"
                    value={nextStatus}
                    onChange={(event) => setNextStatus(event.target.value as OrderStatus)}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>{ORDER_STATUS_LABELS[status]}</option>
                    ))}
                  </select>
                  <button type="button" onClick={changeStatus} className="btn-primary shrink-0 px-3 py-2 text-xs">
                    Применить
                  </button>
                </div>
                <input
                  className="input mt-2 py-2.5 text-xs"
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  placeholder="Комментарий к статусу (необязательно)"
                />
                {selected.data.status === 'awaiting_payment' && (
                  <button type="button" onClick={confirmPayment} className="btn-secondary mt-2 w-full py-2.5 text-xs">
                    <CheckCircle2 size={15} /> Подтвердить оплату
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-line p-4">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Доставка</h3>
                <div className="mt-3 flex gap-2">
                  <input
                    className="input py-2.5 text-xs"
                    value={shipping}
                    onChange={(event) => setShipping(event.target.value)}
                    placeholder="Стоимость, ₽"
                    inputMode="numeric"
                  />
                  <button type="button" onClick={saveShipping} className="btn-secondary shrink-0 px-3 py-2 text-xs">Сохранить</button>
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    className="input py-2.5 text-xs"
                    value={tracking}
                    onChange={(event) => setTracking(event.target.value)}
                    placeholder="Трек-номер"
                  />
                  <button type="button" onClick={saveTracking} className="btn-secondary shrink-0 px-3 py-2 text-xs">OK</button>
                </div>
              </div>

              <div className="rounded-2xl border border-line p-4">
                <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Контакты</h3>
                <div className="mt-3 space-y-2 text-xs">
                  <p className="font-bold">{selected.data.customerName}</p>
                  <p className="text-muted">{selected.data.customerPhone}</p>
                  <p className="break-all text-muted">{selected.data.customerEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
