import { TEMPLATES } from '../data/templates';
import { ConfiguratorTemplate } from '../domain/ConfiguratorTemplate';
import type { ConfiguratorTemplateData } from '../domain/types';
import type { TemplateRepository } from '../repositories/types';

export class ConfiguratorService {
  constructor(private readonly repository: TemplateRepository) {}

  list(): ConfiguratorTemplate[] {
    const custom = this.repository
      .listCustom()
      .map((data) => new ConfiguratorTemplate({ ...data, isCustom: true }));
    const customIds = new Set(custom.map((template) => template.id));
    return [...TEMPLATES.filter((template) => !customIds.has(template.id)), ...custom];
  }

  getById(id: string): ConfiguratorTemplate | undefined {
    return this.list().find((template) => template.id === id);
  }

  save(data: ConfiguratorTemplateData): ConfiguratorTemplate {
    const stored: ConfiguratorTemplateData = { ...data, isCustom: true };
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
