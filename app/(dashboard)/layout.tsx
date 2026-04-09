import React from 'react';
import { redirect } from 'next/navigation';
import { createServerClientComponent } from '@/lib/supabase-server';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
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
    <DashboardShell 
      role={userProfile.role === 'admin' ? 'admin' : 'client'}
      user={{
        full_name: userProfile.full_name,
        email: userProfile.email,
        role: userProfile.role
      }}
    >
      {children}
    </DashboardShell>
  );
}
