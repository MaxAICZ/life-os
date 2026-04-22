'use client';
import { useEffect, useRef, useState } from 'react';

export default function NotesTab({ nodeId }: { nodeId: string }) {
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [loading, setLoading] = useState(true);
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/notes?node_id=${nodeId}`)
      .then((r) => r.json())
      .then((d) => {
        setContent(d.content ?? '');
        setLoading(false);
      });
  }, [nodeId]);

  function onChange(value: string) {
    setContent(value);
    setStatus('saving');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ node_id: nodeId, content: value }),
      });
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1200);
    }, 700);
  }

  return (
    <div className="p-5 h-full flex flex-col">
      <div className="text-xs text-white/40 mb-2 h-4">
        {status === 'saving' && 'Guardando...'}
        {status === 'saved' && '✓ Guardado'}
      </div>
      {loading ? (
        <div className="text-center text-white/40 text-sm py-8">Cargando...</div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe tus notas aquí..."
          className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-white/30 outline-none focus:border-teal-400/60 resize-none"
        />
      )}
    </div>
  );
}
