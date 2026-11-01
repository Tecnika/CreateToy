import { HolidayTheme } from '../domain/HolidayTheme';
import type { HolidayThemeData } from '../domain/types';
import { HolidayRegistry } from '../../themes/definitions';
import type { ThemeRepository } from '../repositories/types';
import type { Storage } from '../storage/Storage';

export class ThemeService {
  private readonly registry: HolidayRegistry;
  private readonly listeners = new Set<() => void>();
  private activeId: string;

  constructor(
    private readonly repository: ThemeRepository,
    private readonly storage: Storage,
  ) {
    this.registry = HolidayRegistry.createDefault();
    this.repository.listCustom().forEach((data) => {
      this.registry.register(new HolidayTheme({ ...data, isCustom: true }));
    });
    this.activeId = this.storage.get<string>('theme:active', this.registry.getDefault().id);
    if (!this.registry.get(this.activeId)) {
      this.activeId = this.registry.getDefault().id;
    }
    this.apply();
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

  setActiveTheme(id: string): void {
    if (!this.registry.get(id)) throw new Error('Тема не найдена');
    this.activeId = id;
    this.storage.set('theme:active', id);
    this.apply();
    this.emit();
  }

  addCustomTheme(data: HolidayThemeData): void {
    const theme = new HolidayTheme({ ...data, isCustom: true });
    this.registry.register(theme);
    this.repository.saveCustom({ ...data, isCustom: true });
    this.emit();
  }

  removeCustomTheme(id: string): void {
    const theme = this.registry.get(id);
    if (!theme?.data.isCustom) return;
    this.registry.unregister(id);
    this.repository.removeCustom(id);
    if (this.activeId === id) {
      this.activeId = this.registry.getDefault().id;
      this.storage.set('theme:active', this.activeId);
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
