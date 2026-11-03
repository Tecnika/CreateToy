import { useMemo, useState } from 'react';
import { Check, ChevronRight, ShoppingBag, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ConfiguratorField, ConfiguratorValues, Product } from '../../core/domain/types';
import type { ConfiguratorTemplate } from '../../core/domain/ConfiguratorTemplate';
import { useCart } from '../../state/CartContext';
import { hashString } from '../../utils/hash';
import { Button, LinkButton } from '../ui/Button';
import { QuantityControl } from '../ui/QuantityControl';
import { ProductMedia } from '../product/ProductMedia';

interface ConfiguratorProps {
  product: Product;
  template: ConfiguratorTemplate;
}

export function Configurator({ product, template }: ConfiguratorProps) {
  const { addLine } = useCart();
  const inStock = product.inStock !== false;
  const [values, setValues] = useState<ConfiguratorValues>(() => template.defaultValues());
  const [quantity, setQuantity] = useState(1);
  const [errors, setErrors] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const unitPrice = useMemo(
    () => template.calculatePrice(product.price, values),
    [product.price, template, values],
  );

  const textPreview = useMemo(() => {
    const text = values.text ?? values.cardText;
    return typeof text === 'string' && text.trim() ? text : null;
  }, [values]);

  function update(field: ConfiguratorField, value: ConfiguratorValues[string]) {
    setValues((current) => ({ ...current, [field.id]: value }));
    setAdded(false);
  }

  function handleAdd() {
    if (!inStock) return;
    const validation = template.validate(values);
    if (validation.length > 0) {
      setErrors(validation);
      return;
    }
    setErrors([]);
    const configurationLabel = template.summarize(values);
    const id = `${product.id}-${hashString(JSON.stringify(values))}`;
    addLine({
      id,
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      art: product.art,
      imageUrl: product.imageUrl,
      unitPrice: unitPrice.amount,
      quantity,
      configuration: values,
      configurationLabel,
    });
    setAdded(true);
  }

  return (
    <div className="surface-card overflow-hidden">
      <div className="border-b border-line bg-surface-2/60 px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-muted">Настройка</p>
            <h2 className="display-title mt-1 text-xl">{template.data.name}</h2>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-accent-2">
            <Sparkles size={12} />
            {template.data.fields.length} шага
          </span>
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          {template.fields.map((field) => (
            <FieldControl
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={(value) => update(field, value)}
            />
          ))}

          {errors.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div
            className="relative overflow-hidden rounded-3xl border border-line"
            style={{
              background: `linear-gradient(145deg, ${product.art.colors[1]} 0%, ${product.art.colors[0]} 100%)`,
            }}
          >
            <ProductMedia
              art={product.art}
              imageUrl={product.imageUrl}
              label={`${product.title} — предпросмотр`}
              className="aspect-square w-full object-cover"
            />
            {textPreview && (
              <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/30 bg-black/25 px-4 py-3 text-center backdrop-blur">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/60">Ваша надпись</p>
                <p className="mt-1 truncate font-display text-lg font-semibold text-white">{textPreview}</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-line bg-surface-2/50 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">Итого</p>
                <p className="mt-1 font-display text-2xl font-semibold">{unitPrice.format()}</p>
                <p className="mt-1 text-xs text-muted">за 1 шт. · без доставки</p>
              </div>
              <QuantityControl value={quantity} onChange={setQuantity} />
            </div>

            <Button className="mt-4 w-full" onClick={handleAdd} disabled={!inStock}>
              {inStock ? added ? <Check size={17} /> : <ShoppingBag size={17} /> : null}
              {!inStock ? 'Нет в продаже' : added ? 'Добавлено в корзину' : 'Добавить в корзину'}
            </Button>

            {added && (
              <LinkButton to="/cart" variant="secondary" className="mt-2 w-full text-xs">
                Перейти в корзину
                <ChevronRight size={15} />
              </LinkButton>
            )}

            <p className="mt-3 text-center text-[10px] leading-4 text-muted">
              Итоговую стоимость доставки подтвердит менеджер после связи.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: ConfiguratorField;
  value: ConfiguratorValues[string] | undefined;
  onChange: (value: ConfiguratorValues[string]) => void;
}) {
  if (field.type === 'color') {
    return (
      <div>
        <FieldLabel field={field} />
        <div className="flex flex-wrap gap-2.5">
          {field.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`group flex items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-bold transition ${
                value === option.value
                  ? 'border-accent bg-accent-soft text-ink'
                  : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-ink'
              }`}
            >
              <span
                className="h-6 w-6 rounded-full border border-black/10 shadow-inner"
                style={{ background: option.swatch }}
              />
              {option.label}
              {option.price ? <span className="text-[10px] text-accent">+{option.price} ₽</span> : null}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        <FieldLabel field={field} />
        <div className="grid gap-2 sm:grid-cols-2">
          {field.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 text-left text-xs font-bold transition ${
                value === option.value
                  ? 'border-accent bg-accent-soft text-ink'
                  : 'border-line bg-surface text-muted hover:border-accent/50 hover:text-ink'
              }`}
            >
              <span>{option.label}</span>
              {option.price ? <span className="text-[10px] text-accent">+{option.price} ₽</span> : null}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-surface p-3.5 transition hover:border-accent/50">
        <input
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-0.5 h-4 w-4 accent-[var(--accent)]"
        />
        <span className="flex-1">
          <span className="block text-sm font-bold">{field.label}</span>
          {field.help && <span className="mt-0.5 block text-xs text-muted">{field.help}</span>}
        </span>
        {field.price ? <span className="text-xs font-bold text-accent">+{field.price} ₽</span> : null}
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <FieldLabel field={field} />
        <textarea
          className="textarea"
          value={String(value ?? '')}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div>
        <FieldLabel field={field} />
        <input
          type="number"
          className="input"
          value={Number(value ?? field.min ?? 1)}
          min={field.min}
          max={field.max}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </div>
    );
  }

  return (
    <div>
      <FieldLabel field={field} />
      <input
        type="text"
        className="input"
        value={String(value ?? '')}
        maxLength={field.maxLength}
        placeholder={field.placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function FieldLabel({ field }: { field: ConfiguratorField }) {
  return (
    <div className="mb-2 flex items-baseline justify-between gap-3">
      <label className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">{field.label}</label>
      {field.help && <span className="text-right text-[10px] text-muted/80">{field.help}</span>}
    </div>
  );
}
