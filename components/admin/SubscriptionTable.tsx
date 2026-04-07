'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronRight, 
  RotateCcw, 
  PauseCircle, 
  XCircle,
  BarChart3,
  Search,
  ArrowUpRight,
  Package
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/Common';
import { SubscriptionStatus } from '@/lib/types';

interface SubscriptionWithInfo {
  id: string;
  status: SubscriptionStatus;
  start_date?: string;
  end_date?: string;
  price_snapshot_usd: number;
  visit_used_count: number;
  visit_available_count: number;
  days_remaining: number;
  client: { business_name: string };
  plan: { name: string, is_unlimited_visits: boolean };
}

export const SubscriptionTable = ({ initialSubs }: { initialSubs: SubscriptionWithInfo[] }) => {
  const [filter, setFilter] = useState('all');

  const filteredSubs = filter === 'all' 
    ? initialSubs 
    : initialSubs.filter(s => s.status === filter);

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Estado de Suscripciones</h2>
          <p className="text-xs text-[#8A9199] font-medium italic mt-1 font-serif tracking-widest uppercase opacity-80 leading-relaxed">Monitoreo de ciclos de servicio y vigencia contractual.</p>
        </div>

        <div className="flex items-center gap-4">
           <select 
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="bg-white/5 border border-white/5 rounded-xl py-2 px-4 text-xs text-white outline-none focus:border-[#3D7BFF]/50 cursor-pointer"
           >
              <option value="all">Todos los estados</option>
              <option value="active">Activas</option>
              <option value="pending_payment">Pendiente Pago</option>
              <option value="suspended">Suspendidas</option>
              <option value="expired">Vencidas</option>
           </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Empresa / Plan</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Vencimiento</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Visitas</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Monto</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSubs.map((sub) => (
              <tr key={sub.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D7BFF]/10 flex items-center justify-center text-[#3D7BFF] shrink-0 border border-[#3D7BFF]/20">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white tracking-tight">{sub.client.business_name}</p>
                      <p className="text-[10px] text-[#3D7BFF] font-black uppercase tracking-widest italic">{sub.plan.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                   <div className="space-y-1">
                      <p className="text-xs font-bold text-white">
                        {sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'No definida'}
                      </p>
                      <div className="flex items-center gap-2">
                         <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden w-20">
                            <div 
                              className={`h-full rounded-full ${sub.days_remaining < 5 ? 'bg-red-500' : 'bg-[#3D7BFF]'}`}
                              style={{ width: `${Math.min((sub.days_remaining / 30) * 100, 100)}%` }}
                            />
                         </div>
                         <span className={`text-[10px] font-black ${sub.days_remaining < 5 ? 'text-red-500' : 'text-[#8A9199]'}`}>
                           {sub.days_remaining}d
                         </span>
                      </div>
                   </div>
                </td>
                <td className="px-8 py-6">
                   <div className="flex items-center gap-2">
                      <BarChart3 className="w-3.5 h-3.5 text-[#8A9199]" />
                      <span className="text-xs font-bold text-white">{sub.visit_used_count} / {sub.plan.is_unlimited_visits ? '∞' : sub.visit_available_count + sub.visit_used_count}</span>
                   </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-white">${sub.price_snapshot_usd}</span>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-8 py-6 text-right">
                   <div className="flex items-center justify-end gap-2">
                      <button className="p-2 border border-white/5 bg-white/5 rounded-lg text-[#8A9199] hover:text-[#3D7BFF] transition-all">
                         <RotateCcw className="w-4 h-4" />
                      </button>
                      <button className="p-2 border border-white/5 bg-white/5 rounded-lg text-[#8A9199] hover:text-white transition-all">
                         <ChevronRight className="w-4 h-4" />
                      </button>
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
