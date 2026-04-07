'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Loader2, 
  FileText, 
  Building2, 
  Calendar, 
  AlertTriangle,
  FileSearch,
  CheckCircle2
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { createServiceReport } from '@/lib/actions/admin.actions';
import { useRouter } from 'next/navigation';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportUploadModal = ({ isOpen, onClose }: ReportUploadModalProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    clientId: '',
    visitId: '',
    incidentId: '',
    title: '',
    summary: '',
    recommendations: '',
  });

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: clientData } = await supabase.from('clients').select('id, business_name').order('business_name');
      if (clientData) setClients(clientData);

      if (formData.clientId) {
         const { data: visitData } = await supabase
          .from('visits')
          .select('id, title, scheduled_start')
          .eq('client_id', formData.clientId)
          .order('scheduled_start', { ascending: false });
         if (visitData) setVisits(visitData);

         const { data: incidentData } = await supabase
          .from('incidents')
          .select('id, title')
          .eq('client_id', formData.clientId)
          .order('reported_at', { ascending: false });
         if (incidentData) setIncidents(incidentData);
      }
    };
    if (isOpen) fetchData();
  }, [isOpen, formData.clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Por favor seleccione un archivo.");
    
    setIsLoading(true);

    try {
      // 1. Upload file to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.clientId}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('service-reports')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create DB record
      const { error: dbError } = await createServiceReport({
        client_id: formData.clientId,
        visit_id: formData.visitId || null,
        incident_id: formData.incidentId || null,
        title: formData.title,
        summary: formData.summary,
        recommendations: formData.recommendations,
        file_path: filePath,
        file_url: null, // We use signed URLs later
      });

      if (dbError) throw dbError;

      onClose();
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl bg-black/60">
      <div className="bg-[#0B1622] border border-white/10 w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#3D7BFF]/10 flex items-center justify-center text-[#3D7BFF]">
                 <Upload className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Cargar Informe Técnico</h2>
                 <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest mt-1">Sube la documentación oficial de la visita</p>
              </div>
           </div>
           <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
              <X className="w-6 h-6 text-white/20" />
           </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Seleccionar Cliente</label>
                 <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <select 
                      required
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-[#3D7BFF]/50 transition-all appearance-none"
                    >
                       <option value="" className="bg-[#0B1622]">-- Elegir Cliente --</option>
                       {clients.map(c => <option key={c.id} value={c.id} className="bg-[#0B1622]">{c.business_name}</option>)}
                    </select>
                 </div>
              </div>

              {/* Vinculo (Visita o Incidencia) */}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Vincular a Visita (Opcional)</label>
                 <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <select 
                      disabled={!formData.clientId}
                      value={formData.visitId}
                      onChange={(e) => setFormData({...formData, visitId: e.target.value})}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-[#3D7BFF]/50 transition-all appearance-none disabled:opacity-30"
                    >
                       <option value="" className="bg-[#0B1622]">-- Sin vínculo --</option>
                       {visits.map(v => <option key={v.id} value={v.id} className="bg-[#0B1622]">{v.title} ({new Date(v.scheduled_start).toLocaleDateString()})</option>)}
                    </select>
                 </div>
              </div>
           </div>

           {/* Titulo */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Título del Reporte</label>
              <input 
                required
                type="text"
                placeholder="Ej: Reporte Mantenimiento de Servidores Q1"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#3D7BFF]/50 transition-all"
              />
           </div>

           {/* Summary */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Resumen Ejecutivo</label>
              <textarea 
                required
                rows={3}
                placeholder="Breve descripción de los hallazgos y trabajos realizados..."
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#3D7BFF]/50 transition-all resize-none"
              />
           </div>

           {/* Archivo */}
           <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-2">Documento Digital (Max 5MB)</label>
              <div className="relative">
                 <input 
                   type="file" 
                   accept=".pdf,.png,.jpg,.jpeg"
                   onChange={(e) => setFile(e.target.files?.[0] || null)}
                   className="hidden" 
                   id="report-file" 
                 />
                 <label 
                   htmlFor="report-file"
                   className="flex flex-col items-center justify-center w-full bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-8 cursor-pointer hover:border-[#3D7BFF]/40 hover:bg-[#3D7BFF]/5 transition-all group"
                 >
                    {file ? (
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 className="w-5 h-5" />
                         </div>
                         <div className="text-left">
                            <p className="text-xs font-bold text-white">{file.name}</p>
                            <p className="text-[9px] text-[#8A9199]">{(file.size / 1024 / 1024).toFixed(2)} MB • Listo para subir</p>
                         </div>
                      </div>
                    ) : (
                      <>
                        <FileSearch className="w-10 h-10 text-white/10 group-hover:text-[#3D7BFF]/40 mb-3 transition-colors" />
                        <p className="text-xs font-bold text-white/40 group-hover:text-white transition-colors">Haga clic o arrastre para cargar archivo</p>
                        <p className="text-[9px] text-[#8A9199] mt-1 uppercase tracking-widest font-black opacity-40">PDF, PNG, JPG únicamente</p>
                      </>
                    )}
                 </label>
              </div>
           </div>

           {/* Footer Buttons */}
           <div className="flex items-center justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-4 text-white/20 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-all"
              >
                 Cancelar
              </button>
              <button 
                type="submit"
                disabled={isLoading || !file || !formData.clientId}
                className="flex items-center gap-3 px-10 py-4 bg-[#3D7BFF] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                 {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                 Finalizar y Sincronizar
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};
