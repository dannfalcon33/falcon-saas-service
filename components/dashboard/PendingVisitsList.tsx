'use client';

import React from 'react';
import { 
  Hourglass, 
  MapPin, 
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { StatusBadge } from './Common';

interface PendingVisit {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  reported_at: string;
}

interface PendingVisitsListProps {
  requests: PendingVisit[];
}

export const PendingVisitsList = ({ requests }: PendingVisitsListProps) => {
  if (requests.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
         <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
         <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">En espera de programación</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {requests.map((request) => (
          <div 
            key={request.id} 
            className="group bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Hourglass className="w-12 h-12 text-amber-500" />
            </div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-5">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
                   <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                   <div className="flex items-center gap-3">
                      <p className="text-white font-bold tracking-tight">Solicitud de Visita Técnica</p>
                      <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black text-white/30 uppercase tracking-widest border border-white/5">Pendiente</span>
                   </div>
                   <p className="text-xs text-[#8A9199] line-clamp-2 italic leading-relaxed">
                     "{request.description}"
                   </p>
                </div>
              </div>

              <div className="flex items-center gap-8 pl-16 md:pl-0">
                 <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Prioridad</p>
                    <div className="flex items-center gap-2">
                       <AlertCircle className={`w-3 h-3 ${request.priority === 'critical' || request.priority === 'high' ? 'text-red-500' : 'text-[#3D7BFF]'}`} />
                       <span className="text-xs font-bold text-white uppercase">{request.priority}</span>
                    </div>
                 </div>
                 <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Enviada</p>
                    <p className="text-xs font-bold text-white">{new Date(request.reported_at).toLocaleDateString()}</p>
                 </div>
                 <div className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-[#8A9199] group-hover:text-white transition-colors">
                    <ChevronRight className="w-5 h-5" />
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 bg-[#3D7BFF]/5 border border-[#3D7BFF]/10 rounded-2xl">
         <p className="text-xs text-[#8A9199] italic leading-relaxed">
           <span className="text-[#3D7BFF] font-bold">Nota:</span> Estas solicitudes se convertirán en visitas programadas una vez que el administrador asigne un técnico y horario disponible.
         </p>
      </div>
    </div>
  );
};
