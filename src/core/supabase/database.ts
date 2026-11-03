import type {
  Address,
  ConfiguratorTemplateData,
  HolidayThemeData,
  OrderHistoryEntry,
  OrderItem,
  OrderStatus,
  Product,
  ProductArt,
  Role,
  SiteSettings,
} from '../domain/types';

export interface ProfileRow {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  phone: string | null;
  addresses: Address[] | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  category: string;
  holiday_ids: string[] | null;
  template_id: string;
  art: ProductArt;
  badge: string | null;
  production_days: number;
  materials: string;
  size: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderRow {
  id: string;
  number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: Address | null;
  comment: string;
  delivery_method: string | null;
  payment_method: string | null;
  items: OrderItem[] | null;
  subtotal: number;
  shipping_cost: number;
  total: number;
  status: OrderStatus;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
  history: OrderHistoryEntry[] | null;
}

export interface SettingsRow {
  id: boolean;
  data: Partial<SiteSettings> | null;
}

export interface ThemeRow {
  id: string;
  data: HolidayThemeData;
}

export interface TemplateRow {
  id: string;
  data: ConfiguratorTemplateData;
}

export type ProductRecord = Product;
