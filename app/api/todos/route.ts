import { NextRequest, NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const sb = createServer();
  const { searchParams } = new URL(req.url);
  const node_id = searchParams.get('node_id');
  const urgent = searchParams.get('urgent');

  let q = sb.from('todos').select('*').order('done', { ascending: true }).order('created_at', { ascending: false });
  if (node_id) q = q.eq('node_id', node_id);
  if (urgent === '1') {
    const today = new Date();
    const soon = new Date(today);
    soon.setDate(today.getDate() + 2);
    q = q.eq('done', false).or(`priority.eq.urgent,due_date.lte.${soon.toISOString().slice(0, 10)}`);
  }
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServer();
  const body = await req.json();
  const { node_id, title, priority = 'normal', due_date = null } = body;
  if (!node_id || !title) return NextResponse.json({ error: 'node_id+title required' }, { status: 400 });
  const { data, error } = await sb.from('todos').insert({ node_id, title, priority, due_date }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest) {
  const sb = createServer();
  const body = await req.json();
  const { id, ...patch } = body;
  const { data, error } = await sb.from('todos').update(patch).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const sb = createServer();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { error } = await sb.from('todos').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
