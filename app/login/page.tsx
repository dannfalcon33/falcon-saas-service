'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ArrowRight,
  Ticket,
  ClipboardCheck,
  Activity,
  Zap
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PlansModal } from "@/components/PlansModal";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Iniciando sesión...", { email, password });
    // Aquí iría la lógica de autenticación con Supabase próximamente
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-blue-500/30">
      <div className="relative grid min-h-screen lg:grid-cols-2">
        
        {/* Fondo decorativo con gradientes y rejilla */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute left-[8%] top-[10%] h-64 w-64 rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute right-[10%] top-[28%] h-80 w-80 rounded-full bg-cyan-500/5 blur-[120px]" />
          <div className="absolute bottom-[12%] left-[35%] h-96 w-96 rounded-full bg-indigo-900/10 blur-[120px]" />
          
          {/* Rejilla sutil */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        </div>

        {/* COLUMNA IZQUIERDA - Marketing & Branding (Desktop Only) - Centrado */}
        <section className="relative hidden border-r border-white/5 lg:flex lg:flex-col lg:justify-between lg:px-12 lg:py-12 xl:px-20 bg-black/20 backdrop-blur-sm shadow-2xl">
          <div className="flex justify-center lg:justify-start">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white group font-medium"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Volver al inicio</span>
            </Link>
          </div>

          <div className="max-w-xl mx-auto space-y-12">
            <div className="flex justify-center lg:justify-start">
              <div className="inline-flex items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/5 px-4 py-2 text-sm text-blue-200 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Soporte centralizado y monitoreo activo
              </div>
            </div>

            <div className="space-y-6 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center gap-5">
                <div className="flex h-16 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black shadow-[0_0_40px_rgba(59,130,246,0.1)] backdrop-blur-md">
                  <Logo className="w-8 h-10" />
                </div>
                <div>
                  <h2 className="text-xl font-serif font-bold tracking-wider">FALCON IT</h2>
                  <p className="text-sm text-white/50 font-medium font-serif opacity-80">Control Total y Continuidad IT</p>
                </div>
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl xl:text-5xl font-serif font-bold leading-[1.1] text-white">
                  Accede al panel que <span className="text-blue-400">centraliza</span> tu operación.
                </h1>
                <p className="max-w-md mx-auto lg:mx-0 text-base leading-relaxed text-white/60 xl:text-lg italic font-serif">
                  Supervisa incidencias, controla tus mantenimientos preventivos y verifica el estado de tus backups desde una sola plataforma profesional.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Tickets y Soporte",
                  desc: "Gestión centralizada de requerimientos.",
                  icon: Ticket
                },
                {
                  title: "Mantenimiento",
                  desc: "Control de visitas y tareas preventivas.",
                  icon: ClipboardCheck
                },
                {
                  title: "Continuidad",
                  desc: "Visibilidad de salud de servidores y red.",
                  icon: Activity
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl hover:bg-white/[0.06] transition-colors group text-center"
                >
                  <div className="mb-4 mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-400/20 group-hover:scale-110 transition-transform">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-white/50 font-medium">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">
            <span>Falcon IT © 2026</span>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              <span>Acceso Seguro</span>
            </div>
          </div>
        </section>

        {/* COLUMNA DERECHA - Formulario de Login sin caja - Centrado */}
        <section className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-8 lg:px-16 xl:px-24 overflow-hidden">
          
          <div className="w-full max-w-md mx-auto relative z-10">
            
            {/* Header móvil */}
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link 
                href="/" 
                className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver</span>
              </Link>
              <div className="flex h-10 w-8 items-center justify-center rounded-xl border border-white/10 bg-black">
                <Logo className="w-5 h-7" />
              </div>
            </div>

            <div className="relative z-10">
              <div className="mb-12 flex flex-col items-center text-center">
                <div className="mb-8 flex h-14 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black shadow-[0_0_50px_rgba(59,130,246,0.1)] transform hover:scale-105 transition-transform duration-500">
                  <Logo className="w-6 h-10" />
                </div>
                
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-6">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sistema Online
                </div>
                <h2 className="text-4xl font-serif font-bold text-white tracking-tight">Iniciar Sesión</h2>
                <p className="mt-4 text-base leading-relaxed text-[#8A9199] font-medium max-w-sm mx-auto">
                  Gestiona tu infraestructura y soporte IT desde tu panel de cliente centralizado.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Correo Electrónico</label>
                  <div className="group relative flex h-16 items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-6 transition-all focus-within:border-blue-500/40 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                    <Mail className="w-5 h-5 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@empresa.com"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/10 font-medium"
                    />
                  </div>
                </div>

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
                  <div className="group relative flex h-16 items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-6 transition-all focus-within:border-blue-500/40 focus-within:bg-white/[0.05] focus-within:shadow-[0_0_30px_rgba(59,130,246,0.05)]">
                    <Lock className="w-5 h-5 text-white/20 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/10 tracking-[0.2em] font-medium"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between px-1 text-[11px] font-bold uppercase tracking-widest">
                  <label className="flex items-center gap-3 text-white/30 cursor-pointer hover:text-white/50 transition-colors">
                    <input type="checkbox" className="h-4 w-4 rounded border-white/10 bg-transparent text-blue-500 focus:ring-offset-0 focus:ring-0 cursor-pointer" />
                    <span>Recordar sesión</span>
                  </label>
                  <button type="button" className="text-white/30 hover:text-white transition-colors underline underline-offset-8 decoration-white/5">
                    ¿Olvido su clave?
                  </button>
                </div>

                <button
                  type="submit"
                  className="group relative h-16 w-full rounded-2xl bg-white text-black text-sm font-black uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/5 to-transparent skew-x-[-20deg] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                  <span className="flex items-center justify-center gap-2">
                    Acceder al Panel <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </form>

              {/* Notas de seguridad inferiores */}
              <div className="mt-12 space-y-4">
                <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 transition-all hover:bg-white/[0.04] group">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Acceso Seguro Cifrado</h4>
                    <p className="mt-2 text-[11px] leading-relaxed text-white/30 font-medium">
                      Tus credenciales y datos operativos se procesan bajo un entorno protegido de grado empresarial.
                    </p>
                  </div>
                </div>

                <div className="text-center mt-10">
                  <p className="text-xs font-medium text-white/30 tracking-widest uppercase">
                    ¿Aún no eres cliente?{' '}
                    <button 
                      type="button" 
                      onClick={() => setShowPlansModal(true)}
                      className="font-black text-white transition hover:text-blue-300 hover:underline underline-offset-4"
                    >
                      Solicitar acceso
                    </button>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center text-[10px] flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-white/10 lg:hidden font-black">
              <span>Falcon IT © 2026</span>
              <span className="mx-2 opacity-30">•</span>
              <span>Tecnología de Excelencia</span>
            </div>
          </div>
        </section>
      </div>

      <PlansModal 
        isOpen={showPlansModal} 
        onClose={() => setShowPlansModal(false)} 
      />
    </div>
  );
};

export default Login;
