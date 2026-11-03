# Настройка Windows

Краткая инструкция для локальной разработки CreateToy на Windows 10/11. Общая архитектура и режимы данных описаны в [README](../README.md), Supabase — в [SUPABASE-SETUP.md](SUPABASE-SETUP.md).

## 1. Что установить

- **Node.js 24.12+** — <https://nodejs.org/> или `winget install OpenJS.NodeJS.LTS`.
- **Git** — <https://git-scm.com/download/win>.
- **VS Code** (по желанию) с расширениями ESLint и Tailwind CSS IntelliSense.

Проверка в PowerShell:

```powershell
node --version
npm --version
git --version
```

## 2. Клонирование и зависимости

```powershell
cd D:\GitHub\Sites
git clone https://github.com/Tecnika/CreateToy.git
cd CreateToy
npm install
```

## 3. Переменные окружения

Публичная конфигурация лежит в `.env.local` (файл исключён из git):

```dotenv
VITE_DATA_MODE=supabase
VITE_SUPABASE_URL=https://ztfjefnnkjnsuefplxpg.supabase.co
VITE_SUPABASE_ANON_KEY=ваш_anon_или_publishable_key
VITE_ADMIN_LOGIN=Administrator
VITE_ADMIN_EMAIL=admin@createtoy.local
```

Если `VITE_DATA_MODE` не равен `supabase` или URL/ключ не заданы, приложение работает в демо-режиме на `localStorage`.

Секреты (`service_role`, строка подключения PostgreSQL, пароли сотрудников) хранятся только в `.secrets/supabase.env`. Этот файл нельзя коммитить и нельзя переносить в `VITE_*`: такие переменные попадают в браузер.

Шаблон публичных переменных: [`.env.example`](../.env.example).

## 4. Запуск

```powershell
npm run dev
```

Сайт откроется на <http://127.0.0.1:5173/>. Vite сам перезагружает страницу после изменений.

Полезные команды:

```powershell
npm run typecheck   # проверка TypeScript
npm test            # unit-тесты
npm run build       # production-сборка в dist/
npm run preview     # локальный просмотр dist/
```

## 5. Аккаунты

- Администратор: `Administrator` → `admin@createtoy.local`.
- Менеджер: `manager@createtoy.local`.
- Пароли: только в `.secrets/supabase.env`.
- Демо-режим: `demo1234` для `buyer@createtoy.local`, `manager@createtoy.local` и `admin@createtoy.local`.

## 6. Публикация

GitHub Actions собирает сайт и публикует `dist/` на GitHub Pages:

- workflow: `.github/workflows/deploy-pages.yml`;
- адрес: <https://tecnika.github.io/CreateToy/>;
- для SPA используется `404.html` с перенаправлением на `index.html`.

Публичные `VITE_*` уже прописаны в workflow. Секреты в CI не добавляются.

## 7. Частые проблемы

**PowerShell не запускает `npm`**

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Порт 5173 занят**

```powershell
npm run dev -- --port 5174
```

**Сайт долго грузится**

Бесплатный проект Supabase засыпает после 7 дней без запросов. Первый запрос может занять несколько секунд; клиент автоматически показывает ошибку, если сервер не ответил за 15 секунд.

**После регистрации не пускает в аккаунт**

В Supabase включено подтверждение email. Отключите **Authentication → Providers → Email → Confirm email** или подтвердите письмо.

**Кнопки Google/GitHub возвращают ошибку**

Провайдеры не настроены. Инструкция — в [SUPABASE-SETUP.md](SUPABASE-SETUP.md).
