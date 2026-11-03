import type { SupabaseClient } from '@supabase/supabase-js';
import { Order } from '../../domain/Order';
import type { OrderRepository } from '../types';
import { supabaseError } from '../../supabase/errors';
import { mapOrderRow, toOrderInsert, toOrderUpdate } from '../../supabase/mappers';
import type { OrderRow } from '../../supabase/database';
import type { SupabaseCache } from '../../supabase/store';

function firstRow(value: unknown): OrderRow | null {
  if (Array.isArray(value)) return (value[0] as OrderRow | undefined) ?? null;
  return (value as OrderRow | null) ?? null;
}

export class SupabaseOrderRepository implements OrderRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly cache: SupabaseCache,
  ) {}

  listAll(): Order[] {
    return this.cache.orders;
  }

  listByUser(userId: string): Order[] {
    return this.listAll().filter((order) => order.data.userId === userId);
  }

  getById(id: string): Order | undefined {
    return this.listAll().find((order) => order.data.id === id);
  }

  async create(order: Order): Promise<Order> {
    const { data, error } = await this.client
      .from('orders')
      .insert(toOrderInsert(order))
      .select('*')
      .single();
    if (error) throw supabaseError(error, 'Не удалось создать заказ.');
    const created = mapOrderRow(data as OrderRow);
    this.cache.upsertOrder(created);
    return created;
  }

  async update(order: Order): Promise<Order> {
    const { data, error } = await this.client
      .from('orders')
      .update(toOrderUpdate(order))
      .eq('id', order.data.id)
      .select('*')
      .single();
    if (error) throw supabaseError(error, 'Не удалось обновить заказ.');
    const updated = mapOrderRow(data as OrderRow);
    this.cache.upsertOrder(updated);
    return updated;
  }

  async cancel(id: string): Promise<Order> {
    const { data, error } = await this.client.rpc('cancel_order', { p_order_id: id });
    if (error) throw supabaseError(error, 'Не удалось отменить заказ.');
    const row = firstRow(data);
    if (!row) throw new Error('Не удалось отменить заказ.');
    const cancelled = mapOrderRow(row);
    this.cache.upsertOrder(cancelled);
    return cancelled;
  }
}
