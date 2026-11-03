import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile } from '../../domain/types';
import type { UserRepository } from '../types';
import { supabaseError } from '../../supabase/errors';
import { mapProfileRow, toProfileInsert, toProfilePatch } from '../../supabase/mappers';
import type { ProfileRow } from '../../supabase/database';
import type { SupabaseCache } from '../../supabase/store';

export class SupabaseUserRepository implements UserRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly cache: SupabaseCache,
  ) {}

  list(): UserProfile[] {
    return this.cache.users;
  }

  getById(id: string): UserProfile | undefined {
    return this.list().find((user) => user.uid === id);
  }

  getByEmail(email: string): UserProfile | undefined {
    const normalized = email.trim().toLowerCase();
    return this.list().find((user) => user.email.toLowerCase() === normalized);
  }

  getByLogin(login: string): UserProfile | undefined {
    const normalized = login.trim().toLowerCase();
    return this.list().find(
      (user) => user.email.toLowerCase() === normalized || user.displayName.toLowerCase() === normalized,
    );
  }

  async save(user: UserProfile): Promise<void> {
    const previous = this.getById(user.uid);
    const roleChanged = previous && previous.role !== user.role;

    if (roleChanged) {
      const { data, error } = await this.client.rpc('admin_set_user_role', {
        p_user_id: user.uid,
        p_role: user.role,
      });
      if (error) throw supabaseError(error, 'Не удалось изменить роль.');
      const row = (Array.isArray(data) ? data[0] : data) as ProfileRow | null;
      if (row) this.cache.upsertUser(mapProfileRow(row));
      return;
    }

    if (!previous) {
      const { data, error } = await this.client
        .from('profiles')
        .insert(toProfileInsert(user))
        .select('*')
        .single();
      if (error) throw supabaseError(error, 'Не удалось создать профиль.');
      this.cache.upsertUser(mapProfileRow(data as ProfileRow));
      return;
    }

    const { data, error } = await this.client
      .from('profiles')
      .update(toProfilePatch(user))
      .eq('id', user.uid)
      .select('*')
      .single();
    if (error) throw supabaseError(error, 'Не удалось сохранить профиль.');
    this.cache.upsertUser(mapProfileRow(data as ProfileRow));
  }
}
