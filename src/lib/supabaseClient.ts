import { createClient } from '@supabase/supabase-js';

// Helper to clean and sanitize Supabase URLs to avoid PGRST125 errors (e.g. from /rest/v1 suffix or trailing slashes)
export function cleanSupabaseUrl(url: string): string {
  if (!url) return '';
  let cleaned = url.trim();
  
  // Strip surrounding double or single quotes if present
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  
  // Remove trailing slashes first
  cleaned = cleaned.replace(/\/+$/, '');
  
  // Case-insensitive stripping of /rest/v1, /graphql, /auth/v1, /storage/v1 and everything after them
  const lowercase = cleaned.toLowerCase();
  const pathsToStrip = ['/rest/v1', '/graphql', '/auth/v1', '/storage/v1'];
  
  for (const p of pathsToStrip) {
    const idx = lowercase.indexOf(p);
    if (idx !== -1) {
      cleaned = cleaned.substring(0, idx).replace(/\/+$/, '');
      break;
    }
  }
  
  try {
    const parsed = new URL(cleaned);
    // If it's a standard Supabase hosted URL, return the origin
    if (parsed.hostname.endsWith('.supabase.co')) {
      return parsed.origin;
    }
    return cleaned;
  } catch (e) {
    return cleaned;
  }
}

// Helper to clean Supabase keys (strips surrounding quotes)
export function cleanSupabaseKey(key: string): string {
  if (!key) return '';
  let cleaned = key.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }
  return cleaned;
}

// Static environment fallback
const envUrl = cleanSupabaseUrl(((import.meta as any).env.VITE_SUPABASE_URL || '').trim());
const envKey = cleanSupabaseKey(((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim());
const isEnvActive = !!(envUrl && envKey && envUrl !== 'your-supabase-project-url' && envUrl !== '');

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
  const rawLocalKey = (localStorage.getItem('custom_supabase_anon_key') || '').trim();
  const localKey = cleanSupabaseKey(rawLocalKey);
  
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
