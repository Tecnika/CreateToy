# Firebase на плане Spark

Инструкция для CreateToy. Проект уже работает в демо-режиме на `localStorage`; Firebase подключается как замена репозиториев и Auth, без переписывания интерфейса.

## Что доступно на Spark

| Сервис | Spark | Комментарий |
| --- | --- | --- |
| Authentication | Да | Email/Password, Google, письма подтверждения и сброса пароля |
| Cloud Firestore | Да | Бесплатные квоты: около 1 GiB, 50k чтений/день, 20k записей/день |
| Hosting | Да | Статический сайт, бесплатные квоты |
| Cloud Storage | **Нет** для новых проектов | Для нового проекта нужен Blaze. В MVP загрузки покупателей не используются, а карточки товаров показывают встроенную графику, поэтому Storage не обязателен |
| Cloud Functions | **Нет** | Нужен Blaze. Без них нет автоматических писем, custom claims и серверной проверки оплаты |

На Spark роли хранятся в Firestore, а не в custom claims. Проверка ролей — через security rules и чтение документа `users/{uid}`.

## 1. Создать проект

1. Откройте <https://console.firebase.google.com/>.
2. **Create project** → имя, например `CreateToy`.
3. Google Analytics можно отключить.
4. Останьтесь на плане **Spark**. Карта не нужна, Blaze не включайте.

## 2. Создать Firestore

1. **Build → Firestore Database → Create database**.
2. Режим: **Production mode**.
3. Регион: `europe-west3` (Frankfurt). Регион нельзя изменить после создания.

Правила доступа добавим позже; до этого база будет закрыта.

## 3. Включить Authentication

1. **Build → Authentication → Get started**.
2. **Email/Password** → Enable.
3. **Google** → Enable → выберите support email.
4. **Authentication → Settings → Authorized domains** добавьте:
   - `localhost`
   - `tecnika.github.io`
   - `<project-id>.web.app`
   - `<project-id>.firebaseapp.com`

Для GitHub Pages достаточно домена `tecnika.github.io`, путь `/CreateToy/` не указывается.

## 4. Создать Web App и получить конфиг

1. **Project settings → General → Your apps**.
2. Нажмите **Web** (`</>`), nickname `CreateToy Web`, зарегистрируйте приложение.
3. Скопируйте `firebaseConfig`.

Firebase web config — **не секрет**: он всё равно попадает в браузер. Секретом является только service account JSON.

