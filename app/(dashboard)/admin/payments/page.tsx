import React from 'react';
import { createServerClientComponent } from '@/lib/supabase-server';
import { AdminPaymentTable } from '@/components/dashboard/AdminPaymentTable';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function AdminPaymentsPage() {
  const supabase = await createServerClientComponent();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch all payments with client info
  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      *,
      clients:client_id (
        business_name,
        contact_name
      )
    `)
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching admin payments:', error);
    return <div>Error al cargar los pagos admin.</div>;
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1F3A5F]/20 rounded-full border border-[#1F3A5F]/30 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Gestión de Ingresos y Activaciones
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            Verificación de Pagos
          </h1>
          <p className="text-[#8A9199] font-medium italic">Auditoría de comprobantes y activación manual de suscripciones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <AdminPaymentTable initialPayments={payments as any || []} adminId={user.id} />
      </div>

      <div className="p-8 bg-[#3D7BFF]/5 border border-[#3D7BFF]/10 rounded-[2rem] flex items-center gap-6 backdrop-blur-xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#3D7BFF]/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:scale-110 transition-transform" />
         <div className="w-16 h-16 bg-[#3D7BFF]/20 rounded-2xl flex items-center justify-center border border-[#3D7BFF]/20 shrink-0">
            <ShieldCheck className="w-8 h-8 text-[#3D7BFF]" />
         </div>
         <div>
            <h4 className="text-white font-bold text-lg mb-1 tracking-tight">Seguridad en Conciliación</h4>
            <p className="text-sm text-[#8A9199] font-medium italic max-w-2xl leading-relaxed">Cada validación dispara automáticamente la activación del servicio y el envío de notificaciones internas. Asegúrese de verificar la referencia bancaria antes de aprobar.</p>
         </div>
      </div>
    </div>
  );
}
