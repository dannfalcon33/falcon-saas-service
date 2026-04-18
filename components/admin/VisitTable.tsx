'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  MapPin,
  User as UserIcon,
  Clock,
  MoreVertical,
  Activity,
  Plus,
  ClipboardList,
  Loader2,
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/Common';
import { VisitStatus, VisitType } from '@/lib/types';
import { createClient } from '@/lib/supabase';
import { rejectVisitRequestAction, scheduleVisitRequestAction, updateVisit } from '@/lib/actions/admin.actions';
import { useRouter } from 'next/navigation';

interface VisitWithInfo {
  id: string;
  title: string;
  status: VisitStatus;
  scheduled_start: string;
  scheduled_end?: string;
  visit_type: string;
  client: { business_name: string };
  technician?: { full_name: string };
}

interface VisitRequestWithInfo {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: 'pending' | 'scheduled' | 'rejected';
  requested_at: string;
  client?: { business_name: string };
}

interface VisitTableProps {
  initialVisits: VisitWithInfo[];
  initialRequests: VisitRequestWithInfo[];
}

export const VisitTable = ({ initialVisits, initialRequests }: VisitTableProps) => {
  const CARACAS_TIME_ZONE = 'America/Caracas';
  const router = useRouter();
  const supabase = createClient();
  const [visits, setVisits] = useState(initialVisits);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<VisitRequestWithInfo | null>(null);
  const [modalMode, setModalMode] = useState<'schedule' | 'reject' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [statusModalVisit, setStatusModalVisit] = useState<VisitWithInfo | null>(null);
  const [nextVisitStatus, setNextVisitStatus] = useState<VisitStatus>('scheduled');
  const [technicians, setTechnicians] = useState<{ id: string; full_name: string }[]>([]);
  const [scheduleData, setScheduleData] = useState({
    assignedTo: '',
    scheduledStart: '',
    scheduledEnd: '',
    visitType: 'included' as VisitType,
    title: '',
    description: '',
    adminNotes: '',
  });
  const [rejectNotes, setRejectNotes] = useState('');

  useEffect(() => {
    setVisits(initialVisits);
  }, [initialVisits]);

  const filteredVisits = filter === 'all' ? visits : visits.filter((v) => v.status === filter);
  const pendingRequests = initialRequests.filter((r) => r.status === 'pending');

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--/--/----';
    return date.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: CARACAS_TIME_ZONE,
    });
  };

  const formatTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: CARACAS_TIME_ZONE,
    });
  };

  const formatDateTime = (value: string) => `${formatDate(value)} ${formatTime(value)}`;

  const getErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'string' && error.trim()) return error;
    if (error && typeof error === 'object' && 'message' in error) {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) return message;
    }
    return fallback;
  };

  const openScheduleModal = async (request: VisitRequestWithInfo) => {
    setSelectedRequest(request);
    setModalMode('schedule');
    setScheduleData({
      assignedTo: '',
      scheduledStart: '',
      scheduledEnd: '',
      visitType: 'included',
      title: request.title || 'Visita técnica programada',
      description: request.description || '',
      adminNotes: '',
    });

    const { data } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('role', ['admin', 'technician'])
      .order('full_name', { ascending: true });

    if (data) setTechnicians(data);
  };

  const openRejectModal = (request: VisitRequestWithInfo) => {
    setSelectedRequest(request);
    setModalMode('reject');
    setRejectNotes('');
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setModalMode(null);
    setIsLoading(false);
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !scheduleData.scheduledStart) return;

    setIsLoading(true);
    const { error } = await scheduleVisitRequestAction({
      requestId: selectedRequest.id,
      assignedTo: scheduleData.assignedTo || undefined,
      scheduledStart: new Date(scheduleData.scheduledStart).toISOString(),
      scheduledEnd: scheduleData.scheduledEnd ? new Date(scheduleData.scheduledEnd).toISOString() : undefined,
      visitType: scheduleData.visitType,
      title: scheduleData.title,
      description: scheduleData.description,
      adminNotes: scheduleData.adminNotes || undefined,
    });

    setIsLoading(false);
    if (error) {
      alert(`No se pudo programar la visita: ${getErrorMessage(error, 'Error inesperado')}`);
      return;
    }

    closeModal();
    router.refresh();
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsLoading(true);
    const { error } = await rejectVisitRequestAction({
      requestId: selectedRequest.id,
      adminNotes: rejectNotes || undefined,
    });
    setIsLoading(false);

    if (error) {
      alert(`No se pudo rechazar la solicitud: ${getErrorMessage(error, 'Error inesperado')}`);
      return;
    }

    closeModal();
    router.refresh();
  };

  const handleUpdateVisitStatus = async (visitId: string, status: VisitStatus) => {
    setStatusUpdatingId(visitId);

    const visitData: Partial<{ status: VisitStatus; completed_at: string | null }> = { status };
    if (status === 'completed') {
      visitData.completed_at = new Date().toISOString();
    } else if (status === 'scheduled') {
      visitData.completed_at = null;
    }

    const { error } = await updateVisit(visitId, visitData);
    setStatusUpdatingId(null);

    if (error) {
      alert(`No se pudo actualizar el estado: ${getErrorMessage(error, 'Error inesperado')}`);
      return false;
    }

    setVisits((current) => current.map((visit) => (visit.id === visitId ? { ...visit, status } : visit)));
    router.refresh();
    return true;
  };

  const openStatusModal = (visit: VisitWithInfo) => {
    setStatusModalVisit(visit);
    setNextVisitStatus(visit.status);
  };

  const closeStatusModal = () => {
    if (statusUpdatingId) return;
    setStatusModalVisit(null);
  };

  const confirmVisitStatusChange = async () => {
    if (!statusModalVisit) return;
    const success = await handleUpdateVisitStatus(statusModalVisit.id, nextVisitStatus);
    if (success) setStatusModalVisit(null);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <div className="p-4 md:p-8 border-b border-white/5">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-[#3D7BFF]/10 text-[#3D7BFF] flex items-center justify-center border border-[#3D7BFF]/20 shrink-0">
              <ClipboardList className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">Solicitudes de Visita Pendientes</h2>
              <p className="text-[10px] md:text-xs text-[#8A9199] font-medium italic mt-1 font-serif tracking-widest uppercase opacity-80 leading-relaxed">
                Flujo operativo para aprobar, rechazar y convertir solicitudes en visitas programadas.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {pendingRequests.length === 0 && (
            <div className="px-4 md:px-8 py-12 md:py-16 text-center">
              <p className="text-xs font-serif italic tracking-widest uppercase text-white/30">No hay solicitudes pendientes</p>
            </div>
          )}

          {pendingRequests.map((request) => (
            <div key={request.id} className="px-4 md:px-8 py-4 md:py-6 flex flex-col xl:flex-row gap-4 xl:items-center xl:justify-between">
              <div className="space-y-2 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <p className="text-sm font-bold text-white">{request.client?.business_name || 'Cliente'}</p>
                  <StatusBadge status={request.status} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{request.priority}</span>
                </div>
                <p className="text-xs text-white/80 font-bold">{request.title}</p>
                <p className="text-xs text-[#8A9199] italic leading-relaxed">{request.description}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                  Solicitada: {formatDateTime(request.requested_at)}
                </p>
              </div>

              <div className="w-full xl:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => openScheduleModal(request)}
                  className="w-full sm:w-auto px-5 py-3 bg-[#3D7BFF] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Programar
                </button>
                <button
                  onClick={() => openRejectModal(request)}
                  className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:border-red-500/40 hover:text-red-400 transition-all"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
        <div className="p-4 md:p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-white tracking-tight">Agenda de Visitas</h2>
            <p className="text-[10px] md:text-xs text-[#8A9199] font-medium italic mt-1 font-serif tracking-widest uppercase opacity-80 leading-relaxed">
              Programación y seguimiento de servicios técnicos presenciales.
            </p>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto bg-white/5 border border-white/5 rounded-xl py-2.5 px-4 text-xs text-white outline-none focus:border-[#3D7BFF]/50 cursor-pointer"
            >
              <option value="all" className="bg-[#0B1622]">Todos los estados</option>
              <option value="scheduled" className="bg-[#0B1622]">Programadas</option>
              <option value="completed" className="bg-[#0B1622]">Completadas</option>
              <option value="cancelled" className="bg-[#0B1622]">Canceladas</option>
            </select>

            <button
              type="button"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3D7BFF] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Plus className="w-3 h-3" />
              Nueva Visita
            </button>
          </div>
        </div>

        <div className="md:hidden divide-y divide-white/5">
          {filteredVisits.length > 0 ? (
            filteredVisits.map((visit) => (
              <article key={visit.id} className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white tracking-tight truncate">{visit.title}</p>
                      <p className="text-[10px] text-[#8A9199] font-medium uppercase tracking-widest truncate">
                        {visit.client.business_name}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={visit.status} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-white/5 bg-black/20 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Fecha</p>
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="w-3 h-3 text-[#3D7BFF]" />
                      <span className="text-xs font-bold">{formatDate(visit.scheduled_start)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl border border-white/5 bg-black/20 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Hora</p>
                    <div className="flex items-center gap-2 text-[#8A9199]">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs font-bold">{formatTime(visit.scheduled_start)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#3D7BFF] shrink-0">
                      {visit.technician?.full_name?.charAt(0) || <UserIcon className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-bold text-white/80 truncate">{visit.technician?.full_name || 'Por asignar'}</span>
                  </div>

                  <button
                    onClick={() => openStatusModal(visit)}
                    disabled={statusUpdatingId === visit.id}
                    className="p-2 border border-white/5 bg-white/5 rounded-lg text-[#8A9199] hover:text-white transition-all disabled:opacity-50"
                  >
                    {statusUpdatingId === visit.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="px-4 py-20 text-center">
              <div className="flex flex-col items-center gap-4 opacity-30">
                <Activity className="w-10 h-10" />
                <p className="text-xs font-serif italic tracking-widest uppercase">No hay visitas programadas</p>
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[940px]">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Servicio / Cliente</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Fecha y Hora</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Técnico</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
                <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredVisits.length > 0 ? (
                filteredVisits.map((visit) => (
                  <tr key={visit.id} className="group hover:bg-white/[0.01] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white tracking-tight">{visit.title}</p>
                          <p className="text-[10px] text-[#8A9199] font-medium uppercase tracking-widest">{visit.client.business_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-white">
                          <MapPin className="w-3 h-3 text-[#3D7BFF]" />
                          <span className="text-xs font-bold">{formatDate(visit.scheduled_start)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#8A9199]">
                          <Clock className="w-3 h-3" />
                          <span className="text-[10px] font-black">{formatTime(visit.scheduled_start)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-[#3D7BFF]">
                          {visit.technician?.full_name?.charAt(0) || <UserIcon className="w-3 h-3" />}
                        </div>
                        <span className="text-xs font-bold text-white/80">{visit.technician?.full_name || 'Por asignar'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={visit.status} />
                    </td>
                    <td className="px-8 py-6 text-right relative">
                      <button
                        onClick={() => openStatusModal(visit)}
                        disabled={statusUpdatingId === visit.id}
                        className="p-2 border border-white/5 bg-white/5 rounded-lg text-[#8A9199] hover:text-white transition-all disabled:opacity-50"
                      >
                        {statusUpdatingId === visit.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <Activity className="w-12 h-12" />
                      <p className="text-sm font-serif italic tracking-widest uppercase">No hay visitas programadas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {statusModalVisit && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl bg-black/60">
          <div className="bg-[#0B1622] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-serif font-bold text-white">Actualizar Estado de Visita</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Selecciona el nuevo estado operativo</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                <p className="text-xs text-white font-bold">{statusModalVisit.title}</p>
                <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest">
                  Cliente: {statusModalVisit.client.business_name}
                </p>
                <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest">
                  Fecha: {formatDateTime(statusModalVisit.scheduled_start)}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nuevo estado</label>
                <select
                  value={nextVisitStatus}
                  onChange={(e) => setNextVisitStatus(e.target.value as VisitStatus)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                >
                  <option value="scheduled" className="bg-[#0B1622]">Programada</option>
                  <option value="completed" className="bg-[#0B1622]">Realizada</option>
                  <option value="missed" className="bg-[#0B1622]">Inasistencia</option>
                  <option value="cancelled" className="bg-[#0B1622]">Cancelada</option>
                </select>
              </div>
            </div>
            <div className="px-8 pb-8 flex items-center justify-end gap-3">
              <button
                onClick={closeStatusModal}
                disabled={statusUpdatingId === statusModalVisit.id}
                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors disabled:opacity-50"
              >
                Volver
              </button>
              <button
                onClick={confirmVisitStatusChange}
                disabled={statusUpdatingId === statusModalVisit.id}
                className="px-6 py-3 bg-[#3D7BFF] rounded-xl text-xs font-black uppercase tracking-widest text-white disabled:opacity-50 flex items-center gap-2"
              >
                {statusUpdatingId === statusModalVisit.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar estado
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && modalMode === 'schedule' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl bg-black/60">
          <div className="bg-[#0B1622] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-serif font-bold text-white">Programar Visita desde Solicitud</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{selectedRequest.client?.business_name}</p>
            </div>
            <form onSubmit={handleSchedule} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Técnico</label>
                  <select
                    value={scheduleData.assignedTo}
                    onChange={(e) => setScheduleData({ ...scheduleData, assignedTo: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                  >
                    <option value="" className="bg-[#0B1622]">Sin asignar</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id} className="bg-[#0B1622]">{t.full_name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Tipo de visita</label>
                  <select
                    value={scheduleData.visitType}
                    onChange={(e) => setScheduleData({ ...scheduleData, visitType: e.target.value as VisitType })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                  >
                    <option value="included" className="bg-[#0B1622]">Incluida</option>
                    <option value="extra" className="bg-[#0B1622]">Extra</option>
                    <option value="emergency" className="bg-[#0B1622]">Emergencia</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Inicio</label>
                  <input
                    required
                    type="datetime-local"
                    value={scheduleData.scheduledStart}
                    onChange={(e) => setScheduleData({ ...scheduleData, scheduledStart: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Fin</label>
                  <input
                    type="datetime-local"
                    value={scheduleData.scheduledEnd}
                    onChange={(e) => setScheduleData({ ...scheduleData, scheduledEnd: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Titulo</label>
                <input
                  value={scheduleData.title}
                  onChange={(e) => setScheduleData({ ...scheduleData, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Descripcion</label>
                <textarea
                  rows={3}
                  value={scheduleData.description}
                  onChange={(e) => setScheduleData({ ...scheduleData, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Notas administrativas</label>
                <textarea
                  rows={2}
                  value={scheduleData.adminNotes}
                  onChange={(e) => setScheduleData({ ...scheduleData, adminNotes: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-[#3D7BFF] rounded-xl text-xs font-black uppercase tracking-widest text-white disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar Programacion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedRequest && modalMode === 'reject' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl bg-black/60">
          <div className="bg-[#0B1622] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h3 className="text-xl font-serif font-bold text-white">Rechazar Solicitud de Visita</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{selectedRequest.client?.business_name}</p>
            </div>
            <form onSubmit={handleReject} className="p-8 space-y-5">
              <p className="text-xs text-[#8A9199] italic">Puedes dejar una nota visible para auditoria interna.</p>
              <textarea
                rows={4}
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white resize-none"
                placeholder="Motivo del rechazo"
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-red-600 rounded-xl text-xs font-black uppercase tracking-widest text-white disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
