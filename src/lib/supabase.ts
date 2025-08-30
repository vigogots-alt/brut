import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Добавляем логирование для отладки
console.log("VITE_SUPABASE_URL:", supabaseUrl);
console.log("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  // Выбрасываем ошибку, чтобы она была видна в консоли браузера
  throw new Error("Supabase URL or Anon Key is not set. Please check your .env.local file and ensure the app is restarted.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);