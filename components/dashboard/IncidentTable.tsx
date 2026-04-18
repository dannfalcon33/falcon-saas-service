'use client';

import React, { useState } from 'react';
import { AlertTriangle, MessageSquare, User as UserIcon, ShieldAlert, Filter } from 'lucide-react';
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
  const showAdminActions = Boolean(isAdmin && onManage);

  const filteredIncidents = filter === 'all' ? incidents : incidents.filter((incident) => incident.status === filter);

  const priorityConfig: Record<IncidentPriority, { color: string; bg: string }> = {
    low: { color: 'text-blue-400', bg: 'bg-blue-400/10' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-400/10' },
    high: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
    critical: { color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  const formatDate = (value: string) => new Date(value).toLocaleDateString();
  const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-xl shrink-0">
      <div className="p-4 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">Historial de Incidencias</h2>
          <p className="text-[10px] md:text-xs text-[#8A9199] font-medium italic mt-1 font-serif tracking-widest uppercase opacity-80 leading-relaxed">
            Registro de soporte técnico y estados de resolución.
          </p>
        </div>

        <div className="w-full md:w-auto flex items-center gap-4">
          <div className="w-full md:w-auto flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-white/40" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-auto bg-transparent text-xs text-white outline-none cursor-pointer pr-2"
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

      <div className="md:hidden divide-y divide-white/5">
        {filteredIncidents.length > 0 ? (
          filteredIncidents.map((incident) => {
            const priority = priorityConfig[incident.priority];
            return (
              <article key={incident.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 border border-white/5 ${priority.bg} ${priority.color}`}>
                      {incident.priority === 'critical' ? <ShieldAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white tracking-tight truncate">{incident.title}</p>
                      <p className="text-[10px] text-[#8A9199] font-medium italic mt-0.5 truncate">
                        {isAdmin ? incident.client?.business_name : `Prioridad ${incident.priority}`}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={incident.status} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Reporte</p>
                    <p className="text-xs font-bold text-white/80 mt-1">{formatDate(incident.reported_at)}</p>
                    <p className="text-[10px] text-white/30 font-black tracking-widest mt-1">{formatTime(incident.reported_at)}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Responsable</p>
                    <div className="mt-1 flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-[#3D7BFF]" />
                      <span className="text-xs font-bold text-white/70 truncate">{incident.technician?.full_name || 'Sin asignar'}</span>
                    </div>
                  </div>
                </div>

                {showAdminActions && (
                  <div className="flex justify-end border-t border-white/5 pt-3">
                    <button
                      onClick={() => onManage && onManage(incident)}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[#8A9199] hover:text-[#3D7BFF] hover:border-[#3D7BFF]/30 transition-all"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Gestionar</span>
                    </button>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="px-4 py-16 text-center">
            <p className="text-xs font-serif italic tracking-widest text-[#8A9199]/40 uppercase">No hay registros de incidencias</p>
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[940px]">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Incidencia / {isAdmin ? 'Cliente' : 'Prioridad'}</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fecha Reporte</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Responsable</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
              {showAdminActions && (
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Acción</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident) => {
                const priority = priorityConfig[incident.priority];
                return (
                  <tr key={incident.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl shrink-0 border border-white/5 ${priority.bg} ${priority.color}`}>
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
                        <span className="text-xs font-bold text-white/80">{formatDate(incident.reported_at)}</span>
                        <span className="text-[10px] text-white/20 font-black tracking-widest">{formatTime(incident.reported_at)}</span>
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
                    {showAdminActions && (
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => onManage && onManage(incident)}
                          className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[#8A9199] hover:text-[#3D7BFF] hover:border-[#3D7BFF]/30 transition-all group/btn"
                        >
                          <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={showAdminActions ? 5 : 4} className="px-8 py-20 text-center">
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
