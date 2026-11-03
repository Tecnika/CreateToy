import { MockAuthAdapter } from './auth/MockAuthAdapter';
import { SupabaseAuthAdapter } from './auth/SupabaseAuthAdapter';
import { LocalOrderRepository } from './repositories/local/LocalOrderRepository';
import { LocalProductRepository } from './repositories/local/LocalProductRepository';
import { LocalSettingsRepository } from './repositories/local/LocalSettingsRepository';
import { LocalTemplateRepository } from './repositories/local/LocalTemplateRepository';
import { LocalThemeRepository } from './repositories/local/LocalThemeRepository';
import { LocalUserRepository } from './repositories/local/LocalUserRepository';
import { SupabaseOrderRepository } from './repositories/supabase/SupabaseOrderRepository';
import { SupabaseProductRepository } from './repositories/supabase/SupabaseProductRepository';
import { SupabaseSettingsRepository } from './repositories/supabase/SupabaseSettingsRepository';
import { SupabaseTemplateRepository } from './repositories/supabase/SupabaseTemplateRepository';
import { SupabaseThemeRepository } from './repositories/supabase/SupabaseThemeRepository';
import { SupabaseUserRepository } from './repositories/supabase/SupabaseUserRepository';
import { AuthService } from './services/AuthService';
import { CartService } from './services/CartService';
import { CatalogService } from './services/CatalogService';
import { ConfiguratorService } from './services/ConfiguratorService';
import { OrderService } from './services/OrderService';
import { ProductImageService } from './services/ProductImageService';
import { SettingsService } from './services/SettingsService';
import { ThemeService } from './services/ThemeService';
import { UserService } from './services/UserService';
import { Storage } from './storage/Storage';
import {
  createSupabaseClient,
  readSupabaseConfig,
  resolveDataMode,
  type DataMode,
  type SupabaseConfig,
} from './supabase/client';
import { SupabaseCache } from './supabase/store';

function createDemoServices(configError: Error | null = null) {
  const storage = new Storage();
  const users = new LocalUserRepository(storage);
  const products = new LocalProductRepository(storage);
  const orders = new LocalOrderRepository(storage);
  const settings = new LocalSettingsRepository(storage);
  const themes = new LocalThemeRepository(storage);
  const templates = new LocalTemplateRepository(storage);
  const authAdapter = new MockAuthAdapter(users, storage);
  const themeService = new ThemeService(themes, storage, settings);

  return {
    mode: 'demo' as DataMode,
    storage,
    auth: new AuthService(authAdapter),
    users: new UserService(users),
    catalog: new CatalogService(products),
    cart: new CartService(storage),
    orders: new OrderService(orders),
    settings: new SettingsService(settings),
    themes: themeService,
    configurator: new ConfiguratorService(templates),
    productImages: new ProductImageService(),
    initialize: async () => {
      if (configError) throw configError;
      await authAdapter.initialize();
      themeService.reload(false);
    },
  };
}

function createSupabaseServices(config: SupabaseConfig) {
  const client = createSupabaseClient(config);
  const cache = new SupabaseCache(client);
  const users = new SupabaseUserRepository(client, cache);
  const products = new SupabaseProductRepository(client, cache);
  const orders = new SupabaseOrderRepository(client, cache);
  const settings = new SupabaseSettingsRepository(client, cache);
  const themes = new SupabaseThemeRepository(client, cache);
  const templates = new SupabaseTemplateRepository(client, cache);
  const authAdapter = new SupabaseAuthAdapter(client, users, cache);
  const themeService = new ThemeService(themes, new Storage(), settings);

  let initialized: Promise<void> | null = null;
  const initialize = () => {
    if (!initialized) {
      initialized = (async () => {
        await authAdapter.initialize();
        await cache.loadPublic();
        themeService.reload(false);
      })();
    }
    return initialized;
  };

  return {
    mode: 'supabase' as DataMode,
    storage: new Storage(),
    auth: new AuthService(authAdapter),
    users: new UserService(users),
    catalog: new CatalogService(products),
    cart: new CartService(new Storage()),
    orders: new OrderService(orders),
    settings: new SettingsService(settings),
    themes: themeService,
    configurator: new ConfiguratorService(templates),
    productImages: new ProductImageService(client),
    initialize,
  };
}

const requestedMode = resolveDataMode();
let supabaseConfig: SupabaseConfig | null = null;
let configError: Error | null = null;

if (requestedMode === 'supabase') {
  try {
    supabaseConfig = readSupabaseConfig();
    if (!supabaseConfig) {
      configError = new Error(
        'Не заданы VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY. Проверьте переменные сборки.',
      );
    }
  } catch (error) {
    configError = error instanceof Error ? error : new Error('Некорректная конфигурация Supabase.');
  }
}

export const services =
  requestedMode === 'supabase' && supabaseConfig
    ? createSupabaseServices(supabaseConfig)
    : createDemoServices(configError);

export type Services = ReturnType<typeof createDemoServices>;

export function createServices(): Services {
  return services;
}
