'use client';

import React, { useState, useEffect } from 'react';
import { IncidentForm } from '@/components/dashboard/IncidentForm';
import { IncidentTable } from '@/components/dashboard/IncidentTable';
import { getClientIncidents } from '@/lib/actions/dashboard.actions';
import { createClient } from '@/lib/supabase';
import { Plus, X, ListFilter, Activity } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function ClientIncidentsPage() {
  const supabase = createClient();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);

  const fetchIncidents = async (cid: string) => {
    const { data } = await getClientIncidents(cid);
    
    if (data) setIncidents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*, clients:clients(id)')
          .eq('id', user.id)
          .single();
        
        const cid = profile?.clients?.[0]?.id;
        if (cid) {
          setClientId(cid);
          fetchIncidents(cid);
        }
      }
    };
    getProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#3D7BFF] animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header Estilizado */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Canal de Emergencia
          </div>
          <h1 className="text-5xl font-serif font-bold text-white tracking-tight">
            Gestión de Tickets
          </h1>
          <p className="text-[#8A9199] font-medium italic text-lg max-w-2xl">
            Centro de soporte prioritario para fallas técnicas y reportes de mal funcionamiento.
          </p>
        </div>

        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center gap-3 px-8 py-4 bg-[#3D7BFF] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
            Reportar Nueva Falla
          </button>
        )}
      </div>

      {/* KPI Simples */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
               <Activity className="w-6 h-6" />
            </div>
            <div>
               <p className="text-2xl font-black text-white">{incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length}</p>
               <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Activos</p>
            </div>
         </div>
      </div>

      {/* Formulario / Lista */}
      <div className="relative">
        {showForm ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <IncidentForm 
              clientId={clientId!} 
              onSuccess={() => {
                setShowForm(false);
                fetchIncidents(clientId!);
              }} 
              onCancel={() => setShowForm(false)} 
            />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <IncidentTable incidents={incidents} />
          </div>
        )}
      </div>
    </div>
  );
}
