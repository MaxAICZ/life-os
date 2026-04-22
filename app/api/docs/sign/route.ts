import { NextRequest, NextResponse } from 'next/server';
import { createServer } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const sb = createServer();
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'path required' }, { status: 400 });
  const { data, error } = await sb.storage.from('documents').createSignedUrl(path, 3600);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
