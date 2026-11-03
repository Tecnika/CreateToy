export type Role = 'buyer' | 'manager' | 'admin';

export type OrderStatus =
  | 'new'
  | 'contacted'
  | 'awaiting_payment'
  | 'paid'
  | 'in_production'
  | 'ready'
  | 'shipped'
  | 'completed'
  | 'cancelled';

export type ArtKind =
  | 'snowman'
  | 'pumpkin'
  | 'heart'
  | 'rocket'
  | 'bouquet'
  | 'egg'
  | 'organizer'
  | 'badge'
  | 'leaf'
  | 'vase'
  | 'box'
  | 'keychain'
  | 'cat'
  | 'gift'
  | 'tree'
  | 'bunny';

export type ConfiguratorFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'color'
  | 'number'
  | 'checkbox';

export type ConfiguratorValue = string | number | boolean;
export type ConfiguratorValues = Record<string, ConfiguratorValue>;

export interface ProductArt {
  kind: ArtKind;
  colors: [string, string, string];
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  category: string;
  holidayIds: string[];
  templateId: string;
  art: ProductArt;
  badge?: string;
  productionDays: number;
  materials: string;
  size: string;
  featured?: boolean;
}

export interface ConfiguratorOption {
  value: string;
  label: string;
  price?: number;
  swatch?: string;
}

export interface ConfiguratorField {
  id: string;
  type: ConfiguratorFieldType;
  label: string;
  help?: string;
  required?: boolean;
  options?: ConfiguratorOption[];
  price?: number;
  min?: number;
  max?: number;
  maxLength?: number;
  placeholder?: string;
}

export interface ConfiguratorTemplateData {
  id: string;
  name: string;
  description: string;
  fields: ConfiguratorField[];
  isCustom?: boolean;
}

export interface CartLineData {
  id: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  art: ProductArt;
  unitPrice: number;
  quantity: number;
  configuration: ConfiguratorValues;
  configurationLabel: string;
}

export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  city: string;
  street: string;
  house: string;
  apartment?: string;
  postalCode: string;
  isDefault?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  phone?: string;
  addresses: Address[];
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
  configurationLabel: string;
  art: ProductArt;
}

export interface OrderHistoryEntry {
  status: OrderStatus;
  at: string;
  by: string;
  note?: string;
}

export interface OrderData {
  id: string;
  number: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: Address | null;
  comment: string;
  deliveryMethod?: string;
  paymentMethod?: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  history: OrderHistoryEntry[];
}

export interface ThemePalette {
  bg: string;
  surface: string;
  surface2: string;
  ink: string;
  muted: string;
  accent: string;
  accent2: string;
  accentSoft: string;
  line: string;
  heroGlow: string;
}

export type EffectId =
  | 'sparkles'
  | 'snow'
  | 'pumpkins'
  | 'notebook'
  | 'hearts'
  | 'petals'
  | 'stars'
  | 'ribbon'
  | 'leaves'
  | 'eggs'
  | 'scan'
  | 'fireworks';

export interface HolidayThemeData {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  effect: EffectId;
  palette: ThemePalette;
  heroTitle: string;
  heroAccent: string;
  heroNote: string;
  featuredProductIds: string[];
  dateLabel: string;
  isCustom?: boolean;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  telegram: string;
  address: string;
  currency: 'RUB';
  deliveryMethods: string[];
  paymentMethods: string[];
  activeThemeId?: string;
}

export interface DemoCredentials {
  email: string;
  password: string;
  role: Role;
  displayName: string;
}
