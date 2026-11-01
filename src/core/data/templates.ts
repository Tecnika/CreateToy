import { ConfiguratorTemplate } from '../domain/ConfiguratorTemplate';

export const TEMPLATES: ConfiguratorTemplate[] = [
  new ConfiguratorTemplate({
    id: 'figure',
    name: 'Фигурка с характером',
    description: 'Цвет, размер и подставка — базовая настройка фигурки или декора.',
    fields: [
      {
        id: 'color',
        type: 'color',
        label: 'Основной цвет',
        required: true,
        options: [
          { value: 'cream', label: 'Тёплый крем', swatch: '#f4f1e8' },
          { value: 'forest', label: 'Лесной', swatch: '#2f5d50' },
          { value: 'terracotta', label: 'Терракота', swatch: '#c45d3a' },
          { value: 'gold', label: 'Золото', swatch: '#c9a227' },
          { value: 'plum', label: 'Слива', swatch: '#3b2340' },
        ],
      },
      {
        id: 'size',
        type: 'select',
        label: 'Размер',
        required: true,
        options: [
          { value: 's', label: 'S — компактный', price: 0 },
          { value: 'm', label: 'M — стандартный', price: 250 },
          { value: 'l', label: 'L — заметный', price: 450 },
        ],
      },
      {
        id: 'base',
        type: 'checkbox',
        label: 'Добавить подставку с гравировкой',
        price: 190,
      },
      {
        id: 'packaging',
        type: 'checkbox',
        label: 'Подарочная упаковка',
        price: 250,
      },
    ],
  }),
  new ConfiguratorTemplate({
    id: 'keychain',
    name: 'Брелок на память',
    description: 'Форма, надпись и крепление. Хорошо подходит для небольших подарков.',
    fields: [
      {
        id: 'shape',
        type: 'select',
        label: 'Форма',
        required: true,
        options: [
          { value: 'round', label: 'Круг', price: 0 },
          { value: 'heart', label: 'Сердце', price: 50 },
          { value: 'star', label: 'Звезда', price: 50 },
        ],
      },
      {
        id: 'text',
        type: 'text',
        label: 'Надпись',
        help: 'До 12 символов. Например, имя или дата.',
        required: true,
        maxLength: 12,
        placeholder: 'Например, Аня',
      },
      {
        id: 'color',
        type: 'color',
        label: 'Цвет',
        required: true,
        options: [
          { value: 'ink', label: 'Графит', swatch: '#2b2b2b' },
          { value: 'accent', label: 'Акцент', swatch: '#d94b67' },
          { value: 'gold', label: 'Золото', swatch: '#c9a227' },
          { value: 'mint', label: 'Мята', swatch: '#7aa7a1' },
        ],
      },
      {
        id: 'ring',
        type: 'select',
        label: 'Крепление',
        options: [
          { value: 'none', label: 'Без крепления', price: 0 },
          { value: 'silver', label: 'Серебристое кольцо', price: 100 },
          { value: 'gold', label: 'Золотое кольцо', price: 180 },
        ],
      },
      {
        id: 'packaging',
        type: 'checkbox',
        label: 'Крафт-упаковка',
        price: 150,
      },
    ],
  }),
  new ConfiguratorTemplate({
    id: 'personalized',
    name: 'Именной подарок',
    description: 'Текст, шрифт и цвет — для подарка, который узнают с первого взгляда.',
    fields: [
      {
        id: 'text',
        type: 'text',
        label: 'Имя или короткая фраза',
        help: 'До 24 символов.',
        required: true,
        maxLength: 24,
        placeholder: 'Например, Маша',
      },
      {
        id: 'font',
        type: 'select',
        label: 'Стиль надписи',
        options: [
          { value: 'sans', label: 'Современный', price: 0 },
          { value: 'display', label: 'Выразительный', price: 100 },
          { value: 'script', label: 'Рукописный', price: 150 },
        ],
      },
      {
        id: 'color',
        type: 'color',
        label: 'Цвет',
        required: true,
        options: [
          { value: 'forest', label: 'Лесной', swatch: '#2f5d50' },
          { value: 'terracotta', label: 'Терракота', swatch: '#c45d3a' },
          { value: 'gold', label: 'Золото', swatch: '#c9a227' },
          { value: 'plum', label: 'Слива', swatch: '#3b2340' },
        ],
      },
      {
        id: 'size',
        type: 'select',
        label: 'Размер',
        options: [
          { value: 's', label: 'S — компактный', price: 0 },
          { value: 'm', label: 'M — стандартный', price: 200 },
          { value: 'l', label: 'L — большой', price: 400 },
        ],
      },
      {
        id: 'packaging',
        type: 'checkbox',
        label: 'Подарочная упаковка',
        price: 250,
      },
    ],
  }),
  new ConfiguratorTemplate({
    id: 'gift-set',
    name: 'Подарочный набор',
    description: 'Соберите бокс: цвет, открытка и лента.',
    fields: [
      {
        id: 'boxColor',
        type: 'color',
        label: 'Цвет бокса',
        required: true,
        options: [
          { value: 'kraft', label: 'Крафт', swatch: '#c9a27a' },
          { value: 'forest', label: 'Лесной', swatch: '#2f5d50' },
          { value: 'berry', label: 'Ягодный', swatch: '#9e2a2b' },
          { value: 'night', label: 'Ночной', swatch: '#2b2b2b' },
        ],
      },
      {
        id: 'cardText',
        type: 'textarea',
        label: 'Текст открытки',
        help: 'До 120 символов. Напишем от руки или напечатаем.',
        maxLength: 120,
        placeholder: 'Самые тёплые слова...',
      },
      {
        id: 'includeCard',
        type: 'checkbox',
        label: 'Добавить открытку',
        price: 120,
      },
      {
        id: 'packaging',
        type: 'checkbox',
        label: 'Лента и подарочная упаковка',
        price: 150,
      },
    ],
  }),
];

export const TEMPLATE_MAP = new Map(TEMPLATES.map((template) => [template.id, template]));

export function getTemplateById(id: string): ConfiguratorTemplate | undefined {
  return TEMPLATE_MAP.get(id);
}
