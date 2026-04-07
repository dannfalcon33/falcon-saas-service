import React from 'react';
import { createServerClientComponent } from '@/lib/supabase-server';
import { getSubscriptions } from '@/lib/actions/admin.actions';
import { SubscriptionTable } from '@/components/admin/SubscriptionTable';
import { redirect } from 'next/navigation';

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const statusFilter = searchParams.status || 'all';
  const { data: subscriptions, error } = await getSubscriptions(statusFilter);

  if (error) {
    console.error('Error loading subscriptions:', error);
    return <div>Error al cargar suscripciones.</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Control de Vigencia y Planes
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            Suscripciones Activas
          </h1>
          <p className="text-[#8A9199] font-medium italic">Gestión de ciclos de facturación y límites de visitas técnicas por cliente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <SubscriptionTable initialSubs={subscriptions as any || []} />
      </div>
    </div>
  );
}
