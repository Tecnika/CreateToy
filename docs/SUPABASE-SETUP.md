# Supabase: настройка и текущее состояние

Проект работает на **Supabase Free**. Это PostgreSQL + Auth + RLS без карты и собственного сервера. Сайт остаётся статическим и публикуется на GitHub Pages.

## Что уже сделано

- Проект `createtoy`, регион `eu-west-1`, ref `ztfjefnnkjnsuefplxpg`.
- Применена миграция [`supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql):
  - 8 таблиц: `profiles`, `products`, `orders`, `order_counters`, `settings`, `holiday_themes`, `configurator_templates`, `app_migrations`;
  - роли `buyer`, `manager`, `admin` и статусы заказов;
  - 21 RLS-политика, триггеры `updated_at`, генерация номера заказа, отмена заказа, смена роли;
  - триггер `on_auth_user_created` создаёт профиль покупателя после регистрации.
- Применены миграции [`0002_product_archive.sql`](../supabase/migrations/0002_product_archive.sql), [`0003_product_archive_guard.sql`](../supabase/migrations/0003_product_archive_guard.sql) и [`0004_product_availability_and_images.sql`](../supabase/migrations/0004_product_availability_and_images.sql): скрытие товаров, защита восстановления, статус «нет в продаже» и публичный bucket `product-images` для фото товара.
- Загружены 16 товаров и базовые настройки. Встроенные темы и шаблоны конструктора определены в коде; пользовательские темы и шаблоны сохраняются в Supabase.
- Создан администратор: логин `Administrator` → `admin@createtoy.local`. Пароль хранится только в `.secrets/supabase.env`.
- Создан менеджер: `manager@createtoy.local`. Пароль хранится только в `.secrets/supabase.env`.
- Менеджеры могут создавать, редактировать, скрывать товары, загружать фото и снимать товар с продажи. Восстановление скрытых карточек и удаление навсегда доступны только администратору.
- Активная праздничная тема хранится в общей строке `settings.activeThemeId`.
- Фронтенд выбирает Supabase при `VITE_DATA_MODE=supabase`; иначе работает локальный демо-режим.
- Публичные URL и anon key прописаны в `.env.local` и GitHub Actions. Секреты в браузер и CI не попадают.
- Временная функция `public.exec_sql(text)` удалена после применения миграции.

## Что осталось сделать один раз

### 1. Отключить подтверждение email

Сейчас Supabase всё ещё сообщает `mailer_autoconfirm: false`, поэтому после регистрации нет активной сессии, пока пользователь не подтвердит email.

1. Откройте <https://supabase.com/dashboard/project/ztfjefnnkjnsuefplxpg/auth/providers>.
2. **Email** → выключите **Confirm email**.
3. Сохраните.

Проверка:

```powershell
$env:SUPABASE_URL='https://ztfjefnnkjnsuefplxpg.supabase.co'
$env:SUPABASE_ANON_KEY='<anon key>'
node -e "fetch(process.env.SUPABASE_URL+'/auth/v1/settings',{headers:{apikey:process.env.SUPABASE_ANON_KEY}}).then(r=>r.json()).then(x=>console.log(x.mailer_autoconfirm))"
```

Должно быть `true`. Пока подтверждение включено, интерфейс корректно показывает экран «Проверьте почту», но мгновенный вход после регистрации недоступен.

### 2. Настроить URL приложения

В **Authentication → URL Configuration**:

- **Site URL**: `https://tecnika.github.io/CreateToy/`
- **Redirect URLs**:
  - `https://tecnika.github.io/CreateToy/**`
  - `http://127.0.0.1:5173/**`
  - `http://localhost:5173/**`

### 3. Социальный вход (по желанию)

Сейчас Google и GitHub выключены (`external.google: false`, `external.github: false`).

**Google**

1. В Google Cloud Console создайте OAuth Client ID типа **Web application**.
2. Authorized redirect URI: `https://ztfjefnnkjnsuefplxpg.supabase.co/auth/v1/callback`.
3. В Supabase → **Authentication → Providers → Google** включите провайдер и вставьте Client ID и Client Secret.

**GitHub**

1. GitHub → **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Authorization callback URL: `https://ztfjefnnkjnsuefplxpg.supabase.co/auth/v1/callback`.
3. В Supabase → **Authentication → Providers → GitHub** включите провайдер и вставьте Client ID и Client Secret.

Кнопки Google/GitHub уже есть в интерфейсе. Без credentials Supabase вернёт ошибку «provider is not enabled».

### 4. Проверить старый секретный ключ

Ранее в переписку попадал `service_role`-ключ. Если он ещё активен, перевыпустите ключи в **Project Settings → API** и обновите `.secrets/supabase.env`. Новый ключ уже используется для seed-скрипта.

## Локальные команды

```powershell
# Проверка типов, тестов и production-сборки
npm run typecheck
npm test
npm run build

# Повторная загрузка товаров, настроек, администратора и менеджера
node --env-file=.secrets/supabase.env scripts/db-seed.mjs
```

Seed-скрипт использует Supabase REST и Auth Admin API, поэтому не зависит от pooler-соединения. Прямое подключение к PostgreSQL осталось в `scripts/db-migrate.mjs` для будущих миграций; при нестабильном pooler используйте SQL Editor.

## Результат локальной проверки

Проверено на живом проекте Supabase через `npm run dev`:

- вход `Administrator` и `manager@createtoy.local`;
- каталог, карточка товара, корзина и оформление заказа;
- заказ виден покупателю и менеджеру;
- смена статусов, подтверждение оплаты, стоимость доставки и трек-номер;
- отмена заказа покупателем до оплаты;
- смена роли через `/admin/users`;
- создание и редактирование товара менеджером, удаление только администратором;
- создание и удаление шаблона;
- переключение темы для всех посетителей;
- сохранение контактов и способов доставки в `/admin/settings`;
- ошибки записи показываются в интерфейсе, а не теряются молча.

Обновлённая версия опубликована на GitHub Pages и проверена: сайт загружает каталог из Supabase, в футере отображается «Облачный аккаунт · Supabase», вход `Administrator` ведёт в `/admin`.

Не проверено до выполнения шагов ниже: мгновенный вход после регистрации (включено подтверждение email) и Google/GitHub OAuth (провайдеры выключены). На медленном соединении первый запрос к Supabase Free может занять 10–30 секунд; клиент повторяет GET-запрос и показывает понятную ошибку, если сервер не ответил.

## Что проверить после публикации

1. Регистрация покупателя и вход.
2. Оформление заказа: состав, адрес, доставка, оплата.
3. Заказ виден покупателю в личном кабинете и менеджеру в `/manager`.
4. Смена статуса, подтверждение оплаты, трек-номер и стоимость доставки.
5. Отмена заказа покупателем до оплаты.
6. Смена роли покупателя на менеджера в `/admin/users`.
7. Создание и редактирование товара менеджером; загрузка фото, снятие с продажи, скрытие и восстановление только администратором.
8. Создание шаблона и темы, переключение темы для всех посетителей.
9. Сохранение контактов и способов доставки в `/admin/settings`.
10. Вход `Administrator` и переход в `/admin`.

## Безопасность

- `anon` / `publishable` key публичный, его защищают RLS-политики.
- `service_role` key и `DATABASE_URL` хранятся только в `.secrets/` и никогда не попадают в `VITE_*`, GitHub Actions или браузер.
- Покупатель видит только свои заказы и профиль. Менеджер видит заказы и профили, может скрыть или снять товар с продажи, но не восстановить и не удалить его. Восстановление и удаление товаров, роли, темы, шаблоны и настройки — у администратора.
- Фото товаров лежат в публичном bucket `product-images`. Загружать, заменять и удалять файлы могут только менеджер и администратор; покупатели файлы не загружают.
- Пароли хранит Supabase Auth; в таблицах их нет.

## Ограничения Free

- 500 МБ базы, 1 ГБ Storage, 50 000 MAU.
- Проект засыпает после 7 дней без запросов. Ежедневный keep-alive workflow можно добавить отдельно.
- Встроенная почта Supabase имеет лимиты. Для подтверждения email и восстановления пароля лучше подключить SMTP (Resend и т. п.).
- Автоматических бэкапов на Free нет. Периодически делайте `pg_dump` вручную.
