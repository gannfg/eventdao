import { createClient } from '@supabase/supabase-js';

// Prefer environment variables; fall back to hardcoded only if missing (local only)
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const envAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const fallbackUrl = 'https://bfjuqmhzczpybbozrpgz.supabase.co';
const fallbackAnon = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmanVxbWh6Y3pweWJib3pycGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTA0ODgsImV4cCI6MjA3NTQ2NjQ4OH0.n8ljnuPDJTmX_KU64p9_QpKjzcDR6fCdPn-z228oqlo';

const supabaseUrl = envUrl || fallbackUrl;
const supabaseAnonKey = envAnon || fallbackAnon;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

