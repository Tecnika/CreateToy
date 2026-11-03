import { Order } from '../../domain/Order';
import type { OrderData } from '../../domain/types';
import { DEMO_ORDERS } from '../../data/demo';
import type { Storage } from '../../storage/Storage';
import type { OrderRepository } from '../types';

export class LocalOrderRepository implements OrderRepository {
  private readonly key = 'orders';

  constructor(private readonly storage: Storage) {
    if (!this.storage.has(this.key)) {
      this.storage.set(this.key, DEMO_ORDERS);
    }
  }

  private raw(): OrderData[] {
    return this.storage.get<OrderData[]>(this.key, []);
  }

  listAll(): Order[] {
    return this.raw()
      .map(Order.fromJSON)
      .sort((a, b) => b.data.createdAt.localeCompare(a.data.createdAt));
  }

  listByUser(userId: string): Order[] {
    return this.listAll().filter((order) => order.data.userId === userId);
  }

  getById(id: string): Order | undefined {
    return this.listAll().find((order) => order.data.id === id);
  }

  create(order: Order): Order {
    this.persist(order);
    return order;
  }

  update(order: Order): Order {
    this.persist(order);
    return order;
  }

  private persist(order: Order): void {
    const all = this.raw();
    const index = all.findIndex((item) => item.id === order.data.id);
    if (index >= 0) all[index] = order.toJSON();
    else all.push(order.toJSON());
    this.storage.set(this.key, all);
  }
}
