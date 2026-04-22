'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Network } from 'lucide-react';

export default function NavBar() {
  const path = usePathname();
  const isTree = path?.startsWith('/tree');
  return (
    <header className="fixed top-0 inset-x-0 z-40 h-16 glass-strong border-b border-white/10 safe-top">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-400/90 text-slate-900 flex items-center justify-center font-bold text-sm shadow-glow">
            ∞
          </div>
          <span className="font-semibold tracking-tight">Life OS</span>
        </Link>
        <nav className="flex gap-1">
          <Link
            href="/"
            className={`btn ${!isTree ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <LayoutDashboard size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link
            href="/tree"
            className={`btn ${isTree ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <Network size={16} />
            <span className="hidden sm:inline">Árbol</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
