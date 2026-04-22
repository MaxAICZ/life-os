'use client';
import { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Download, FileIcon } from 'lucide-react';
import type { DocumentRow } from '@/lib/types';

export default function DocsTab({ nodeId }: { nodeId: string }) {
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const r = await fetch(`/api/docs?node_id=${nodeId}`);
    setDocs(await r.json());
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, [nodeId]);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('node_id', nodeId);
      await fetch('/api/docs', { method: 'POST', body: fd });
    }
    setUploading(false);
    load();
  }

  async function del(id: string) {
    if (!confirm('Eliminar este documento?')) return;
    await fetch(`/api/docs?id=${id}`, { method: 'DELETE' });
    setDocs((p) => p.filter((d) => d.id !== id));
  }

  async function download(path: string) {
    const r = await fetch(`/api/docs/sign?path=${encodeURIComponent(path)}`);
    const { url } = await r.json();
    window.open(url, '_blank');
  }

  function formatSize(b: number | null) {
    if (!b) return '';
    if (b < 1024) return `${b}B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
    return `${(b / 1024 / 1024).toFixed(1)}MB`;
  }

  return (
    <div className="p-5 space-y-3">
      <button
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full glass rounded-xl p-6 border-2 border-dashed border-white/15 hover:border-teal-400/60 hover:bg-teal-400/5 transition flex flex-col items-center gap-2 text-white/60"
      >
        <Upload size={24} />
        <span className="text-sm font-medium">{uploading ? 'Subiendo...' : 'Subir documentos'}</span>
        <span className="text-xs text-white/40">Click o arrastra archivos aquí</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        multiple
        hidden
        onChange={(e) => upload(e.target.files)}
      />

      {loading ? (
        <div className="text-center text-white/40 text-sm py-8">Cargando...</div>
      ) : docs.length === 0 ? (
        <div className="text-center text-white/40 text-sm py-8">Sin documentos</div>
      ) : (
        <ul className="space-y-1.5">
          {docs.map((d) => (
            <li key={d.id} className="group glass rounded-xl p-3 flex items-center gap-3">
              <FileIcon size={18} className="text-white/50 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{d.name}</div>
                <div className="text-xs text-white/40">{formatSize(d.size_bytes)}</div>
              </div>
              <button onClick={() => download(d.storage_path)} className="text-white/50 hover:text-teal-400">
                <Download size={16} />
              </button>
              <button onClick={() => del(d.id)} className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
