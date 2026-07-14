import { createClient } from '@supabase/supabase-js';

// Static environment fallback
const envUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim();
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
  const localUrl = (localStorage.getItem('custom_supabase_url') || '').trim();
  const localKey = (localStorage.getItem('custom_supabase_anon_key') || '').trim();
  
  if (localUrl && localKey) {
    return {
      url: localUrl.replace(/\/+$/, ''),
      key: localKey,
      isConfigured: true,
      source: 'local'
    };
  }

  if (isEnvActive) {
    return {
      url: envUrl.replace(/\/+$/, ''),
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
