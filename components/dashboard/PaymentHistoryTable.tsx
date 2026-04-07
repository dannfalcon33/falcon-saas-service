'use client';

import React from 'react';
import { StatusBadge } from './Common';
import { ExternalLink, FileText } from 'lucide-react';
import { getSignedUrl } from '@/lib/actions/dashboard.actions';

interface Payment {
  id: string;
  amount_usd: number;
  payment_method: string;
  reference_code: string;
  status: string;
  submitted_at: string;
  verified_at?: string;
  proof_file_url?: string;
}

export const PaymentHistoryTable = ({ payments }: { payments: Payment[] }) => {
  const handleViewProof = async (path: string) => {
    const { data: url, error } = await getSignedUrl(path);
    if (error) {
      alert("Error al generar enlace seguro.");
      return;
    }
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
      <div className="p-8 border-b border-white/5">
        <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Historial de Pagos</h2>
        <p className="text-xs text-[#8A9199] font-medium italic mt-1">Registro detallado de tus transacciones y activaciones.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fecha</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Monto</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Método</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Referencia</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-8 py-12 text-center text-[#8A9199] italic font-medium text-sm">
                  No se han registrado pagos aún.
                </td>
              </tr>
            ) : (
              payments.map((payment) => (
                <tr key={payment.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-white">{new Date(payment.submitted_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-[#8A9199] font-medium">{new Date(payment.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-black text-white">${payment.amount_usd}</span>
                    <span className="text-[10px] text-[#8A9199] ml-1 uppercase">USD</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-[#C0C6CF] capitalize">{payment.payment_method.replace('_', ' ')}</span>
                  </td>
                  <td className="px-8 py-6">
                    <code className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-[#3D7BFF] font-black tracking-widest">{payment.reference_code}</code>
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-8 py-6">
                    {payment.proof_file_url ? (
                      <button 
                        onClick={() => handleViewProof(payment.proof_file_url!)}
                        className="flex items-center gap-2 text-[10px] font-black text-[#3D7BFF] uppercase tracking-widest hover:text-white transition-colors group/btn"
                      >
                        <FileText className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Ver Comprobante
                      </button>
                    ) : (
                      <span className="text-[10px] text-white/10 font-black uppercase tracking-widest">Sin archivo</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
