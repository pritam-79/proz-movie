import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const isValidUrl = supabaseUrl && supabaseUrl.startsWith('http') && !supabaseUrl.includes('your-project');

  if (!isValidUrl || !supabaseKey || supabaseKey === 'your-anon-key-here') {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
