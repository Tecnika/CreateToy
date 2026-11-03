import type { Order } from '../domain/Order';
import type {
  ConfiguratorTemplateData,
  HolidayThemeData,
  Product,
  SiteSettings,
  UserProfile,
} from '../domain/types';

export type MaybePromise<T> = T | Promise<T>;

export interface ProductRepository {
  list(): Product[];
  getById(id: string): Product | undefined;
  getBySlug(slug: string): Product | undefined;
  save(product: Product): MaybePromise<void>;
  remove(id: string): MaybePromise<void>;
}

export interface OrderRepository {
  listAll(): Order[];
  listByUser(userId: string): Order[];
  getById(id: string): Order | undefined;
  create(order: Order): MaybePromise<Order>;
  update(order: Order): MaybePromise<Order>;
  cancel?(id: string): MaybePromise<Order>;
}

export interface UserRepository {
  list(): UserProfile[];
  getById(id: string): UserProfile | undefined;
  getByEmail(email: string): UserProfile | undefined;
  getByLogin(login: string): UserProfile | undefined;
  save(user: UserProfile): MaybePromise<void>;
}

export interface SettingsRepository {
  get(): SiteSettings;
  save(settings: SiteSettings): MaybePromise<void>;
}

export interface ThemeRepository {
  listCustom(): HolidayThemeData[];
  saveCustom(theme: HolidayThemeData): MaybePromise<void>;
  removeCustom(id: string): MaybePromise<void>;
}

export interface TemplateRepository {
  listCustom(): ConfiguratorTemplateData[];
  saveCustom(template: ConfiguratorTemplateData): MaybePromise<void>;
  removeCustom(id: string): MaybePromise<void>;
}
