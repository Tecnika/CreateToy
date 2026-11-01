# CreateToy — настройка на Windows

## 1. Что уже готово

- Репозиторий: `https://github.com/Tecnika/CreateToy.git`
- Локальная папка: `D:\GitHub\Sites\CreateToy`
- Git инициализирован, remote `origin` настроен.
- GitHub-токен проверен: есть доступ к репозиторию, права push/admin, Actions и Secrets.
- Репозиторий публичный и пока пустой.
- GitHub Pages ещё не включён — включим, когда появится первый workflow.
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

Нужен Node.js 20 или новее.

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
6. В Storage создайте default bucket.
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

- **Spark** — бесплатный. Доступны Auth, Firestore, Storage, Hosting. Для старта хватает.
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

- нет автоматических писем (только in-app и `mailto:`);
- роль администратора создаётся локальным скриптом с service account;
- custom claims не используются, роли хранятся в Firestore;
- сложные серверные проверки откладываются.

Blaze можно добавить позже без переделки фронтенда.

## 7. GitHub Pages

Репозиторий: `https://github.com/Tecnika/CreateToy`

Будущий адрес GitHub Pages:

```text
https://tecnika.github.io/CreateToy/
```

После добавления workflow:

1. GitHub → Settings → Pages.
2. Source: **GitHub Actions**.
3. Первый push в `main` запустит сборку и деплой.

Firebase Hosting будет основным адресом, GitHub Pages — зеркалом.

## 8. Безопасность

- `.secrets/` уже в `.gitignore`.
- GitHub-токен был отправлен в чат. После завершения настройки его лучше перевыпустить.
- Пароль администратора был в переписке. При первом входе система потребует его сменить.
- Не храните токены в переменных `VITE_*`: они попадут в браузер.
- Service account JSON нельзя коммитить, публиковать и отправлять в чат.
- Firebase web config не является секретом.

## 9. Следующий шаг

После создания Firebase-проекта и заполнения `FIREBASE_PROJECT_ID`:

1. Я подключаю Auth, Firestore, Storage и Hosting.
2. Создаю доменное ядро и интерфейс.
3. Настраиваю роли, товары, конфигуратор, корзину и заказы.
4. Добавляю темы праздников.
5. Настраиваю GitHub Actions и деплой.

Если Firebase пока нет, можно начать с фронтенда на mock-сервисах, а Firebase подключить позже.
