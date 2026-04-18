'use client';

import React, { useState, useEffect } from 'react';
import { getLeads } from '@/lib/actions/admin.actions';
import { LeadDetailModal } from '@/components/admin/LeadDetailModal';
import { StatusBadge } from '@/components/dashboard/Common';
import {
  Search,
  Filter,
  Loader2,
  ChevronRight,
  UserCheck,
  Clock,
  RefreshCcw,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface LeadItem {
  id: string;
  full_name: string;
  company_name: string;
  status: string;
  created_at: string;
  submitted_at?: string;
  reference_code?: string;
  plan?: {
    name?: string;
  } | null;
  [key: string]: unknown;
}

export default function AdminLeadsPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminId, setAdminId] = useState<string>('');

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await getLeads(filter === 'all' ? undefined : filter);
    if (data) setLeads(data as LeadItem[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    const getAdmin = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setAdminId(user.id);
    };
    getAdmin();
  }, [filter]);

  const filteredLeads = leads.filter(
    (lead) =>
      lead.full_name.toLowerCase().includes(search.toLowerCase()) ||
      lead.company_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenLead = (lead: LeadItem) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const formatLeadDate = (lead: LeadItem) => {
    return new Date(lead.submitted_at || lead.created_at).toLocaleDateString();
  };

  return (
    <div className="space-y-6 md:space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#3D7BFF]/10 rounded-full border border-[#3D7BFF]/20 text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest mb-2 font-serif">
            Bandeja Comercial
          </div>
          <h1 className="text-2xl md:text-4xl font-serif font-bold text-white tracking-tight">Prospectos / Leads</h1>
          <p className="text-sm md:text-base text-[#8A9199] font-medium italic">
            Gestione nuevas solicitudes y valide pagos para activación de clientes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-3 md:p-4 bg-white/5 border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all"
            title="Actualizar"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
        <div className="bg-white/[0.03] border border-white/5 p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#3D7BFF]/10 rounded-2xl flex items-center justify-center text-[#3D7BFF]">
            <Clock className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-white">{leads.filter((l) => l.status === 'new').length}</p>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Nuevos</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
            <UserCheck className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-white">{leads.filter((l) => l.status === 'pending_review').length}</p>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">En Revisión</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-white">{leads.filter((l) => l.status === 'won').length}</p>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Convertidos</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 p-4 md:p-6 rounded-3xl flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
            <XCircle className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <p className="text-xl md:text-2xl font-black text-white">{leads.filter((l) => l.status === 'lost').length}</p>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Perdidos</p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <div className="p-4 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Buscar prospecto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-11 pr-4 text-sm text-white outline-none focus:border-[#3D7BFF]/50 transition-all"
            />
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <div className="w-full md:w-auto flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-xl">
              <Filter className="w-3.5 h-3.5 text-white/40" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full md:w-auto bg-transparent text-xs text-white outline-none cursor-pointer pr-2"
              >
                <option value="all" className="bg-[#0B1622]">
                  Todos los estados
                </option>
                <option value="new" className="bg-[#0B1622]">
                  Nuevos
                </option>
                <option value="pending_review" className="bg-[#0B1622]">
                  En Revisión
                </option>
                <option value="won" className="bg-[#0B1622]">
                  Convertidos (Won)
                </option>
                <option value="lost" className="bg-[#0B1622]">
                  Rechazados (Lost)
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="md:hidden divide-y divide-white/5">
          {isLoading && leads.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <Loader2 className="w-8 h-8 text-[#3D7BFF] animate-spin mx-auto opacity-40" />
            </div>
          ) : filteredLeads.length > 0 ? (
            filteredLeads.map((lead) => (
              <article key={lead.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white tracking-tight truncate">{lead.company_name}</p>
                      <p className="text-[10px] text-[#8A9199] font-medium italic truncate">{lead.full_name}</p>
                    </div>
                  </div>
                  <StatusBadge status={lead.status} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Plan</p>
                    <p className="text-xs font-bold text-white/80 mt-1">{lead.plan?.name || 'N/A'}</p>
                  </div>
                  <div className="p-3 rounded-xl border border-white/5 bg-black/20">
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Referencia</p>
                    <p className="text-xs font-bold text-white/80 mt-1 truncate">{lead.reference_code || 'S/R'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{formatLeadDate(lead)}</span>
                  </div>

                  <button
                    onClick={() => handleOpenLead(lead)}
                    className="inline-flex items-center gap-1 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-[#8A9199] hover:text-[#3D7BFF] hover:border-[#3D7BFF]/30 transition-all"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Abrir</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="px-4 py-20 text-center">
              <p className="text-xs font-serif italic tracking-widest text-[#8A9199]/40 uppercase">
                No hay prospectos que coincidan
              </p>
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Prospecto / Empresa</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Plan / Referencia</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Enviado</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading && leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-[#3D7BFF] animate-spin mx-auto opacity-20" />
                  </td>
                </tr>
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-white/40">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white tracking-tight line-clamp-1">{lead.company_name}</p>
                          <p className="text-[10px] text-[#8A9199] font-medium italic mt-0.5">{lead.full_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white/80">Plan {lead.plan?.name || 'N/A'}</p>
                        <p className="text-[10px] text-white/20 font-black tracking-widest uppercase">REF: {lead.reference_code || 'S/R'}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-white/60">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{formatLeadDate(lead)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleOpenLead(lead)}
                        className="p-3 bg-white/5 border border-white/5 rounded-2xl text-[#8A9199] hover:text-[#3D7BFF] hover:border-[#3D7BFF]/30 transition-all group/btn"
                      >
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <p className="text-xs font-serif italic tracking-widest text-[#8A9199]/40 uppercase">No hay prospectos que coincidan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <LeadDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchData();
        }}
        lead={selectedLead}
        adminId={adminId}
      />
    </div>
  );
}
