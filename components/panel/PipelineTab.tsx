'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { PipelineItem, PipelineStage } from '@/lib/types';

const STAGES: { id: PipelineStage; label: string; color: string }[] = [
  { id: 'lead', label: 'Lead', color: '#3b82f6' },
  { id: 'active', label: 'Active', color: '#f59e0b' },
  { id: 'closed', label: 'Closed', color: '#06D6A0' },
  { id: 'lost', label: 'Lost', color: '#ef4444' },
];

export default function PipelineTab({ nodeId }: { nodeId: string }) {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<PipelineStage | null>(null);
  const [newTitle, setNewTitle] = useState('');

  async function load() {
    const r = await fetch(`/api/pipeline?node_id=${nodeId}`);
    setItems(await r.json());
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, [nodeId]);

  async function add(stage: PipelineStage) {
    if (!newTitle.trim()) return;
    const r = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node_id: nodeId, title: newTitle.trim(), stage }),
    });
    const it: PipelineItem = await r.json();
    setItems((p) => [...p, it]);
    setNewTitle('');
    setAdding(null);
  }

  async function move(item: PipelineItem, stage: PipelineStage) {
    await fetch('/api/pipeline', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, stage }),
    });
    setItems((p) => p.map((x) => (x.id === item.id ? { ...x, stage } : x)));
  }

  async function del(id: string) {
    await fetch(`/api/pipeline?id=${id}`, { method: 'DELETE' });
    setItems((p) => p.filter((x) => x.id !== id));
  }

  if (loading) return <div className="p-5 text-center text-white/40 text-sm">Cargando...</div>;

  return (
    <div className="p-5 space-y-4">
      {STAGES.map((s) => {
        const stageItems = items.filter((i) => i.stage === s.id);
        return (
          <div key={s.id} className="glass rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-xs font-semibold uppercase tracking-wide">{s.label}</span>
                <span className="text-xs text-white/40">({stageItems.length})</span>
              </div>
              <button onClick={() => setAdding(s.id)} className="text-white/50 hover:text-teal-400">
                <Plus size={16} />
              </button>
            </div>

            {adding === s.id && (
              <div className="flex gap-2 mb-2">
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') add(s.id);
                    if (e.key === 'Escape') { setAdding(null); setNewTitle(''); }
                  }}
                  placeholder="Nombre..."
                  className="input text-xs py-1.5"
                />
                <button onClick={() => add(s.id)} className="btn-primary text-xs py-1.5 px-3">OK</button>
              </div>
            )}

            <ul className="space-y-1.5">
              {stageItems.map((it) => (
                <li key={it.id} className="group bg-white/5 rounded-lg p-2.5 flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate">{it.title}</div>
                    {it.contact && <div className="text-xs text-white/40">{it.contact}</div>}
                    {it.value != null && <div className="text-xs text-teal-400">${it.value.toLocaleString()}</div>}
                  </div>
                  <select
                    value={it.stage}
                    onChange={(e) => move(it, e.target.value as PipelineStage)}
                    className="bg-transparent text-xs outline-none text-white/50"
                  >
                    {STAGES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
                  </select>
                  <button onClick={() => del(it.id)} className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
