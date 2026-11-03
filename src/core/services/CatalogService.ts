import type { HolidayTheme } from '../domain/HolidayTheme';
import type { Product } from '../domain/types';
import { PRODUCT_CATEGORIES } from '../data/products';
import type { ProductRepository } from '../repositories/types';

export class CatalogService {
  constructor(private readonly repository: ProductRepository) {}

  list(): Product[] {
    return this.repository.list();
  }

  listAll(): Product[] {
    return this.repository.listAll();
  }

  archived(): Product[] {
    return this.repository.listAll().filter((product) => product.archivedAt);
  }

  bySlug(slug: string): Product | undefined {
    return this.repository.getBySlug(slug);
  }

  byId(id: string): Product | undefined {
    return this.repository.getById(id);
  }

  categories() {
    return PRODUCT_CATEGORIES;
  }

  featured(theme?: HolidayTheme): Product[] {
    if (theme) {
      const ids = new Set(theme.data.featuredProductIds);
      const selected = this.list().filter((product) => ids.has(product.id));
      if (selected.length > 0) return selected;
    }
    return this.list().filter((product) => product.featured);
  }

  related(product: Product, limit = 3): Product[] {
    return this.list()
      .filter(
        (candidate) =>
          candidate.id !== product.id &&
          (candidate.category === product.category ||
            candidate.holidayIds.some((holidayId) => product.holidayIds.includes(holidayId))),
      )
      .slice(0, limit);
  }

  filter(options: { query?: string; category?: string; holidayId?: string }): Product[] {
    const query = options.query?.trim().toLowerCase();
    return this.list().filter((product) => {
      const matchesQuery =
        !query ||
        product.title.toLowerCase().includes(query) ||
        product.subtitle.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query);
      const matchesCategory =
        !options.category || options.category === 'all' || product.category === options.category;
      const matchesHoliday = !options.holidayId || product.holidayIds.includes(options.holidayId);
      return matchesQuery && matchesCategory && matchesHoliday;
    });
  }

  async save(product: Product): Promise<void> {
    await this.repository.save(product);
  }

  async archive(id: string): Promise<void> {
    await this.repository.archive(id);
  }

  async restore(id: string): Promise<void> {
    await this.repository.restore(id);
  }

  async remove(id: string): Promise<void> {
    await this.repository.remove(id);
  }
}
