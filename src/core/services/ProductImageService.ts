import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'product-images';
const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const MAX_SIDE = 1600;

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fall back to an <img> for formats the browser can decode but not bitmap.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

async function prepareImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Выберите файл изображения.');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Фото должно быть не больше 10 МБ.');
  }

  const bitmap = await loadBitmap(file);
  const width = 'width' in bitmap ? bitmap.width : 0;
  const height = 'height' in bitmap ? bitmap.height : 0;
  if (!width || !height) {
    throw new Error('Не удалось прочитать изображение.');
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Не удалось подготовить изображение.');

  context.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  if ('close' in bitmap) bitmap.close();

  const webp = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/webp', 0.86);
  });
  if (webp) return webp;

  const jpeg = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', 0.88);
  });
  if (!jpeg) throw new Error('Не удалось обработать изображение.');
  return jpeg;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Не удалось прочитать изображение.'));
    reader.readAsDataURL(blob);
  });
}

export class ProductImageService {
  constructor(private readonly client?: SupabaseClient) {}

  async upload(file: File, productId: string): Promise<string> {
    const blob = await prepareImage(file);

    if (!this.client) {
      return blobToDataUrl(blob);
    }

    const extension = blob.type === 'image/jpeg' ? 'jpg' : 'webp';
    const path = `${productId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await this.client.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (error) throw new Error(`Не удалось загрузить фото: ${error.message}`);

    return this.client.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  async remove(url: string): Promise<void> {
    if (!this.client || !url || url.startsWith('data:')) return;

    const marker = `/${BUCKET}/`;
    const index = url.indexOf(marker);
    if (index < 0) return;

    const path = decodeURIComponent(url.slice(index + marker.length).split('?')[0]);
    if (!path) return;

    const { error } = await this.client.storage.from(BUCKET).remove([path]);
    if (error) console.warn('Не удалось удалить фото товара:', error.message);
  }
}
