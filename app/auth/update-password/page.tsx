'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase handles the recovery session automatically via headers/hash
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // In recovery flow, session should be active after following the email link
        setErrorMsg("Sesión de recuperación no encontrada. Asegúrate de haber llegado mediante el enlace de tu correo.");
      }
    };
    checkSession();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
         router.push('/login');
      }, 3000);

    } catch (err: any) {
      setErrorMsg(err.message || "No se pudo actualizar la contraseña. El enlace podría haber expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-12 text-center backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-16 -mt-16" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="text-3xl font-serif font-bold mb-4">Contraseña Actualizada</h2>
            <p className="text-[#8A9199] font-medium leading-relaxed mb-8">
              Tu nueva contraseña ha sido establecida con éxito. Serás redirigido al inicio de sesión en unos segundos.
            </p>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-blue-500 animate-[progress_3s_linear_forwards]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      <div className="relative flex min-h-screen items-center justify-center px-6 py-10">
        
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[10%] top-[10%] h-64 w-64 rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute right-[10%] bottom-[10%] h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="mb-12 flex flex-col items-center text-center">
            <div className="mb-8 flex h-14 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black shadow-[0_0_50px_rgba(59,130,246,0.1)] transform hover:scale-105 transition-transform duration-500">
              <Logo className="w-6 h-10" />
            </div>
            
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Recuperación de Cuenta
            </div>
            <h2 className="text-4xl font-serif font-bold text-white tracking-tight">Nueva Contraseña</h2>
            <p className="mt-4 text-base leading-relaxed text-[#8A9199] font-medium max-w-sm mx-auto">
              Define tu nueva clave de acceso para Falcon IT.
            </p>

            {errorMsg && (
              <div className="mt-6 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-wider flex items-center gap-3 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Contraseña</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 transition hover:text-blue-300"
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              <div className="group relative flex h-16 items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-6 transition-all focus-within:border-blue-500/40 focus-within:bg-white/[0.05]">
                <Lock className="w-5 h-5 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/10 tracking-[0.2em] font-medium"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Confirmar</label>
              <div className="group relative flex h-16 items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-6 transition-all focus-within:border-blue-500/40 focus-within:bg-white/[0.05]">
                <Lock className="w-5 h-5 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/10 tracking-[0.2em] font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative h-16 w-full rounded-2xl bg-white text-black text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition hover:scale-[1.02] active:scale-[0.98] overflow-hidden disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent skew-x-[-20deg] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <span className="flex items-center justify-center gap-2">
                {isLoading ? "Actualizando..." : "Cambiar Contraseña"} <ArrowRight className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
              </span>
            </button>
          </form>

          <div className="mt-12 text-center text-[10px] uppercase font-bold text-white/20 tracking-[0.3em]">
            Falcon IT Protection System
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
