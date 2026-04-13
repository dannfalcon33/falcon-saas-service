'use client';

import React, { useState } from 'react';
import { StatusBadge } from './Common';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  Search,
  Filter
} from 'lucide-react';
import { getSignedUrl } from '@/lib/actions/dashboard.actions';
import { verifyPayment } from '@/lib/actions/admin.actions';
import { useRouter } from 'next/navigation';

interface Payment {
  id: string;
  amount_usd: number;
  payment_method: string;
  reference_code: string;
  status: string;
  submitted_at: string;
  proof_file_url?: string;
  proof_file_path?: string;
  admin_notes?: string;
  clients?: {
    business_name: string;
    contact_name: string;
  };
}

export const AdminPaymentTable = ({ initialPayments, adminId }: { initialPayments: Payment[], adminId: string }) => {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [filter, setFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--/--/----';
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter);

  const handleViewProof = async (path: string) => {
    const { data: url, error } = await getSignedUrl(path);
    if (error) {
      alert(`Error al generar enlace: ${error}`);
      return;
    }
    if (url) window.open(url, '_blank');
  };

  const handleVerify = async (paymentId: string) => {
    if (!confirm("¿Confirmar verificación de pago? Esto activará la suscripción del cliente.")) return;
    
    setIsProcessing(paymentId);
    try {
      const { error } = await verifyPayment(paymentId, adminId);
      if (error) throw error;
      
      // Update local state or just refresh
      router.refresh();
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: 'verified' } : p));
    } catch (err: any) {
      alert("Error verificando pago: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Registro de Pagos</h2>
          <p className="text-xs text-[#8A9199] font-medium italic mt-1 font-serif tracking-[0.05em] opacity-80 uppercase tracking-widest leading-relaxed line-clamp-1">Validación de ingresos y activación administrativa.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input type="text" placeholder="Buscar..." className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#3D7BFF]/50" />
           </div>
           <select 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="bg-white/5 border border-white/5 rounded-xl py-2 px-4 text-xs text-white outline-none focus:border-[#3D7BFF]/50 cursor-pointer"
           >
              <option value="all">Todos los estados</option>
              <option value="submitted">Pendientes</option>
              <option value="verified">Verificados</option>
              <option value="rejected">Rechazados</option>
           </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Cliente</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Referencia</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Monto</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fecha Envío</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-white tracking-tight">{payment.clients?.business_name}</p>
                  <p className="text-[10px] text-[#8A9199] font-medium italic">{payment.clients?.contact_name}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#3D7BFF] uppercase tracking-widest mb-1">{payment.payment_method}</span>
                    <code className="text-[10px] text-white/60">{payment.reference_code}</code>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-white">${payment.amount_usd}</span>
                </td>
                <td className="px-8 py-6 text-sm">
                  {formatDate(payment.submitted_at)}
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-3">
                      {(payment.proof_file_path || payment.proof_file_url) && (
                        <button 
                          onClick={() => handleViewProof(payment.proof_file_path || payment.proof_file_url!)}
                          className="p-2 bg-white/5 border border-white/5 rounded-lg text-white/40 hover:text-[#3D7BFF] hover:border-[#3D7BFF]/30 transition-all group/btn"
                          title="Ver Comprobante"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                      
                      {payment.status === 'submitted' && (
                        <button 
                          onClick={() => handleVerify(payment.id)}
                          disabled={isProcessing === payment.id}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-50"
                        >
                          {isProcessing === payment.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                          Aprobar
                        </button>
                      )}
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
