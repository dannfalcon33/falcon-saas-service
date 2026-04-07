'use client';

import React, { useState } from 'react';
import { User, Bell, Search, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface TopbarProps {
  user: {
    full_name: string;
    email: string;
    role: string;
  };
}

export const Topbar = ({ user }: TopbarProps) => {
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
    <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-black/10 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4 group">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#3D7BFF] transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#3D7BFF]/50 transition-all w-64 md:w-80"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative text-white/40 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#3D7BFF] rounded-full border-2 border-black" />
        </button>

        <div className="h-8 w-px bg-white/10 hidden md:block" />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 p-1.5 pr-4 rounded-full bg-white/5 border border-white/5 hover:border-white/10 transition-all group">
            <div className="w-10 h-10 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center text-[#3D7BFF] font-bold group-hover:scale-105 transition-transform overflow-hidden">
              <User className="w-5 h-5" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-bold text-white group-hover:text-[#3D7BFF] transition-colors line-clamp-1">{user.full_name}</p>
              <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest">{user.role}</p>
            </div>
          </div>

          <button 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-2xl transition-all disabled:opacity-50 group"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
