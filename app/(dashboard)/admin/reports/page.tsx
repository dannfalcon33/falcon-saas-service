'use client';

import React, { useState, useEffect } from 'react';
import { ServiceReportTable } from '@/components/dashboard/ServiceReportTable';
import { ReportUploadModal } from '@/components/admin/ReportUploadModal';
import { getServiceReports } from '@/lib/actions/admin.actions';
import { 
  FileText, 
  Plus, 
  Briefcase, 
  Loader2,
  RefreshCcw
} from 'lucide-react';

interface ReportListItem {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  client_id: string | null;
  work_performed?: string;
  recommendations?: string;
  file_url?: string;
  file_path?: string;
  client?: { business_name: string };
  visit?: { title: string; scheduled_start: string };
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    const { data } = await getServiceReports();
    if (data) setReports(data as ReportListItem[]);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await fetchData();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3D7BFF]/10 rounded-full border border-[#3D7BFF]/20 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Gestión Documental Técnica
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white tracking-tight">
            Archivo de Reportes
          </h1>
          <p className="text-sm md:text-base text-[#8A9199] font-medium italic">
            Repositorio oficial de informes de servicio y diagnósticos por cliente.
          </p>
        </div>

        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
           <button 
             onClick={handleRefresh}
             className="p-3 md:p-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all shrink-0"
           >
              <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full md:w-auto justify-center flex items-center gap-3 px-5 md:px-8 py-3 md:py-4 bg-[#3D7BFF] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-2xl"
           >
              <Plus className="w-4 h-4" />
              Nuevo Informe
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
         <div className="bg-white/[0.03] border border-white/5 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#3D7BFF]/10 rounded-2xl flex items-center justify-center text-[#3D7BFF]">
               <FileText className="w-6 h-6" />
            </div>
            <div>
               <p className="text-2xl font-black text-white">{reports.length}</p>
               <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Total Reportes</p>
            </div>
         </div>
         <div className="bg-white/[0.03] border border-white/5 p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
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
          void handleRefresh();
        }}
      />
    </div>
  );
}
