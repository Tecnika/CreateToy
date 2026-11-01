import { describe, expect, it } from 'vitest';
import { ConfiguratorTemplate } from './ConfiguratorTemplate';
import type { ConfiguratorTemplateData } from './types';

const template = new ConfiguratorTemplate({
  id: 'test',
  name: 'Проверочный шаблон',
  description: '',
  fields: [
    {
      id: 'color',
      type: 'color',
      label: 'Цвет',
      required: true,
      options: [
        { value: 'cream', label: 'Крем', price: 0, swatch: '#f4f1e8' },
        { value: 'forest', label: 'Лесной', price: 100, swatch: '#2f5d50' },
      ],
    },
    { id: 'text', type: 'text', label: 'Надпись', required: true, maxLength: 5 },
    { id: 'packaging', type: 'checkbox', label: 'Упаковка', price: 250 },
    { id: 'quantity', type: 'number', label: 'Количество', price: 50, min: 1, max: 3 },
  ],
} satisfies ConfiguratorTemplateData);

describe('ConfiguratorTemplate', () => {
  it('builds default values from field types', () => {
    expect(template.defaultValues()).toEqual({
      color: 'cream',
      text: '',
      packaging: false,
      quantity: 1,
    });
  });

  it('adds option, checkbox and number surcharges', () => {
    const price = template.calculatePrice(1000, {
      color: 'forest',
      text: 'Маша',
      packaging: true,
      quantity: 2,
    });
    expect(price.amount).toBe(1450);
  });

  it('validates required fields without duplicate messages', () => {
    const errors = template.validate({});
    expect(errors).toHaveLength(2);
    expect(errors.every((error) => error.startsWith('Заполните:'))).toBe(true);
  });

  it('validates max length and numeric bounds', () => {
    const errors = template.validate({
      color: 'cream',
      text: 'Слишком длинная надпись',
      quantity: 5,
    });
    expect(errors.some((error) => error.includes('не более 5'))).toBe(true);
    expect(errors.some((error) => error.includes('максимум 3'))).toBe(true);
  });

  it('rejects an unknown required option', () => {
    const errors = template.validate({ color: 'unknown', text: 'Маша' });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toContain('Выберите: Цвет');
  });

  it('summarizes selected values and skips empty ones', () => {
    const summary = template.summarize({
      color: 'forest',
      text: 'Маша',
      packaging: true,
      quantity: 2,
    });
    expect(summary).toContain('Цвет: Лесной');
    expect(summary).toContain('Надпись: Маша');
    expect(summary).toContain('Упаковка');
    expect(summary).toContain('Количество: 2');
    expect(template.summarize({ color: 'cream', text: '', packaging: false, quantity: 1 })).toBe(
      'Цвет: Крем · Количество: 1',
    );
  });
});
