import type { SiteSettings } from '../../domain/types';
import { DEFAULT_SETTINGS } from '../../data/settings';
import type { Storage } from '../../storage/Storage';
import type { SettingsRepository } from '../types';

export class LocalSettingsRepository implements SettingsRepository {
  private readonly key = 'settings';

  constructor(private readonly storage: Storage) {}

  get(): SiteSettings {
    return this.storage.get<SiteSettings>(this.key, DEFAULT_SETTINGS);
  }

  save(settings: SiteSettings): void {
    this.storage.set(this.key, settings);
  }
}
