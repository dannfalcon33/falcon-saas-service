import React from 'react';
import { 
  Users, 
  CreditCard, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Package,
  UserPlus
} from 'lucide-react';
import { getAdminStats } from '@/lib/actions/admin.actions';
import { StatCard } from '@/components/dashboard/Common';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default async function AdminDashboardPage() {
  const { data: stats, error } = await getAdminStats();
  
  if (error || !stats) {
    return <div>Error al cargar estadísticas.</div>;
  }

  const kpis = [
    { title: "Clientes Activos", value: stats.activeClients, icon: Users, color: "emerald" as const, trend: "Empresas en servicio" },
    { title: "MRR Estimado", value: `$${stats.mrr}`, icon: TrendingUp, color: "emerald" as const, trend: "Ingreso mensual" },
    { title: "Pagos Pendientes", value: stats.pendingPayments, icon: CreditCard, color: "amber" as const, trend: "Por validar" },
    { title: "Suscripciones", value: stats.activeSubscriptions, icon: Package, color: "blue" as const, trend: "Planes activos" },
    { title: "Leads Recibidos", value: stats.totalLeads, icon: UserPlus, color: "blue" as const, trend: `${stats.leadsLast7Days} en 7 días` },
    { title: "Por Vencer (7d)", value: stats.expiringSoon, icon: Clock, color: "amber" as const, trend: "Seguimiento" },
    { title: "Vencidas", value: stats.expired, icon: AlertTriangle, color: "red" as const, trend: "Requiere atención" },
    { title: "Incidencias VIP", value: stats.openIncidents, icon: AlertTriangle, color: "red" as const, trend: `${stats.criticalIncidents} Críticas` },
    { title: "Visitas Semanales", value: stats.visitsThisWeek, icon: Calendar, color: "blue" as const, trend: "Planificadas" },
  ];

  return (
    <div className="space-y-10">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F3A5F]/20 rounded-full border border-[#1F3A5F]/30 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Métricas de Control Administrativo
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            Dashboard Central
          </h1>
          <p className="text-[#8A9199] font-medium italic">Visión global de la operación y el estado financiero.</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => (
          <StatCard key={i} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions (2/3) */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl">
              <h2 className="text-2xl font-serif font-bold text-white mb-8 tracking-tight">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <Link href="/admin/payments" className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-[#3D7BFF]/30 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                       <div className="p-3 bg-[#3D7BFF]/10 text-[#3D7BFF] rounded-2xl group-hover:scale-110 transition-transform">
                          <CreditCard className="w-6 h-6" />
                       </div>
                       <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-[#3D7BFF] transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Validar Pagos</h3>
                    <p className="text-xs text-[#8A9199] font-medium italic mt-1">Revisar comprobantes de clientes pendientes.</p>
                 </Link>
                 
                 <Link href="/admin/clients" className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/5 hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                       <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
                          <Users className="w-6 h-6" />
                       </div>
                       <ArrowUpRight className="w-5 h-5 text-white/20 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Ver Clientes</h3>
                    <p className="text-xs text-[#8A9199] font-medium italic mt-1">Gestión de datos fiscales y personas de contacto.</p>
                 </Link>
              </div>
           </div>
        </div>

        {/* System Health / Status (1/3) */}
        <div className="bg-[#1F3A5F]/5 border border-[#1F3A5F]/10 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center group">
           <div className="relative mb-8">
              <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center border border-white/10 group-hover:scale-105 transition-all shadow-2xl">
                 <Logo className="w-12 h-16" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-2xl flex items-center justify-center border-4 border-[#0B1622] text-xs font-black text-black">
                 <CheckCircle2 className="w-4 h-4" />
              </div>
           </div>
           <h3 className="text-2xl font-serif font-bold text-white tracking-tight">Sistema Óptimo</h3>
           <p className="text-sm text-[#8A9199] font-medium italic mt-2 px-4 leading-relaxed line-clamp-2">Plataforma de gestión tecnológica administrativa operativa.</p>
           
           <div className="mt-8 w-full space-y-3">
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Uptime</span>
                 <span className="text-xs font-bold text-emerald-400">99.9%</span>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
                 <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Verificado</span>
                 <span className="text-xs font-bold text-[#3D7BFF]">FalconIT 2026</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
