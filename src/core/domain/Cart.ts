import { Money } from './Money';
import type { CartLineData } from './types';

export class Cart {
  constructor(public lines: CartLineData[] = []) {}

  add(line: CartLineData): Cart {
    const existing = this.lines.find((item) => item.id === line.id);
    if (existing) {
      existing.quantity += line.quantity;
    } else {
      this.lines.push(line);
    }
    return this;
  }

  updateQuantity(lineId: string, quantity: number): Cart {
    const line = this.lines.find((item) => item.id === lineId);
    if (!line) return this;
    if (quantity <= 0) {
      return this.remove(lineId);
    }
    line.quantity = Math.max(1, Math.min(99, Math.round(quantity)));
    return this;
  }

  remove(lineId: string): Cart {
    this.lines = this.lines.filter((item) => item.id !== lineId);
    return this;
  }

  clear(): Cart {
    this.lines = [];
    return this;
  }

  get count(): number {
    return this.lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  get subtotal(): Money {
    return this.lines.reduce(
      (sum, line) => sum.add(Money.from(line.unitPrice).multiply(line.quantity)),
      Money.zero(),
    );
  }

  toJSON(): CartLineData[] {
    return this.lines;
  }

  static fromJSON(value: unknown): Cart {
    if (!Array.isArray(value)) return new Cart();
    return new Cart(value as CartLineData[]);
  }
}
