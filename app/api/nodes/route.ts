import { NextRequest, NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase';

export async function GET() {
  const sb = createServer();
  const { data, error } = await sb.from('nodes').select('*').order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServer();
  const body = await req.json();
  const { parent_id, name, icon, color } = body;
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const { data, error } = await sb
    .from('nodes')
    .insert({ parent_id: parent_id ?? null, name, icon: icon || '📁', color: color || '#06D6A0' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const sb = createServer();
  const body = await req.json();
  const { id, ...patch } = body;
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { data, error } = await sb.from('nodes').update(patch).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const sb = createServer();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await sb.from('nodes').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
