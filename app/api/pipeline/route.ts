import { NextRequest, NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const sb = createServer();
  const { searchParams } = new URL(req.url);
  const node_id = searchParams.get('node_id');
  if (!node_id) return NextResponse.json({ error: 'node_id required' }, { status: 400 });
  const { data, error } = await sb.from('pipeline_items').select('*').eq('node_id', node_id).order('sort_order');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServer();
  const body = await req.json();
  const { node_id, title, stage = 'lead', contact = null, value = null, notes = null } = body;
  if (!node_id || !title) return NextResponse.json({ error: 'node_id+title required' }, { status: 400 });
  const { data, error } = await sb
    .from('pipeline_items')
    .insert({ node_id, title, stage, contact, value, notes })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const sb = createServer();
  const body = await req.json();
  const { id, ...patch } = body;
  patch.updated_at = new Date().toISOString();
  const { data, error } = await sb.from('pipeline_items').update(patch).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const sb = createServer();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await sb.from('pipeline_items').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
