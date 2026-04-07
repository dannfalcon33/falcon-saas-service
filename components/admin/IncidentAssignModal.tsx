'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User as UserIcon, ShieldAlert, CheckCircle2, MessageSquare } from 'lucide-react';
import { updateIncident } from '@/lib/actions/admin.actions';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { IncidentStatus } from '@/lib/types';

interface IncidentAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  incident: any;
}

export const IncidentAssignModal = ({ isOpen, onClose, incident }: IncidentAssignModalProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [technicians, setTechnicians] = useState<{ id: string, full_name: string }[]>([]);
  
  const [formData, setFormData] = useState({
    status: '',
    assigned_to: '',
    resolution_notes: ''
  });

  useEffect(() => {
    if (incident) {
      setFormData({
        status: incident.status,
        assigned_to: incident.assigned_to || '',
        resolution_notes: incident.resolution_notes || ''
      });
    }

    const fetchTechnicians = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['admin', 'technician']); // Both can be assigned
      if (data) setTechnicians(data);
    };

    if (isOpen) fetchTechnicians();
  }, [incident, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await updateIncident(incident.id, {
        status: formData.status as IncidentStatus,
        assigned_to: formData.assigned_to || null,
        resolution_notes: formData.resolution_notes,
        resolved_at: formData.status === 'resolved' ? new Date().toISOString() : incident.resolved_at
      });

      if (error) throw error;
      onClose();
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl bg-black/60">
      <div className="bg-[#0B1622] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-500" />
              Gestión de Ticket
            </h2>
            <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest mt-1">ID: {incident.id.slice(0, 8)}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
             <p className="text-[10px] text-[#3D7BFF] font-black uppercase tracking-widest mb-1">{incident.client?.business_name}</p>
             <h3 className="text-sm font-bold text-white mb-2">{incident.title}</h3>
             <p className="text-xs text-white/40 line-clamp-3 leading-relaxed">{incident.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] text-white/60 font-bold ml-1">Cambiar Estado</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-[#3D7BFF]/50"
                >
                  <option value="open" className="bg-[#0B1622]">Abierto</option>
                  <option value="in_progress" className="bg-[#0B1622]">En Progreso</option>
                  <option value="resolved" className="bg-[#0B1622]">Resuelto</option>
                  <option value="closed" className="bg-[#0B1622]">Cerrado</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] text-white/60 font-bold ml-1">Asignar Técnico</label>
                <select 
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-[#3D7BFF]/50"
                >
                  <option value="" className="bg-[#0B1622]">Sin asignar</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id} className="bg-[#0B1622]">{t.full_name}</option>
                  ))}
                </select>
             </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] text-white/60 font-bold ml-1 flex items-center gap-2">
                <MessageSquare className="w-3 h-3" />
                Notas de Resolución (Visibles al cliente)
             </label>
             <textarea 
               value={formData.resolution_notes}
               onChange={(e) => setFormData({...formData, resolution_notes: e.target.value})}
               rows={3}
               placeholder="Escriba cómo se solucionó el problema..."
               className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white outline-none focus:border-[#3D7BFF]/50 resize-none transition-all placeholder:text-white/5"
             />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
             <button 
               type="button"
               onClick={onClose}
               className="px-6 py-3 text-white/20 text-xs font-black uppercase tracking-widest hover:text-white transition-all"
             >
               Cancelar
             </button>
             <button 
               type="submit"
               disabled={isLoading}
               className="flex items-center gap-3 px-8 py-3 bg-[#3D7BFF] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               Actualizar Ticket
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
