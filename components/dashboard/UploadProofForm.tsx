'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { submitPaymentProof } from '@/lib/actions/dashboard.actions';
import { PaymentMethod } from '@/lib/types';

interface UploadProofFormProps {
  clientId: string;
  subscriptionId: string;
  amountUsd: number;
}

export const UploadProofForm = ({ clientId, subscriptionId, amountUsd }: UploadProofFormProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("binance");
  const [reference, setReference] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError("");

    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("El archivo supera el límite de 5MB.");
        setFile(null);
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Formato no permitido. Use JPG, PNG o PDF.");
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !paymentMethod || !reference) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      // 1. Get current user ID for the path
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No session");

      // 2. Define path: payment-proofs/{user_id}/{subscription_id}/{filename}
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${subscriptionId}/${fileName}`;

      // 3. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // 4. Save record in database via Server Action
      const { error: actionError } = await submitPaymentProof({
        clientId,
        subscriptionId,
        amountUsd,
        paymentMethod,
        referenceCode: reference,
        proofFileUrl: uploadData.path, // We store the path for signed URLs later
      });

      if (actionError) throw actionError;

      setSuccess(true);
      router.refresh();
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Error al subir el comprobante.");
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center flex flex-col items-center">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 animate-bounce" />
        <h3 className="text-xl font-serif font-bold text-white mb-2">¡Comprobante Recibido!</h3>
        <p className="text-[#8A9199] text-sm font-medium mb-6 italic">Nuestro equipo verificará el pago en las próximas horas.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="px-6 py-2 bg-emerald-500 text-black font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-all"
        >
          Enviar otro reporte
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#3D7BFF]/5 rounded-full -mr-16 -mt-16 blur-2xl" />
      
      <div className="mb-8 relative z-10">
        <h2 className="text-xl font-serif font-bold text-white tracking-tight">Reportar Pago</h2>
        <p className="text-xs text-[#8A9199] font-medium leading-relaxed italic mt-1">Registra tu comprobante para activar o renovar tu plan.</p>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Método de Pago</label>
            <select 
              className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-white outline-none focus:border-[#3D7BFF]/50 transition-all"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            >
              <option value="binance">Binance Pay</option>
              <option value="pagomovil">Pago Móvil</option>
              <option value="zinli">Zinli</option>
              <option value="transferencia">Transferencia Bancaria</option>
              <option value="efectivo">Efectivo</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Referencia / ID</label>
            <input 
              type="text" 
              placeholder="Ej: 123456" 
              className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm text-white placeholder:text-white/10 outline-none focus:border-[#3D7BFF]/50 transition-all"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Comprobante (Máx 5MB)</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-40 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
              file ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                  {file.type === 'application/pdf' ? <FileText className="w-6 h-6 text-emerald-500" /> : <ImageIcon className="w-6 h-6 text-emerald-500" />}
                </div>
                <p className="text-sm font-bold text-white line-clamp-1 px-4">{file.name}</p>
                <p className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="mt-2 text-[9px] text-[#8A9199] hover:text-red-400 font-black uppercase tracking-widest"
                >
                  Cambiar archivo
                </button>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-[#3D7BFF]/10 rounded-2xl flex items-center justify-center">
                  <Upload className="w-6 h-6 text-[#3D7BFF]" />
                </div>
                <p className="text-sm font-bold text-white">Haz clic para subir archivo</p>
                <p className="text-[9px] text-[#8A9199] font-black uppercase tracking-widest">PDF, JPG o PNG • Máximo 5MB</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <button 
          type="submit"
          disabled={isUploading || !file}
          className="group relative w-full py-5 rounded-2xl bg-white text-black text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition hover:scale-[1.02] active:scale-[0.98] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
           <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/5 to-transparent skew-x-[-20deg] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
          <span className="flex items-center justify-center gap-2">
            {isUploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo comprobante...</>
            ) : (
              "Reportar Pago"
            )}
          </span>
        </button>
      </div>
    </form>
  );
};
