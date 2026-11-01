import { Money } from './Money';
import { OrderStatusMachine } from './OrderStatus';
import type {
  Address,
  CartLineData,
  OrderData,
  OrderHistoryEntry,
  OrderItem,
  OrderStatus,
  Role,
} from './types';

export interface CreateOrderInput {
  number: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: Address | null;
  comment: string;
  deliveryMethod?: string;
  paymentMethod?: string;
  lines: CartLineData[];
  shippingCost?: number;
}

export class Order {
  private constructor(public readonly data: OrderData) {}

  static create(input: CreateOrderInput): Order {
    const items: OrderItem[] = input.lines.map((line) => {
      const unitPrice = Money.from(line.unitPrice);
      return {
        productId: line.productId,
        title: line.productTitle,
        quantity: line.quantity,
        unitPrice: unitPrice.amount,
        total: unitPrice.multiply(line.quantity).amount,
        configurationLabel: line.configurationLabel,
        art: line.art,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const shippingCost = Math.max(0, Math.round(input.shippingCost ?? 0));
    const now = new Date().toISOString();
    const history: OrderHistoryEntry[] = [
      { status: 'new', at: now, by: input.userId, note: 'Заказ создан' },
    ];

    return new Order({
      id: crypto.randomUUID(),
      number: input.number,
      userId: input.userId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      address: input.address,
      comment: input.comment,
      deliveryMethod: input.deliveryMethod,
      paymentMethod: input.paymentMethod,
      items,
      subtotal,
      shippingCost,
      total: subtotal + shippingCost,
      status: 'new',
      createdAt: now,
      updatedAt: now,
      history,
    });
  }

  static fromJSON(value: OrderData): Order {
    return new Order(value);
  }

  get subtotal(): Money {
    return Money.from(this.data.subtotal);
  }

  get total(): Money {
    return Money.from(this.data.total);
  }

  get canBuyerCancel(): boolean {
    return ['new', 'contacted', 'awaiting_payment'].includes(this.data.status);
  }

  withStatus(status: OrderStatus, by: string, note?: string): Order {
    if (!OrderStatusMachine.canTransition(this.data.status, status, 'manager')) {
      throw new Error(`Нельзя перевести заказ из «${this.data.status}» в «${status}»`);
    }
    const now = new Date().toISOString();
    return new Order({
      ...this.data,
      status,
      updatedAt: now,
      history: [...this.data.history, { status, at: now, by, note }],
    });
  }

  cancelByBuyer(by: string): Order {
    if (!this.canBuyerCancel) {
      throw new Error('Заказ уже нельзя отменить самостоятельно');
    }
    const now = new Date().toISOString();
    return new Order({
      ...this.data,
      status: 'cancelled',
      updatedAt: now,
      history: [
        ...this.data.history,
        { status: 'cancelled', at: now, by, note: 'Отменён покупателем' },
      ],
    });
  }

  withTracking(trackingNumber: string): Order {
    return new Order({
      ...this.data,
      trackingNumber: trackingNumber.trim(),
      updatedAt: new Date().toISOString(),
    });
  }

  withShippingCost(amount: number): Order {
    const shippingCost = Math.max(0, Math.round(amount));
    return new Order({
      ...this.data,
      shippingCost,
      total: this.data.subtotal + shippingCost,
      updatedAt: new Date().toISOString(),
    });
  }

  canBeManagedBy(role: Role): boolean {
    return role === 'manager' || role === 'admin';
  }

  toJSON(): OrderData {
    return this.data;
  }
}
