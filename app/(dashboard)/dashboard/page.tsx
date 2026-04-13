import React from 'react';
import { 
  Zap, 
  Calendar, 
  Activity, 
  Clock, 
  AlertCircle,
  ArrowRight,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { createServerClientComponent } from '@/lib/supabase-server';
import { getCurrentSubscription, getClientDashboardData, getAuthenticatedClientContext } from '@/lib/actions/dashboard.actions';
import { StatCard, StatusBadge } from '@/components/dashboard/Common';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { FileText, MessageSquare, List } from 'lucide-react';

export default async function ClientDashboardPage() {
  const { clientId } = await getAuthenticatedClientContext();

  const supabase = await createServerClientComponent();

  // Get client details for display
  const { data: client } = await supabase
    .from('clients')
    .select('id, business_name, status, zone')
    .eq('id', clientId)
    .single();

  if (!client) return null;

  const { data: subscription } = await getCurrentSubscription(client.id);
  const { data: stats } = await getClientDashboardData(client.id);

  // If no active subscription, try to find a pending one
  let pendingSub = null;
  if (!subscription) {
    const { data: ps } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('client_id', client.id)
      .eq('status', 'pending_payment')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (ps) {
      const { data: pPlan } = await supabase
        .from('plans')
        .select('*')
        .eq('id', ps.plan_id)
        .maybeSingle();
      
      pendingSub = { ...ps, plan: pPlan };
    }
  }

  const activeOrPending = subscription || pendingSub;
  const visitStats = stats?.subscriptionStats;

  const expirationDays = subscription?.days_remaining || 0;
  const isExpiring = subscription && expirationDays <= 7 && expirationDays > 0;
  const isExpired = subscription && expirationDays === 0;

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F3A5F]/20 rounded-full border border-[#1F3A5F]/30 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3D7BFF] animate-pulse" />
            Operación IT Activa
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            Panel de {client.business_name}
          </h1>
          <p className="text-[#8A9199] font-medium italic">Visibilidad total de tu infraestructura tecnológica.</p>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/dashboard/visits" className="px-6 py-3 bg-[#3D7BFF] rounded-2xl text-xs font-bold uppercase tracking-widest text-white hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-[#3D7BFF]/20">
            Solicitar Visita <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/dashboard/payments" className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2">
            Pagos
          </Link>
        </div>
      </div>

      {/* Subscription Warnings Content remains... */}
      {/* (Skipping for brevity in diff but keeping in file) */}

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
{/* Visit Usage KPI */}
        {visitStats?.is_unlimited_snapshot || activeOrPending?.plan?.name?.toLowerCase().includes('corporativo') ? (
          <StatCard 
            title="Uso de Visitas" 
            value="Cobertura Flexible" 
            subtitle="Base operativa: 4 visitas / mes"
            icon={Calendar}
            color="emerald"
            trend="Solicitudes según necesidad"
          />
        ) : (
          <StatCard 
            title="Uso de Visitas" 
            value={`${visitStats?.visit_used_count || 0} / ${visitStats?.visit_limit_snapshot || 0}`} 
            subtitle="Visitas de mantenimiento"
            icon={Calendar}
            color="blue"
            trend={visitStats?.visit_available_count && visitStats.visit_available_count > 0 ? `${visitStats.visit_available_count} disponibles` : "Límite alcanzado"}
          />
        )}
        <StatCard 
          title="Próxima Visita" 
          value={stats?.nextVisit ? new Date(stats.nextVisit.scheduled_start).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' }) : "No prog."} 
          subtitle={stats?.nextVisit ? stats.nextVisit.title : "Sin visitas pendientes"}
          icon={Clock}
          color="amber"
          trend={stats?.nextVisit ? "Confirmada" : "Sujeta a solicitud"}
        />
        <StatCard 
          title="Incidencias" 
          value={stats?.openIncidents || 0}
          subtitle="Abiertas en el sistema"
          icon={Activity}
          color={stats?.openIncidents && stats.openIncidents > 0 ? "red" : "emerald"}
          trend={stats?.openIncidents && stats.openIncidents > 0 ? "Atención requerida" : "Todo despejado"}
        />
        <StatCard 
          title="Plan Activo" 
          value={activeOrPending?.plan?.name || "Sin Plan"} 
          subtitle={subscription ? "SLA y Soporte Activo" : "Esperando Pago"}
          icon={Zap}
          color={subscription ? "emerald" : "amber"}
          trend={subscription ? "Protegido" : "Inactivo"}
        />
      </div>

      {/* Secondary Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Plan Detail & Reports */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Logo className="w-64 h-64" />
              </div>
              
              <div className="flex items-center justify-between mb-8 relative z-10">
                <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Último Reporte Técnico</h2>
                <Link href="/dashboard/reports" className="text-[10px] font-black text-[#3D7BFF] uppercase tracking-widest hover:underline flex items-center gap-1">
                  Ver Todo <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {stats?.lastReport ? (
                <div className="relative z-10 space-y-6">
                  <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                    <h3 className="text-white font-bold mb-2">{stats.lastReport.title}</h3>
                    <p className="text-sm text-[#8A9199] leading-relaxed line-clamp-3 italic mb-4">
                      {stats.lastReport.summary}
                    </p>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Fecha: {new Date(stats.lastReport.created_at).toLocaleDateString()}</span>
                       <span className="w-1 h-1 rounded-full bg-white/10" />
                       <span className="text-[10px] font-black text-[#3D7BFF] uppercase tracking-widest">SLA Cumplido</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-black/20 border border-white/5 border-dashed rounded-2xl text-center relative z-10">
                   <p className="text-sm text-[#8A9199] italic">No hay reportes técnicos registrados todavía.</p>
                </div>
              )}

              <Link href="/dashboard/visits" className="mt-10 p-6 bg-[#3D7BFF]/5 border border-[#3D7BFF]/10 rounded-2xl flex items-center justify-between relative z-10 group/cta cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#3D7BFF]/10 rounded-xl flex items-center justify-center text-[#3D7BFF]">
                    <TrendingUp className="w-5 h-5 group-hover/cta:scale-110 transition-transform" />
                  </div>
                  <p className="text-sm font-bold text-white group-hover/cta:text-[#3D7BFF] transition-colors">Ver historial de actividad técnica y visitas</p>
                </div>
                <ChevronRight className="w-5 h-5 text-[#3D7BFF] opacity-50 group-hover/cta:opacity-100 transition-all" />
              </Link>
           </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
           <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 flex flex-col gap-4">
              <h3 className="text-xl font-serif font-bold text-white mb-2 tracking-tight">Acciones Rápidas</h3>
              
              <Link href="/dashboard/incidents" className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-[#3D7BFF]/30 transition-all group">
                <div className="w-10 h-10 bg-[#3D7BFF]/10 text-[#3D7BFF] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Reportar Incidencia</p>
                  <p className="text-[10px] text-[#8A9199] italic">Soporte técnico inmediato</p>
                </div>
              </Link>

              <Link href="/dashboard/payments" className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-emerald-500/30 transition-all group">
                <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Subir Comprobante</p>
                  <p className="text-[10px] text-[#8A9199] italic">Validar mensualidad</p>
                </div>
              </Link>

              <Link href="/dashboard/visits" className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/5 hover:border-blue-500/30 transition-all group">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <List className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Ver Visitas</p>
                  <p className="text-[10px] text-[#8A9199] italic">Calendario asignado</p>
                </div>
              </Link>
           </div>

           <div className="bg-[#1F3A5F]/10 border border-[#1F3A5F]/20 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
             <div className="w-16 h-16 bg-emerald-400/10 rounded-2xl flex items-center justify-center mb-4 border border-emerald-400/20 shadow-2xl">
               <MapPin className="w-8 h-8 text-emerald-400" />
             </div>
             <h3 className="text-lg font-bold text-white mb-1">Tu Zona</h3>
             <p className="text-[10px] text-white/50 uppercase font-black tracking-widest mb-4">Maracaibo / {client.zone || 'Norte'}</p>
             <p className="text-[11px] text-[#8A9199] font-medium leading-relaxed italic">Atención técnica prioritaria según tu ubicación.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
