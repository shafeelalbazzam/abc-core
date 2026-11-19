import { createClient } from '@supabase/supabase-js';

export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey =
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    '';

  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('abc_supabase_url') || '' : '';
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('abc_supabase_anon_key') || '' : '';

  const url = (envUrl || localUrl).trim();
  const key = (envKey || localKey).trim();

  return { url, key, isFromEnv: Boolean(envUrl) };
};

export const isSupabaseConfigured = () => {
  const { url, key } = getSupabaseConfig();
  return (
    Boolean(url) &&
    Boolean(key) &&
    !url.includes('your-project-id') &&
    url.startsWith('https://')
  );
};

// Create client dynamically or export instance
export const getSupabaseClient = () => {
  const { url, key } = getSupabaseConfig();
  if (isSupabaseConfigured()) {
    return createClient(url, key);
  }
  return null;
};

export const supabase = getSupabaseClient();

