import type { SupabaseClient } from '@supabase/supabase-js';
import type { HolidayThemeData } from '../../domain/types';
import type { ThemeRepository } from '../types';
import { supabaseError } from '../../supabase/errors';
import { toThemeRow } from '../../supabase/mappers';
import type { SupabaseCache } from '../../supabase/store';

export class SupabaseThemeRepository implements ThemeRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly cache: SupabaseCache,
  ) {}

  listCustom(): HolidayThemeData[] {
    return this.cache.themes;
  }

  async saveCustom(theme: HolidayThemeData): Promise<void> {
    const { error } = await this.client
      .from('holiday_themes')
      .upsert(toThemeRow(theme), { onConflict: 'id' });
    if (error) throw supabaseError(error, 'Не удалось сохранить тему.');
    this.cache.upsertTheme(theme);
  }

  async removeCustom(id: string): Promise<void> {
    const { error } = await this.client.from('holiday_themes').delete().eq('id', id);
    if (error) throw supabaseError(error, 'Не удалось удалить тему.');
    this.cache.removeTheme(id);
  }
}
