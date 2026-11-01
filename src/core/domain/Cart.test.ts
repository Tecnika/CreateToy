import { describe, expect, it } from 'vitest';
import { Cart } from './Cart';
import type { CartLineData } from './types';

function line(overrides: Partial<CartLineData> = {}): CartLineData {
  return {
    id: 'line-1',
    productId: 'product-1',
    productTitle: 'Снежная семейка',
    productSlug: 'snow-family',
    art: { kind: 'snowman', colors: ['#ffffff', '#d9ecff', '#20251f'] },
    unitPrice: 1490,
    quantity: 1,
    configuration: {},
    configurationLabel: '',
    ...overrides,
  };
}

describe('Cart', () => {
  it('merges a repeated line instead of duplicating it', () => {
    const cart = new Cart().add(line()).add(line({ quantity: 2 }));
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0].quantity).toBe(3);
  });

  it('keeps quantities within 1..99 and removes at zero', () => {
    const cart = new Cart([line()]);
    cart.updateQuantity('line-1', 120);
    expect(cart.lines[0].quantity).toBe(99);
    cart.updateQuantity('line-1', -5);
    expect(cart.lines).toHaveLength(0);
  });

  it('ignores unknown line ids', () => {
    const cart = new Cart([line()]);
    cart.updateQuantity('missing', 5);
    expect(cart.lines).toHaveLength(1);
    expect(cart.lines[0].quantity).toBe(1);
  });

  it('counts items and calculates the subtotal', () => {
    const cart = new Cart([
      line({ id: 'a', unitPrice: 1490, quantity: 2 }),
      line({ id: 'b', unitPrice: 250, quantity: 3 }),
    ]);
    expect(cart.count).toBe(5);
    expect(cart.subtotal.amount).toBe(3730);
  });

  it('clears and restores a cart from JSON', () => {
    const restored = Cart.fromJSON([line()]);
    expect(restored.count).toBe(1);
    restored.clear();
    expect(restored.lines).toHaveLength(0);
    expect(Cart.fromJSON(null).lines).toHaveLength(0);
  });
});
