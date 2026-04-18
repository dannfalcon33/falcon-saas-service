'use client';

import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface DashboardShellProps {
  children: React.ReactNode;
  role: 'admin' | 'client';
  user: {
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string | null;
  };
}

export const DashboardShell = ({ children, role, user }: DashboardShellProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth >= 768) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = isMobileOpen ? 'hidden' : originalOverflow || '';

    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isMobileOpen]);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
      return;
    }

    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[190] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-[200] md:z-50 transform transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        <Sidebar role={role} isCollapsed={isCollapsed} onCloseMobile={() => setIsMobileOpen(false)} />
      </div>

      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:pl-20' : 'md:pl-72'
        }`}
      >
        <Topbar user={user} onToggleSidebar={toggleSidebar} isSidebarCollapsed={isCollapsed} />

        <main className="flex-1 p-4 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative z-10 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};
