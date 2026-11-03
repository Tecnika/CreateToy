import type { SiteSettings } from '../domain/types';
import type { SettingsRepository } from '../repositories/types';

export class SettingsService {
  constructor(private readonly repository: SettingsRepository) {}

  get(): SiteSettings {
    return this.repository.get();
  }

  async save(settings: SiteSettings): Promise<void> {
    await this.repository.save(settings);
  }
}
