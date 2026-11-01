export class Storage {
  constructor(private readonly prefix = 'createtoy:') {}

  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(`${this.prefix}${key}`);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(value));
  }

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(`${this.prefix}${key}`);
  }

  has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(`${this.prefix}${key}`) !== null;
  }
}
