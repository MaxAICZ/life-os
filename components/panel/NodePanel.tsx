'use client';
import { useEffect, useState } from 'react';
import { X, CheckSquare, FileText, Paperclip, KanbanSquare, Trash2, ChevronRight, Pencil } from 'lucide-react';
import type { TreeNode } from '@/lib/types';
import TodosTab from './TodosTab';
import NotesTab from './NotesTab';
import DocsTab from './DocsTab';
import PipelineTab from './PipelineTab';
import EditNodeModal from '@/components/tree/EditNodeModal';

type Tab = 'todos' | 'notes' | 'docs' | 'pipeline';

type Props = {
  node: TreeNode;
  allNodes: TreeNode[];
  onClose: () => void;
  onDeleted: (id: string) => void;
  onTodoChange: () => void;
  onUpdated?: (n: TreeNode) => void;
};

function breadcrumb(node: TreeNode, all: TreeNode[]): TreeNode[] {
  const path: TreeNode[] = [];
  let cur: TreeNode | undefined = node;
  while (cur) {
    path.unshift(cur);
    cur = cur.parent_id ? all.find((n) => n.id === cur!.parent_id) : undefined;
  }
  return path;
}

export default function NodePanel({ node, allNodes, onClose, onDeleted, onTodoChange, onUpdated }: Props) {
  const [tab, setTab] = useState<Tab>('todos');
  const [editing, setEditing] = useState(false);
  const crumbs = breadcrumb(node, allNodes);

  async function handleEdit(data: { name: string; icon: string; color: string }) {
    const res = await fetch('/api/nodes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: node.id, ...data }),
    });
    const updated: TreeNode = await res.json();
    onUpdated?.(updated);
  }

  useEffect(() => {
    const saved = localStorage.getItem(`tab-${node.id}`);
    if (saved) setTab(saved as Tab);
  }, [node.id]);

  useEffect(() => {
    localStorage.setItem(`tab-${node.id}`, tab);
  }, [tab, node.id]);

  async function handleDelete() {
    if (!confirm(`Eliminar "${node.name}" y todos sus hijos?`)) return;
    await fetch(`/api/nodes?id=${node.id}`, { method: 'DELETE' });
    onDeleted(node.id);
  }

  const tabs: { id: Tab; label: string; icon: typeof CheckSquare }[] = [
    { id: 'todos', label: 'To-dos', icon: CheckSquare },
    { id: 'notes', label: 'Notas', icon: FileText },
    { id: 'docs', label: 'Docs', icon: Paperclip },
    { id: 'pipeline', label: 'Pipeline', icon: KanbanSquare },
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 z-40 w-full sm:w-[440px] glass-strong border-l border-white/10 flex flex-col safe-top">
        <div className="p-5 pt-20 sm:pt-5 border-b border-white/10">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setEditing(true)}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 hover:ring-2 hover:ring-teal-400/60 transition"
                style={{ background: `${node.color}22`, border: `1px solid ${node.color}55` }}
                title="Editar icono"
              >
                {node.icon}
              </button>
              <div className="min-w-0">
                <h2 className="text-lg font-bold truncate">{node.name}</h2>
                <div className="flex items-center gap-0.5 text-xs text-white/40 truncate">
                  {crumbs.slice(0, -1).map((c, i) => (
                    <span key={c.id} className="flex items-center gap-0.5">
                      <span className="truncate">{c.name}</span>
                      {i < crumbs.length - 2 && <ChevronRight size={10} />}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing(true)} className="p-2 rounded-lg text-white/50 hover:text-teal-400 hover:bg-teal-400/10" title="Editar">
                <Pencil size={18} />
              </button>
              {node.parent_id && (
                <button onClick={handleDelete} className="p-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10">
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={onClose} className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex gap-1 bg-white/5 rounded-xl p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition ${
                  tab === id ? 'bg-white/10 text-white shadow' : 'text-white/50 hover:text-white/80'
                }`}
              >
                <Icon size={14} />
                <span className="hidden xs:inline sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {tab === 'todos' && <TodosTab nodeId={node.id} onChange={onTodoChange} />}
          {tab === 'notes' && <NotesTab nodeId={node.id} />}
          {tab === 'docs' && <DocsTab nodeId={node.id} />}
          {tab === 'pipeline' && <PipelineTab nodeId={node.id} />}
        </div>
      </aside>
      {editing && <EditNodeModal node={node} onClose={() => setEditing(false)} onSave={handleEdit} />}
    </>
  );
}
