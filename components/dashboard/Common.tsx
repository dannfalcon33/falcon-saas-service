import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { LucideIcon } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Status Badge Component
export const StatusBadge = ({ 
  status
}: { 
  status: string; 
  variant?: 'default' | 'outline' | 'ghost' 
}) => {
  const getStatusLabel = (s: string) => {
    switch (s.toLowerCase()) {
      case 'submitted':
        return 'PENDING_VERIFICATION';
      case 'verified':
        return 'PAID';
      default:
        return s;
    }
  };

  const getStatusStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active':
      case 'verified':
      case 'completed':
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending_payment':
      case 'pending':
      case 'submitted':
      case 'scheduled':
      case 'in_progress':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'expired':
      case 'expiring':
      case 'suspended':
      case 'cancelled':
      case 'rejected':
      case 'critical':
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-white/10 text-white/50 border-white/10';
    }
  };

  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
      getStatusStyles(status)
    )}>
      {getStatusLabel(status).replace(/_/g, ' ')}
    </span>
  );
};

// Stat Card Component
export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue"
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  color?: "blue" | "emerald" | "amber" | "red";
}) => {
  const colors = {
    blue: "text-[#3D7BFF] bg-[#3D7BFF]/10 ring-[#3D7BFF]/20",
    emerald: "text-emerald-400 bg-emerald-400/10 ring-emerald-400/20",
    amber: "text-amber-400 bg-amber-400/10 ring-amber-400/20",
    red: "text-red-400 bg-red-400/10 ring-red-400/20",
  };

  return (
    <div className="bg-white/[0.03] border border-white/5 p-6 rounded-3xl backdrop-blur-xl relative overflow-hidden group hover:border-[#3D7BFF]/20 transition-all shadow-2xl">
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{title}</p>
          <div className={cn("p-3 rounded-2xl ring-1 ring-inset transition-transform group-hover:scale-105", colors[color])}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-3xl font-serif font-bold text-white mb-1">{value}</h3>
        {subtitle && <p className="text-xs text-[#8A9199] font-medium italic">{subtitle}</p>}
        {trend && (
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-400 animate-pulse">●</span>
            <span className="text-[10px] font-black text-[#8A9199] uppercase tracking-widest">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};
