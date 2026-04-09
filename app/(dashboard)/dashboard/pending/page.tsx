import React from 'react';
import { redirect } from 'next/navigation';
import { 
  Clock, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Building2, 
  Mail,
  ArrowRight,
  LogOut,
  ChevronRight,
  FileText
} from 'lucide-react';
import { Logo } from "@/components/Logo";
import { createServerClientComponent } from '@/lib/supabase-server';
import { getClientAccessState } from '@/lib/actions/dashboard.actions';
import Link from 'next/link';
import { LogoutButton } from '@/components/dashboard/LogoutButton';

export default async function PendingPage() {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const accessState = await getClientAccessState(user.id);

  // If active, redirect to dashboard
  if (accessState.status === 'active') {
    redirect('/dashboard');
  }

  // Get lead status for the UI info
  const { data: leadData } = await supabase
    .from('leads')
    .select('*, plan:plan_interest_id(*)')
    .eq('auth_user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      <div className="relative min-h-screen flex flex-col">
        
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[120px]" />
          <div className="absolute right-[5%] bottom-[10%] h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* Top Navbar */}
        <nav className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl px-6 py-4 lg:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-10 border border-white/10 bg-black rounded-xl flex items-center justify-center shadow-2xl">
              <Logo className="w-5 h-7" />
            </div>
            <div>
              <h2 className="text-sm font-serif font-bold tracking-wider leading-none">FALCON IT</h2>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Client Portal</p>
            </div>
          </div>

          <LogoutButton />
        </nav>

        {/* Content */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="max-w-3xl w-full">
            
            <div className="text-center mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Suscripción en Validación
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white tracking-tight">
                Estamos revisando <br />tu <span className="text-blue-500">solicitud.</span>
              </h1>
              <p className="text-[#8A9199] text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed italic">
                Bienvenido a Falcon IT. Hemos recibido tu reporte de pago y estamos validando los datos para activar tu infraestructura.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {/* Status List */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-6">Estado del Proceso</h3>
                
                <div className="flex gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Registro de Usuario</h4>
                    <p className="text-[11px] text-[#8A9199] font-medium leading-relaxed">Credenciales creadas y perfil verificado.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-3xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Reporte de Pago</h4>
                    <p className="text-[11px] text-[#8A9199] font-medium leading-relaxed">Referencia: {leadData?.reference_code || 'Recibida'}</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-3xl bg-white/[0.05] border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)] group">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                    <Search className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white mb-1">Validación Técnica</h4>
                    <p className="text-[11px] text-[#8A9199] font-medium leading-relaxed italic">Nuestro equipo administrativo está confirmando la transacción bancaria.</p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 rounded-3xl bg-white/[0.01] border border-white/5 opacity-50">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white/50 mb-1">Activación de Dashboard</h4>
                    <p className="text-[11px] text-white/20 font-medium leading-relaxed">Pendiente de validación comercial.</p>
                  </div>
                </div>
              </div>

              {/* Order Sumary */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 lg:p-10 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl -mr-16 -mt-16" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-white/30 text-[10px] uppercase font-black tracking-widest mb-8">
                    <FileText className="w-3 h-3" /> Resumen de Selección
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] text-blue-400 font-black uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded mb-2 inline-block">Plan {leadData?.plan?.name || leadData?.plan_interest_id}</span>
                      <h4 className="text-2xl font-serif font-bold text-white tracking-tight">{leadData?.company_name}</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 text-[11px]">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8A9199] font-bold uppercase tracking-widest">Contacto</span>
                        <span className="text-white font-medium">{leadData?.full_name}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8A9199] font-bold uppercase tracking-widest">Correo</span>
                        <span className="text-white font-medium">{leadData?.email}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-[#8A9199] font-bold uppercase tracking-widest">Método</span>
                        <span className="text-white font-medium uppercase">{leadData?.payment_method}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center gap-4 group cursor-help">
                  <Building2 className="w-6 h-6 text-blue-400 shrink-0" />
                  <p className="text-[10px] leading-relaxed text-[#8A9199] font-medium">
                    Una vez aprobada, configuraremos tus servicios y asignaremos un técnico de soporte para tu primera visita.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-relaxed">
                    Protegiendo tu infraestructura <br /><span className="text-white/20">Falcon IT Operations System</span>
                  </p>
               </div>
               
               <p className="text-xs text-white/40 font-medium italic">
                 ¿Necesitas ayuda inmediata? <a href="https://wa.me/584220331995" target="_blank" className="text-blue-500 hover:text-blue-400 font-bold not-italic hover:underline underline-offset-4">Contactar Soporte WhatsApp</a>
               </p>
            </div>
          </div>
        </main>

        {/* Footer info */}
        <footer className="relative z-10 px-12 py-8 text-center border-t border-white/5">
           <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.4em]">Soporte Técnico Especializado © 2026</p>
        </footer>
      </div>
    </div>
  );
}
