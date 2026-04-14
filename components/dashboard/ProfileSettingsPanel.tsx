'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, Save, UserCircle2, Building2 } from 'lucide-react';
import { ClientProfilePanelData } from '@/lib/types';
import { updateClientProfilePanelAction } from '@/lib/actions/dashboard.actions';

interface ProfileSettingsPanelProps {
  initialData: ClientProfilePanelData;
}

export const ProfileSettingsPanel = ({ initialData }: ProfileSettingsPanelProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    fullName: initialData.profile.full_name || '',
    phone: initialData.profile.phone || '',
    contactName: initialData.client?.contact_name || '',
    mainPhone: initialData.client?.main_phone || '',
    city: initialData.client?.city || '',
    zone: initialData.client?.zone || '',
    address: initialData.client?.address || '',
    billingEmail: initialData.client?.billing_email || '',
    administrativeContact: initialData.client?.administrative_contact || '',
  });

  const initials = useMemo(() => {
    const tokens = form.fullName.trim().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return 'U';
    return (tokens[0][0] + (tokens[1]?.[0] || '')).toUpperCase();
  }, [form.fullName]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    const { error } = await updateClientProfilePanelAction({
      fullName: form.fullName,
      phone: form.phone,
      contactName: form.contactName,
      mainPhone: form.mainPhone,
      city: form.city,
      zone: form.zone,
      address: form.address,
      billingEmail: form.billingEmail,
      administrativeContact: form.administrativeContact,
    });

    setIsSaving(false);
    if (error) {
      setFeedback({ type: 'error', text: error });
      return;
    }

    setFeedback({ type: 'ok', text: 'Perfil actualizado correctamente.' });
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-10">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-[#3D7BFF]/10 border border-[#3D7BFF]/20 flex items-center justify-center text-[#3D7BFF] overflow-hidden">
            {initialData.profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={initialData.profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-black">{initials}</span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-white">Perfil del Usuario</h2>
            <p className="text-xs text-[#8A9199] font-medium italic mt-1">
              Personaliza tus datos de acceso y contacto.
            </p>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-3">{initialData.profile.email}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-3 text-[#3D7BFF]">
            <UserCircle2 className="w-5 h-5" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Cuenta</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Nombre completo</span>
              <input
                value={form.fullName}
                onChange={(e) => setField('fullName', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
                required
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Teléfono</span>
              <input
                value={form.phone}
                onChange={(e) => setField('phone', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              />
            </label>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-[2.5rem] p-8 md:p-10 space-y-6">
          <div className="flex items-center gap-3 text-emerald-400">
            <Building2 className="w-5 h-5" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Empresa</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Empresa</span>
              <input
                value={initialData.client?.business_name || 'No disponible'}
                readOnly
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white/60 cursor-not-allowed"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Email principal</span>
              <input
                value={initialData.client?.main_email || initialData.profile.email}
                readOnly
                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white/60 cursor-not-allowed"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Contacto administrativo</span>
              <input
                value={form.contactName}
                onChange={(e) => setField('contactName', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Teléfono empresarial</span>
              <input
                value={form.mainPhone}
                onChange={(e) => setField('mainPhone', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Ciudad</span>
              <input
                value={form.city}
                onChange={(e) => setField('city', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Zona</span>
              <input
                value={form.zone}
                onChange={(e) => setField('zone', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Dirección</span>
              <input
                value={form.address}
                onChange={(e) => setField('address', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Email de facturación</span>
              <input
                type="email"
                value={form.billingEmail}
                onChange={(e) => setField('billingEmail', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              />
            </label>
            <label className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Contacto alterno</span>
              <input
                value={form.administrativeContact}
                onChange={(e) => setField('administrativeContact', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white"
              />
            </label>
          </div>
        </div>

        {feedback && (
          <div
            className={`px-5 py-4 rounded-2xl border text-sm font-medium ${
              feedback.type === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D7BFF] rounded-xl text-xs font-black uppercase tracking-widest text-white hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  );
};
