import type { HolidayThemeData, ThemePalette } from './types';

const CSS_VARIABLE_MAP: Record<keyof ThemePalette, string> = {
  bg: '--bg',
  surface: '--surface',
  surface2: '--surface-2',
  ink: '--ink',
  muted: '--muted',
  accent: '--accent',
  accent2: '--accent-2',
  accentSoft: '--accent-soft',
  line: '--line',
  heroGlow: '--hero-glow',
};

export class HolidayTheme {
  constructor(public readonly data: HolidayThemeData) {}

  get id(): string {
    return this.data.id;
  }

  get name(): string {
    return this.data.name;
  }

  get effect(): HolidayThemeData['effect'] {
    return this.data.effect;
  }

  get cssVariables(): Record<string, string> {
    return Object.entries(this.data.palette).reduce<Record<string, string>>(
      (variables, [key, value]) => {
        variables[CSS_VARIABLE_MAP[key as keyof ThemePalette]] = value;
        return variables;
      },
      {},
    );
  }

  apply(root: HTMLElement = document.documentElement): void {
    Object.entries(this.cssVariables).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });
    root.dataset.theme = this.id;
    root.dataset.effect = this.effect;
  }

  withData(patch: Partial<HolidayThemeData>): HolidayTheme {
    return new HolidayTheme({ ...this.data, ...patch });
  }
}
