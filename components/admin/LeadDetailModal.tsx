'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  User, 
  Building2, 
  Mail, 
  Phone, 
  CreditCard, 
  Calendar,
  Download,
  Loader2,
  ArrowRightLeft,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { updateLeadStatus, updateLeadNotes, convertLeadToClient } from '@/lib/actions/admin.actions';
import { getSignedUrl } from '@/lib/actions/dashboard.actions';
import { StatusBadge } from '@/components/dashboard/Common';

interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any;
  adminId: string;
}

export const LeadDetailModal = ({ isOpen, onClose, lead, adminId }: LeadDetailModalProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState(lead?.notes || '');

  React.useEffect(() => {
    setNotes(lead?.notes || '');
  }, [lead?.id]);

  if (!isOpen || !lead) return null;

  const handleUpdateStatus = async (newStatus: string) => {
    setIsProcessing(true);
    try {
      await updateLeadStatus(lead.id, newStatus);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsProcessing(true);
    try {
      await updateLeadNotes(lead.id, notes);
      alert('Observación guardada correctamente.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConvert = async (activateNow: boolean = true) => {
    const msg = activateNow 
      ? '¿Está seguro de convertir y ACTIVAR este prospecto? El cliente tendrá acceso inmediato al dashboard.'
      : '¿Está seguro de convertir este prospecto? El cliente se creará pero su acceso seguirá pendiente hasta que se active manualmente.';
    
    if (!confirm(msg)) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const result = await convertLeadToClient(lead.id, adminId, activateNow);
      if (result.error) throw new Error(result.error);
      
      alert(activateNow ? '¡Activación exitosa!' : '¡Conversión exitosa! El acceso sigue pendiente.');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewProof = async () => {
    if (!lead.proof_file_path) return;
    const { data, error } = await getSignedUrl(lead.proof_file_path, 'payment-proofs');
    if (error) {
      setError(error);
      return;
    }
    if (data) window.open(data, '_blank');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl bg-black/60">
      <div className="bg-[#0B1622] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3D7BFF]/10 flex items-center justify-center text-[#3D7BFF]">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Detalle de Prospecto</h2>
              <div className="flex items-center gap-2 mt-1">
                 <StatusBadge status={lead.status} />
                 <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">ID: {lead.id.slice(0,8)}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-2xl transition-all">
            <X className="w-6 h-6 text-white/20" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm">
               <AlertCircle className="w-5 h-5" />
               <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Información Contacto */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-[#3D7BFF] uppercase tracking-[0.2em]">Datos de Contacto</h3>
               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                     <Building2 className="w-4 h-4 text-white/20" />
                     <p className="text-sm font-bold text-white">{lead.company_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <User className="w-4 h-4 text-white/20" />
                     <p className="text-sm text-white/60">{lead.full_name}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <Mail className="w-4 h-4 text-white/20" />
                     <p className="text-sm text-white/60">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <Phone className="w-4 h-4 text-white/20" />
                     <p className="text-sm text-white/60">{lead.phone || 'N/A'}</p>
                  </div>
               </div>
            </div>

            {/* Plan y Pago */}
            <div className="space-y-4">
               <h3 className="text-[10px] font-black text-[#3D7BFF] uppercase tracking-[0.2em]">Interés y Pago</h3>
               <div className="space-y-3">
                  <div className="flex items-center gap-3">
                     <ShieldCheck className="w-4 h-4 text-white/20" />
                     <p className="text-sm font-bold text-white">Plan {lead.plan?.name || 'No especificado'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <CreditCard className="w-4 h-4 text-white/20" />
                     <p className="text-sm text-white/60 uppercase">{lead.payment_method || 'N/A'}</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <Calendar className="w-4 h-4 text-white/20" />
                     <p className="text-sm text-white/60">{new Date(lead.submitted_at || lead.created_at).toLocaleDateString()}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Comprobante Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Comprobante de Pago</h3>
                  <span className="text-xs font-mono text-[#3D7BFF] font-bold">Ref: {lead.reference_code || 'N/A'}</span>
              </div>
              
              {lead.proof_file_path ? (
                <button 
                  onClick={handleViewProof}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                >
                  <Download className="w-5 h-5 text-[#3D7BFF] group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-bold text-white">Ver Documento</span>
                </button>
              ) : (
                <div className="py-4 text-center border border-dashed border-white/5 rounded-2xl">
                    <p className="text-[10px] text-white/20 italic">Sin comprobante digital.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
               <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Notas Internas</h3>
               <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar observación sobre este prospecto..."
                  className="w-full h-24 bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-white placeholder:text-white/10 outline-none focus:border-[#3D7BFF]/30 transition-all resize-none"
               />
               <button 
                onClick={handleSaveNotes}
                disabled={isProcessing || notes === lead.notes}
                className="w-full py-2 bg-white/5 text-white/40 hover:text-white hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
               >
                 {isProcessing ? 'Guardando...' : 'Guardar Observación'}
               </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <button 
              disabled={isProcessing || lead.status === 'won'}
              onClick={() => handleUpdateStatus('lost')}
              className="px-6 py-3 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-30"
            >
              Rechazar
            </button>
            <button 
              disabled={isProcessing || lead.status === 'pending_review' || lead.status === 'won'}
              onClick={() => handleUpdateStatus('pending_review')}
              className="px-6 py-3 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all disabled:opacity-30"
            >
              En Revisión
            </button>
          </div>

          <div className="flex-1 md:flex-none flex items-center gap-3">
            <button 
              disabled={isProcessing || lead.status === 'won'}
              onClick={() => handleConvert(false)}
              className="px-6 py-4 bg-white/5 border border-white/10 text-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30"
            >
              Solo Convertir
            </button>
            <button 
              disabled={isProcessing || lead.status === 'won'}
              onClick={() => handleConvert(true)}
              className="flex items-center justify-center gap-3 px-10 py-4 bg-[#3D7BFF] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-[#3D7BFF]/20 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              Convertir y Activar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
