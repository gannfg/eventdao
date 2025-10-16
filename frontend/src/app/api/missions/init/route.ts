import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/utils/server-supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Get active missions
    const { data: missions, error: missionsError } = await serverSupabase
      .from('missions')
      .select('id')
      .eq('is_active', true);

    if (missionsError) throw missionsError;

    const rows = (missions || []).map((m: { id: string }) => ({
      user_id: userId,
      mission_id: m.id,
      status: 'available'
    }));

    if (!rows.length) {
      return NextResponse.json({ success: true, inserted: 0 });
    }

    const { error: insertError } = await serverSupabase
      .from('user_missions')
      .insert(rows);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, inserted: rows.length });
  } catch (err) {
    console.error('init missions error', err);
    return NextResponse.json({ error: 'Failed to initialize missions' }, { status: 500 });
  }
}


