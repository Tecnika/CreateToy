import { Cart } from '../domain/Cart';
import type { CartLineData } from '../domain/types';
import type { Storage } from '../storage/Storage';

export class CartService {
  private cart: Cart;
  private readonly listeners = new Set<(cart: Cart) => void>();

  constructor(private readonly storage: Storage) {
    this.cart = Cart.fromJSON(this.storage.get<CartLineData[]>('cart', []));
  }

  get lines(): CartLineData[] {
    return this.cart.lines;
  }

  get count(): number {
    return this.cart.count;
  }

  get subtotal() {
    return this.cart.subtotal;
  }

  addLine(line: CartLineData): void {
    this.cart.add(line);
    this.commit();
  }

  updateQuantity(lineId: string, quantity: number): void {
    this.cart.updateQuantity(lineId, quantity);
    this.commit();
  }

  remove(lineId: string): void {
    this.cart.remove(lineId);
    this.commit();
  }

  clear(): void {
    this.cart.clear();
    this.commit();
  }

  subscribe(listener: (cart: Cart) => void): () => void {
    this.listeners.add(listener);
    listener(this.cart);
    return () => this.listeners.delete(listener);
  }

  private commit(): void {
    this.cart = new Cart(this.cart.lines.map((line) => ({ ...line })));
    this.storage.set('cart', this.cart.toJSON());
    this.listeners.forEach((listener) => listener(this.cart));
  }
}
