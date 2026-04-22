'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

const COLORS = ['#06D6A0', '#ff6b9d', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'];
const ICONS = ['📁', '⭐', '🎯', '💼', '👥', '📄', '💰', '🏠', '✅', '📝', '🔥', '🌱', '💡', '📈', '🚀', '🧠'];

type Props = {
  parentName: string;
  onClose: () => void;
  onCreate: (data: { name: string; icon: string; color: string }) => Promise<void>;
};

export default function AddNodeModal({ parentName, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState(COLORS[0]);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setSaving(true);
    await onCreate({ name: name.trim(), icon, color });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div
        className="w-full sm:max-w-md glass-strong rounded-t-3xl sm:rounded-2xl p-6 safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wide">Nueva rama en</div>
            <div className="font-semibold">{parentName}</div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Nombre</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Ej: Cliente X, Meta Q2..."
          className="input mb-5"
        />

        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Ícono</label>
        <div className="grid grid-cols-8 gap-1.5 mb-5">
          {ICONS.map((i) => (
            <button
              key={i}
              onClick={() => setIcon(i)}
              className={`aspect-square rounded-lg flex items-center justify-center text-xl transition ${
                icon === i ? 'bg-teal-400/20 ring-2 ring-teal-400' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              {i}
            </button>
          ))}
        </div>

        <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wide">Color</label>
        <div className="flex gap-2 mb-6">
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
            {saving ? 'Creando...' : 'Crear rama'}
          </button>
        </div>
      </div>
    </div>
  );
}
