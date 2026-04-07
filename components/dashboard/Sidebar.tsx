'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase';

interface SidebarProps {
  role: 'admin' | 'client';
}

export const Sidebar = ({ role }: SidebarProps) => {
  const pathname = usePathname();
  const supabase = createClient();

  const clientLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pagos', href: '/dashboard/payments', icon: CreditCard },
  ];

  const adminLinks = [
    { name: 'Métricas', href: '/admin', icon: LayoutDashboard },
    { name: 'Clientes', href: '/admin/clients', icon: Users },
    { name: 'Suscripciones', href: '/admin/subscriptions', icon: Calendar },
    { name: 'Pagos Pendientes', href: '/admin/payments', icon: CreditCard },
    { name: 'Incidencias', href: '/admin/incidents', icon: AlertTriangle },
    { name: 'Reportes', href: '/admin/reports', icon: FileText },
  ];

  const links = role === 'admin' ? adminLinks : clientLinks;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#020617] border-r border-white/5 flex flex-col z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-14 bg-black border border-white/10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <Logo className="w-6 h-8" />
        </div>
        <div>
          <h1 className="text-white font-serif font-bold tracking-widest text-lg">FALCON IT</h1>
          <p className="text-[#3D7BFF] text-[10px] font-black uppercase tracking-[0.2em]">{role === 'admin' ? 'Admin Panel' : 'Client Portal'}</p>
        </div>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-2">
        <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Principal</p>
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${
                isActive 
                  ? 'bg-white/5 text-white border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]' 
                  : 'text-[#8A9199] hover:bg-white/[0.02] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <link.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#3D7BFF]' : 'group-hover:text-[#3D7BFF]'}`} />
                <span className="text-sm font-bold tracking-wide">{link.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-[#3D7BFF]" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-white/5 bg-white/[0.01]">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-4 text-[#8A9199] hover:text-red-400 transition-colors font-bold text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
