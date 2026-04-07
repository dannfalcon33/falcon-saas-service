import React from 'react';
import { createServerClientComponent } from '@/lib/supabase-server';
import { getClients } from '@/lib/actions/admin.actions';
import { AdminClientView } from '@/components/admin/AdminClientView';
import { redirect } from 'next/navigation';

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const query = searchParams.q || '';
  const { data: clients, error } = await getClients(query);

  if (error) {
    console.error('Error loading clients:', error);
    return <div>Error al cargar clientes.</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3D7BFF]/10 rounded-full border border-[#3D7BFF]/20 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Gestión de Cartera B2B
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            Maestro de Clientes
          </h1>
          <p className="text-[#8A9199] font-medium italic">Base de datos centralizada de empresas y contactos técnicos.</p>
        </div>
      </div>

      <AdminClientView initialClients={clients as any || []} />
    </div>
  );
}
