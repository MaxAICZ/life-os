'use client';
import { useEffect, useMemo, useState } from 'react';
import UrgentTodos from '@/components/dashboard/UrgentTodos';
import DomainCard from '@/components/dashboard/DomainCard';
import type { TreeNode, Todo } from '@/lib/types';

export default function DashboardPage() {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch('/api/nodes').then((r) => r.json()), fetch('/api/todos').then((r) => r.json())]).then(
      ([n, t]) => {
        setNodes(n);
        setTodos(t);
        setLoading(false);
      },
    );
  }, []);

  const root = nodes.find((n) => !n.parent_id);
  const domains = root ? nodes.filter((n) => n.parent_id === root.id) : [];
  const nodesById = useMemo(() => Object.fromEntries(nodes.map((n) => [n.id, n])), [nodes]);

  const soon = new Date();
  soon.setDate(soon.getDate() + 2);
  const soonStr = soon.toISOString().slice(0, 10);

  function descendantIds(id: string): string[] {
    const out = [id];
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const c of nodes.filter((n) => n.parent_id === cur)) {
        out.push(c.id);
        stack.push(c.id);
      }
    }
    return out;
  }

  function countsFor(nodeId: string) {
    const ids = new Set(descendantIds(nodeId));
    const relevant = todos.filter((t) => ids.has(t.node_id) && !t.done);
    const urgent = relevant.filter((t) => t.priority === 'urgent' || (t.due_date && t.due_date <= soonStr));
    return { todoCount: relevant.length, urgentCount: urgent.length };
  }

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-8 text-white/40">Cargando...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10 space-y-8 safe-bottom">
      <header>
        <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Life OS · Dashboard</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Hola, Izaak 👋</h1>
        <p className="text-white/50 mt-1 text-sm">
          {todos.filter((t) => !t.done).length} to-dos abiertos · {domains.length} dominios activos
        </p>
      </header>

      <section>
        <UrgentTodos nodesById={nodesById} />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50 mb-3">Dominios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {domains.map((d) => {
            const { todoCount, urgentCount } = countsFor(d.id);
            const children = nodes.filter((n) => n.parent_id === d.id);
            return (
              <DomainCard key={d.id} node={d} childNodes={children} todoCount={todoCount} urgentCount={urgentCount} />
            );
          })}
        </div>
      </section>
    </div>
  );
}
