import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type DataMode = 'demo' | 'supabase';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function readSupabaseConfig(): SupabaseConfig | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  if (!url || !anonKey) return null;
  if (anonKey.startsWith('sb_secret_') || anonKey.toLowerCase().includes('service_role')) {
    throw new Error('В VITE_SUPABASE_ANON_KEY попал секретный ключ. Используйте только anon / publishable key.');
  }
  return { url: url.replace(/\/$/, ''), anonKey };
}

export function resolveDataMode(): DataMode {
  const configured = (import.meta.env.VITE_DATA_MODE as string | undefined)?.trim().toLowerCase();
  return configured === 'supabase' ? 'supabase' : 'demo';
}

const REQUEST_TIMEOUT_MS = 15_000;
const TIMEOUT_MESSAGE = 'Сервер не ответил вовремя. Проверьте подключение и повторите.';

type FetchInput = Parameters<typeof fetch>[0];

function isTimeout(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
}

async function requestWithTimeout(input: FetchInput, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new DOMException(TIMEOUT_MESSAGE, 'TimeoutError'));
  }, REQUEST_TIMEOUT_MS);
  const externalSignal = init?.signal;
  const forwardAbort = () => controller.abort(externalSignal?.reason);

  if (externalSignal) {
    if (externalSignal.aborted) forwardAbort();
    else externalSignal.addEventListener('abort', forwardAbort, { once: true });
  }

  try {
    const response = await fetch(input, {
      ...init,
      credentials: init?.credentials ?? 'omit',
      signal: controller.signal,
    });
    const body = response.status === 204 || response.status === 304 ? null : await response.arrayBuffer();
    const headers = new Headers(response.headers);
    headers.delete('content-encoding');
    headers.delete('content-length');
    headers.delete('transfer-encoding');

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener('abort', forwardAbort);
  }
}

async function fetchWithTimeout(input: FetchInput, init?: RequestInit): Promise<Response> {
  const method = (init?.method ?? 'GET').toUpperCase();

  try {
    return await requestWithTimeout(input, init);
  } catch (error) {
    if (method !== 'GET' || init?.signal?.aborted || !isTimeout(error)) {
      throw isTimeout(error) ? new Error(TIMEOUT_MESSAGE) : error;
    }
    try {
      return await requestWithTimeout(input, init);
    } catch (retryError) {
      throw isTimeout(retryError) ? new Error(TIMEOUT_MESSAGE) : retryError;
    }
  }
}

export function createSupabaseClient(config: SupabaseConfig): SupabaseClient {
  return createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: fetchWithTimeout,
    },
  });
}
