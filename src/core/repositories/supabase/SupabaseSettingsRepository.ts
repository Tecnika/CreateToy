import type { SupabaseClient } from '@supabase/supabase-js';
import type { SiteSettings } from '../../domain/types';
import type { SettingsRepository } from '../types';
import { supabaseError } from '../../supabase/errors';
import { toSettingsRow } from '../../supabase/mappers';
import type { SupabaseCache } from '../../supabase/store';

export class SupabaseSettingsRepository implements SettingsRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly cache: SupabaseCache,
  ) {}

  get(): SiteSettings {
    return this.cache.settings;
  }

  async save(settings: SiteSettings): Promise<void> {
    const { error } = await this.client
      .from('settings')
      .upsert(toSettingsRow(settings), { onConflict: 'id' });
    if (error) throw supabaseError(error, 'Не удалось сохранить настройки.');
    this.cache.setSettings(settings);
  }
}
