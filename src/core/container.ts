import { MockAuthAdapter } from './auth/MockAuthAdapter';
import { LocalOrderRepository } from './repositories/local/LocalOrderRepository';
import { LocalProductRepository } from './repositories/local/LocalProductRepository';
import { LocalSettingsRepository } from './repositories/local/LocalSettingsRepository';
import { LocalTemplateRepository } from './repositories/local/LocalTemplateRepository';
import { LocalThemeRepository } from './repositories/local/LocalThemeRepository';
import { LocalUserRepository } from './repositories/local/LocalUserRepository';
import { AuthService } from './services/AuthService';
import { CartService } from './services/CartService';
import { CatalogService } from './services/CatalogService';
import { ConfiguratorService } from './services/ConfiguratorService';
import { OrderService } from './services/OrderService';
import { SettingsService } from './services/SettingsService';
import { ThemeService } from './services/ThemeService';
import { UserService } from './services/UserService';
import { Storage } from './storage/Storage';

export function createServices() {
  const storage = new Storage();
  const users = new LocalUserRepository(storage);
  const products = new LocalProductRepository(storage);
  const orders = new LocalOrderRepository(storage);
  const settings = new LocalSettingsRepository(storage);
  const themes = new LocalThemeRepository(storage);
  const templates = new LocalTemplateRepository(storage);
  const authAdapter = new MockAuthAdapter(users, storage);

  return {
    storage,
    auth: new AuthService(authAdapter),
    users: new UserService(users),
    catalog: new CatalogService(products),
    cart: new CartService(storage),
    orders: new OrderService(orders),
    settings: new SettingsService(settings),
    themes: new ThemeService(themes, storage),
    configurator: new ConfiguratorService(templates),
  };
}

export type Services = ReturnType<typeof createServices>;

export const services = createServices();
