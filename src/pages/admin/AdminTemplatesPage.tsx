import { useState, type FormEvent } from 'react';
import { Check, ChevronDown, ChevronUp, Pencil, Plus, Trash2, X } from 'lucide-react';
import { services } from '../../core/container';
import type {
  ConfiguratorField,
  ConfiguratorFieldType,
  ConfiguratorOption,
  ConfiguratorTemplateData,
} from '../../core/domain/types';

const fieldTypes: { id: ConfiguratorFieldType; label: string }[] = [
  { id: 'text', label: 'Строка' },
  { id: 'textarea', label: 'Многострочный текст' },
  { id: 'select', label: 'Выбор варианта' },
  { id: 'color', label: 'Выбор цвета' },
  { id: 'number', label: 'Число' },
  { id: 'checkbox', label: 'Галочка' },
  { id: 'image', label: 'Загрузка изображения' },
];

function optionsToText(options?: ConfiguratorOption[]): string {
  return (options ?? [])
    .map((option) => [option.value, option.label, option.price ?? '', option.swatch ?? ''].join('|'))
    .join('\n');
}

function textToOptions(text: string): ConfiguratorOption[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [value, label, price, swatch] = line.split('|').map((part) => part.trim());
      return {
        value: value || label,
        label: label || value,
        price: price ? Number(price) : undefined,
        swatch: swatch || undefined,
      };
    });
}

function toDraft(template?: ConfiguratorTemplateData): ConfiguratorTemplateData {
  return template
    ? {
        ...template,
        fields: template.fields.map((field) => ({ ...field, options: field.options ? [...field.options] : undefined })),
      }
    : {
        id: `template-${crypto.randomUUID().slice(0, 8)}`,
        name: '',
        description: '',
        fields: [],
      };
}

function newField(): ConfiguratorField {
  return {
    id: `field-${crypto.randomUUID().slice(0, 8)}`,
    type: 'text',
    label: 'Новое поле',
    required: false,
  };
}

