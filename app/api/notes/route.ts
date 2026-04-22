import { NextRequest, NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const sb = createServer();
  const { searchParams } = new URL(req.url);
  const node_id = searchParams.get('node_id');
  if (!node_id) return NextResponse.json({ error: 'node_id required' }, { status: 400 });
  const { data, error } = await sb.from('notes').select('*').eq('node_id', node_id).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? { node_id, content: '' });
}

export async function PUT(req: NextRequest) {
  const sb = createServer();
  const body = await req.json();
  const { node_id, content } = body;
  if (!node_id) return NextResponse.json({ error: 'node_id required' }, { status: 400 });
  const { data, error } = await sb
    .from('notes')
    .upsert({ node_id, content, updated_at: new Date().toISOString() }, { onConflict: 'node_id' })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
