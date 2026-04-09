'use client';

import React, { useState } from 'react';
import { User, Bell, Search, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  user: {
    full_name: string;
    email: string;
    role: string;
  };
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Topbar = ({ user, onToggleSidebar, isSidebarCollapsed }: TopbarProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    setIsSigningOut(false);
  };

  return (
    <header className="h-20 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-black/10 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#8A9199] hover:text-white hover:border-white/10 transition-all active:scale-95 group"
          title={isSidebarCollapsed ? "Expandir Menú" : "Contraer Menú"}
        >
          <div className="relative w-5 h-5">
             <Menu className={`absolute inset-0 w-5 h-5 transition-all duration-300 md:hidden ${isSidebarCollapsed ? 'opacity-100 rotate-0' : 'opacity-100 rotate-0'}`} />
             <div className="hidden md:block">
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 transition-all duration-300" />
                ) : (
                  <ChevronLeft className="w-5 h-5 transition-all duration-300" />
                )}
             </div>
          </div>
        </button>

        <div className="flex items-center gap-4 group ml-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#3D7BFF] transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#3D7BFF]/50 transition-all w-48 lg:w-80"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <button className="relative text-white/40 hover:text-white transition-colors p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#3D7BFF] rounded-full border-2 border-[#020617]" />
        </button>

        <div className="h-8 w-px bg-white/10 hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 p-1 rounded-full bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center text-[#3D7BFF] font-bold group-hover:scale-105 transition-transform overflow-hidden">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left hidden lg:block pr-4">
              <p className="text-sm font-bold text-white group-hover:text-[#3D7BFF] transition-colors line-clamp-1">{user.full_name}</p>
              <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest leading-none mt-0.5">{user.role}</p>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="p-2.5 md:p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-2xl transition-all disabled:opacity-50 group"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
