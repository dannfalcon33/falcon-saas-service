import React from 'react';
import { createServerClientComponent } from '@/lib/supabase-server';
import { getVisits } from '@/lib/actions/admin.actions';
import { VisitTable } from '@/components/admin/VisitTable';
import { redirect } from 'next/navigation';

export default async function AdminVisitsPage() {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: visits, error } = await getVisits();

  if (error) {
    console.error('Error loading visits:', error);
    return <div>Error al cargar visitas.</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Operaciones de Campo
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            Calendario Técnico
          </h1>
          <p className="text-[#8A9199] font-medium italic">Control de despliegue en sitio y soporte correctivo presencial.</p>
        </div>
      </div>

      <VisitTable initialVisits={visits as any || []} />
    </div>
  );
}
