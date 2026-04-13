import React from 'react';
import { 
  getAuthenticatedClientContext, 
  getClientVisits, 
  getClientDashboardData,
  getClientVisitRequests 
} from '@/lib/actions/dashboard.actions';
import { ClientVisitView } from '@/components/dashboard/ClientVisitView';
import { VisitManagementSection } from '@/components/dashboard/VisitManagementSection';

export default async function ClientVisitsPage() {
  const { clientId, subscriptionId } = await getAuthenticatedClientContext();

  const [
    { data: visits },
    { data: dashboardData },
    { data: pendingRequests }
  ] = await Promise.all([
    getClientVisits(clientId),
    getClientDashboardData(clientId),
    getClientVisitRequests(clientId, 'pending')
  ]);

  return (
    <div className="space-y-10 pb-20">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3D7BFF]/10 rounded-full border border-[#3D7BFF]/20 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
          Transparencia en el Servicio
        </div>
        <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
          Mis Visitas Técnicas
        </h1>
        <p className="text-[#8A9199] font-medium italic">Agenda detallada de mantenimiento y soporte presencial programado.</p>
      </div>

      {/* Interactive Management Section */}
      <VisitManagementSection 
        subscriptionId={subscriptionId}
        visitStats={dashboardData?.subscriptionStats || undefined}
        pendingRequests={pendingRequests || []}
      />

      <div className="space-y-6">
        <div className="flex items-center gap-3">
           <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Historial Operativo</h3>
        </div>
        <ClientVisitView visits={visits || []} />
      </div>
    </div>
  );
}
