import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://bfjuqmhzczpybbozrpgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmanVxbWh6Y3pweWJib3pycGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTA0ODgsImV4cCI6MjA3NTQ2NjQ4OH0.n8ljnuPDJTmX_KU64p9_QpKjzcDR6fCdPn-z228oqlo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// GET /api/users/wallet/[wallet_address] - Get user by wallet address
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ wallet_address: string }> }
) {
  try {
    const resolvedParams = await params;
    const { wallet_address } = resolvedParams;
    
    if (wallet_address.length !== 44) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', wallet_address)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    console.error('Error in wallet user lookup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
