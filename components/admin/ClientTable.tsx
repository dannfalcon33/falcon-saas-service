'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Building2,
  ExternalLink,
  Loader2,
  User as UserIcon,
  Mail,
  Send,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/Common';
import { ClientStatus } from '@/lib/types';
import { deleteClient, enableClientAccess } from '@/lib/actions/admin.actions';
import { useRouter } from 'next/navigation';

interface ClientWithSub {
  id: string;
  business_name: string;
  contact_name: string;
  main_email: string;
  main_phone?: string;
  status: ClientStatus;
  rif_or_id?: string;
  invitation_sent_at?: string;
  access_enabled_at?: string;
  owner_profile_id?: string;
  subscriptions?: {
    status: string;
    end_date: string;
    plan: { name: string } | null;
  }[];
}

interface ClientTableProps {
  initialClients: ClientWithSub[];
  onEdit: (client: any) => void;
  onAdd: () => void;
}

export const ClientTable = ({ initialClients, onEdit, onAdd }: ClientTableProps) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const filteredClients = initialClients.filter(c => 
    c.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.main_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${name}? Esta acción no se puede deshacer.`)) return;
    
    setIsDeleting(id);
    try {
      const { error } = await deleteClient(id);
      if (error) throw error;
      router.refresh();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleInvite = async (id: string) => {
    setIsInviting(id);
    try {
      const { error } = await enableClientAccess(id);
      if (error) throw new Error(error);
      alert("Invitación enviada con éxito");
      router.refresh();
    } catch (err: any) {
      alert("Error al enviar invitación: " + err.message);
    } finally {
      setIsInviting(null);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
      <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Directorio de Clientes</h2>
          <p className="text-xs text-[#8A9199] font-medium italic mt-1 font-serif tracking-widest uppercase opacity-80 leading-relaxed">Gestión proactiva de cuentas y datos corporativos.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input 
                type="text" 
                placeholder="Buscar cliente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#3D7BFF]/50 w-64 transition-all" 
              />
           </div>
           <button 
             onClick={onAdd}
             className="flex items-center gap-2 px-5 py-2.5 bg-[#3D7BFF] text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(61,123,255,0.2)]"
           >
              <Plus className="w-3 h-3" />
              Nuevo Cliente
           </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Empresa</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Contacto</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Suscripción</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Acceso Dashboard</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Estado</th>
              <th className="px-8 py-5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredClients.map((client) => {
              const activeSub = client.subscriptions?.find(s => s.status === 'active');
              
              return (
                <tr key={client.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#3D7BFF] shrink-0 border border-white/5">
                        <Building2 className="w-5 h-5 opacity-50" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{client.business_name}</p>
                        <p className="text-[10px] text-[#8A9199] font-medium">{client.rif_or_id || 'Sin RIF'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-white/80">
                         <UserIcon className="w-3 h-3 text-[#3D7BFF]" />
                         <span className="text-xs font-bold">{client.contact_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#8A9199]">
                         <Mail className="w-3 h-3" />
                         <span className="text-[10px] font-medium">{client.main_email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {activeSub ? (
                      <div>
                         <p className="text-xs font-bold text-white uppercase tracking-tighter">{activeSub.plan?.name}</p>
                         <p className="text-[10px] text-emerald-500 font-black italic">Vence: {isMounted ? new Date(activeSub.end_date).toLocaleDateString() : '...'}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-white/20 uppercase italic">Sin plan activo</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    {client.owner_profile_id ? (
                      <div className="flex items-center gap-2 text-emerald-500">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Habilitado</span>
                      </div>
                    ) : client.invitation_sent_at ? (
                      <div className="flex items-center gap-2 text-amber-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Invitado</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleInvite(client.id)}
                        disabled={isInviting === client.id}
                        className="flex items-center gap-2 text-[#3D7BFF] hover:text-[#3D7BFF]/80 transition-all font-black text-[10px] uppercase tracking-widest"
                      >
                        {isInviting === client.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Habilitar
                      </button>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={client.status} />
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center justify-end gap-2">
                        {client.invitation_sent_at && !client.owner_profile_id && (
                          <button 
                            onClick={() => handleInvite(client.id)}
                            title="Reenviar invitación"
                            className="p-2 border border-[#3D7BFF]/5 bg-[#3D7BFF]/5 rounded-lg text-[#3D7BFF] hover:bg-[#3D7BFF] hover:text-white transition-all shadow-sm"
                          >
                             <Send className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => onEdit(client)}
                          className="p-2 border border-white/5 bg-white/5 rounded-lg text-[#8A9199] hover:text-white hover:border-white/10 transition-all shadow-sm"
                        >
                           <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(client.id, client.business_name)}
                          disabled={isDeleting === client.id}
                          className="p-2 border border-red-500/10 bg-red-500/5 rounded-lg text-red-500/50 hover:text-red-500 hover:border-red-500/20 transition-all disabled:opacity-50"
                        >
                           {isDeleting === client.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                     </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
