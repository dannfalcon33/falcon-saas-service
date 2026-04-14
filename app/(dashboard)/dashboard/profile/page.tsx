import React from 'react';
import { redirect } from 'next/navigation';
import { createServerClientComponent } from '@/lib/supabase-server';
import { getClientProfilePanelData } from '@/lib/actions/dashboard.actions';
import { ProfileSettingsPanel } from '@/components/dashboard/ProfileSettingsPanel';

export default async function ClientProfilePage() {
  const supabase = await createServerClientComponent();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect('/login');
  }

  const { data, error } = await getClientProfilePanelData();
  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif font-bold text-white">Perfil</h1>
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error || 'No se pudo cargar tu perfil.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3D7BFF]/10 rounded-full border border-[#3D7BFF]/20 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest">
          Panel de Perfil
        </div>
        <h1 className="text-4xl font-serif font-bold text-white tracking-tight">Configuración de Usuario</h1>
        <p className="text-[#8A9199] font-medium italic">Actualiza tu información personal y datos administrativos visibles en el portal.</p>
      </div>

      <ProfileSettingsPanel initialData={data} />
    </div>
  );
}
