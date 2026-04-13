'use client';

import React, { useState } from 'react';
import { MousePointer2 } from 'lucide-react';
import { VisitRequestModal } from './VisitRequestModal';
import { PendingVisitsList } from './PendingVisitsList';
import { VisitRequest } from '@/lib/types';

interface VisitStats {
  visit_used_count: number;
  visit_available_count: number;
  visit_limit_snapshot: number;
  is_unlimited_snapshot: boolean;
}

interface VisitManagementSectionProps {
  subscriptionId?: string;
  visitStats?: VisitStats | null;
  pendingRequests: VisitRequest[];
}

export const VisitManagementSection = ({ 
  subscriptionId, 
  visitStats, 
  pendingRequests 
}: VisitManagementSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-10">
      {/* Call to Action Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-[#3D7BFF]/5 border border-[#3D7BFF]/10 rounded-3xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3D7BFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-[#3D7BFF]/10 rounded-2xl flex items-center justify-center text-[#3D7BFF] shadow-inner">
            <MousePointer2 className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-serif font-bold text-white tracking-tight">¿Necesitas soporte presencial?</h3>
            <p className="text-sm text-[#8A9199]">Solicita una visita técnica para mantenimientos preventivos o correctivos.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 px-10 py-5 bg-[#3D7BFF] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#3D7BFF]/40 border border-white/10"
        >
          Solicitar Visita Técnica
        </button>
      </div>

      {/* Pending Requests Section */}
      <PendingVisitsList requests={pendingRequests} />

      {/* Request Modal */}
      <VisitRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        subscriptionId={subscriptionId}
        visitStats={visitStats || undefined}
      />
    </div>
  );
};
