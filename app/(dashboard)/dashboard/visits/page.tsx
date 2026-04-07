import React from 'react';
import { createServerClientComponent } from '@/lib/supabase-server';
import { getClientVisits } from '@/lib/actions/dashboard.actions';
import { ClientVisitView } from '@/components/dashboard/ClientVisitView';
import { redirect } from 'next/navigation';

export default async function ClientVisitsPage() {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // We need the client_id for this profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, clients:clients(id)')
    .eq('id', user.id)
    .single();

  const clientId = profile?.clients?.[0]?.id;

  if (!clientId) {
    return (
      <div className="p-12 text-center bg-white/5 border border-white/5 rounded-[2.5rem]">
        <p className="text-white/40 font-serif italic tracking-widest uppercase">No hay información de cliente asociada a esta cuenta.</p>
      </div>
    );
  }

  const { data: visits, error } = await getClientVisits(clientId);

  if (error) {
    console.error('Error loading client visits:', error);
    return <div>Error al cargar visitas.</div>;
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3D7BFF]/10 rounded-full border border-[#3D7BFF]/20 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
          Transparencia en el Servicio
        </div>
        <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
          Mis Visitas Técnicas
        </h1>
        <p className="text-[#8A9199] font-medium italic">Agenda detallada de mantenimiento y soporte presencial programado.</p>
      </div>

      <ClientVisitView visits={visits || []} />
    </div>
  );
}