export function AdminTemplatesPage() {
  const [version, setVersion] = useState(0);
  const [draft, setDraft] = useState<ConfiguratorTemplateData | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [optionTexts, setOptionTexts] = useState<Record<string, string>>({});

  const templates = services.configurator.list();
  const products = services.catalog.list();

  function openNew() {
    setDraft(toDraft());
    setOptionTexts({});
    setMessage('');
    setError('');
  }

  function openEdit(template: ConfiguratorTemplateData) {
    setDraft(toDraft(template));
    setOptionTexts(
      template.fields.reduce<Record<string, string>>((result, field) => {
        result[field.id] = optionsToText(field.options);
        return result;
      }, {}),
    );
    setMessage('');
    setError('');
  }

  function update<K extends keyof ConfiguratorTemplateData>(key: K, value: ConfiguratorTemplateData[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function updateField(id: string, patch: Partial<ConfiguratorField>) {
    setDraft((current) =>
      current
        ? { ...current, fields: current.fields.map((field) => (field.id === id ? { ...field, ...patch } : field)) }
        : current,
    );
  }

  function addField() {
    setDraft((current) => (current ? { ...current, fields: [...current.fields, newField()] } : current));
  }

  function removeField(id: string) {
    setDraft((current) => (current ? { ...current, fields: current.fields.filter((field) => field.id !== id) } : current));
  }

  function moveField(id: string, direction: -1 | 1) {
    setDraft((current) => {
      if (!current) return current;
      const index = current.fields.findIndex((field) => field.id === id);
      const next = index + direction;
      if (index < 0 || next < 0 || next >= current.fields.length) return current;
      const fields = [...current.fields];
      [fields[index], fields[next]] = [fields[next], fields[index]];
      return { ...current, fields };
    });
  }

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setError('');
    if (draft.name.trim().length < 2) {
      setError('Укажите название шаблона.');
      return;
    }
    if (draft.fields.length === 0) {
      setError('Добавьте хотя бы одно поле.');
      return;
    }
    if (draft.fields.some((field) => !field.label.trim())) {
      setError('У каждого поля должно быть название.');
      return;
    }
    const fields = draft.fields.map((field) => ({
      ...field,
      label: field.label.trim(),
      options: ['select', 'color'].includes(field.type) ? textToOptions(optionTexts[field.id] ?? optionsToText(field.options)) : undefined,
    }));
    services.configurator.save({ ...draft, name: draft.name.trim(), description: draft.description.trim(), fields });
    setVersion((value) => value + 1);
    setDraft(null);
    setMessage('Шаблон сохранён. Его можно выбрать при создании товара.');
  }

  function remove(id: string) {
    const usedBy = products.filter((product) => product.templateId === id);
    if (usedBy.length > 0) {
      setError(`Шаблон используют товары: ${usedBy.map((product) => product.title).join(', ')}. Сначала смените им шаблон.`);
      return;
    }
    if (!window.confirm('Удалить шаблон? Для встроенного шаблона вернётся стандартная версия.')) return;
    services.configurator.removeCustom(id);
    setVersion((value) => value + 1);
    setMessage('Шаблон удалён.');
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow mb-3">Конструктор</span>
          <h1 className="display-title text-3xl sm:text-4xl">Шаблоны товаров</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Настройте поля, которые увидит покупатель: цвет, размер, надпись, упаковку и доплаты.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-primary px-4 py-2.5 text-xs">
          <Plus size={15} /> Новый шаблон
        </button>
      </div>

      {(message || error) && (
        <p className={`rounded-2xl px-4 py-3 text-xs font-semibold ${error ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
          {error || message}
        </p>
      )}

      {draft && (
        <form onSubmit={save} className="surface-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="display-title text-2xl">{templates.some((template) => template.id === draft.id) ? 'Редактировать шаблон' : 'Новый шаблон'}</h2>
              <p className="mt-1 text-xs text-muted">ID: {draft.id} · поля применяются к товарам с этим шаблоном</p>
            </div>
            <button type="button" onClick={() => setDraft(null)} className="btn-icon h-9 w-9" aria-label="Закрыть форму">
              <X size={16} />
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="field-label">Название</label>
              <input className="input" value={draft.name} onChange={(event) => update('name', event.target.value)} placeholder="Например, Светильник" />
            </div>
            <div>
              <label className="field-label">Описание</label>
              <input className="input" value={draft.description} onChange={(event) => update('description', event.target.value)} />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted">Поля · {draft.fields.length}</h3>
              <button type="button" onClick={addField} className="btn-secondary px-3 py-2 text-xs">
                <Plus size={14} /> Добавить поле
              </button>
            </div>

            {draft.fields.length === 0 && (
              <p className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-muted">
                Пока нет полей. Добавьте первое — например, «Цвет» или «Надпись».
              </p>
            )}

            {draft.fields.map((field, index) => (
              <div key={field.id} className="rounded-2xl border border-line bg-surface-2/30 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted">Поле {index + 1}</span>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => moveField(field.id, -1)} className="btn-icon h-7 w-7" aria-label="Выше"><ChevronUp size={13} /></button>
                    <button type="button" onClick={() => moveField(field.id, 1)} className="btn-icon h-7 w-7" aria-label="Ниже"><ChevronDown size={13} /></button>
                    <button type="button" onClick={() => removeField(field.id)} className="btn-icon h-7 w-7 text-rose-600" aria-label="Удалить поле"><Trash2 size={13} /></button>
                  </div>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="lg:col-span-2">
                    <label className="field-label">Название поля</label>
                    <input className="input py-2.5 text-xs" value={field.label} onChange={(event) => updateField(field.id, { label: event.target.value })} />
                  </div>
                  <div>
                    <label className="field-label">Тип</label>
                    <select className="select py-2.5 text-xs" value={field.type} onChange={(event) => updateField(field.id, { type: event.target.value as ConfiguratorFieldType })}>
                      {fieldTypes.map((type) => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="field-label">Доплата, ₽</label>
                    <input type="number" className="input py-2.5 text-xs" value={field.price ?? ''} onChange={(event) => updateField(field.id, { price: event.target.value ? Number(event.target.value) : undefined })} />
                  </div>
                  <div className="lg:col-span-2">
                    <label className="field-label">Подсказка</label>
                    <input className="input py-2.5 text-xs" value={field.help ?? ''} onChange={(event) => updateField(field.id, { help: event.target.value || undefined })} />
                  </div>
                  <div>
                    <label className="field-label">Плейсхолдер</label>
                    <input className="input py-2.5 text-xs" value={field.placeholder ?? ''} onChange={(event) => updateField(field.id, { placeholder: event.target.value || undefined })} />
                  </div>
                  <div className="flex items-end gap-3 pb-1">
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted">
                      <input type="checkbox" checked={Boolean(field.required)} onChange={(event) => updateField(field.id, { required: event.target.checked })} className="h-4 w-4 accent-[var(--accent)]" />
                      Обязательное
                    </label>
                    {['text', 'textarea'].includes(field.type) && (
                      <input type="number" className="input w-24 py-2.5 text-xs" value={field.maxLength ?? ''} onChange={(event) => updateField(field.id, { maxLength: event.target.value ? Number(event.target.value) : undefined })} placeholder="Длина" />
                    )}
                  </div>
                </div>

                {(field.type === 'select' || field.type === 'color') && (
                  <div className="mt-3">
                    <label className="field-label">Варианты — по одному на строку: value | Название | доплата | цвет</label>
                    <textarea
                      className="textarea min-h-20 font-mono text-[11px]"
                      value={optionTexts[field.id] ?? optionsToText(field.options)}
                      onChange={(event) => setOptionTexts((current) => ({ ...current, [field.id]: event.target.value }))}
                      placeholder={'cream | Тёплый крем | 0 | #f4f1e8\nforest | Лесной | 100 | #2f5d50'}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setDraft(null)} className="btn-secondary px-4 py-2.5 text-xs">Отмена</button>
            <button type="submit" className="btn-primary px-4 py-2.5 text-xs"><Check size={15} /> Сохранить шаблон</button>
          </div>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {templates.map((template) => {
          const usedBy = products.filter((product) => product.templateId === template.id);
          const overridden = Boolean(template.data.isCustom);
          return (
            <div key={template.id} className="surface-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-extrabold">{template.data.name}</h2>
                    <span className="badge">{overridden ? 'свой' : 'встроенный'}</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted">{template.data.description}</p>
                </div>
                <div className="flex gap-1">
                  <button type="button" onClick={() => openEdit(template.data)} className="btn-icon h-8 w-8" aria-label="Редактировать шаблон"><Pencil size={13} /></button>
                  <button type="button" onClick={() => remove(template.id)} className="btn-icon h-8 w-8 text-rose-600" aria-label="Удалить шаблон"><Trash2 size={13} /></button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {template.fields.map((field) => (
                  <span key={field.id} className="rounded-full bg-surface-2 px-2.5 py-1 text-[10px] font-bold text-muted">
                    {field.label}{field.required ? ' *' : ''}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-[10px] text-muted">ID: {template.id} · товаров: {usedBy.length}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
