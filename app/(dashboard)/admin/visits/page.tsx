import React from 'react';
import { createServerClientComponent } from '@/lib/supabase-server';
import { getVisitRequests, getVisits } from '@/lib/actions/admin.actions';
import { VisitTable } from '@/components/admin/VisitTable';
import { redirect } from 'next/navigation';
import { VisitStatus } from '@/lib/types';

interface AdminVisitRow {
  id: string;
  title: string;
  status: VisitStatus;
  scheduled_start: string;
  scheduled_end?: string;
  visit_type: string;
  client: { business_name: string };
  technician?: { full_name: string };
}

interface AdminVisitRequestRow {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: 'pending' | 'scheduled' | 'rejected';
  requested_at: string;
  client?: { business_name: string };
}

export default async function AdminVisitsPage() {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [
    { data: visits, error: visitsError },
    { data: visitRequests, error: requestsError }
  ] = await Promise.all([
    getVisits(),
    getVisitRequests('pending')
  ]);

  if (visitsError || requestsError) {
    console.error('Error loading visits module:', visitsError || requestsError);
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

      <VisitTable
        initialVisits={(visits || []) as AdminVisitRow[]}
        initialRequests={(visitRequests || []) as AdminVisitRequestRow[]}
      />
    </div>
  );
}
