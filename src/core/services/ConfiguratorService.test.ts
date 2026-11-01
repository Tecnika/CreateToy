import { describe, expect, it } from 'vitest';
import type { ConfiguratorField, ConfiguratorTemplateData } from '../domain/types';
import type { TemplateRepository } from '../repositories/types';
import { ConfiguratorService } from './ConfiguratorService';

const legacyUploadField = {
  id: 'photo',
  type: 'image',
  label: 'Фото',
} as unknown as ConfiguratorField;

function repository(custom: ConfiguratorTemplateData[] = []): TemplateRepository {
  return {
    listCustom: () => custom,
    saveCustom: () => undefined,
    removeCustom: () => undefined,
  };
}

describe('ConfiguratorService', () => {
  it('removes legacy upload fields from stored templates', () => {
    const service = new ConfiguratorService(
      repository([
        {
          id: 'legacy',
          name: 'Старый шаблон',
          description: '',
          fields: [legacyUploadField, { id: 'text', type: 'text', label: 'Надпись' }],
        },
      ]),
    );

    expect(service.getById('legacy')?.fields.map((field) => field.id)).toEqual(['text']);
  });

  it('does not save upload fields in new templates', () => {
    const saved: ConfiguratorTemplateData[] = [];
    const service = new ConfiguratorService({
      listCustom: () => [],
      saveCustom: (template) => saved.push(template),
      removeCustom: () => undefined,
    });

    service.save({
      id: 'new',
      name: 'Новый шаблон',
      description: '',
      fields: [legacyUploadField],
    });

    expect(saved[0]?.fields).toEqual([]);
  });
});
