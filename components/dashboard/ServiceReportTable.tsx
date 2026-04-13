'use client';

import React from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  ClipboardCheck,
  Building2,
  FileSearch,
  Activity
} from 'lucide-react';
import { getSecureReportUrl } from '@/lib/actions/dashboard.actions';

interface ServiceReportWithInfo {
  id: string;
  title: string;
  summary: string;
  work_performed?: string;
  recommendations?: string;
  file_url?: string;
  file_path?: string;
  created_at: string;
  client?: { business_name: string };
  visit?: { title: string, scheduled_start: string };
}

interface ServiceReportTableProps {
  reports: ServiceReportWithInfo[];
  isAdmin?: boolean;
}

export const ServiceReportTable = ({ reports, isAdmin }: ServiceReportTableProps) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  
  const handleDownload = async (id: string) => {
    try {
      const { data, error } = await getSecureReportUrl(id);
      if (error) {
        alert(`Error al acceder al archivo: ${error}`);
        return;
      }
      if (data) window.open(data, '_blank');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      alert("Error al acceder al archivo: " + message);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
      <div className="p-8 border-b border-white/5">
        <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Biblioteca de Reportes</h2>
        <p className="text-xs text-[#8A9199] font-medium italic mt-1 font-serif tracking-widest uppercase opacity-80 leading-relaxed disabled:opacity-50">Documentación técnica de visitas e incidencias resueltas.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Documento / {isAdmin ? 'Cliente' : 'Servicio'}</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fecha Emisión</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Recomendaciones</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reports.length > 0 ? reports.map((report) => (
              <React.Fragment key={report.id}>
                <tr className="group hover:bg-white/[0.01] transition-colors border-none">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#3D7BFF] shadow-sm">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight line-clamp-1">{report.title}</p>
                        <p className="text-[10px] text-[#8A9199] font-medium uppercase tracking-widest italic">
                          {isAdmin ? report.client?.business_name : (report.visit?.title || 'Reporte Técnico')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-2 text-white/60">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{new Date(report.created_at).toLocaleDateString()}</span>
                     </div>
                  </td>
                  <td className="px-8 py-6 max-w-xs">
                     {report.recommendations ? (
                        <p className="text-[10px] text-[#8A9199] font-medium italic leading-relaxed line-clamp-2">
                          {report.recommendations}
                        </p>
                     ) : (
                        <span className="text-[10px] text-white/10 font-black uppercase tracking-widest italic">N/A</span>
                     )}
                  </td>
                  <td className="px-8 py-6 text-right">
                     <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                          className={`p-2 border border-white/5 rounded-lg transition-all ${expandedId === report.id ? 'bg-[#3D7BFF] text-white' : 'bg-white/5 text-[#8A9199] hover:text-white'}`}
                        >
                           <ChevronRight className={`w-4 h-4 transition-transform ${expandedId === report.id ? 'rotate-90' : ''}`} />
                        </button>
                        {report.file_path && (
                          <button 
                            onClick={() => handleDownload(report.id)}
                            className="p-2 border border-[#3D7BFF]/20 bg-[#3D7BFF]/5 rounded-lg text-[#3D7BFF] hover:bg-[#3D7BFF] hover:text-white transition-all shadow-md group/dl"
                          >
                             <Download className="w-4 h-4 group-hover/dl:scale-110 transition-transform" />
                          </button>
                        )}
                     </div>
                  </td>
                </tr>
                {expandedId === report.id && (
                  <tr className="bg-[#3D7BFF]/5">
                    <td colSpan={4} className="px-8 py-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 text-[#3D7BFF]">
                                <ClipboardCheck className="w-4 h-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Trabajo Realizado</p>
                             </div>
                             <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <p className="text-xs text-white/80 leading-relaxed whitespace-pre-wrap">{report.work_performed || 'No se detalló el trabajo en este reporte.'}</p>
                             </div>
                          </div>
                          <div className="space-y-3">
                             <div className="flex items-center gap-2 text-emerald-500">
                                <Activity className="w-4 h-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Resumen Ejecutivo</p>
                             </div>
                             <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                <p className="text-xs text-[#8A9199] leading-relaxed italic">{report.summary}</p>
                             </div>
                          </div>
                       </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center">
                   <div className="flex flex-col items-center gap-4 opacity-20">
                      <FileSearch className="w-12 h-12" />
                      <p className="text-sm font-serif italic tracking-widest uppercase">No hay reportes disponibles</p>
                   </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
