'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  MessageSquare,
  User as UserIcon,
  ShieldAlert,
  Zap,
  Filter
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/Common';
import { IncidentStatus, IncidentPriority } from '@/lib/types';

interface IncidentWithInfo {
  id: string;
  title: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  reported_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  client?: { business_name: string };
  technician?: { full_name: string };
}

interface IncidentTableProps {
  incidents: IncidentWithInfo[];
  isAdmin?: boolean;
  onManage?: (incident: IncidentWithInfo) => void;
}

export const IncidentTable = ({ incidents, isAdmin, onManage }: IncidentTableProps) => {
  const [filter, setFilter] = useState('all');

  const filteredIncidents = filter === 'all' 
    ? incidents 
    : incidents.filter(i => i.status === filter);

  const priorityConfig = {
    low: { color: 'text-blue-400', bg: 'bg-blue-400/10' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-400/10' },
    high: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
    critical: { color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl shrink-0">
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Historial de Incidencias</h2>
          <p className="text-xs text-[#8A9199] font-medium italic mt-1 font-serif tracking-widest uppercase opacity-80 leading-relaxed">Registro de soporte técnico y estados de resolución.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-white/40" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-transparent text-xs text-white outline-none cursor-pointer pr-2"
              >
                  <option value="all" className="bg-[#0B1622]">Estados</option>
                  <option value="open" className="bg-[#0B1622]">Abiertas</option>
                  <option value="in_progress" className="bg-[#0B1622]">En Proceso</option>
                  <option value="resolved" className="bg-[#0B1622]">Resueltas</option>
                  <option value="closed" className="bg-[#0B1622]">Cerradas</option>
              </select>
           </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Incidencia / {isAdmin ? 'Cliente' : 'Prioridad'}</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fecha Reporte</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Responsable</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredIncidents.length > 0 ? filteredIncidents.map((incident) => {
              const p = priorityConfig[incident.priority];
              return (
                <tr key={incident.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl shrink-0 border border-white/5 ${p.bg} ${p.color}`}>
                        {incident.priority === 'critical' ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight line-clamp-1">{incident.title}</p>
                        <p className="text-[10px] text-[#8A9199] font-medium italic mt-0.5">
                          {isAdmin ? incident.client?.business_name : `Prioridad ${incident.priority}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-white/80">{new Date(incident.reported_at).toLocaleDateString()}</span>
                      <span className="text-[10px] text-white/20 font-black tracking-widest">{new Date(incident.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-[#3D7BFF]" />
                      <span className="text-xs font-bold text-white/60">{incident.technician?.full_name || 'Sin asignar'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={incident.status} />
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => onManage && onManage(incident)}
                      className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[#8A9199] hover:text-[#3D7BFF] hover:border-[#3D7BFF]/30 transition-all group/btn"
                    >
                      {isAdmin ? <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> : <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />}
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <p className="text-xs font-serif italic tracking-widest text-[#8A9199]/40 uppercase">No hay registros de incidencias</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
