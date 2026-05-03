import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseUrl = (envUrl && envUrl.trim() !== '') ? envUrl.trim() : 'https://phdpkrkfkprfafxzueoe.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey && supabaseAnonKey.trim() !== ''
  ? createClient(supabaseUrl, supabaseAnonKey.trim()) 
  : null;
