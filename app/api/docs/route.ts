import { NextRequest, NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const sb = createServer();
  const { searchParams } = new URL(req.url);
  const node_id = searchParams.get('node_id');
  if (!node_id) return NextResponse.json({ error: 'node_id required' }, { status: 400 });
  const { data, error } = await sb.from('documents').select('*').eq('node_id', node_id).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const sb = createServer();
  const form = await req.formData();
  const file = form.get('file') as File | null;
  const node_id = form.get('node_id') as string | null;
  if (!file || !node_id) return NextResponse.json({ error: 'file+node_id required' }, { status: 400 });

  const path = `${node_id}/${Date.now()}-${file.name}`;
  const { error: upErr } = await sb.storage.from('documents').upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  const { data, error } = await sb
    .from('documents')
    .insert({
      node_id,
      name: file.name,
      storage_path: path,
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest) {
  const sb = createServer();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const { data: doc } = await sb.from('documents').select('storage_path').eq('id', id).single();
  if (doc?.storage_path) await sb.storage.from('documents').remove([doc.storage_path]);
  const { error } = await sb.from('documents').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
