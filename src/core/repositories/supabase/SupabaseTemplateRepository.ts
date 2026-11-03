import type { SupabaseClient } from '@supabase/supabase-js';
import type { ConfiguratorTemplateData } from '../../domain/types';
import type { TemplateRepository } from '../types';
import { supabaseError } from '../../supabase/errors';
import { toTemplateRow } from '../../supabase/mappers';
import type { SupabaseCache } from '../../supabase/store';

export class SupabaseTemplateRepository implements TemplateRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly cache: SupabaseCache,
  ) {}

  listCustom(): ConfiguratorTemplateData[] {
    return this.cache.templates;
  }

  async saveCustom(template: ConfiguratorTemplateData): Promise<void> {
    const { error } = await this.client
      .from('configurator_templates')
      .upsert(toTemplateRow(template), { onConflict: 'id' });
    if (error) throw supabaseError(error, 'Не удалось сохранить шаблон.');
    this.cache.upsertTemplate(template);
  }

  async removeCustom(id: string): Promise<void> {
    const { error } = await this.client.from('configurator_templates').delete().eq('id', id);
    if (error) throw supabaseError(error, 'Не удалось удалить шаблон.');
    this.cache.removeTemplate(id);
  }
}
