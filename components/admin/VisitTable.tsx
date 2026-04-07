'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  User as UserIcon, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Activity,
  Plus
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/Common';
import { VisitStatus } from '@/lib/types';

interface VisitWithInfo {
  id: string;
  title: string;
  status: VisitStatus;
  scheduled_start: string;
  scheduled_end?: string;
  visit_type: string;
  client: { business_name: string };
  technician?: { full_name: string };
}

export const VisitTable = ({ initialVisits }: { initialVisits: VisitWithInfo[] }) => {
  const [filter, setFilter] = useState('all');

  const filteredVisits = filter === 'all' 
    ? initialVisits 
    : initialVisits.filter(v => v.status === filter);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Agenda de Visitas</h2>
          <p className="text-xs text-[#8A9199] font-medium italic mt-1 font-serif tracking-widest uppercase opacity-80 leading-relaxed">Programación y seguimiento de servicios técnicos presenciales.</p>
        </div>

        <div className="flex items-center gap-4">
           <select 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="bg-white/5 border border-white/5 rounded-xl py-2 px-4 text-xs text-white outline-none focus:border-[#3D7BFF]/50 cursor-pointer"
           >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programadas</option>
              <option value="completed">Completadas</option>
              <option value="cancelled">Canceladas</option>
           </select>
           <button className="flex items-center gap-2 px-5 py-2.5 bg-[#3D7BFF] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">
              <Plus className="w-3 h-3" />
              Nueva Visita
           </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Servicio / Cliente</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fecha y Hora</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Técnico</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredVisits.length > 0 ? filteredVisits.map((visit) => (
              <tr key={visit.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{visit.title}</p>
                      <p className="text-[10px] text-[#8A9199] font-medium uppercase tracking-widest">{visit.client.business_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-white">
                         <MapPin className="w-3 h-3 text-[#3D7BFF]" />
                         <span className="text-xs font-bold">{new Date(visit.scheduled_start).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8A9199]">
                         <Clock className="w-3 h-3" />
                         <span className="text-[10px] font-black">{new Date(visit.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#3D7BFF]">
                         {visit.technician?.full_name?.charAt(0) || <UserIcon className="w-3 h-3" />}
                      </div>
                      <span className="text-xs font-bold text-white/80">{visit.technician?.full_name || 'Por asignar'}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <StatusBadge status={visit.status} />
                </td>
                <td className="px-8 py-6 text-right">
                   <button className="p-2 border border-white/5 bg-white/5 rounded-lg text-[#8A9199] hover:text-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                   </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-20">
                      <Activity className="w-12 h-12" />
                      <p className="text-sm font-serif italic tracking-widest uppercase">No hay visitas programadas</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
