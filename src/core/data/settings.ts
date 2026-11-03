import type { SiteSettings } from '../domain/types';

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'CreateToy',
  tagline: 'Сувениры, напечатанные с любовью',
  contactEmail: 'hello@createtoy.ru',
  contactPhone: '+7 (999) 000-00-00',
  telegram: '@createtoy',
  address: 'Москва, самовывоз по договорённости',
  currency: 'RUB',
  deliveryMethods: ['Самовывоз', 'СДЭК', 'Почта России', 'Курьер по Москве'],
  paymentMethods: ['Перевод по реквизитам', 'СБП', 'Наличные при самовывозе'],
  activeThemeId: 'base',
};
