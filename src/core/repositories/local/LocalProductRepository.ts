import type { Product } from '../../domain/types';
import { PRODUCTS } from '../../data/products';
import type { Storage } from '../../storage/Storage';
import type { ProductRepository } from '../types';

export class LocalProductRepository implements ProductRepository {
  private readonly key = 'products:custom';
  private readonly removedKey = 'products:removed';

  constructor(private readonly storage: Storage) {}

  private custom(): Product[] {
    return this.storage.get<Product[]>(this.key, []);
  }

  private removed(): string[] {
    return this.storage.get<string[]>(this.removedKey, []);
  }

  listAll(): Product[] {
    const custom = this.custom();
    const customIds = new Set(custom.map((product) => product.id));
    const removed = new Set(this.removed());
    return [...PRODUCTS.filter((product) => !customIds.has(product.id) && !removed.has(product.id)), ...custom];
  }

  list(): Product[] {
    return this.listAll().filter((product) => !product.archivedAt);
  }

  getById(id: string): Product | undefined {
    return this.list().find((product) => product.id === id);
  }

  getBySlug(slug: string): Product | undefined {
    return this.list().find((product) => product.slug === slug);
  }

  save(product: Product): void {
    const custom = this.custom();
    const index = custom.findIndex((item) => item.id === product.id);
    if (index >= 0) custom[index] = product;
    else custom.push(product);
    this.storage.set(this.key, custom);
    this.storage.set(this.removedKey, this.removed().filter((id) => id !== product.id));
  }

  archive(id: string): void {
    const product = this.listAll().find((item) => item.id === id);
    if (!product) throw new Error('Товар не найден.');
    this.save({ ...product, archivedAt: new Date().toISOString() });
  }

  restore(id: string): void {
    const product = this.listAll().find((item) => item.id === id);
    if (!product) throw new Error('Товар не найден.');
    const restored = { ...product };
    delete restored.archivedAt;
    this.save(restored);
  }

  remove(id: string): void {
    this.storage.set(
      this.key,
      this.custom().filter((product) => product.id !== id),
    );
    if (PRODUCTS.some((product) => product.id === id)) {
      this.storage.set(this.removedKey, Array.from(new Set([...this.removed(), id])));
    }
  }
}
