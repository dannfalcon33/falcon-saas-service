import React from 'react';
import { redirect } from 'next/navigation';
import { createServerClientComponent } from '@/lib/supabase-server';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Topbar } from '@/components/dashboard/Topbar';
import { Profile } from '@/lib/types';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  const userProfile = profile as Profile;

  return (
    <div className="min-h-screen bg-[#050505] text-[#8A9199]">
      <Sidebar role={userProfile.role === 'admin' ? 'admin' : 'client'} />
      
      <div className="pl-72 flex flex-col min-h-screen">
        <Topbar user={{
          full_name: userProfile.full_name,
          email: userProfile.email,
          role: userProfile.role
        }} />
        
        <main className="flex-1 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
