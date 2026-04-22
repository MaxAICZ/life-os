'use client';
import Link from 'next/link';
import type { TreeNode } from '@/lib/types';
import { ArrowRight } from 'lucide-react';

type Props = {
  node: TreeNode;
  childNodes: TreeNode[];
  todoCount: number;
  urgentCount: number;
};

export default function DomainCard({ node, childNodes, todoCount, urgentCount }: Props) {
  return (
    <Link
      href={`/tree?node=${node.id}`}
      className="group glass rounded-2xl p-5 hover:bg-white/[0.07] transition-all hover:scale-[1.02] block"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: `${node.color}22`, border: `1px solid ${node.color}55` }}
        >
          {node.icon}
        </div>
        <ArrowRight size={18} className="text-white/30 group-hover:text-teal-400 group-hover:translate-x-1 transition" />
      </div>
      <h3 className="font-bold text-lg mb-1">{node.name}</h3>
      <div className="text-xs text-white/40 mb-3">
        {childNodes.length} ramas
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {urgentCount > 0 && (
          <span className="chip bg-red-500/20 text-red-300">{urgentCount} urgentes</span>
        )}
        {todoCount > 0 && (
          <span className="chip bg-white/10 text-white/60">{todoCount} pendientes</span>
        )}
        {todoCount === 0 && urgentCount === 0 && (
          <span className="chip bg-teal-400/15 text-teal-300">al día</span>
        )}
      </div>
    </Link>
  );
}
