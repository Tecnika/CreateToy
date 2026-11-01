import { Check, Circle } from 'lucide-react';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  OrderStatusMachine,
} from '../../core/domain/OrderStatus';
import type { OrderData, OrderHistoryEntry } from '../../core/domain/types';
import { formatDateTime } from '../../utils/format';

function findEntry(history: OrderHistoryEntry[], status: OrderHistoryEntry['status']) {
  return [...history].reverse().find((entry) => entry.status === status);
}

export function OrderProgress({ order }: { order: OrderData }) {
  const cancelled = order.status === 'cancelled';
  const currentIndex = ORDER_STATUS_ORDER.indexOf(order.status);

  return (
    <div className="rounded-3xl border border-line bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Статус заказа</p>
          <p className="display-title mt-1 text-xl">{ORDER_STATUS_LABELS[order.status]}</p>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-accent-2">
          {cancelled ? 'Закрыт' : OrderStatusMachine.isFinal(order.status) ? 'Завершён' : 'В работе'}
        </span>
      </div>

      {cancelled ? (
        <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          Заказ отменён. Если это ошибка — свяжитесь с менеджером.
        </p>
      ) : (
        <>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${OrderStatusMachine.progress(order.status)}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8">
            {ORDER_STATUS_ORDER.map((status, index) => {
              const done = index <= currentIndex;
              return (
                <div key={status} className="flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] ${
                      done ? 'bg-accent text-white' : 'border border-line bg-surface-2 text-muted'
                    }`}
                  >
                    {done ? <Check size={12} /> : <Circle size={7} fill="currentColor" />}
                  </span>
                  <span className={`text-[9px] font-bold leading-3 ${done ? 'text-ink' : 'text-muted'}`}>
                    {ORDER_STATUS_LABELS[status]}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function OrderTimeline({ order }: { order: OrderData }) {
  return (
    <div className="surface-card p-5 sm:p-6">
      <h2 className="display-title text-xl">История заказа</h2>
      <div className="mt-5 space-y-4">
        {[...order.history].reverse().map((entry, index) => (
          <div key={`${entry.status}-${entry.at}-${index}`} className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Check size={13} />
            </span>
            <div className="min-w-0 flex-1 border-b border-line pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-bold">{ORDER_STATUS_LABELS[entry.status]}</p>
                <span className="text-[11px] text-muted">{formatDateTime(entry.at)}</span>
              </div>
              {entry.note && <p className="mt-1 text-xs leading-5 text-muted">{entry.note}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderStatusHistoryPreview({ order }: { order: OrderData }) {
  const last = findEntry(order.history, order.status);
  if (!last) return null;
  return <span className="text-[11px] text-muted">{formatDateTime(last.at)}</span>;
}
