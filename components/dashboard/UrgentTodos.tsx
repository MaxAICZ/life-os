'use client';
import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import type { Todo, TreeNode } from '@/lib/types';
import Link from 'next/link';

type Props = { nodesById: Record<string, TreeNode> };

export default function UrgentTodos({ nodesById }: Props) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/todos?urgent=1')
      .then((r) => r.json())
      .then((d) => {
        setTodos(d);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="glass rounded-2xl p-6 text-center text-white/40">Cargando urgentes...</div>;

  if (todos.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="text-4xl mb-2">✨</div>
        <div className="text-white/60">Sin to-dos urgentes. Todo bajo control.</div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-white/10 flex items-center gap-2">
        <Flame size={16} className="text-red-400" />
        <span className="font-semibold">Urgentes & por vencer</span>
        <span className="ml-auto text-xs text-white/40">{todos.length}</span>
      </div>
      <ul className="divide-y divide-white/5">
        {todos.map((t) => {
          const node = nodesById[t.node_id];
          return (
            <li key={t.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/5">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{t.title}</div>
                {node && (
                  <Link href={`/tree?node=${node.id}`} className="text-xs text-white/40 hover:text-teal-400">
                    {node.icon} {node.name}
                  </Link>
                )}
              </div>
              {t.due_date && <span className="chip bg-white/10 text-white/60">{t.due_date}</span>}
              <span className="chip bg-red-500/20 text-red-300">{t.priority}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
