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
import { getCurrentSubscription } from '@/lib/actions/dashboard.actions';
import { StatCard, StatusBadge } from '@/components/dashboard/Common';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default async function ClientDashboardPage() {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Get client ID for this user
  const { data: client } = await supabase
    .from('clients')
    .select('id, business_name, status')
    .eq('owner_profile_id', user.id)
    .single();

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
          <AlertCircle className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Cuenta en Proceso</h2>
        <p className="text-[#8A9199] max-w-md mx-auto italic font-medium">
          Aún no tienes una empresa vinculada a tu perfil. Contacta a soporte para finalizar tu registro.
        </p>
      </div>
    );
  }

  const { data: subscription } = await getCurrentSubscription(client.id);

  // If no active subscription, try to find a pending one
  const { data: pendingSub } = !subscription ? await supabase
    .from('subscriptions')
    .select('*, plan:plans(*)')
    .eq('client_id', client.id)
    .eq('status', 'pending_payment')
    .maybeSingle() : { data: null };

  const activeOrPending = subscription || pendingSub;

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
          <Link href="/dashboard/payments" className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2">
            Gestionar Pagos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Subscription Warnings */}
      {!subscription && pendingSub && (
        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center border border-amber-500/20 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Activación Pendiente</h3>
              <p className="text-[#8A9199] text-sm font-medium">Estamos esperando la validación de tu pago para activar el <span className="text-amber-500 font-bold">{pendingSub.plan?.name}</span>.</p>
            </div>
          </div>
          <Link href="/dashboard/payments" className="px-8 py-4 bg-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-[0_10px_30px_rgba(245,158,11,0.2)] relative z-10">
            Subir Comprobante
          </Link>
        </div>
      )}

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Plan Actual" 
          value={activeOrPending?.plan?.name || "Sin Plan"} 
          subtitle={subscription ? "Suscripción Activa" : "Esperando Pago"}
          icon={Zap}
          color={subscription ? "blue" : "amber"}
          trend={subscription ? "SLA 99.9%" : "Pendiente"}
        />
        <StatCard 
          title="Días Restantes" 
          value={subscription?.days_remaining || 0} 
          subtitle="Ciclo de Facturación"
          icon={Calendar}
          color={subscription?.days_remaining && subscription.days_remaining < 5 ? "red" : "blue"}
          trend={subscription?.renewal_due_date ? `Vence: ${subscription.renewal_due_date}` : "N/A"}
        />
        <StatCard 
          title="Visitas Técnicas" 
          value={`${subscription?.visit_used_count || 0} / ${subscription?.visit_limit_snapshot || (subscription?.is_unlimited_snapshot ? '∞' : 0)}`}
          subtitle="Incluidas en el plan"
          icon={Activity}
          color="emerald"
          trend={`${subscription?.visit_available_count || 0} Disponibles`}
        />
        <StatCard 
          title="Saldo Estimado" 
          value={`$${activeOrPending?.price_snapshot_usd || 0}`} 
          subtitle="Costo Mensual"
          icon={Clock}
          color="blue"
          trend="USD por ciclo"
        />
      </div>

      {/* Secondary Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Plan Detail */}
        <div className="lg:col-span-2 bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <Logo className="w-64 h-64" />
          </div>
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Detalles del Servicio</h2>
            <StatusBadge status={subscription?.status || client.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 font-serif uppercase tracking-[0.2em]">Soporte Remoto</p>
                <p className="text-white font-bold text-sm tracking-wide">{activeOrPending?.plan?.remote_support_label || 'Consultar SLA'}</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 font-serif uppercase tracking-[0.2em]">Respuesta Emergencias</p>
                <p className="text-white font-bold text-sm tracking-wide">{activeOrPending?.plan?.response_time_min_hours ? `${activeOrPending.plan.response_time_min_hours} - ${activeOrPending.plan.response_time_max_hours} Horas` : 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 font-serif uppercase tracking-[0.2em]">Monitoreo Activo</p>
                <p className="text-white font-bold text-sm tracking-wide">{activeOrPending?.plan?.monitoring_label || 'No Incluido'}</p>
              </div>
              <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2 font-serif uppercase tracking-[0.2em]">Respaldo en Nube</p>
                <p className="text-white font-bold text-sm tracking-wide">{activeOrPending?.plan?.cloud_backup_label || 'No Incluido'}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 bg-[#3D7BFF]/5 border border-[#3D7BFF]/10 rounded-2xl flex items-center justify-between relative z-10 group/cta cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#3D7BFF]/10 rounded-xl flex items-center justify-center text-[#3D7BFF]">
                <TrendingUp className="w-5 h-5 group-hover/cta:scale-110 transition-transform" />
              </div>
              <p className="text-sm font-bold text-white group-hover/cta:text-[#3D7BFF] transition-colors">Ver historial de actividad técnica</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[#3D7BFF] opacity-50 group-hover/cta:opacity-100 transition-all" />
          </div>
        </div>

        {/* Quick Location / Access */}
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-emerald-400/10 rounded-3xl flex items-center justify-center mb-6 border border-emerald-400/20 shadow-[0_0_30px_rgba(52,211,153,0.05)]">
            <MapPin className="w-10 h-10 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Zonificación</h3>
          <p className="text-xs text-[#8A9199] font-medium leading-relaxed italic mb-8">Nuestros técnicos están listos para tu zona operativa habitual.</p>
          
          <div className="w-full space-y-4">
            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest border-b border-white/5 pb-3">
              <span className="text-white/30">Ciudad</span>
              <span className="text-white">Maracaibo</span>
            </div>
            <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest border-b border-white/5 pb-3">
              <span className="text-white/30">Sector</span>
              <span className="text-white">Norte / Indio Mara</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight(props: any) {
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
