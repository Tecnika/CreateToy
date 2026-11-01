import type { ConfiguratorTemplateData } from '../../domain/types';
import type { Storage } from '../../storage/Storage';
import type { TemplateRepository } from '../types';

export class LocalTemplateRepository implements TemplateRepository {
  private readonly key = 'templates:custom';

  constructor(private readonly storage: Storage) {}

  listCustom(): ConfiguratorTemplateData[] {
    return this.storage.get<ConfiguratorTemplateData[]>(this.key, []);
  }

  saveCustom(template: ConfiguratorTemplateData): void {
    const templates = this.listCustom();
    const index = templates.findIndex((item) => item.id === template.id);
    if (index >= 0) templates[index] = template;
    else templates.push(template);
    this.storage.set(this.key, templates);
  }

  removeCustom(id: string): void {
    this.storage.set(
      this.key,
      this.listCustom().filter((template) => template.id !== id),
    );
  }
}
