# CreateToy — настройка на Windows

## 1. Что уже готово

- Репозиторий: `https://github.com/Tecnika/CreateToy.git`
- Локальная папка: `D:\GitHub\Sites\CreateToy`
- Git инициализирован, remote `origin` настроен.
- GitHub-токен проверен: есть доступ к репозиторию, права push/admin, Actions и Secrets.
- Репозиторий публичный, ветка `main` запушена.
- GitHub Pages включён: сайт собирается workflow и публикуется из ветки `gh-pages`.
- Демо-версия доступна: `https://tecnika.github.io/CreateToy/`.
- Firebase-проект ещё не создан.
- Секреты лежат в `.secrets/credentials.env`; папка `.secrets/` добавлена в `.gitignore`.

## 2. Установка инструментов

### Node.js

Скачайте LTS-версию с `https://nodejs.org/` или установите через PowerShell:

```powershell
winget install OpenJS.NodeJS.LTS
```

Проверка в новом окне PowerShell:

```powershell
node -v
npm -v
```

Нужен Node.js 24.12 или новее: этого требует Firebase SDK. Именно эта версия используется в GitHub Actions.

### Git

```powershell
winget install Git.Git
git --version
```

Git уже установлен и настроен в этой папке.

### Firebase CLI

```powershell
npm install -g firebase-tools
firebase --version
```

Если PowerShell пишет `firebase не является внутренней или внешней командой`, добавьте в `PATH` папку:

```text
%APPDATA%\npm
```

После изменения `PATH` перезапустите PowerShell.

### Java — позже

Java нужна только для Firebase Emulator Suite. Для первого этапа не обязательна. Если понадобится:

```powershell
winget install Microsoft.OpenJDK.21
```

## 3. Создание Firebase-проекта на бесплатном плане Spark

Карта на этом этапе не нужна.

1. Откройте `https://console.firebase.google.com/`.
2. Создайте проект, например `CreateToy`.
3. Google Analytics можно отключить — для MVP не обязательна.
4. Создайте Firestore:
   - режим: production;
   - регион: `europe-west3` (Frankfurt).
   - Регион нельзя изменить после создания.
5. В Authentication включите:
   - Email/Password;
   - Google.
6. Storage на Spark не создаём: для новых проектов Cloud Storage требует Blaze. В текущем MVP загрузки покупателей не используются, а карточки товаров показывают встроенную графику, поэтому Storage не нужен.
7. В Project settings → General → Your apps создайте Web app.
8. Скопируйте Firebase web config. Это публичные значения, не секрет.
9. В Project settings → Service accounts нажмите Generate new private key.
10. Сохраните JSON как:

```text
D:\GitHub\Sites\CreateToy\.secrets\firebase-service-account.json
```

Этот файл — секрет. Он уже покрыт `.gitignore` и не должен попадать в GitHub.

11. В Authentication → Settings → Authorized domains добавьте:
   - `localhost`;
   - `tecnika.github.io`;
   - будущий `*.web.app`;
   - будущий `*.firebaseapp.com`.

## 4. Заполнение `.secrets/credentials.env`

Откройте файл:

```text
D:\GitHub\Sites\CreateToy\.secrets\credentials.env
```

Заполните:

```env
FIREBASE_PROJECT_ID=ваш-project-id
ADMIN_EMAIL=ваш-email-для-админа
FIREBASE_SERVICE_ACCOUNT_PATH=.secrets/firebase-service-account.json
```

`FIREBASE_TOKEN` пока можно оставить пустым. Он нужен для деплоя из GitHub Actions. Для локального деплоя достаточно `firebase login`.

Проверьте, что секреты не попали в git:

```powershell
git check-ignore -v .secrets/credentials.env
git status --short
```

В `git status` не должно быть `.secrets/`.

## 5. Вход в Firebase CLI

Для локальной работы:

```powershell
firebase login
```

Для CI-токена:

```powershell
firebase login:ci
```

Токен `login:ci` даёт доступ ко всем Firebase-проектам аккаунта. Если это критично, используйте service account JSON вместо CI-токена.

Привязка проекта:

```powershell
firebase use --add
```

Выберите проект и alias `default`.

Проверка:

```powershell
firebase projects:list
```

## 6. Что такое Blaze

В Firebase два основных плана:

- **Spark** — бесплатный. Доступны Auth, Firestore, Hosting. Cloud Storage для новых проектов недоступен — нужен Blaze.
- **Blaze** — pay-as-you-go. Нужна привязанная карта. Внутри Blaze есть бесплатные лимиты, платите только за превышение.

**Cloud Functions требуют Blaze.** Functions нужны для:

- автоматических писем;
- управления ролями через custom claims;
- некоторых серверных проверок.

Без Blaze можно сделать MVP:

- регистрация и вход;
- каталог, корзина, заказы;
- роли через Firestore + security rules;
- админ-панель;
- ручное подтверждение оплаты;
- GitHub Pages + Firebase Hosting.

Ограничения без Blaze:

- Cloud Storage недоступен для новых проектов;
- нет автоматических писем (только in-app и `mailto:`);
- роль администратора создаётся локальным скриптом с service account;
- custom claims не используются, роли хранятся в Firestore;
- сложные серверные проверки откладываются.

Blaze можно добавить позже без переделки фронтенда.

## 7. GitHub Pages

Репозиторий: `https://github.com/Tecnika/CreateToy`

Адрес GitHub Pages:

```text
https://tecnika.github.io/CreateToy/
```

Как это устроено:

1. Push в `main` запускает `.github/workflows/deploy-pages.yml`.
2. Workflow ставит зависимости, запускает тесты и собирает проект с базовым путём `/CreateToy/`.
3. Содержимое `dist/` вместе с `404.html` и `.nojekyll` публикуется в ветку `gh-pages`.
4. GitHub Pages собирает сайт из `gh-pages` (Source: **Deploy from a branch**, branch `gh-pages`, folder `/`).

Первый деплой уже выполнен. Прямые ссылки вроде `/CreateToy/catalog` работают через `404.html`.

Firebase Hosting будет основным адресом, GitHub Pages — зеркалом.

## 8. Безопасность

- `.secrets/` уже в `.gitignore`.
- GitHub-токен был отправлен в чат. После завершения настройки его лучше перевыпустить.
- Пароль администратора был в переписке. При первом входе система потребует его сменить.
- Не храните токены в переменных `VITE_*`: они попадут в браузер.
- Service account JSON нельзя коммитить, публиковать и отправлять в чат.
- Firebase web config не является секретом.

## 9. Следующий шаг

Фронтенд, демо-данные, роли, конфигуратор, темы и GitHub Pages уже готовы. После создания Firebase-проекта и заполнения `FIREBASE_PROJECT_ID`:

1. Подключить Firebase Auth, Firestore и Hosting. Storage пропустить: на Spark он недоступен.
2. Заменить localStorage-репозитории на Firebase-адаптеры в `src/core/container.ts`.
3. Настроить security rules, индексы и создание администратора `Administrator`.
4. Проверить роли и заказы на реальных данных.
5. Задеплоить Firebase Hosting и оставить GitHub Pages зеркалом.

До подключения Firebase проект полностью работает в демо-режиме без внешних сервисов.

Пошаговая инструкция именно для Spark: [`FIREBASE-SPARK.md`](FIREBASE-SPARK.md).
