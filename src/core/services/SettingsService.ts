import type { SiteSettings } from '../domain/types';
import type { SettingsRepository } from '../repositories/types';

export class SettingsService {
  constructor(private readonly repository: SettingsRepository) {}

  get(): SiteSettings {
    return this.repository.get();
  }

  save(settings: SiteSettings): void {
    this.repository.save(settings);
  }
}
