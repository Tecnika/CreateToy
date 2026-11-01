import { describe, expect, it } from 'vitest';
import { Order } from './Order';
import type { CartLineData } from './types';

const line: CartLineData = {
  id: 'line-1',
  productId: 'product-1',
  productTitle: 'Своя фигурка',
  productSlug: 'custom-figure',
  art: { kind: 'gift', colors: ['#c45d3a', '#f2b84b', '#f7f0e6'] },
  unitPrice: 1990,
  quantity: 2,
  configuration: { inscription: 'Маша' },
  configurationLabel: 'Надпись: Маша',
};

function createOrder(): Order {
  return Order.create({
    number: 'CT-2026-0001',
    userId: 'buyer-1',
    customerName: 'Анна',
    customerEmail: 'buyer@example.com',
    customerPhone: '+7 999 000-00-00',
    address: {
      id: 'address-1',
      label: 'Дом',
      recipient: 'Анна',
      phone: '+7 999 000-00-00',
      city: 'Москва',
      street: 'Тверская',
      house: '12',
      postalCode: '125009',
    },
    comment: 'Подарочная упаковка',
    deliveryMethod: 'СДЭК',
    paymentMethod: 'Перевод по реквизитам',
    lines: [line],
  });
}

describe('Order', () => {
  it('calculates item totals and the order total', () => {
    const order = createOrder();
    expect(order.data.id).toBeTruthy();
    expect(order.data.items[0].total).toBe(3980);
    expect(order.data.subtotal).toBe(3980);
    expect(order.data.shippingCost).toBe(0);
    expect(order.data.total).toBe(3980);
    expect(order.data.status).toBe('new');
    expect(order.data.history).toHaveLength(1);
  });

  it('changes status and keeps an audit trail', () => {
    const contacted = createOrder().withStatus('contacted', 'manager-1', 'Связались с покупателем');
    expect(contacted.data.status).toBe('contacted');
    expect(contacted.data.history).toHaveLength(2);
    expect(contacted.data.history[1].note).toBe('Связались с покупателем');
  });

  it('rejects a transition to the same status', () => {
    expect(() => createOrder().withStatus('new', 'manager-1')).toThrow();
  });

  it('lets a buyer cancel before production', () => {
    const cancelled = createOrder().cancelByBuyer('buyer-1');
    expect(cancelled.data.status).toBe('cancelled');
    expect(cancelled.canBuyerCancel).toBe(false);
  });

  it('does not let a buyer cancel a paid order', () => {
    const paid = createOrder().withStatus('paid', 'manager-1');
    expect(() => paid.cancelByBuyer('buyer-1')).toThrow();
  });

  it('trims tracking and recalculates the total with shipping', () => {
    const updated = createOrder().withTracking('  CDEK-123  ').withShippingCost(350.4);
    expect(updated.data.trackingNumber).toBe('CDEK-123');
    expect(updated.data.shippingCost).toBe(350);
    expect(updated.data.total).toBe(4330);
  });
});
