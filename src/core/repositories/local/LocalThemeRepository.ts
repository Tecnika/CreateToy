import type { HolidayThemeData } from '../../domain/types';
import type { Storage } from '../../storage/Storage';
import type { ThemeRepository } from '../types';

export class LocalThemeRepository implements ThemeRepository {
  private readonly key = 'themes:custom';

  constructor(private readonly storage: Storage) {}

  listCustom(): HolidayThemeData[] {
    return this.storage.get<HolidayThemeData[]>(this.key, []);
  }

  saveCustom(theme: HolidayThemeData): void {
    const themes = this.listCustom();
    const index = themes.findIndex((item) => item.id === theme.id);
    if (index >= 0) themes[index] = theme;
    else themes.push(theme);
    this.storage.set(this.key, themes);
  }

  removeCustom(id: string): void {
    this.storage.set(
      this.key,
      this.listCustom().filter((theme) => theme.id !== id),
    );
  }
}
