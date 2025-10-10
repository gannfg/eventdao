import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Initialize Supabase client
const supabaseUrl = 'https://bfjuqmhzczpybbozrpgz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmanVxbWh6Y3pweWJib3pycGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTA0ODgsImV4cCI6MjA3NTQ2NjQ4OH0.n8ljnuPDJTmX_KU64p9_QpKjzcDR6fCdPn-z228oqlo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Validation schemas
const userIdSchema = z.object({
  id: z.string().uuid(),
});

const updateUserSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  wallet_address: z.string().length(44, 'Wallet address must be 44 characters').optional(),
});

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = userIdSchema.parse({ id: resolvedParams.id });
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = userIdSchema.parse({ id: resolvedParams.id });
    const body = await request.json();
    const updateData = updateUserSchema.parse(body);
    
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      if (error.code === '23505') {
        return NextResponse.json({ 
          error: 'User with this username or wallet address already exists' 
        }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.issues 
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = userIdSchema.parse({ id: resolvedParams.id });
    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid user ID format' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
