import { createClient } from '@supabase/supabase-js';

// Use hardcoded values for now since .env.local creation is problematic
const supabaseUrl = 'https://bfjuqmhzczpybbozrpgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmanVxbWh6Y3pweWJib3pycGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTA0ODgsImV4cCI6MjA3NTQ2NjQ4OH0.n8ljnuPDJTmX_KU64p9_QpKjzcDR6fCdPn-z228oqlo';

console.log('Supabase client initialized with:', {
  url: supabaseUrl,
  key: `${supabaseAnonKey.substring(0, 20)}...`
});

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

