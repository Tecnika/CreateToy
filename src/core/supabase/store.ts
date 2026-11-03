import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_SETTINGS } from '../data/settings';
import { Order } from '../domain/Order';
import type {
  ConfiguratorTemplateData,
  HolidayThemeData,
  Product,
  SiteSettings,
  UserProfile,
} from '../domain/types';
import type { OrderRow, ProductRow, ProfileRow, SettingsRow, TemplateRow, ThemeRow } from './database';
import {
  mapOrderRow,
  mapProductRow,
  mapProfileRow,
  mapSettingsRow,
  mapTemplateRow,
  mapThemeRow,
} from './mappers';

function fail(error: unknown, fallback: string): never {
  if (error instanceof Error) throw error;
  if (error && typeof error === 'object' && 'message' in error) {
    throw new Error(String((error as { message: unknown }).message) || fallback);
  }
  throw new Error(fallback);
}

export class SupabaseCache {
  private productItems: Product[] = [];
  private orderItems: Order[] = [];
  private userItems: UserProfile[] = [];
  private settingsValue: SiteSettings = DEFAULT_SETTINGS;
  private themeItems: HolidayThemeData[] = [];
  private templateItems: ConfiguratorTemplateData[] = [];

  constructor(private readonly client: SupabaseClient) {}

  get products(): Product[] {
    return this.productItems;
  }

  get orders(): Order[] {
    return this.orderItems;
  }

  get users(): UserProfile[] {
    return this.userItems;
  }

  get settings(): SiteSettings {
    return this.settingsValue;
  }

  get themes(): HolidayThemeData[] {
    return this.themeItems;
  }

  get templates(): ConfiguratorTemplateData[] {
    return this.templateItems;
  }

  async loadPublic(): Promise<void> {
    const [products, settings, themes, templates] = await Promise.all([
      this.client.from('products').select('*').order('created_at', { ascending: true }).limit(1000),
      this.client.from('settings').select('*').limit(1).maybeSingle(),
      this.client.from('holiday_themes').select('*').order('created_at', { ascending: true }).limit(500),
      this.client.from('configurator_templates').select('*').order('created_at', { ascending: true }).limit(500),
    ]);

    if (products.error) fail(products.error, 'Не удалось загрузить каталог.');
    if (settings.error) {
      console.warn('Supabase settings:', settings.error.message);
    } else {
      this.settingsValue = mapSettingsRow((settings.data ?? null) as SettingsRow | null);
    }
    if (themes.error) fail(themes.error, 'Не удалось загрузить темы.');
    if (templates.error) fail(templates.error, 'Не удалось загрузить шаблоны.');

    this.productItems = ((products.data ?? []) as ProductRow[]).map(mapProductRow);
    this.themeItems = ((themes.data ?? []) as ThemeRow[]).map(mapThemeRow);
    this.templateItems = ((templates.data ?? []) as TemplateRow[]).map(mapTemplateRow);
  }

  async loadSession(): Promise<void> {
    const [profiles, orders] = await Promise.all([
      this.client.from('profiles').select('*').order('created_at', { ascending: true }).limit(1000),
      this.client.from('orders').select('*').order('created_at', { ascending: false }).limit(1000),
    ]);

    if (profiles.error) fail(profiles.error, 'Не удалось загрузить пользователей.');
    if (orders.error) fail(orders.error, 'Не удалось загрузить заказы.');

    this.userItems = ((profiles.data ?? []) as ProfileRow[]).map(mapProfileRow);
    this.orderItems = ((orders.data ?? []) as OrderRow[]).map(mapOrderRow);
  }

  clearSession(): void {
    this.userItems = [];
    this.orderItems = [];
  }

  setSettings(settings: SiteSettings): void {
    this.settingsValue = settings;
  }

  upsertProduct(product: Product): void {
    const index = this.productItems.findIndex((item) => item.id === product.id);
    if (index >= 0) this.productItems = this.productItems.map((item) => (item.id === product.id ? product : item));
    else this.productItems = [...this.productItems, product];
  }

  removeProduct(id: string): void {
    this.productItems = this.productItems.filter((item) => item.id !== id);
  }

  upsertOrder(order: Order): void {
    const exists = this.orderItems.some((item) => item.data.id === order.data.id);
    const next = exists
      ? this.orderItems.map((item) => (item.data.id === order.data.id ? order : item))
      : [order, ...this.orderItems];
    this.orderItems = next.sort((a, b) => b.data.createdAt.localeCompare(a.data.createdAt));
  }

  upsertUser(user: UserProfile): void {
    const index = this.userItems.findIndex((item) => item.uid === user.uid);
    if (index >= 0) this.userItems = this.userItems.map((item) => (item.uid === user.uid ? user : item));
    else this.userItems = [...this.userItems, user];
  }

  upsertTheme(theme: HolidayThemeData): void {
    const index = this.themeItems.findIndex((item) => item.id === theme.id);
    if (index >= 0) this.themeItems = this.themeItems.map((item) => (item.id === theme.id ? theme : item));
    else this.themeItems = [...this.themeItems, theme];
  }

  removeTheme(id: string): void {
    this.themeItems = this.themeItems.filter((item) => item.id !== id);
  }

  upsertTemplate(template: ConfiguratorTemplateData): void {
    const index = this.templateItems.findIndex((item) => item.id === template.id);
    if (index >= 0) {
      this.templateItems = this.templateItems.map((item) => (item.id === template.id ? template : item));
    } else {
      this.templateItems = [...this.templateItems, template];
    }
  }

  removeTemplate(id: string): void {
    this.templateItems = this.templateItems.filter((item) => item.id !== id);
  }
}
