import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '../../domain/types';
import type { ProductRepository } from '../types';
import { supabaseError } from '../../supabase/errors';
import { mapProductRow, toProductRow } from '../../supabase/mappers';
import type { ProductRow } from '../../supabase/database';
import type { SupabaseCache } from '../../supabase/store';

export class SupabaseProductRepository implements ProductRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly cache: SupabaseCache,
  ) {}

  listAll(): Product[] {
    return this.cache.products;
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

  async save(product: Product): Promise<void> {
    const { error } = await this.client
      .from('products')
      .upsert(toProductRow(product), { onConflict: 'id' });
    if (error) throw supabaseError(error, 'Не удалось сохранить товар.');
    this.cache.upsertProduct(product);
  }

  async archive(id: string): Promise<void> {
    await this.setArchived(id, new Date().toISOString());
  }

  async restore(id: string): Promise<void> {
    await this.setArchived(id, null);
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.client.from('products').delete().eq('id', id);
    if (error) throw supabaseError(error, 'Не удалось удалить товар.');
    this.cache.removeProduct(id);
  }

  private async setArchived(id: string, archivedAt: string | null): Promise<void> {
    const { data, error } = await this.client
      .from('products')
      .update({ archived_at: archivedAt })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw supabaseError(error, 'Не удалось изменить видимость товара.');
    this.cache.upsertProduct(mapProductRow(data as ProductRow));
  }
}
