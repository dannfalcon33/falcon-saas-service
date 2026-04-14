'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  User,
  Bell,
  Search,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Wrench,
  FileText,
  CalendarCheck2,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { getClientNotifications } from '@/lib/actions/dashboard.actions';
import { getAdminNotifications } from '@/lib/actions/admin.actions';
import { DashboardNotification } from '@/lib/types';

interface TopbarProps {
  user: {
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string | null;
  };
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Topbar = ({ user, onToggleSidebar, isSidebarCollapsed }: TopbarProps) => {
  const router = useRouter();
  const supabase = createClient();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const bellContainerRef = useRef<HTMLDivElement | null>(null);

  const isClientRole = useMemo(() => user.role === 'client', [user.role]);
  const isAdminRole = useMemo(() => user.role === 'admin', [user.role]);
  const hasNotificationFeed = isClientRole || isAdminRole;
  const notificationSeenStorageKey = useMemo(
    () => `falconit_notifications_last_seen_${user.role}_${user.email}`,
    [user.email, user.role]
  );

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--/--/---- --:-- UTC';
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes} UTC`;
  };

  const loadNotifications = async () => {
    if (!hasNotificationFeed) return;
    setIsLoadingNotifications(true);
    const { data, error } = isAdminRole
      ? await getAdminNotifications(20)
      : await getClientNotifications(20);
    setIsLoadingNotifications(false);
    if (error) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    const items = data || [];
    setNotifications(items);

    const lastSeenRaw = typeof window !== 'undefined' ? window.localStorage.getItem(notificationSeenStorageKey) : null;
    const lastSeenMs = lastSeenRaw ? new Date(lastSeenRaw).getTime() : 0;
    const unread = items.filter((item) => {
      const occurredAt = new Date(item.occurred_at).getTime();
      if (Number.isNaN(occurredAt)) return false;
      return occurredAt > lastSeenMs;
    }).length;
    setUnreadCount(unread);
  };

  const markNotificationsAsSeen = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(notificationSeenStorageKey, new Date().toISOString());
    }
    setUnreadCount(0);
  };

  useEffect(() => {
    loadNotifications();
  }, [hasNotificationFeed, isAdminRole, notificationSeenStorageKey]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!bellContainerRef.current) return;
      if (!bellContainerRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const openProfilePanel = () => {
    if (isClientRole) {
      router.push('/dashboard/profile');
      return;
    }
    router.push('/admin');
  };

  const openNotificationTarget = (href: string) => {
    markNotificationsAsSeen();
    setIsNotificationsOpen(false);
    router.push(href);
  };

  const getNotificationIcon = (type: DashboardNotification['type']) => {
    switch (type) {
      case 'payment_approved':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'payment_submitted':
        return <CheckCircle2 className="w-4 h-4 text-amber-400" />;
      case 'incident_resolved':
      case 'incident_opened':
        return <Wrench className="w-4 h-4 text-blue-400" />;
      case 'report_received':
      case 'report_uploaded':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'visit_approved':
      case 'visit_request_pending':
        return <CalendarCheck2 className="w-4 h-4 text-purple-400" />;
      case 'lead_received':
        return <User className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-white/50" />;
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push('/login');
    setIsSigningOut(false);
  };

  return (
    <header className="h-20 border-b border-white/5 px-4 md:px-8 flex items-center justify-between bg-black/10 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar Button */}
        <button 
          onClick={onToggleSidebar}
          className="p-2.5 bg-white/5 border border-white/5 rounded-xl text-[#8A9199] hover:text-white hover:border-white/10 transition-all active:scale-95 group"
          title={isSidebarCollapsed ? "Expandir Menú" : "Contraer Menú"}
        >
          <div className="relative w-5 h-5">
             <Menu className={`absolute inset-0 w-5 h-5 transition-all duration-300 md:hidden ${isSidebarCollapsed ? 'opacity-100 rotate-0' : 'opacity-100 rotate-0'}`} />
             <div className="hidden md:block">
                {isSidebarCollapsed ? (
                  <ChevronRight className="w-5 h-5 transition-all duration-300" />
                ) : (
                  <ChevronLeft className="w-5 h-5 transition-all duration-300" />
                )}
             </div>
          </div>
        </button>

        <div className="flex items-center gap-4 group ml-2">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-[#3D7BFF] transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-white/5 border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#3D7BFF]/50 transition-all w-48 lg:w-80"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div ref={bellContainerRef} className="relative">
          <button
            onClick={() => {
              const next = !isNotificationsOpen;
              setIsNotificationsOpen(next);
              if (next) {
                markNotificationsAsSeen();
                loadNotifications();
              }
            }}
            className="relative text-white/40 hover:text-white transition-colors p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-[1.15rem] px-1 bg-red-500 text-white text-[10px] font-black rounded-full border border-[#020617] leading-[1.05rem] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-[360px] max-w-[90vw] bg-[#0B1622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-white/70">Notificaciones</p>
                <button
                  onClick={loadNotifications}
                  className="text-[10px] font-black uppercase tracking-widest text-[#3D7BFF] hover:text-white transition-colors"
                >
                  Actualizar
                </button>
              </div>

              <div className="max-h-[380px] overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="px-4 py-8 flex items-center justify-center text-white/50">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-xs font-medium text-white/40">
                    No tienes notificaciones recientes.
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => openNotificationTarget(notification.href)}
                      className="w-full px-4 py-3 text-left border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">{notification.title}</p>
                          <p className="text-[11px] text-[#8A9199] leading-relaxed">{notification.message}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-white/30">
                            {formatDateTime(notification.occurred_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-white/10 hidden md:block" />

        <div className="flex items-center gap-3">
          <button
            onClick={openProfilePanel}
            className="flex items-center gap-4 p-1 rounded-full bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
            title="Perfil de usuario"
          >
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#1F2937] border border-white/10 flex items-center justify-center text-[#3D7BFF] font-bold group-hover:scale-105 transition-transform overflow-hidden">
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="text-left hidden lg:block pr-4">
              <p className="text-sm font-bold text-white group-hover:text-[#3D7BFF] transition-colors line-clamp-1">{user.full_name}</p>
              <p className="text-[10px] text-[#8A9199] font-black uppercase tracking-widest leading-none mt-0.5">{user.role}</p>
            </div>
          </button>

          <button 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="p-2.5 md:p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded-2xl transition-all disabled:opacity-50 group"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
};
