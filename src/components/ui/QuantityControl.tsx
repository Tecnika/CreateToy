import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityControl({ value, onChange, min = 1, max = 99 }: QuantityControlProps) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-surface p-1">
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
        onClick={() => onChange(Math.max(min, value - 1))}
        aria-label="Уменьшить количество"
      >
        <Minus size={15} />
      </button>
      <span className="w-8 text-center text-sm font-bold">{value}</span>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
        onClick={() => onChange(Math.min(max, value + 1))}
        aria-label="Увеличить количество"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
