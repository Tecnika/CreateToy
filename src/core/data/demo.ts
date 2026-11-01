import type { Address, DemoCredentials, OrderData, UserProfile } from '../domain/types';
import { getProductById } from './products';

export const DEMO_PASSWORD = 'demo1234';

export const DEMO_USERS: UserProfile[] = [
  {
    uid: 'buyer-1',
    email: 'buyer@createtoy.local',
    displayName: 'Анна',
    role: 'buyer',
    phone: '+7 (999) 111-22-33',
    addresses: [
      {
        id: 'address-1',
        label: 'Дом',
        recipient: 'Анна Смирнова',
        phone: '+7 (999) 111-22-33',
        city: 'Москва',
        street: 'Лесная',
        house: '12',
        apartment: '45',
        postalCode: '125047',
        isDefault: true,
      },
    ],
    createdAt: '2026-09-12T10:00:00.000Z',
  },
  {
    uid: 'manager-1',
    email: 'manager@createtoy.local',
    displayName: 'Мария',
    role: 'manager',
    phone: '+7 (999) 222-33-44',
    addresses: [],
    createdAt: '2026-09-01T10:00:00.000Z',
  },
  {
    uid: 'admin-1',
    email: 'admin@createtoy.local',
    displayName: 'Administrator',
    role: 'admin',
    phone: '+7 (999) 333-44-55',
    addresses: [],
    createdAt: '2026-09-01T09:00:00.000Z',
  },
];

export const DEMO_CREDENTIALS: DemoCredentials[] = [
  { email: 'buyer@createtoy.local', password: DEMO_PASSWORD, role: 'buyer', displayName: 'Анна' },
  { email: 'manager@createtoy.local', password: DEMO_PASSWORD, role: 'manager', displayName: 'Мария' },
  { email: 'admin@createtoy.local', password: DEMO_PASSWORD, role: 'admin', displayName: 'Administrator' },
];

const demoAddress: Address = {
  id: 'address-1',
  label: 'Дом',
  recipient: 'Анна Смирнова',
  phone: '+7 (999) 111-22-33',
  city: 'Москва',
  street: 'Лесная',
  house: '12',
  apartment: '45',
  postalCode: '125047',
  isDefault: true,
};

function item(productId: string, quantity: number, configurationLabel: string) {
  const product = getProductById(productId);
  if (!product) throw new Error(`Demo product not found: ${productId}`);
  return {
    productId,
    title: product.title,
    quantity,
    unitPrice: product.price,
    total: product.price * quantity,
    configurationLabel,
    art: product.art,
  };
}

export const DEMO_ORDERS: OrderData[] = [
  {
    id: 'order-1',
    number: 'CT-2026-0001',
    userId: 'buyer-1',
    customerName: 'Анна Смирнова',
    customerEmail: 'buyer@createtoy.local',
    customerPhone: '+7 (999) 111-22-33',
    address: demoAddress,
    comment: 'Подарок для мамы, упаковать отдельно, пожалуйста.',
    items: [
      item('snow-family', 1, 'Размер: M · Цвет: Лесной · Подарочная упаковка'),
      item('gift-box', 1, 'Цвет бокса: Крафт · Открытка: С любовью'),
    ],
    subtotal: 3980,
    shippingCost: 390,
    total: 4370,
    status: 'in_production',
    createdAt: '2026-10-20T12:30:00.000Z',
    updatedAt: '2026-10-24T09:15:00.000Z',
    history: [
      { status: 'new', at: '2026-10-20T12:30:00.000Z', by: 'buyer-1', note: 'Заказ создан' },
      { status: 'contacted', at: '2026-10-21T10:00:00.000Z', by: 'manager-1' },
      { status: 'awaiting_payment', at: '2026-10-21T10:05:00.000Z', by: 'manager-1' },
      { status: 'paid', at: '2026-10-21T15:20:00.000Z', by: 'manager-1', note: 'Оплата подтверждена' },
      { status: 'in_production', at: '2026-10-24T09:15:00.000Z', by: 'manager-1' },
    ],
  },
  {
    id: 'order-2',
    number: 'CT-2026-0002',
    userId: 'buyer-1',
    customerName: 'Анна Смирнова',
    customerEmail: 'buyer@createtoy.local',
    customerPhone: '+7 (999) 111-22-33',
    address: demoAddress,
    comment: 'Нужно к 14 февраля.',
    items: [item('heart-keychain', 2, 'Форма: Сердце · Надпись: Аня · Цвет: Акцент')],
    subtotal: 1380,
    shippingCost: 0,
    total: 1380,
    status: 'new',
    createdAt: '2026-10-30T18:10:00.000Z',
    updatedAt: '2026-10-30T18:10:00.000Z',
    history: [{ status: 'new', at: '2026-10-30T18:10:00.000Z', by: 'buyer-1', note: 'Заказ создан' }],
  },
  {
    id: 'order-3',
    number: 'CT-2026-0003',
    userId: 'buyer-1',
    customerName: 'Анна Смирнова',
    customerEmail: 'buyer@createtoy.local',
    customerPhone: '+7 (999) 111-22-33',
    address: demoAddress,
    comment: '',
    items: [item('spring-wreath', 1, 'Размер: M · Цвет: Лесной')],
    subtotal: 1590,
    shippingCost: 390,
    total: 1980,
    status: 'completed',
    trackingNumber: 'CDEK-123456789',
    createdAt: '2026-04-10T10:00:00.000Z',
    updatedAt: '2026-04-18T14:00:00.000Z',
    history: [
      { status: 'new', at: '2026-04-10T10:00:00.000Z', by: 'buyer-1' },
      { status: 'contacted', at: '2026-04-10T11:00:00.000Z', by: 'manager-1' },
      { status: 'awaiting_payment', at: '2026-04-10T11:05:00.000Z', by: 'manager-1' },
      { status: 'paid', at: '2026-04-10T12:00:00.000Z', by: 'manager-1' },
      { status: 'in_production', at: '2026-04-11T09:00:00.000Z', by: 'manager-1' },
      { status: 'ready', at: '2026-04-14T16:00:00.000Z', by: 'manager-1' },
      { status: 'shipped', at: '2026-04-15T10:00:00.000Z', by: 'manager-1', note: 'CDEK-123456789' },
      { status: 'completed', at: '2026-04-18T14:00:00.000Z', by: 'manager-1' },
    ],
  },
];
