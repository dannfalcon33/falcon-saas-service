'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase';

export const LogoutButton = () => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Refresh to trigger middleware/server component re-evaluation
    router.push('/login');
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
    >
      <LogOut className="w-3.5 h-3.5" />
      Cerrar Sesión
    </button>
  );
};
