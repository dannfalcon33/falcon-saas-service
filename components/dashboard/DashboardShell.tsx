'use client';

import React, { useState, useEffect } from 'react';
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

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(!isMobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar Overlay for Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        ${isCollapsed ? 'w-20' : 'w-72'}
      `}>
        <Sidebar 
          role={role} 
          isCollapsed={isCollapsed} 
          onCloseMobile={() => setIsMobileOpen(false)} 
        />
      </div>

      {/* Main Content Area */}
      <div className={`
        flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
        ${isCollapsed ? 'md:pl-20' : 'md:pl-72'}
      `}>
        <Topbar 
          user={user} 
          onToggleSidebar={toggleSidebar}
          isSidebarCollapsed={isCollapsed}
        />
        
        <main className="flex-1 p-4 md:p-8 relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-900/5 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
