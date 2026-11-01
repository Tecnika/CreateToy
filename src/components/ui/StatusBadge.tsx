import clsx from 'clsx';
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../../core/domain/OrderStatus';
import type { OrderStatus } from '../../core/domain/types';

export function StatusBadge({ status, className }: { status: OrderStatus; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.08em]',
        ORDER_STATUS_TONES[status],
        className,
      )}
    >
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}
