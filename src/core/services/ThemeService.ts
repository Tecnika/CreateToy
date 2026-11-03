import { HolidayTheme } from '../domain/HolidayTheme';
import type { HolidayThemeData, SiteSettings } from '../domain/types';
import { HolidayRegistry } from '../../themes/definitions';
import type { SettingsRepository, ThemeRepository } from '../repositories/types';
import type { Storage } from '../storage/Storage';

export class ThemeService {
  private registry: HolidayRegistry;
  private readonly listeners = new Set<() => void>();
  private activeId: string;

  constructor(
    private readonly repository: ThemeRepository,
    private readonly storage: Storage,
    private readonly settingsRepository?: SettingsRepository,
  ) {
    this.registry = HolidayRegistry.createDefault();
    this.activeId = this.registry.getDefault().id;
    this.reload(false);
  }

  get themes() {
    return this.registry.list();
  }

  get activeTheme() {
    return this.registry.get(this.activeId) ?? this.registry.getDefault();
  }

  getTheme(id: string) {
    return this.registry.get(id);
  }

  reload(emit = true): void {
    this.registry = HolidayRegistry.createDefault();
    this.repository.listCustom().forEach((data) => {
      this.registry.register(new HolidayTheme({ ...data, isCustom: true }));
    });

    const persisted = this.settingsRepository?.get().activeThemeId;
    const local = this.storage.get<string>('theme:active', this.registry.getDefault().id);
    const requested = persisted || local;
    this.activeId = this.registry.get(requested) ? requested : this.registry.getDefault().id;
    if (!this.registry.get(this.activeId)) {
      this.activeId = this.registry.getDefault().id;
    }
    this.apply();
    if (emit) this.emit();
  }

  async setActiveTheme(id: string): Promise<void> {
    if (!this.registry.get(id)) throw new Error('Тема не найдена');
    if (this.settingsRepository) {
      const settings = this.settingsRepository.get();
      await this.settingsRepository.save({ ...settings, activeThemeId: id });
    }
    this.activeId = id;
    this.storage.set('theme:active', id);
    this.apply();
    this.emit();
  }

  async addCustomTheme(data: HolidayThemeData): Promise<void> {
    const theme = new HolidayTheme({ ...data, isCustom: true });
    await this.repository.saveCustom({ ...data, isCustom: true });
    this.registry.register(theme);
    this.emit();
  }

  async removeCustomTheme(id: string): Promise<void> {
    const theme = this.registry.get(id);
    if (!theme?.data.isCustom) return;
    await this.repository.removeCustom(id);
    this.registry.unregister(id);
    if (this.activeId === id) {
      this.activeId = this.registry.getDefault().id;
      this.storage.set('theme:active', this.activeId);
      if (this.settingsRepository) {
        const settings: SiteSettings = this.settingsRepository.get();
        await this.settingsRepository.save({ ...settings, activeThemeId: this.activeId });
      }
      this.apply();
    }
    this.emit();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private apply(): void {
    if (typeof document !== 'undefined') {
      this.activeTheme.apply();
    }
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}
