'use client';

import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User as UserIcon,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/Common';
import { Visit } from '@/lib/types';

interface ClientVisitViewProps {
  visits: any[];
}

export const ClientVisitView = ({ visits }: ClientVisitViewProps) => {
  const upcomingVisits = visits.filter(v => v.status === 'scheduled');
  const pastVisits = visits.filter(v => v.status !== 'scheduled');

  return (
    <div className="space-y-12">
      {/* Próximas Visitas */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 bg-[#3D7BFF] rounded-full" />
          <h2 className="text-xl font-serif font-bold text-white tracking-tight">Próximos Servicios en Sitio</h2>
        </div>

        {upcomingVisits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingVisits.map((visit) => (
              <div key={visit.id} className="group bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-8 hover:border-[#3D7BFF]/30 transition-all shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#3D7BFF]/5 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:bg-[#3D7BFF]/10 transition-colors" />
                
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-[#3D7BFF]/10 rounded-2xl border border-[#3D7BFF]/20 text-[#3D7BFF]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <StatusBadge status={visit.status} />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#3D7BFF] transition-colors">{visit.title}</h3>
                    <p className="text-xs text-[#8A9199] mt-1 line-clamp-2">{visit.description || 'Sin descripción adicional'}</p>
                  </div>

                  <div className="h-px bg-white/5 w-full" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Fecha y Hora</p>
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#3D7BFF]" />
                        {new Date(visit.scheduled_start).toLocaleDateString()} - {new Date(visit.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-white/40 font-black uppercase tracking-widest">Especialista</p>
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        {visit.technician?.full_name || 'Personal Asignado'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/[0.02] border border-white/5 border-dashed rounded-[2.5rem] p-12 text-center">
            <Info className="w-12 h-12 text-white/10 mx-auto mb-4" />
            <p className="text-[#8A9199] font-serif italic tracking-widest">No hay visitas programadas próximamente.</p>
          </div>
        )}
      </section>

      {/* Historial */}
      <section className="space-y-6">
        <h2 className="text-xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
          <div className="w-1.5 h-6 bg-white/20 rounded-full" />
          Historial de Intervenciones
        </h2>

        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
           <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02]">
                  <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Servicio</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fecha</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
                  <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pastVisits.map((visit) => (
                  <tr key={visit.id} className="group hover:bg-white/[0.01] transition-colors cursor-pointer">
                    <td className="px-8 py-6">
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{visit.title}</p>
                        <p className="text-[10px] text-[#8A9199] font-medium">{visit.visit_type === 'included' ? 'Mantenimiento de Plan' : 'Soporte Extra'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-xs font-bold text-white/60">{new Date(visit.scheduled_start).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6">
                       <StatusBadge status={visit.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                       <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white group-hover:translate-x-1 transition-all inline-block" />
                    </td>
                  </tr>
                ))}
                {pastVisits.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-8 py-10 text-center opacity-30 text-xs font-serif italic tracking-widest uppercase">Historial vacío</td>
                  </tr>
                )}
              </tbody>
           </table>
        </div>
      </section>
    </div>
  );
};