Создайте в корне проекта `.env.local` (он уже в `.gitignore`):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=<project-id>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<project-id>
VITE_FIREBASE_STORAGE_BUCKET=<project-id>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_DATA_MODE=demo
```

`VITE_DATA_MODE` позже переключит контейнер сервисов между `demo` и `firebase`. Пока код использует демо-режим.

## 5. Service account для администратора

1. **Project settings → Service accounts → Generate new private key**.
2. Сохраните файл как:

```text
D:\GitHub\Sites\CreateToy\.secrets\firebase-service-account.json
```

3. Заполните `.secrets/credentials.env`:

```env
FIREBASE_PROJECT_ID=<project-id>
FIREBASE_REGION=europe-west3
FIREBASE_SERVICE_ACCOUNT_PATH=.secrets/firebase-service-account.json
ADMIN_LOGIN=Administrator
ADMIN_EMAIL=<ваш-email-для-админа>
ADMIN_PASSWORD=<надёжный-пароль>
```

Не коммитьте `.secrets/`, не вставляйте service account JSON в чат и не добавляйте `ADMIN_PASSWORD` в `VITE_*`.

## 6. Что изменить в коде

Сейчас `src/core/container.ts` создаёт локальные репозитории и `MockAuthAdapter`. Для Firebase нужны:

1. `src/core/firebase/client.ts` — `initializeApp(firebaseConfig)`, экспорт `auth` и `db`.
2. `src/core/auth/FirebaseAuthAdapter.ts` — реализация `AuthAdapter`:
   - `signInWithEmailAndPassword`;
   - `createUserWithEmailAndPassword`;
   - `GoogleAuthProvider` + `signInWithPopup`;
   - `onAuthStateChanged`, `signOut`;
   - после входа читать `users/{uid}` и отдавать роль.
3. `src/core/repositories/firebase/` — репозитории users, products, orders, settings, themes, templates.
4. `src/core/container.ts` — выбор адаптеров по `VITE_DATA_MODE`.
5. `scripts/seed-admin.mjs` — создание администратора через `firebase-admin`.

Важно: Firebase Auth принимает **email**, а не произвольный логин. Чтобы вход `Administrator` работал, в адаптере нужно сопоставить логин `Administrator` с `ADMIN_EMAIL` (email администратора не является секретом) либо входить по email. Для менеджера и покупателя в Firebase-режиме используйте email.

## 7. Модель Firestore

| Коллекция | Документ | Назначение |
| --- | --- | --- |
| `users` | `{uid}` | email, displayName, role, phone, addresses, createdAt |
| `products` | `{id}` | товар и параметры конфигуратора |
| `orders` | `{id}` | заказ, userId, статус, история, доставка, трекинг |
| `settings` | `site` | контакты, доставка, оплата |
| `themes` | `{id}` | только пользовательские темы; встроенные остаются в коде |
| `templates` | `{id}` | только пользовательские шаблоны |

Номера заказов без Cloud Functions лучше генерировать на клиенте по схеме `CT-<год>-<случайный/временной номер>` с проверкой уникальности. Либо использовать документ-счётчик и транзакцию, но тогда нужно отдельно продумать правила доступа.

## 8. Security rules: отправная точка

Это эскиз, а не готовые продакшен-правила. Проверяйте их в Firebase Emulator Suite и дополняйте ограничениями на сумму, состав заказа и допустимые переходы статусов.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function profile() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function isStaff() {
      return signedIn() && profile().role in ['manager', 'admin'];
    }

    function isAdmin() {
      return signedIn() && profile().role == 'admin';
    }

    match /users/{uid} {
      allow read: if signedIn() && (request.auth.uid == uid || isStaff());
      allow create: if signedIn()
        && request.auth.uid == uid
        && request.resource.data.role == 'buyer'
        && request.resource.data.email == request.auth.token.email;
      allow update: if isAdmin()
        || (signedIn()
          && request.auth.uid == uid
          && request.resource.data.role == resource.data.role
          && request.resource.data.email == resource.data.email);
      allow delete: if isAdmin();
    }

    match /products/{id} {
      allow read: if true;
      allow create, update: if isStaff();
      allow delete: if isAdmin();
    }

    match /orders/{id} {
      allow create: if signedIn()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status == 'new';
      allow read: if signedIn()
        && (resource.data.userId == request.auth.uid || isStaff());
      allow update: if isStaff()
        || (signedIn()
          && resource.data.userId == request.auth.uid
          && request.resource.data.status == 'cancelled'
          && resource.data.status in ['new', 'contacted', 'awaiting_payment']);
      allow delete: if isAdmin();
    }

    match /settings/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /themes/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /templates/{id} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

Правила не дают покупателю менять роль, email и чужие заказы. Менеджер может создавать и редактировать товары, удаление оставлено администратору. Перед продакшеном нужно запретить покупателю менять сумму, состав заказа и историю при отмене — это делается через `request.resource.data.diff(resource.data).affectedKeys()`.

## 9. Seed администратора

Установите Admin SDK только для локального скрипта:

```powershell
npm install --save-dev firebase-admin
```

Скрипт `scripts/seed-admin.mjs` должен:

1. Прочитать `.secrets/credentials.env`.
2. Загрузить service account JSON.
3. Найти или создать пользователя с `ADMIN_EMAIL` и `ADMIN_PASSWORD`.
4. Записать в `users/{uid}`:

```js
{
  email: ADMIN_EMAIL,
  displayName: 'Administrator',
  role: 'admin',
  phone: '',
  addresses: [],
  createdAt: FieldValue.serverTimestamp()
}
```

Пароль не выводить в консоль и не коммитить. Запуск:

```powershell
node scripts/seed-admin.mjs
```

## 10. Деплой Firebase Hosting

```powershell
firebase login
firebase use --add
npm run build
firebase deploy --only hosting
```

`firebase.json` уже настроен на `dist` и SPA-rewrite. Для Firebase Hosting базовый путь должен быть `/`, а не `/CreateToy/`. Не задавайте `VITE_BASE_PATH=/CreateToy/` при сборке для Firebase.

Адреса после деплоя:

```text
https://<project-id>.web.app/
https://<project-id>.firebaseapp.com/
```

Custom domain можно подключить позже, когда будет DNS.

## 11. Ограничения Spark в этом проекте

- **Нет Storage** → загрузки покупателей убраны из конфигуратора, карточки товаров используют встроенную графику. Storage понадобится только если позже добавить фотографии товаров или файлы покупателей; тогда нужен Blaze или внешнее хранилище.
- **Нет Functions** → менеджер подтверждает оплату вручную, письма открываются через `mailto:`, роли проверяются в Firestore.
- **Нет custom claims** → роль читается из `users/{uid}`; это дополнительные чтения Firestore.
- **Нет автоматических серверных проверок** → сумму и состав заказа нужно защищать правилами и UI-валидацией.
- **Google-вход** работает на Spark. Для VK ID нужна отдельная OIDC-настройка; текущая кнопка VK — демо-заглушка.

## 12. Чек-лист подключения

- [ ] Создан Firebase-проект на Spark.
- [ ] Firestore создан в `europe-west3`, режим production.
- [ ] Включены Email/Password и Google.
- [ ] Добавлены authorized domains.
- [ ] Создан Web App, конфиг лежит в `.env.local`.
- [ ] Service account лежит в `.secrets/firebase-service-account.json`.
- [ ] Заполнены `FIREBASE_PROJECT_ID`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- [ ] Реализованы Firebase Auth и репозитории.
- [ ] `VITE_DATA_MODE=firebase`.
- [ ] Настроены и протестированы security rules.
- [ ] Создан администратор `Administrator`.
- [ ] Проверены вход, каталог, заказ, роли и статусы.
- [ ] Задеплоен Firebase Hosting.

После выполнения пунктов 1–5 можно переключать код на Firebase. GitHub Pages при этом продолжает работать как зеркало.
