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
  ChevronRight,
  Package,
  X
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { createClient } from '@/lib/supabase';

interface SidebarProps {
  role: 'admin' | 'client';
  isCollapsed?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar = ({ role, isCollapsed = false, onCloseMobile }: SidebarProps) => {
  const pathname = usePathname();
  const supabase = createClient();

  const clientLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mis Visitas', href: '/dashboard/visits', icon: Calendar },
    { name: 'Mis Pagos', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Incidencias', href: '/dashboard/incidents', icon: AlertTriangle },
    { name: 'Reportes de Servicios', href: '/dashboard/reports', icon: FileText },
  ];

  const adminLinks = [
    { name: 'Métricas', href: '/admin', icon: LayoutDashboard },
    { name: 'Prospectos', href: '/admin/leads', icon: Users },
    { name: 'Clientes', href: '/admin/clients', icon: Users },
    { name: 'Suscripciones', href: '/admin/subscriptions', icon: Package },
    { name: 'Agenda Visitas', href: '/admin/visits', icon: Calendar },
    { name: 'Validar Pagos', href: '/admin/payments', icon: CreditCard },
    { name: 'Tickets Soporte', href: '/admin/incidents', icon: AlertTriangle },
    { name: 'Reportes de Servicios', href: '/admin/reports', icon: FileText },
  ];

  const links = role === 'admin' ? adminLinks : clientLinks;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <aside className={`h-screen bg-[#020617] border-r border-white/5 flex flex-col transition-all duration-300 relative`}>
      {/* Mobile Close Button */}
      {onCloseMobile && (
        <button 
          onClick={onCloseMobile}
          className="absolute top-6 -right-12 md:hidden p-2 bg-[#020617] text-white/40 rounded-r-xl border-y border-r border-white/5"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Logo Section */}
      <div className={`p-8 flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-14 bg-black border border-white/10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.1)] shrink-0">
          <Logo className="w-6 h-8" />
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <h1 className="text-white font-serif font-bold tracking-widest text-lg">FALCON IT</h1>
            <p className="text-[#3D7BFF] text-[10px] font-black uppercase tracking-[0.2em]">
              {role === 'admin' ? 'Admin Panel' : 'Client Portal'}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`flex-1 px-4 mt-4 space-y-2 overflow-y-auto custom-scrollbar`}>
        {!isCollapsed && (
          <p className="px-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4 animate-in fade-in duration-300">
            Principal
          </p>
        )}
        
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              title={isCollapsed ? link.name : ''}
              className={`flex items-center p-4 rounded-2xl transition-all group overflow-hidden ${
                isActive 
                  ? 'bg-white/5 text-white border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]' 
                  : 'text-[#8A9199] hover:bg-white/[0.02] hover:text-white border border-transparent'
              } ${isCollapsed ? 'justify-center p-4' : 'justify-between'}`}
            >
              <div className="flex items-center gap-3">
                <link.icon className={`w-5 h-5 transition-colors shrink-0 ${isActive ? 'text-[#3D7BFF]' : 'group-hover:text-[#3D7BFF]'}`} />
                {!isCollapsed && (
                  <span className="text-sm font-bold tracking-wide animate-in fade-in slide-in-from-left-2 duration-300">{link.name}</span>
                )}
              </div>
              {!isCollapsed && isActive && (
                <ChevronRight className="w-4 h-4 text-[#3D7BFF] animate-in fade-in slide-in-from-left-2 duration-300" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`p-6 border-t border-white/5 bg-white/[0.01] ${isCollapsed ? 'flex justify-center' : ''}`}>
        <button 
          onClick={handleLogout}
          title={isCollapsed ? 'Cerrar Sesión' : ''}
          className={`flex items-center gap-3 p-4 text-[#8A9199] hover:text-red-400 transition-colors font-bold text-sm w-full group rounded-2xl ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform shrink-0" />
          {!isCollapsed && (
            <span className="animate-in fade-in duration-300">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </aside>
  );
};
