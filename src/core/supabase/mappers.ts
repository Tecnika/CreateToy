import { DEFAULT_SETTINGS } from '../data/settings';
import { Order } from '../domain/Order';
import type {
  Address,
  ConfiguratorTemplateData,
  HolidayThemeData,
  OrderData,
  OrderHistoryEntry,
  OrderItem,
  Product,
  Role,
  SiteSettings,
  UserProfile,
} from '../domain/types';
import type {
  OrderRow,
  ProductRow,
  ProfileRow,
  SettingsRow,
  TemplateRow,
  ThemeRow,
} from './database';

export function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    price: row.price,
    category: row.category,
    holidayIds: row.holiday_ids ?? [],
    templateId: row.template_id,
    art: row.art,
    badge: row.badge ?? undefined,
    productionDays: row.production_days,
    materials: row.materials,
    size: row.size,
    featured: row.featured,
    archivedAt: row.archived_at ?? undefined,
    inStock: row.in_stock ?? true,
    imageUrl: row.image_url ?? undefined,
  };
}

export function toProductRow(product: Product) {
  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle,
    description: product.description,
    price: product.price,
    category: product.category,
    holiday_ids: product.holidayIds,
    template_id: product.templateId,
    art: product.art,
    badge: product.badge ?? null,
    production_days: product.productionDays,
    materials: product.materials,
    size: product.size,
    featured: product.featured ?? false,
    archived_at: product.archivedAt ?? null,
    in_stock: product.inStock ?? true,
    image_url: product.imageUrl ?? null,
  };
}

export function mapProfileRow(row: ProfileRow): UserProfile {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    phone: row.phone ?? undefined,
    addresses: Array.isArray(row.addresses) ? (row.addresses as Address[]) : [],
    createdAt: row.created_at,
  };
}

export function toProfileInsert(user: UserProfile) {
  return {
    id: user.uid,
    email: user.email,
    display_name: user.displayName,
    role: user.role,
    phone: user.phone ?? null,
    addresses: user.addresses,
  };
}

export function toProfilePatch(user: UserProfile) {
  return {
    display_name: user.displayName,
    phone: user.phone ?? null,
    addresses: user.addresses,
  };
}

export function mapOrderRow(row: OrderRow): Order {
  const data: OrderData = {
    id: row.id,
    number: row.number,
    userId: row.user_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    address: row.address ?? null,
    comment: row.comment,
    deliveryMethod: row.delivery_method ?? undefined,
    paymentMethod: row.payment_method ?? undefined,
    items: (row.items ?? []) as OrderItem[],
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    total: row.total,
    status: row.status,
    trackingNumber: row.tracking_number ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    history: (row.history ?? []) as OrderHistoryEntry[],
  };
  return Order.fromJSON(data);
}

export function toOrderInsert(order: Order) {
  const data = order.data;
  return {
    user_id: data.userId,
    customer_name: data.customerName,
    customer_email: data.customerEmail,
    customer_phone: data.customerPhone,
    address: data.address,
    comment: data.comment,
    delivery_method: data.deliveryMethod ?? null,
    payment_method: data.paymentMethod ?? null,
    items: data.items,
    status: 'new',
    tracking_number: data.trackingNumber ?? null,
    created_at: data.createdAt,
    history: data.history,
  };
}

export function toOrderUpdate(order: Order) {
  const data = order.data;
  return {
    status: data.status,
    tracking_number: data.trackingNumber ?? null,
    shipping_cost: data.shippingCost,
    history: data.history,
  };
}

export function mapSettingsRow(row: SettingsRow | null): SiteSettings {
  if (!row?.data) return DEFAULT_SETTINGS;
  const data = row.data;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    currency: 'RUB',
    deliveryMethods: Array.isArray(data.deliveryMethods)
      ? data.deliveryMethods
      : DEFAULT_SETTINGS.deliveryMethods,
    paymentMethods: Array.isArray(data.paymentMethods)
      ? data.paymentMethods
      : DEFAULT_SETTINGS.paymentMethods,
  };
}

export function toSettingsRow(settings: SiteSettings) {
  return { id: true, data: settings };
}

export function mapThemeRow(row: ThemeRow): HolidayThemeData {
  return { ...row.data, id: row.id, isCustom: true };
}

export function toThemeRow(theme: HolidayThemeData) {
  return { id: theme.id, data: { ...theme, isCustom: true } };
}

export function mapTemplateRow(row: TemplateRow): ConfiguratorTemplateData {
  return { ...row.data, id: row.id, isCustom: true };
}

export function toTemplateRow(template: ConfiguratorTemplateData) {
  return { id: template.id, data: { ...template, isCustom: true } };
}

export function normalizeRole(value: string | null | undefined): Role {
  return value === 'admin' || value === 'manager' ? value : 'buyer';
}
