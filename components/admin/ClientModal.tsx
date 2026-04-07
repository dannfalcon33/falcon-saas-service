'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User as UserIcon, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { Client, AppRole } from '@/lib/types';
import { createClient, updateClient } from '@/lib/actions/admin.actions';
import { useRouter } from 'next/navigation';
import { createClient as createBrowserClient } from '@/lib/supabase';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

export const ClientModal = ({ isOpen, onClose, client }: ClientModalProps) => {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isLoading, setIsLoading] = useState(false);
  const [profiles, setProfiles] = useState<{ id: string, full_name: string, email: string }[]>([]);
  
  const [formData, setFormData] = useState<Partial<Client>>({
    business_name: '',
    contact_name: '',
    main_email: '',
    main_phone: '',
    rif_or_id: '',
    city: '',
    zone: '',
    address: '',
    owner_profile_id: '',
    status: 'pending_payment'
  });

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        business_name: '',
        contact_name: '',
        main_email: '',
        main_phone: '',
        rif_or_id: '',
        city: '',
        zone: '',
        address: '',
        owner_profile_id: '',
        status: 'pending_payment'
      });
    }

    // Fetch potential owners (profiles with role 'client')
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'client');
      if (data) setProfiles(data);
    };

    if (isOpen) fetchProfiles();
  }, [client, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (client?.id) {
        await updateClient(client.id, formData);
      } else {
        await createClient(formData);
      }
      onClose();
      router.refresh();
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 backdrop-blur-3xl bg-black/60">
      <div className="bg-[#0B1622] border border-white/10 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              {client ? 'Editar Cliente' : 'Nuevo Cliente Corporativo'}
            </h2>
            <p className="text-xs text-[#8A9199] font-medium italic mt-1 uppercase tracking-widest font-serif">Configuración de cuenta maestra Falcon IT.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* Section: Empresa */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-[#3D7BFF]" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Información Fiscal</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/60 font-bold ml-1">Nombre Comercial / Razón Social</label>
                   <input 
                    required
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                    placeholder="Ejem: Inversiones Falcon C.A"
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/60 font-bold ml-1">RIF / Identificación</label>
                   <input 
                    type="text"
                    value={formData.rif_or_id}
                    onChange={(e) => setFormData({...formData, rif_or_id: e.target.value})}
                    placeholder="J-12345678-0"
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all"
                   />
                </div>
             </div>
          </div>

          {/* Section: Contacto y Dueño */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <UserIcon className="w-4 h-4 text-[#3D7BFF]" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Responsable de la Cuenta</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/60 font-bold ml-1">Nombre de Contacto Directo</label>
                   <input 
                    required
                    type="text"
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    placeholder="Nombre completo"
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/60 font-bold ml-1">Usuario del Sistema (Login)</label>
                   <select 
                    required
                    value={formData.owner_profile_id}
                    onChange={(e) => setFormData({...formData, owner_profile_id: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all"
                   >
                     <option value="" disabled className="bg-[#0B1622]">Seleccionar usuario registrado...</option>
                     {profiles.map(p => (
                       <option key={p.id} value={p.id} className="bg-[#0B1622]">{p.full_name} ({p.email})</option>
                     ))}
                   </select>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/60 font-bold ml-1">Email Principal (Facturación)</label>
                   <input 
                    required
                    type="email"
                    value={formData.main_email}
                    onChange={(e) => setFormData({...formData, main_email: e.target.value})}
                    placeholder="email@empresa.com"
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/60 font-bold ml-1">Teléfono Principal</label>
                   <input 
                    type="text"
                    value={formData.main_phone}
                    onChange={(e) => setFormData({...formData, main_phone: e.target.value})}
                    placeholder="+58 412..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all"
                   />
                </div>
             </div>
          </div>

          {/* Section: Ubicación */}
          <div className="space-y-4">
             <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-[#3D7BFF]" />
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Ubicación Física</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/60 font-bold ml-1">Ciudad</label>
                   <input 
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all"
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[10px] text-white/60 font-bold ml-1">Zona / Sector</label>
                   <input 
                    type="text"
                    value={formData.zone}
                    onChange={(e) => setFormData({...formData, zone: e.target.value})}
                    className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all"
                   />
                </div>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] text-white/60 font-bold ml-1">Dirección Detallada (Para visitas técnicas)</label>
                <textarea 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={2}
                  className="w-full bg-white/5 border border-white/5 rounded-xl p-3 text-sm text-white focus:border-[#3D7BFF]/50 outline-none transition-all resize-none"
                />
             </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex items-center justify-end gap-4">
           <button 
             onClick={onClose}
             className="px-6 py-3 text-white/40 text-xs font-black uppercase tracking-widest hover:text-white transition-all"
           >
             Cancelar
           </button>
           <button 
             onClick={handleSubmit}
             disabled={isLoading}
             className="flex items-center gap-3 px-8 py-3 bg-[#3D7BFF] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
           >
             {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
             {client ? 'Guardar Cambios' : 'Crear Cliente'}
           </button>
        </div>
      </div>
    </div>
  );
};
