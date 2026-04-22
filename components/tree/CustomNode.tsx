'use client';
import { Handle, Position, NodeProps } from 'reactflow';
import { Plus } from 'lucide-react';

export type CustomNodeData = {
  name: string;
  icon: string;
  color: string;
  isRoot?: boolean;
  todoCount?: number;
  urgentCount?: number;
  onAddChild: (id: string) => void;
  onSelect: (id: string) => void;
};

export default function CustomNode({ id, data, selected }: NodeProps<CustomNodeData>) {
  const ring = selected
    ? `ring-2 ring-teal-400 shadow-glow`
    : data.isRoot
    ? `ring-1 ring-teal-400/60 shadow-glow`
    : `ring-1 ring-white/10`;

  return (
    <div
      className={`group relative rounded-2xl glass ${ring} transition-all hover:scale-[1.03] cursor-pointer`}
      style={{ width: 180 }}
      onClick={() => data.onSelect(id)}
    >
      <Handle type="target" position={Position.Top} />
      <div className="px-3 py-2.5 flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: `${data.color}22`, border: `1px solid ${data.color}55` }}
        >
          {data.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate leading-tight">{data.name}</div>
          {data.todoCount !== undefined && data.todoCount > 0 && (
            <div className="flex gap-1 mt-0.5">
              {data.urgentCount && data.urgentCount > 0 ? (
                <span className="chip bg-red-500/20 text-red-300">
                  {data.urgentCount}!
                </span>
              ) : null}
              <span className="chip bg-white/10 text-white/60">{data.todoCount} todo</span>
            </div>
          )}
        </div>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          data.onAddChild(id);
        }}
        className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-teal-400 text-slate-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-glow hover:scale-110"
        aria-label="Add child"
      >
        <Plus size={16} strokeWidth={3} />
      </button>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
