import { Order } from '../domain/Order';
import type { Address, CartLineData, OrderStatus, UserProfile } from '../domain/types';
import type { OrderRepository } from '../repositories/types';

export interface CheckoutDetails {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: Address | null;
  comment: string;
  deliveryMethod?: string;
  paymentMethod?: string;
  shippingCost?: number;
}

export class OrderService {
  constructor(private readonly repository: OrderRepository) {}

  listAll(): Order[] {
    return this.repository.listAll();
  }

  listForUser(userId: string): Order[] {
    return this.repository.listByUser(userId);
  }

  getById(id: string): Order | undefined {
    return this.repository.getById(id);
  }

  async createOrder(user: UserProfile, lines: CartLineData[], details: CheckoutDetails): Promise<Order> {
    if (lines.length === 0) {
      throw new Error('Корзина пуста.');
    }
    const order = Order.create({
      number: this.nextNumber(),
      userId: user.uid,
      ...details,
      lines,
    });
    return await this.repository.create(order);
  }

  async updateStatus(id: string, status: OrderStatus, by: string, note?: string): Promise<Order> {
    const order = this.getOrderOrThrow(id);
    const updated = order.withStatus(status, by, note);
    return await this.repository.update(updated);
  }

  async updateTracking(id: string, trackingNumber: string): Promise<Order> {
    const order = this.getOrderOrThrow(id);
    const updated = order.withTracking(trackingNumber);
    return await this.repository.update(updated);
  }

  async updateShippingCost(id: string, amount: number): Promise<Order> {
    const order = this.getOrderOrThrow(id);
    const updated = order.withShippingCost(amount);
    return await this.repository.update(updated);
  }

  async cancelByBuyer(id: string, userId: string): Promise<Order> {
    const order = this.getOrderOrThrow(id);
    if (order.data.userId !== userId) {
      throw new Error('Это не ваш заказ.');
    }
    const updated = order.cancelByBuyer(userId);
    if (this.repository.cancel) {
      return await this.repository.cancel(updated.data.id);
    }
    return await this.repository.update(updated);
  }

  stats() {
    const orders = this.listAll();
    const active = orders.filter((order) => !['completed', 'cancelled'].includes(order.data.status));
    const revenue = orders
      .filter((order) => !['new', 'contacted', 'awaiting_payment', 'cancelled'].includes(order.data.status))
      .reduce((sum, order) => sum + order.data.total, 0);
    return {
      total: orders.length,
      active: active.length,
      newOrders: orders.filter((order) => order.data.status === 'new').length,
      revenue,
    };
  }

  private nextNumber(): string {
    const year = new Date().getFullYear();
    const numbers = this.listAll()
      .map((order) => order.data.number.match(/(\d+)$/)?.[1])
      .filter(Boolean)
      .map(Number);
    const next = Math.max(0, ...numbers) + 1;
    return `CT-${year}-${String(next).padStart(4, '0')}`;
  }

  private getOrderOrThrow(id: string): Order {
    const order = this.repository.getById(id);
    if (!order) throw new Error('Заказ не найден.');
    return order;
  }
}
