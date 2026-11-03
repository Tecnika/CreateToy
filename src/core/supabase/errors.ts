export function supabaseError(error: unknown, fallback: string): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String((error as { message: unknown }).message).trim();
    const code = 'code' in error ? String((error as { code: unknown }).code) : '';
    if (code === '42501' || /row-level security|permission denied/i.test(message)) {
      return new Error('Недостаточно прав для этого действия.');
    }
    if (message) return new Error(message);
  }
  return new Error(fallback);
}

export function mapAuthError(error: unknown): Error {
  const fallback = 'Не удалось выполнить вход. Попробуйте ещё раз.';
  const original = supabaseError(error, fallback);
  const message = original.message.toLowerCase();
  if (message.includes('invalid login credentials')) {
    return new Error('Неверный email или пароль.');
  }
  if (message.includes('email not confirmed')) {
    return new Error('Email ещё не подтверждён. Перейдите по ссылке из письма и попробуйте снова.');
  }
  if (message.includes('user already registered')) {
    return new Error('Аккаунт с таким email уже существует. Войдите или восстановите пароль.');
  }
  if (message.includes('password should be at least')) {
    return new Error('Пароль должен быть не короче 6 символов.');
  }
  if (message.includes('rate limit')) {
    return new Error('Слишком много попыток. Подождите минуту и попробуйте снова.');
  }
  return original;
}
