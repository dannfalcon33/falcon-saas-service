'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Send, 
  Loader2, 
  X,
  ShieldAlert,
  Zap,
  Clock,
  Info
} from 'lucide-react';
import { createIncident } from '@/lib/actions/dashboard.actions';
import { IncidentPriority } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface IncidentFormProps {
  clientId: string;
  subscriptionId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const IncidentForm = ({ clientId, subscriptionId, onSuccess, onCancel }: IncidentFormProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as IncidentPriority
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await createIncident({
        clientId,
        subscriptionId,
        ...formData
      });

      if (error) throw error;
      
      setFormData({ title: '', description: '', priority: 'medium' });
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      alert("Error al reportar: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const priorities: { value: IncidentPriority; label: string; icon: any; color: string; desc: string }[] = [
    { value: 'low', label: 'Baja', icon: Info, color: 'text-blue-400', desc: 'Consultas o ajustes menores.' },
    { value: 'medium', label: 'Media', icon: Clock, color: 'text-amber-400', desc: 'Falla parcial que no detiene la operación.' },
    { value: 'high', label: 'Alta', icon: Zap, color: 'text-orange-500', desc: 'Falla crítica que afecta procesos clave.' },
    { value: 'critical', label: 'Crítica', icon: ShieldAlert, color: 'text-red-500', desc: 'Operación TOTALMENTE detenida.' },
  ];

  return (
    <div className="bg-[#0B1622] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-3xl rounded-full translate-x-32 -translate-y-32" />
      
      <div className="relative space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
             <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Reportar Incidencia</h2>
             </div>
             <p className="text-xs text-[#8A9199] font-medium italic uppercase tracking-widest font-serif">Notifica una falla técnica para atención inmediata.</p>
          </div>
          {onCancel && (
            <button onClick={onCancel} className="p-2 hover:bg-white/5 rounded-xl transition-all">
               <X className="w-5 h-5 text-white/40" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Prioridad */}
             <div className="space-y-4 col-span-full">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Nivel de Prioridad</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                   {priorities.map((p) => {
                     const isSelected = formData.priority === p.value;
                     return (
                       <button
                         key={p.value}
                         type="button"
                         onClick={() => setFormData({ ...formData, priority: p.value })}
                         className={`p-4 rounded-2xl border transition-all text-left flex flex-col gap-2 relative overflow-hidden group ${
                           isSelected 
                            ? 'bg-white/5 border-white/20 shadow-xl' 
                            : 'bg-transparent border-white/5 hover:border-white/10'
                         }`}
                       >
                          <div className={`p-2 rounded-lg bg-white/5 w-fit ${p.color}`}>
                             <p.icon className="w-4 h-4" />
                          </div>
                          <div>
                             <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-white/60'}`}>{p.label}</p>
                             <p className="text-[9px] text-[#8A9199] leading-tight mt-1">{p.desc}</p>
                          </div>
                          {isSelected && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#3D7BFF] rounded-full" />}
                       </button>
                     );
                   })}
                </div>
             </div>

             {/* Titulo */}
             <div className="space-y-2 col-span-full">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Asunto / Título Breve</label>
                <input 
                  required
                  type="text"
                  placeholder="Ej: Servidor de correos no responde"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-red-500/50 outline-none transition-all placeholder:text-white/10"
                />
             </div>

             {/* Descripción */}
             <div className="space-y-2 col-span-full">
                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Descripción Detallada</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Explique lo que sucede, pasos para reproducir o errores mostrados..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-red-500/50 outline-none transition-all resize-none placeholder:text-white/10"
                />
             </div>
          </div>

          <div className="flex justify-end pt-4">
             <button 
               disabled={isLoading}
               className="flex items-center gap-3 px-10 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)] disabled:opacity-50"
             >
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
               Enviar Reporte de Falla
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};
