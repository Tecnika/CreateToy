import { describe, expect, it } from 'vitest';
import { ORDER_STATUS_ORDER, OrderStatusMachine } from './OrderStatus';

describe('OrderStatusMachine', () => {
  it('walks through the status chain', () => {
    expect(OrderStatusMachine.next('new')).toBe('contacted');
    expect(OrderStatusMachine.next('paid')).toBe('in_production');
    expect(OrderStatusMachine.next('completed')).toBeNull();
    expect(OrderStatusMachine.next('cancelled')).toBeNull();
  });

  it('allows staff to move an order forward', () => {
    expect(OrderStatusMachine.canTransition('new', 'contacted', 'manager')).toBe(true);
    expect(OrderStatusMachine.canTransition('awaiting_payment', 'paid', 'admin')).toBe(true);
    expect(OrderStatusMachine.canTransition('new', 'new', 'manager')).toBe(false);
  });

  it('lets a buyer cancel only before production', () => {
    expect(OrderStatusMachine.canTransition('new', 'cancelled', 'buyer')).toBe(true);
    expect(OrderStatusMachine.canTransition('contacted', 'cancelled', 'buyer')).toBe(true);
    expect(OrderStatusMachine.canTransition('awaiting_payment', 'cancelled', 'buyer')).toBe(true);
    expect(OrderStatusMachine.canTransition('paid', 'cancelled', 'buyer')).toBe(false);
    expect(OrderStatusMachine.canTransition('new', 'paid', 'buyer')).toBe(false);
  });

  it('reports final statuses and progress', () => {
    expect(OrderStatusMachine.isFinal('completed')).toBe(true);
    expect(OrderStatusMachine.isFinal('cancelled')).toBe(true);
    expect(OrderStatusMachine.isFinal('shipped')).toBe(false);
    expect(OrderStatusMachine.progress('new')).toBe((1 / ORDER_STATUS_ORDER.length) * 100);
    expect(OrderStatusMachine.progress('completed')).toBe(100);
    expect(OrderStatusMachine.progress('cancelled')).toBe(0);
  });
});
