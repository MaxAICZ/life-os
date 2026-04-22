'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import type { TreeNode } from '@/lib/types';

const COLORS = ['#06D6A0', '#ff6b9d', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ef4444', '#eab308'];
const ICONS = ['📁', '⭐', '🎯', '💼', '👥', '📄', '💰', '🏠', '✅', '📝', '🔥', '🌱', '💡', '📈', '🚀', '🧠', '💝', '💍', '✨', '💬', '🏢', '🏦', '🌐', '🇻🇪', '💸', '💪', '🎨', '🎵', '🍎', '☕', '🧘', '📚'];

type Props = {
  node: TreeNode;
  onClose: () => void;
  onSave: (data: { name: string; icon: string; color: string }) => Promise<void>;
};

export default function EditNodeModal({ node, onClose, onSave }: Props) {
  const [name, setName] = useState(node.name);
  const [icon, setIcon] = useState(node.icon);
  const [color, setColor] = useState(node.color);
  const [customIcon, setCustomIcon] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), icon: icon || '📁', color });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-md glass-strong rounded-t-3xl sm:rounded-2xl p-6 safe-bottom max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wide">Editar rama</div>
            <div className="font-semibold">{node.name}</div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Nombre</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="input mb-5"
        />

        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Ícono</label>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-white/5 border border-white/10 shrink-0">
            {icon}
          </div>
          <input
            value={customIcon}
            onChange={(e) => {
              setCustomIcon(e.target.value);
              if (e.target.value) setIcon(e.target.value);
            }}
            placeholder="Pega cualquier emoji 🧩"
            className="input flex-1"
          />
        </div>
        <div className="grid grid-cols-8 gap-1.5 mb-5">
          {ICONS.map((i) => (
            <button
              key={i}
              onClick={() => { setIcon(i); setCustomIcon(''); }}
              className={`aspect-square rounded-lg flex items-center justify-center text-xl transition ${
                icon === i && !customIcon ? 'bg-teal-400/20 ring-2 ring-teal-400' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {i}
            </button>
          ))}
        </div>

        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Color</label>
        <div className="flex gap-2 mb-6 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full transition ${color === c ? 'ring-2 ring-white scale-110' : ''}`}
              style={{ background: c }}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">Cancelar</button>
          <button onClick={submit} disabled={!name.trim() || saving} className="btn-primary flex-1 disabled:opacity-50">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
