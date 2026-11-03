import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '../../domain/types';
import type { ProductRepository } from '../types';
import { supabaseError } from '../../supabase/errors';
import { toProductRow } from '../../supabase/mappers';
import type { SupabaseCache } from '../../supabase/store';

export class SupabaseProductRepository implements ProductRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly cache: SupabaseCache,
  ) {}

  list(): Product[] {
    return this.cache.products;
  }

  getById(id: string): Product | undefined {
    return this.list().find((product) => product.id === id);
  }

  getBySlug(slug: string): Product | undefined {
    return this.list().find((product) => product.slug === slug);
  }

  async save(product: Product): Promise<void> {
    const { error } = await this.client
      .from('products')
      .upsert(toProductRow(product), { onConflict: 'id' });
    if (error) throw supabaseError(error, 'Не удалось сохранить товар.');
    this.cache.upsertProduct(product);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from('products').delete().eq('id', id);
    if (error) throw supabaseError(error, 'Не удалось удалить товар.');
    this.cache.removeProduct(id);
  }
}
