import React from 'react';
import { createServerClientComponent } from '@/lib/supabase-server';
import { getServiceReports } from '@/lib/actions/admin.actions';
import { ServiceReportTable } from '@/components/dashboard/ServiceReportTable';
import { redirect } from 'next/navigation';
import { FileText, ShieldCheck, Mail } from 'lucide-react';

export default async function ClientReportsPage() {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Get client ID
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, clients:clients(id)')
    .eq('id', user.id)
    .single();

  const clientId = profile?.clients?.[0]?.id;

  if (!clientId) {
    return (
      <div className="p-12 text-center bg-white/5 border border-white/5 rounded-[2.5rem]">
        <p className="text-white/40 font-serif italic tracking-widest uppercase">No hay información de cliente asociada.</p>
      </div>
    );
  }

  const { data: reports, error } = await getServiceReports(clientId);

  if (error) {
    console.error('Error loading reports:', error);
    return <div>Error al cargar reportes.</div>;
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3D7BFF]/10 rounded-full border border-[#3D7BFF]/20 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Historial de Cumplimiento
          </div>
          <h1 className="text-5xl font-serif font-bold text-white tracking-tight">
            Reportes de Servicio
          </h1>
          <p className="text-[#8A9199] font-medium italic text-lg max-w-2xl">
            Acceda a la documentación técnica de cada intervención realizada por nuestros especialistas.
          </p>
        </div>

        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
           </div>
           <div>
              <p className="text-sm font-bold text-white">Certificación Falcon IT</p>
              <p className="text-[10px] text-[#8A9199]">Documentos con validez técnica oficial.</p>
           </div>
        </div>
      </div>

      <div className="relative">
        <ServiceReportTable reports={reports || []} isAdmin={false} />
      </div>

      <div className="bg-[#3D7BFF]/5 border border-[#3D7BFF]/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3 bg-[#3D7BFF]/10 rounded-xl text-[#3D7BFF]">
               <Mail className="w-5 h-5" />
            </div>
            <div>
               <p className="text-white font-bold">¿Necesita un reporte físico o firmado?</p>
               <p className="text-xs text-[#8A9199]">Solicite atención personalizada a su ejecutivo de cuenta.</p>
            </div>
         </div>
         <button className="px-6 py-3 bg-[#3D7BFF] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
            Contactar Soporte
         </button>
      </div>
    </div>
  );
}
