import { describe, expect, it } from 'vitest';
import type { Product } from '../domain/types';
import type { ProductRepository } from '../repositories/types';
import { CatalogService } from './CatalogService';

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    slug: 'product-1',
    title: 'Товар',
    subtitle: '',
    description: '',
    price: 1000,
    category: 'figurine',
    holidayIds: [],
    templateId: 'figure',
    art: { kind: 'gift', colors: ['#000000', '#ffffff', '#ff0000'] },
    productionDays: 3,
    materials: 'PLA+',
    size: '10 см',
    ...overrides,
  };
}

class MemoryProductRepository implements ProductRepository {
  constructor(private items: Product[]) {}

  list(): Product[] {
    return this.items.filter((item) => !item.archivedAt);
  }

  listAll(): Product[] {
    return this.items;
  }

  getById(id: string): Product | undefined {
    return this.list().find((item) => item.id === id);
  }

  getBySlug(slug: string): Product | undefined {
    return this.list().find((item) => item.slug === slug);
  }

  async save(next: Product): Promise<void> {
    const index = this.items.findIndex((item) => item.id === next.id);
    if (index >= 0) this.items[index] = next;
    else this.items.push(next);
  }

  async archive(id: string): Promise<void> {
    const item = this.items.find((entry) => entry.id === id);
    if (!item) throw new Error('Товар не найден.');
    item.archivedAt = '2026-11-03T00:00:00.000Z';
  }

  async restore(id: string): Promise<void> {
    const item = this.items.find((entry) => entry.id === id);
    if (!item) throw new Error('Товар не найден.');
    delete item.archivedAt;
  }

  async remove(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

describe('CatalogService archive', () => {
  it('hides archived products from the public catalog', () => {
    const service = new CatalogService(
      new MemoryProductRepository([
        product({ id: 'active', slug: 'active', title: 'Активный', featured: true }),
        product({
          id: 'hidden',
          slug: 'hidden',
          title: 'Скрытый',
          featured: true,
          archivedAt: '2026-11-03T00:00:00.000Z',
        }),
      ]),
    );

    expect(service.list().map((item) => item.id)).toEqual(['active']);
    expect(service.listAll().map((item) => item.id)).toEqual(['active', 'hidden']);
    expect(service.archived().map((item) => item.id)).toEqual(['hidden']);
    expect(service.bySlug('hidden')).toBeUndefined();
    expect(service.featured().map((item) => item.id)).toEqual(['active']);
  });

  it('archives and restores a product', async () => {
    const repository = new MemoryProductRepository([product()]);
    const service = new CatalogService(repository);

    await service.archive('product-1');
    expect(service.list()).toHaveLength(0);
    expect(service.archived()).toHaveLength(1);

    await service.restore('product-1');
    expect(service.list()).toHaveLength(1);
    expect(service.archived()).toHaveLength(0);
  });
});
