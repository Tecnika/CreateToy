import { TEMPLATES } from '../data/templates';
import { ConfiguratorTemplate } from '../domain/ConfiguratorTemplate';
import type { ConfiguratorTemplateData } from '../domain/types';
import type { TemplateRepository } from '../repositories/types';

const LEGACY_UPLOAD_FIELD = 'image';

function withoutLegacyUploads(data: ConfiguratorTemplateData): ConfiguratorTemplateData {
  const fields = data.fields.filter((field) => (field.type as string) !== LEGACY_UPLOAD_FIELD);
  return fields.length === data.fields.length ? data : { ...data, fields };
}

export class ConfiguratorService {
  constructor(private readonly repository: TemplateRepository) {}

  list(): ConfiguratorTemplate[] {
    const custom = this.repository
      .listCustom()
      .map((data) => new ConfiguratorTemplate({ ...withoutLegacyUploads(data), isCustom: true }));
    const customIds = new Set(custom.map((template) => template.id));
    return [...TEMPLATES.filter((template) => !customIds.has(template.id)), ...custom];
  }

  getById(id: string): ConfiguratorTemplate | undefined {
    return this.list().find((template) => template.id === id);
  }

  save(data: ConfiguratorTemplateData): ConfiguratorTemplate {
    const stored: ConfiguratorTemplateData = { ...withoutLegacyUploads(data), isCustom: true };
    const template = new ConfiguratorTemplate(stored);
    this.repository.saveCustom(stored);
    return template;
  }

  removeCustom(id: string): void {
    this.repository.removeCustom(id);
  }

  isBuiltIn(id: string): boolean {
    return TEMPLATES.some((template) => template.id === id);
  }
}
