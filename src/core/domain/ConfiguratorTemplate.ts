import { Money } from './Money';
import type {
  ConfiguratorField,
  ConfiguratorOption,
  ConfiguratorTemplateData,
  ConfiguratorValue,
  ConfiguratorValues,
} from './types';

export class ConfiguratorTemplate {
  constructor(public readonly data: ConfiguratorTemplateData) {}

  get id(): string {
    return this.data.id;
  }

  get fields(): ConfiguratorField[] {
    return this.data.fields;
  }

  defaultValue(field: ConfiguratorField): ConfiguratorValue {
    if (field.type === 'checkbox') return false;
    if (field.type === 'number') return field.min ?? 1;
    if (field.type === 'select' || field.type === 'color') {
      return field.options?.[0]?.value ?? '';
    }
    return '';
  }

  defaultValues(): ConfiguratorValues {
    return this.fields.reduce<ConfiguratorValues>((values, field) => {
      values[field.id] = this.defaultValue(field);
      return values;
    }, {});
  }

  private selectedOption(field: ConfiguratorField, value: ConfiguratorValue): ConfiguratorOption | undefined {
    return field.options?.find((option) => option.value === String(value));
  }

  calculatePrice(basePrice: number, values: ConfiguratorValues): Money {
    let total = basePrice;
    for (const field of this.fields) {
      const value = values[field.id];
      if (field.type === 'select' || field.type === 'color') {
        total += this.selectedOption(field, value)?.price ?? 0;
      }
      if (field.type === 'checkbox' && value === true) {
        total += field.price ?? 0;
      }
      if (field.type === 'number' && typeof value === 'number') {
        total += (field.price ?? 0) * value;
      }
    }
    return Money.from(total);
  }

  validate(values: ConfiguratorValues): string[] {
    const errors: string[] = [];
    for (const field of this.fields) {
      const value = values[field.id];
      const missing = value === '' || value === undefined || value === null;
      if (field.required) {
        if (field.type === 'checkbox' && value !== true) {
          errors.push(`Подтвердите: ${field.label}`);
        } else if (field.type !== 'checkbox' && missing) {
          errors.push(`Заполните: ${field.label}`);
        } else if (
          (field.type === 'select' || field.type === 'color') &&
          !this.selectedOption(field, value)
        ) {
          errors.push(`Выберите: ${field.label}`);
        }
      }
      if (field.type === 'text' && typeof value === 'string' && field.maxLength && value.length > field.maxLength) {
        errors.push(`${field.label}: не более ${field.maxLength} символов`);
      }
      if (field.type === 'number' && typeof value === 'number') {
        if (field.min !== undefined && value < field.min) errors.push(`${field.label}: минимум ${field.min}`);
        if (field.max !== undefined && value > field.max) errors.push(`${field.label}: максимум ${field.max}`);
      }
    }
    return errors;
  }

  summarize(values: ConfiguratorValues): string {
    return this.fields
      .map((field) => {
        const value = values[field.id];
        if (value === undefined || value === '' || value === false) return null;
        if (field.type === 'select' || field.type === 'color') {
          const option = this.selectedOption(field, value);
          return option ? `${field.label}: ${option.label}` : null;
        }
        if (field.type === 'checkbox') return field.label;
        if (field.type === 'number') return `${field.label}: ${value}`;
        return `${field.label}: ${value}`;
      })
      .filter(Boolean)
      .join(' · ');
  }
}
