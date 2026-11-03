import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCTS } from '../src/core/data/products.ts';
import { DEFAULT_SETTINGS } from '../src/core/data/settings.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is missing. Run with: node --env-file=.secrets/supabase.env scripts/db-seed.mjs`);
  }
  return value;
}

function optionalEnv(name) {
  return process.env[name]?.trim() || '';
}

async function request(url, serviceKey, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'CreateToy-Setup/1.0',
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }

  if (!response.ok) {
    throw new Error(`Supabase ${response.status}: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }

  return body;
}

async function authRequest(baseUrl, serviceKey, pathname, options = {}) {
  return request(`${baseUrl}${pathname}`, serviceKey, options);
}

async function listUsers(baseUrl, serviceKey) {
  const body = await authRequest(baseUrl, serviceKey, '/auth/v1/admin/users?per_page=200');
  return body?.users ?? [];
}

async function upsertAuthUser({ baseUrl, serviceKey, email, password, displayName }) {
  const normalized = email.trim().toLowerCase();
  const users = await listUsers(baseUrl, serviceKey);
  const existing = users.find((user) => (user.email ?? '').toLowerCase() === normalized);
  const payload = {
    email: normalized,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName },
  };

  if (existing) {
    console.log(`update auth user ${normalized}`);
    return authRequest(baseUrl, serviceKey, `/auth/v1/admin/users/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  console.log(`create auth user ${normalized}`);
  return authRequest(baseUrl, serviceKey, '/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function upsertRows(baseUrl, serviceKey, table, rows) {
  await request(`${baseUrl}/rest/v1/${table}`, serviceKey, {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(rows),
  });
}

async function upsertProfile(baseUrl, serviceKey, profile) {
  await upsertRows(baseUrl, serviceKey, 'profiles', [
    {
      id: profile.id,
      email: profile.email.trim().toLowerCase(),
      display_name: profile.displayName,
      role: profile.role,
    },
  ]);
}

async function seedProducts(baseUrl, serviceKey) {
  await upsertRows(
    baseUrl,
    serviceKey,
    'products',
    PRODUCTS.map((product) => ({
      id: product.id,
      slug: product.slug,
      title: product.title,
      subtitle: product.subtitle,
      description: product.description,
      price: product.price,
      category: product.category,
      holiday_ids: product.holidayIds,
      template_id: product.templateId,
      art: product.art,
      badge: product.badge ?? null,
      production_days: product.productionDays,
      materials: product.materials,
      size: product.size,
      featured: product.featured ?? false,
    })),
  );
  console.log(`seeded ${PRODUCTS.length} products`);
}

async function main() {
  const baseUrl = requireEnv('SUPABASE_URL').replace(/\/$/, '');
  const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const adminEmail = requireEnv('ADMIN_EMAIL');
  const adminPassword = requireEnv('ADMIN_PASSWORD');
  const adminLogin = optionalEnv('ADMIN_LOGIN') || 'Administrator';
  const adminDisplayName = optionalEnv('ADMIN_DISPLAY_NAME') || adminLogin;
  const managerEmail = optionalEnv('MANAGER_EMAIL');
  const managerPassword = optionalEnv('MANAGER_PASSWORD');
  const managerDisplayName = optionalEnv('MANAGER_DISPLAY_NAME') || 'Менеджер';

  const admin = await upsertAuthUser({
    baseUrl,
    serviceKey,
    email: adminEmail,
    password: adminPassword,
    displayName: adminDisplayName,
  });
  const adminId = admin?.user?.id ?? admin?.id;
  if (!adminId) throw new Error('Auth Admin API did not return the admin user id.');
  await upsertProfile(baseUrl, serviceKey, {
    id: adminId,
    email: adminEmail,
    displayName: adminDisplayName,
    role: 'admin',
  });
  console.log(`admin ready: ${adminLogin} -> ${adminEmail}`);

  if (managerEmail && managerPassword) {
    const manager = await upsertAuthUser({
      baseUrl,
      serviceKey,
      email: managerEmail,
      password: managerPassword,
      displayName: managerDisplayName,
    });
    const managerId = manager?.user?.id ?? manager?.id;
    if (!managerId) throw new Error('Auth Admin API did not return the manager user id.');
    await upsertProfile(baseUrl, serviceKey, {
      id: managerId,
      email: managerEmail,
      displayName: managerDisplayName,
      role: 'manager',
    });
    console.log(`manager ready: ${managerEmail}`);
  } else {
    console.log('manager skipped: MANAGER_EMAIL / MANAGER_PASSWORD are empty');
  }

  await seedProducts(baseUrl, serviceKey);

  await upsertRows(baseUrl, serviceKey, 'settings', [{ id: true, data: DEFAULT_SETTINGS }]);
  console.log('settings seeded');

  console.log(`seed complete (${path.basename(root)})`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
