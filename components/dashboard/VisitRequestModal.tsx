'use client';

import React, { useState } from 'react';
import {
  Calendar, 
  Send, 
  Loader2, 
  X,
  Clock,
  Info,
  ShieldCheck,
  Zap,
  ShieldAlert,
  AlertTriangle,
  type LucideIcon
} from 'lucide-react';
import { requestVisitAction } from '@/lib/actions/dashboard.actions';
import { IncidentPriority } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface VisitRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionId?: string;
  visitStats?: {
    visit_used_count: number;
    visit_available_count: number;
    visit_limit_snapshot: number;
    is_unlimited_snapshot: boolean;
  };
}

export const VisitRequestModal = ({ 
  isOpen, 
  onClose, 
  subscriptionId, 
  visitStats 
}: VisitRequestModalProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    priority: 'medium' as IncidentPriority
  });

  const isOverLimit = !visitStats?.is_unlimited_snapshot && 
                     (visitStats?.visit_available_count || 0) <= 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit) return;
    
    setIsLoading(true);

    try {
      const { error } = await requestVisitAction({
        subscriptionId,
        description: formData.description,
        priority: formData.priority
      });

      if (error) throw error;
      
      setFormData({ description: '', priority: 'medium' });
      router.refresh();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      alert("Error al solicitar visita: " + message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const priorities: { value: IncidentPriority; label: string; icon: LucideIcon; color: string; desc: string }[] = [
    { value: 'low', label: 'Mantenimiento', icon: Info, color: 'text-blue-400', desc: 'Revisiones rutinarias o ajustes.' },
    { value: 'medium', label: 'Soporte Estándar', icon: Clock, color: 'text-amber-400', desc: 'Atención técnica regular.' },
    { value: 'high', label: 'Urgencia Técnica', icon: Zap, color: 'text-orange-500', desc: 'Requerido para corregir fallas operativas.' },
    { value: 'critical', label: 'Emergencia Crítica', icon: ShieldAlert, color: 'text-red-500', desc: 'Parada de planta o riesgo total.' },
  ];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl bg-black/60">
      <div className="bg-[#0B1622] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#3D7BFF]/5 blur-3xl rounded-full translate-x-32 -translate-y-32" />
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between relative z-10">
          <div className="space-y-1">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-[#3D7BFF]/10 rounded-lg text-[#3D7BFF]">
                   <Calendar className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
                  Solicitar Visita Técnica
                </h2>
             </div>
             <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest leading-relaxed">
               Coordina una intervención presencial de nuestros especialistas.
             </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
             <X className="w-5 h-5 text-white/40" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto relative z-10 space-y-8">
            {/* Limit Warning */}
            {isOverLimit && (
              <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                   <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-sm font-bold text-white">Límite de visitas alcanzado</p>
                   <p className="text-[10px] text-[#8A9199] mt-1 italic leading-relaxed">
                     Has agotado las visitas de mantenimiento de tu plan mensual. Tu solicitud será evaluada para determinar cargos adicionales o cobertura de emergencia.
                   </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Priority Selection */}
              <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Nivel de Respuesta Requerido</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     {priorities.map((p) => {
                       const isSelected = formData.priority === p.value;
                       return (
                         <button
                           key={p.value}
                           type="button"
                           onClick={() => setFormData({ ...formData, priority: p.value })}
                           className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-4 relative overflow-hidden group ${
                             isSelected 
                              ? 'bg-white/5 border-[#3D7BFF]/30 shadow-xl' 
                              : 'bg-transparent border-white/5 hover:border-white/10'
                           }`}
                         >
                            <div className={`p-2 rounded-lg bg-white/5 ${p.color}`}>
                               <p.icon className="w-4 h-4" />
                            </div>
                            <div>
                               <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>{p.label}</p>
                               <p className="text-[9px] text-[#8A9199] leading-tight mt-1">{p.desc}</p>
                            </div>
                         </button>
                       );
                     })}
                  </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Motivo de la Visita</label>
                  <textarea 
                    required
                    rows={4}
                    placeholder="Describa el requerimiento o la situación que amerita asistencia presencial..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-2xl p-5 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all resize-none placeholder:text-white/10"
                  />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                 <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">SLA Falcon IT</span>
                 </div>
                 <button 
                   type="submit"
                   disabled={isLoading || isOverLimit}
                   className={`flex items-center gap-3 px-8 py-4 ${isOverLimit ? 'bg-white/5 text-white/20' : 'bg-[#3D7BFF]'} text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50`}
                 >
                   {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                   Solicitar Intervención
                 </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
};
