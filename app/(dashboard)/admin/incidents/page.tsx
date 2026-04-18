'use client';

import React, { useEffect, useState } from 'react';
import { IncidentTable } from '@/components/dashboard/IncidentTable';
import { IncidentAssignModal } from '@/components/admin/IncidentAssignModal';
import { getIncidents } from '@/lib/actions/admin.actions';
import { ShieldAlert, Activity, Users, Loader2, RefreshCcw } from 'lucide-react';
import { IncidentPriority, IncidentStatus } from '@/lib/types';

interface IncidentItem {
  id: string;
  title: string;
  description: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  reported_at: string;
  resolved_at?: string;
  resolution_notes?: string;
  assigned_to?: string;
  client?: { business_name: string };
  technician?: { full_name: string };
}

export default function AdminIncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await getIncidents();
    if (data) setIncidents(data as IncidentItem[]);
    setIsLoading(false);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const handleManage = (incident: IncidentItem) => {
    setSelectedIncident(incident);
    setIsModalOpen(true);
  };

  if (isLoading && incidents.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#3D7BFF] animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Mesa de Ayuda Crítica
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight">Control de Incidencias</h1>
          <p className="text-sm md:text-base text-[#8A9199] font-medium italic">Gestión de tickets, asignación técnica y SLAs de respuesta.</p>
        </div>

        <button
          onClick={fetchData}
          className="w-full md:w-auto p-3 md:p-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-red-500/5 border border-red-500/10 p-4 md:p-6 rounded-3xl flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
            <ShieldAlert className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-white">
              {incidents.filter((i) => i.priority === 'critical' && i.status !== 'closed').length}
            </p>
            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Críticos Activos</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 p-4 md:p-6 rounded-3xl flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
            <Activity className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-white">{incidents.filter((i) => i.status === 'open').length}</p>
            <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest">Tickets por Abrir</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 p-4 md:p-6 rounded-3xl flex items-center gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#3D7BFF]/10 rounded-2xl flex items-center justify-center text-[#3D7BFF]">
            <Users className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-white">{incidents.filter((i) => i.status === 'in_progress').length}</p>
            <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest">En Proceso</p>
          </div>
        </div>
      </div>

      <IncidentTable incidents={incidents} isAdmin={true} onManage={handleManage} />

      <IncidentAssignModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} incident={selectedIncident} />
    </div>
  );
}
