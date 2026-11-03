import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { services } from './core/container';
import './styles/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const root: HTMLElement = rootElement;

root.innerHTML = `
  <div class="app-boot" role="status" aria-live="polite">
    <div class="app-boot__card">
      <span class="app-boot__spinner" aria-hidden="true"></span>
      <p class="app-boot__title">CreateToy</p>
      <p class="app-boot__text">Загружаем каталог, настройки и ваш аккаунт…</p>
    </div>
  </div>
`;

async function start() {
  try {
    await services.initialize();
    root.replaceChildren();
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error('CreateToy startup failed:', error);
    const message = error instanceof Error ? error.message : 'Не удалось запустить приложение.';
    root.innerHTML = `
      <div class="app-boot">
        <div class="app-boot__card app-boot__card--error">
          <p class="app-boot__title">Не удалось загрузить сайт</p>
          <p class="app-boot__text" id="app-boot-error"></p>
          <button type="button" class="app-boot__button" id="app-boot-retry">Повторить</button>
        </div>
      </div>
    `;
    const target = document.getElementById('app-boot-error');
    if (target) target.textContent = message;
    document.getElementById('app-boot-retry')?.addEventListener('click', () => window.location.reload());
  }
}

void start();
