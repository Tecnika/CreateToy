import type { OrderStatus, Role } from './types';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  contacted: 'Связались',
  awaiting_payment: 'Ожидает оплаты',
  paid: 'Оплачен',
  in_production: 'В производстве',
  ready: 'Готов',
  shipped: 'Отправлен',
  completed: 'Завершён',
  cancelled: 'Отменён',
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  'new',
  'contacted',
  'awaiting_payment',
  'paid',
  'in_production',
  'ready',
  'shipped',
  'completed',
];

export const ORDER_STATUS_TONES: Record<OrderStatus, string> = {
  new: 'bg-amber-100 text-amber-800',
  contacted: 'bg-sky-100 text-sky-800',
  awaiting_payment: 'bg-orange-100 text-orange-800',
  paid: 'bg-emerald-100 text-emerald-800',
  in_production: 'bg-violet-100 text-violet-800',
  ready: 'bg-teal-100 text-teal-800',
  shipped: 'bg-blue-100 text-blue-800',
  completed: 'bg-stone-200 text-stone-700',
  cancelled: 'bg-rose-100 text-rose-800',
};

export class OrderStatusMachine {
  static label(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status];
  }

  static next(status: OrderStatus): OrderStatus | null {
    const index = ORDER_STATUS_ORDER.indexOf(status);
    if (index < 0 || index === ORDER_STATUS_ORDER.length - 1) return null;
    return ORDER_STATUS_ORDER[index + 1];
  }

  static canTransition(from: OrderStatus, to: OrderStatus, role: Role): boolean {
    if (from === to) return false;
    if (role === 'admin' || role === 'manager') {
      return to !== 'new' || from === 'new';
    }
    if (role === 'buyer') {
      return to === 'cancelled' && ['new', 'contacted', 'awaiting_payment'].includes(from);
    }
    return false;
  }

  static isFinal(status: OrderStatus): boolean {
    return status === 'completed' || status === 'cancelled';
  }

  static progress(status: OrderStatus): number {
    if (status === 'cancelled') return 0;
    const index = ORDER_STATUS_ORDER.indexOf(status);
    return index < 0 ? 0 : ((index + 1) / ORDER_STATUS_ORDER.length) * 100;
  }
}
