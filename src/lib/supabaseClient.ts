import { createClient } from '@supabase/supabase-js';

// Helper to clean and sanitize Supabase URLs to avoid PGRST125 errors (e.g. from /rest/v1 suffix or trailing slashes)
export function cleanSupabaseUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  
  // If user pasted the rest URL containing /rest/v1, strip it
  if (cleaned.includes('/rest/v1')) {
    cleaned = cleaned.split('/rest/v1')[0];
  }
  
  try {
    const parsed = new URL(cleaned);
    if (parsed.hostname.endsWith('.supabase.co')) {
      return parsed.origin;
    }
    return cleaned.replace(/\/+$/, '');
  } catch (e) {
    return cleaned.replace(/\/+$/, '');
  }
}

// Static environment fallback
const envUrl = cleanSupabaseUrl(((import.meta as any).env.VITE_SUPABASE_URL || '').trim());
const envKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim();
const isEnvActive = !!(envUrl && envKey && envUrl !== 'your-supabase-project-url');

export interface SupabaseConfig {
  url: string;
  key: string;
  isConfigured: boolean;
  source: 'env' | 'local' | 'none';
}

// Dynamically retrieve the current configuration (Dynamic LocalStorage + Env fallback)
export function getSupabaseConfig(): SupabaseConfig {
  const rawLocalUrl = (localStorage.getItem('custom_supabase_url') || '').trim();
  const localUrl = cleanSupabaseUrl(rawLocalUrl);
  const localKey = (localStorage.getItem('custom_supabase_anon_key') || '').trim();
  
  if (localUrl && localKey) {
    return {
      url: localUrl,
      key: localKey,
      isConfigured: true,
      source: 'local'
    };
  }

  if (isEnvActive) {
    return {
      url: envUrl,
      key: envKey,
      isConfigured: true,
      source: 'env'
    };
  }

  return {
    url: '',
    key: '',
    isConfigured: false,
    source: 'none'
  };
}

// Dynamically construct a Client on the fly
export function getSupabaseClient() {
  const config = getSupabaseConfig();
  if (config.isConfigured && config.url && config.key) {
    try {
      return createClient(config.url, config.key);
    } catch (e) {
      console.error('Failed to create Supabase client:', e);
      return null;
    }
  }
  return null;
}

// Maintain backward compatibility static exports
export const isSupabaseConfigured = isEnvActive;
export const supabase = isEnvActive ? createClient(envUrl.replace(/\/+$/, ''), envKey) : null;
