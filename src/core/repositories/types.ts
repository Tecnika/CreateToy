import type { Order } from '../domain/Order';
import type {
  ConfiguratorTemplateData,
  HolidayThemeData,
  Product,
  SiteSettings,
  UserProfile,
} from '../domain/types';

export interface ProductRepository {
  list(): Product[];
  getById(id: string): Product | undefined;
  getBySlug(slug: string): Product | undefined;
  save(product: Product): void;
  remove(id: string): void;
}

export interface OrderRepository {
  listAll(): Order[];
  listByUser(userId: string): Order[];
  getById(id: string): Order | undefined;
  save(order: Order): void;
}

export interface UserRepository {
  list(): UserProfile[];
  getById(id: string): UserProfile | undefined;
  getByEmail(email: string): UserProfile | undefined;
  getByLogin(login: string): UserProfile | undefined;
  save(user: UserProfile): void;
}

export interface SettingsRepository {
  get(): SiteSettings;
  save(settings: SiteSettings): void;
}

export interface ThemeRepository {
  listCustom(): HolidayThemeData[];
  saveCustom(theme: HolidayThemeData): void;
  removeCustom(id: string): void;
}

export interface TemplateRepository {
  listCustom(): ConfiguratorTemplateData[];
  saveCustom(template: ConfiguratorTemplateData): void;
  removeCustom(id: string): void;
}
