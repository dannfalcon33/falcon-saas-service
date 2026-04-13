import React from 'react';
import { getAuthenticatedClientContext, getPaymentHistory, getCurrentSubscription } from '@/lib/actions/dashboard.actions';
import { UploadProofForm } from '@/components/dashboard/UploadProofForm';
import { PaymentHistoryTable } from '@/components/dashboard/PaymentHistoryTable';
import { CreditCard, ShieldCheck, Info } from 'lucide-react';
import { createServerClientComponent } from '@/lib/supabase-server';

export default async function ClientPaymentsPage() {
  const { clientId } = await getAuthenticatedClientContext();
  const supabase = await createServerClientComponent();

  const { data: client } = await supabase
    .from('clients')
    .select('id, business_name')
    .eq('id', clientId)
    .single();

  if (!client) return <div>No se encontró el cliente.</div>;

  const { data: subscription } = await getCurrentSubscription(client.id);
  const { data: payments } = await getPaymentHistory(client.id);

  // Fallback for subscriptionID if not active yet
  const { data: anySub } = await supabase
    .from('subscriptions')
    .select('id, price_snapshot_usd')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F3A5F]/20 rounded-full border border-[#1F3A5F]/30 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Finanzas y Facturación
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            Gestión de Pagos
          </h1>
          <p className="text-[#8A9199] font-medium italic">Historial de transacciones y herramientas de activación.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Form (1/3) */}
        <div className="lg:col-span-1 space-y-6">
          <UploadProofForm 
            clientId={client.id}
            subscriptionId={subscription?.id || anySub?.id || ''}
            amountUsd={subscription?.price_snapshot_usd || anySub?.price_snapshot_usd || 0}
          />
          
          <div className="p-6 bg-[#3D7BFF]/5 border border-[#3D7BFF]/10 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-[#3D7BFF]/5 rounded-full -mr-8 -mt-8" />
             <div className="flex gap-4 relative z-10">
                <ShieldCheck className="w-6 h-6 text-[#3D7BFF] shrink-0" />
                <p className="text-[11px] leading-relaxed italic text-[#8A9199] font-medium">
                  Tus datos de pago están cifrados y solo son accesibles por el personal administrativo de Falcon IT para fines de verificación.
                </p>
             </div>
          </div>
        </div>

        {/* History Table (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentHistoryTable payments={payments as any || []} />
          
          <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center gap-4 group hover:bg-white/[0.04] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-[#3D7BFF] border border-white/5 group-hover:scale-105 transition-transform">
              <Info className="w-5 h-5 opacity-50" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Métodos Adicionales</h4>
              <p className="text-[11px] text-[#8A9199] font-medium">Si necesitas realizar un pago por transferencia internacional o Zelle, contacta a tu asesor técnico.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
