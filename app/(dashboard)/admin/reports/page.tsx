'use client';

import React, { useState, useEffect } from 'react';
import { ServiceReportTable } from '@/components/dashboard/ServiceReportTable';
import { ReportUploadModal } from '@/components/admin/ReportUploadModal';
import { getServiceReports } from '@/lib/actions/admin.actions';
import { 
  FileText, 
  Plus, 
  Briefcase, 
  Activity, 
  Loader2,
  RefreshCcw
} from 'lucide-react';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await getServiceReports();
    if (data) setReports(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3D7BFF]/10 rounded-full border border-[#3D7BFF]/20 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Gestión Documental Técnica
          </div>
          <h1 className="text-4xl font-serif font-bold text-white tracking-tight">
            Archivo de Reportes
          </h1>
          <p className="text-[#8A9199] font-medium italic">Repositorio oficial de informes de servicio y diagnósticos por cliente.</p>
        </div>

        <div className="flex items-center gap-4">
           <button 
             onClick={fetchData}
             className="p-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all"
           >
              <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="flex items-center gap-3 px-8 py-4 bg-[#3D7BFF] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
           >
              <Plus className="w-4 h-4" />
              Nuevo Informe
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-[#3D7BFF]/10 rounded-2xl flex items-center justify-center text-[#3D7BFF]">
               <FileText className="w-6 h-6" />
            </div>
            <div>
               <p className="text-2xl font-black text-white">{reports.length}</p>
               <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Total Reportes</p>
            </div>
         </div>
         <div className="bg-white/[0.03] border border-white/5 p-6 rounded-[2.5rem] flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
               <Briefcase className="w-6 h-6" />
            </div>
            <div>
               <p className="text-2xl font-black text-white">{Array.from(new Set(reports.map(r => r.client_id))).length}</p>
               <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Clientes Atendidos</p>
            </div>
         </div>
      </div>

      {isLoading && reports.length === 0 ? (
        <div className="h-[40vh] flex items-center justify-center">
           <Loader2 className="w-10 h-10 text-[#3D7BFF] animate-spin opacity-20" />
        </div>
      ) : (
        <ServiceReportTable reports={reports} isAdmin={true} />
      )}

      <ReportUploadModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchData();
        }}
      />
    </div>
  );
}
