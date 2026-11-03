import { ProductManager } from '../../components/admin/ProductManager';

export function AdminProductsPage() {
  return <ProductManager canDelete canArchive canRestore showTemplateLink />;
}
