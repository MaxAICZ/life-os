'use client';
import { useEffect, useState } from 'react';
import { Flame, Trash2, Plus } from 'lucide-react';
import type { Todo, Priority } from '@/lib/types';

const PRIORITY_COLORS: Record<Priority, string> = {
  urgent: 'bg-red-500/20 text-red-300',
  high: 'bg-orange-500/20 text-orange-300',
  normal: 'bg-white/10 text-white/50',
  low: 'bg-white/5 text-white/40',
};

export default function TodosTab({ nodeId, onChange }: { nodeId: string; onChange?: () => void }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch(`/api/todos?node_id=${nodeId}`);
    setTodos(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    setLoading(true);
    load();
  }, [nodeId]);

  async function add() {
    if (!title.trim()) return;
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ node_id: nodeId, title: title.trim(), priority }),
    });
    const t: Todo = await res.json();
    setTodos((p) => [t, ...p]);
    setTitle('');
    setPriority('normal');
    onChange?.();
  }

  async function toggle(t: Todo) {
    await fetch('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, done: !t.done }),
    });
    setTodos((p) => p.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
    onChange?.();
  }

  async function updatePriority(t: Todo) {
    const order: Priority[] = ['normal', 'high', 'urgent', 'low'];
    const next = order[(order.indexOf(t.priority) + 1) % order.length];
    await fetch('/api/todos', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: t.id, priority: next }),
    });
    setTodos((p) => p.map((x) => (x.id === t.id ? { ...x, priority: next } : x)));
    onChange?.();
  }

  async function del(id: string) {
    await fetch(`/api/todos?id=${id}`, { method: 'DELETE' });
    setTodos((p) => p.filter((x) => x.id !== id));
    onChange?.();
  }

  return (
    <div className="p-5 space-y-3">
      <div className="glass rounded-xl p-3 space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="Agregar to-do..."
          className="w-full bg-transparent outline-none text-sm placeholder-white/30"
        />
        <div className="flex items-center justify-between">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="bg-white/5 text-xs rounded-lg px-2 py-1 border border-white/10 outline-none"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          <button onClick={add} disabled={!title.trim()} className="btn-primary text-xs py-1.5 px-3 disabled:opacity-40">
            <Plus size={14} /> Agregar
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-white/40 text-sm py-8">Cargando...</div>
      ) : todos.length === 0 ? (
        <div className="text-center text-white/40 text-sm py-8">Sin to-dos todavía</div>
      ) : (
        <ul className="space-y-1.5">
          {todos.map((t) => (
            <li
              key={t.id}
              className={`group glass rounded-xl p-3 flex items-start gap-3 transition ${t.done ? 'opacity-50' : ''}`}
            >
              <button
                onClick={() => toggle(t)}
                className={`mt-0.5 w-5 h-5 rounded-md border shrink-0 flex items-center justify-center transition ${
                  t.done ? 'bg-teal-400 border-teal-400' : 'border-white/30 hover:border-teal-400'
                }`}
              >
                {t.done && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-6" stroke="#0a0f1e" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </button>
              <div className="flex-1 min-w-0">
                <div className={`text-sm ${t.done ? 'line-through text-white/40' : ''}`}>{t.title}</div>
                <div className="flex gap-1.5 mt-1">
                  <button onClick={() => updatePriority(t)} className={`chip ${PRIORITY_COLORS[t.priority]}`}>
                    {t.priority === 'urgent' && <Flame size={10} />}
                    {t.priority}
                  </button>
                  {t.due_date && <span className="chip bg-white/5 text-white/40">{t.due_date}</span>}
                </div>
              </div>
              <button onClick={() => del(t.id)} className="text-white/30 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
