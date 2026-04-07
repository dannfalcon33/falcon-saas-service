'use client';

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  Check, 
  ShieldCheck, 
  CreditCard, 
  Building2, 
  User, 
  Mail, 
  Phone,
  CheckCircle2,
  ArrowRight,
  Upload,
  Info
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { plans } from "@/lib/constants";
import { Plan } from "@/lib/types";

const paymentMethods = [
  { id: "binance", label: "Binance Pay", icon: CreditCard, color: "#F3BA2F" },
  { id: "pagomovil", label: "Pago Móvil", icon: Phone, color: "#3D7BFF" },
  { id: "zinli", label: "Zinli", icon: CreditCard, color: "#6B3CF1" },
  { id: "transferencia", label: "Transferencia", icon: Building2, color: "#3D7BFF" },
];

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planName = searchParams.get('plan');
  
  const [selectedPayment, setSelectedPayment] = useState("binance");
  const [submitted, setSubmitted] = useState(false);
  
  // Buscar el plan por nombre o usar uno por defecto
  const plan = plans.find(p => p.name === planName) || plans[1]; // Plan Empresa por defecto

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    empresa: "",
    correo: "",
    telefono: "",
    aceptaTerminos: false,
    referencia: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.aceptaTerminos) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.nombre} ${formData.apellido}`,
          email: formData.correo,
          company: formData.empresa,
          phone: formData.telefono,
          plan: plan.name,
          payment_method: selectedPayment,
          reference: formData.referencia,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const err = await response.json();
        alert(`Error al procesar el reporte: ${err.error}`);
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("Error de conexión al procesar el reporte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full">
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-white mb-4">¡Reporte Recibido!</h1>
          <p className="text-[#8A9199] mb-10 text-lg leading-relaxed">
            Hemos recibido tu reporte de pago para el <strong>{plan.name}</strong>. Nuestro equipo de administración verificará los datos en breve.
          </p>
          <button 
            onClick={() => router.push("/")}
            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            Volver al Inicio <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#8A9199] font-sans flex flex-col lg:flex-row overflow-hidden">
      
      {/* SECCIÓN IZQUIERDA - Formulario (60%) */}
      <div className="w-full lg:w-3/5 p-8 lg:p-16 xl:p-24 overflow-y-auto custom-scrollbar h-auto lg:h-screen bg-black">
        <Link 
          href="/#plans"
          className="group text-[#8A9199] hover:text-white text-sm mb-12 flex items-center gap-2 transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Volver a los planes
        </Link>
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Completa tu suscripción
          </h1>
          <p className="text-lg opacity-80">Finaliza tu activación y protege tu infraestructura hoy mismo.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12 max-w-2xl">
          {/* 1. Datos de la Empresa */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#1F3A5F]/20 flex items-center justify-center text-[#3D7BFF] font-bold text-sm border border-[#1F3A5F]/30">1</div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider text-sm">Datos de la Empresa</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#C0C6CF] ml-1 uppercase opacity-60">Nombre</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    required 
                    type="text" 
                    placeholder="Juan" 
                    className="w-full bg-[#0B1622] border border-white/5 rounded-xl p-4 pl-12 outline-none focus:border-[#3D7BFF]/50 transition-all text-white placeholder:text-[#3A3F47]" 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#C0C6CF] ml-1 uppercase opacity-60">Apellido</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    required 
                    type="text" 
                    placeholder="Pérez" 
                    className="w-full bg-[#0B1622] border border-white/5 rounded-xl p-4 pl-12 outline-none focus:border-[#3D7BFF]/50 transition-all text-white placeholder:text-[#3A3F47]" 
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[#C0C6CF] ml-1 uppercase opacity-60">Nombre del Negocio</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                <input 
                  required 
                  type="text" 
                  placeholder="Tu empresa S.A." 
                  className="w-full bg-[#0B1622] border border-white/5 rounded-xl p-4 pl-12 outline-none focus:border-[#3D7BFF]/50 transition-all text-white placeholder:text-[#3A3F47]" 
                  value={formData.empresa}
                  onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#C0C6CF] ml-1 uppercase opacity-60">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    required 
                    type="email" 
                    placeholder="juan@empresa.com" 
                    className="w-full bg-[#0B1622] border border-white/5 rounded-xl p-4 pl-12 outline-none focus:border-[#3D7BFF]/50 transition-all text-white placeholder:text-[#3A3F47]" 
                    value={formData.correo}
                    onChange={(e) => setFormData({...formData, correo: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#C0C6CF] ml-1 uppercase opacity-60">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                  <input 
                    required 
                    type="tel" 
                    placeholder="+58 412 000 0000" 
                    className="w-full bg-[#0B1622] border border-white/5 rounded-xl p-4 pl-12 outline-none focus:border-[#3D7BFF]/50 transition-all text-white placeholder:text-[#3A3F47]" 
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Método de Pago */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#1F3A5F]/20 flex items-center justify-center text-[#3D7BFF] font-bold text-sm border border-[#1F3A5F]/30">2</div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider text-sm">Método de Pago</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div 
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`cursor-pointer border rounded-[1.25rem] p-5 flex items-center justify-between transition-all ${
                    selectedPayment === method.id 
                    ? `bg-[#0B1622]` 
                    : 'border-white/5 bg-[#0B1622] hover:border-white/20'
                  }`}
                  style={{
                    borderColor: selectedPayment === method.id ? method.color : 'rgba(255,255,255,0.05)',
                    boxShadow: selectedPayment === method.id ? `0 0 20px ${method.color}15` : 'none'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <method.icon className="w-5 h-5" style={{ color: selectedPayment === method.id ? method.color : 'rgba(255,255,255,0.4)' }} />
                    <span className={`font-semibold ${selectedPayment === method.id ? 'text-white' : ''}`}>{method.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors`}
                    style={{
                      backgroundColor: selectedPayment === method.id ? method.color : 'transparent',
                      borderColor: selectedPayment === method.id ? method.color : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    {selectedPayment === method.id && <Check className="w-3 h-3 text-black" />}
                  </div>
                </div>
              ))}
            </div>

            {/* Detalles según método */}
            <div className="mt-8 transition-all duration-300">
              {selectedPayment === 'binance' && (
                <div className="p-8 bg-[#0B1622] border border-[#F3BA2F]/20 rounded-3xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#F3BA2F]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-[#F3BA2F]/10 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-[#F3BA2F]" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">Binance Pay (API Ready)</p>
                      <p className="text-xs text-[#F3BA2F] font-bold uppercase tracking-widest">Pago Instantáneo</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="p-4 bg-black/40 rounded-xl border border-[#F3BA2F]/10 flex items-center gap-3">
                      <Info className="w-4 h-4 text-[#F3BA2F]" />
                      <p className="text-xs text-[#8A9199] leading-relaxed">
                        Este MVP está configurado para simular la conexión con la API de Binance Pay. En producción, serás redirigido a la pasarela segura de Binance.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center p-12 border-2 border-dashed border-[#F3BA2F]/20 rounded-2xl bg-black/20">
                    <div className="text-center group-hover:scale-105 transition-transform">
                      <div className="w-16 h-16 bg-[#F3BA2F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(243,186,47,0.3)]">
                        <CreditCard className="w-8 h-8 text-black" />
                      </div>
                      <p className="text-[#F3BA2F] font-bold">Checkout con Binance Pay</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedPayment === 'pagomovil' && (
                <div className="p-8 bg-[#0B1622] border-l-4 border-[#3D7BFF] rounded-3xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-[#3D7BFF]/10 rounded-2xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-[#3D7BFF]" />
                    </div>
                    <p className="text-white font-bold text-lg">Datos para Pago Móvil</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-xs text-[#3D7BFF] font-black tracking-widest uppercase mb-3">Opción 1</p>
                      <div className="space-y-3">
                        <div><span className="text-xs text-[#8A9199] block font-bold mb-0.5">Banco</span><span className="text-white font-medium">Bancamiga (0172)</span></div>
                        <div><span className="text-xs text-[#8A9199] block font-bold mb-0.5">Cédula / RIF</span><span className="text-white font-medium">V-25959341</span></div>
                        <div><span className="text-xs text-[#8A9199] block font-bold mb-0.5">Teléfono</span><span className="text-white font-medium">0422-0331995</span></div>
                      </div>
                    </div>
                    <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                      <p className="text-xs text-[#3D7BFF] font-black tracking-widest uppercase mb-3">Opción 2</p>
                      <div className="space-y-3">
                        <div><span className="text-xs text-[#8A9199] block font-bold mb-0.5">Banco</span><span className="text-white font-medium">Venezuela (0102)</span></div>
                        <div><span className="text-xs text-[#8A9199] block font-bold mb-0.5">Cédula / RIF</span><span className="text-white font-medium">V-25959341</span></div>
                        <div><span className="text-xs text-[#8A9199] block font-bold mb-0.5">Teléfono</span><span className="text-white font-medium">0416-4637506</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-xs font-bold text-[#C0C6CF] uppercase opacity-60 ml-1">Referencia de Pago</label>
                     <input 
                      type="text" 
                      placeholder="Últimos 4 o 6 dígitos" 
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-4 outline-none focus:border-[#3D7BFF] text-white" 
                      value={formData.referencia}
                      onChange={(e) => setFormData({...formData, referencia: e.target.value})}
                    />
                     <div className="w-full border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/5 hover:border-white/20 cursor-pointer transition-all flex flex-col items-center gap-3">
                        <Upload className="w-8 h-8 text-[#3D7BFF] opacity-60" />
                        <p className="text-sm text-[#8A9199]">Adjuntar captura de pantalla del pago</p>
                        <p className="text-[10px] uppercase font-bold text-[#3D7BFF]/60 mt-1">Requerido para validación</p>
                     </div>
                  </div>
                </div>
              )}

              {selectedPayment === 'zinli' && (
                <div className="p-8 bg-[#0B1622] border-l-4 border-[#6B3CF1] rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#6B3CF1]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-[#6B3CF1]/10 rounded-2xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-[#6B3CF1]" />
                    </div>
                    <p className="text-white font-bold text-lg">Datos para Zinli</p>
                  </div>
                  
                  <div className="p-6 bg-black/40 rounded-2xl border border-white/5 mb-10">
                    <div className="space-y-4">
                      <div><span className="text-xs text-[#8A9199] block font-bold mb-0.5 uppercase tracking-widest">Titular</span><span className="text-white font-serif text-xl font-bold">Yoshua Daniel Soto</span></div>
                      <div className="pt-4 border-t border-white/5"><span className="text-xs text-[#8A9199] block font-bold mb-0.5 uppercase tracking-widest">Correo Zinli</span><span className="text-white font-medium">yoshuasoto54@gmail.com</span></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="w-full border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/5 hover:border-white/20 cursor-pointer transition-all flex flex-col items-center gap-3">
                        <Upload className="w-8 h-8 text-[#6B3CF1] opacity-60" />
                        <p className="text-sm text-[#8A9199]">Adjuntar captura del pago Zinli</p>
                        <p className="text-[10px] uppercase font-bold text-[#6B3CF1]/60 mt-1">Requerido para reporte manual</p>
                     </div>
                  </div>
                </div>
              )}

              {selectedPayment === 'transferencia' && (
                <div className="p-8 bg-[#0B1622] border-l-4 border-[#3D7BFF] rounded-3xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-[#3D7BFF]/10 rounded-2xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#3D7BFF]" />
                    </div>
                    <p className="text-white font-bold text-lg">Cuentas para Transferencia</p>
                  </div>
                  
                  <div className="space-y-4 mb-10">
                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-xs text-[#3D7BFF] font-black tracking-widest uppercase">Bancamiga (0172)</p>
                        <span className="text-[10px] bg-[#3D7BFF]/10 text-[#3D7BFF] px-2 py-0.5 rounded font-bold">Corriente</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white font-mono text-lg tracking-tight">0172-0194-86-194510776</p>
                        <div className="flex flex-col text-[11px] text-[#8A9199] font-medium">
                          <span>Titular: Yoshua Daniel Soto</span>
                          <span>RIF/CI: V-25959341</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-black/40 rounded-2xl border border-white/5">
                      <div className="flex justify-between items-start mb-4">
                        <p className="text-xs text-[#3D7BFF] font-black tracking-widest uppercase">Banco de Venezuela (0102)</p>
                        <span className="text-[10px] bg-[#3D7BFF]/10 text-[#3D7BFF] px-2 py-0.5 rounded font-bold">Corriente</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white font-mono text-lg tracking-tight">01020732120000080130</p>
                        <div className="flex flex-col text-[11px] text-[#8A9199] font-medium">
                          <span>Titular: Yoshua Daniel Soto</span>
                          <span>RIF/CI: V-25959341</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div className="w-full border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:bg-white/5 hover:border-white/20 cursor-pointer transition-all flex flex-col items-center gap-3">
                        <Upload className="w-8 h-8 text-[#3D7BFF] opacity-60" />
                        <p className="text-sm text-[#8A9199]">Adjuntar comprobante de transferencia</p>
                        <p className="text-[10px] uppercase font-bold text-[#3D7BFF]/60 mt-1">Procesamos en horario de oficina</p>
                     </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirmación Final */}
          <div className="space-y-8 pt-8 border-t border-white/10">
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="flex items-center h-5 mt-1">
                <input 
                  type="checkbox" 
                  required
                  className="w-5 h-5 rounded border-white/20 bg-[#0B1622] text-[#3D7BFF] focus:ring-[#3D7BFF] cursor-pointer transition-all" 
                  checked={formData.aceptaTerminos}
                  onChange={(e) => setFormData({...formData, aceptaTerminos: e.target.checked})}
                />
              </div>
              <span className="text-sm text-[#8A9199] group-hover:text-gray-300 transition-colors leading-relaxed">
                He leído y acepto la <Link href="/privacidad" target="_blank" className="text-white hover:text-[#3D7BFF] underline underline-offset-4 font-bold">Política de Privacidad</Link> y los <Link href="/terminos" target="_blank" className="text-white hover:text-[#3D7BFF] underline underline-offset-4 font-bold">Términos de Servicio y SLA</Link> de Falcon IT.
              </span>
            </label>
            
            <button 
              type="submit"
              disabled={!formData.aceptaTerminos || isSubmitting}
              className="group relative w-full bg-white text-black font-black py-5 rounded-2xl transition-all hover:bg-gray-100 hover:scale-[1.02] active:scale-[0.98] shadow-[0_20px_50px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: formData.aceptaTerminos && !isSubmitting ? 'white' : '#1A1A1A',
                color: formData.aceptaTerminos && !isSubmitting ? 'black' : '#444',
              }}
            >
              {formData.aceptaTerminos && !isSubmitting && <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-black/5 to-transparent skew-x-[-20deg] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>}
              {isSubmitting ? "Procesando..." : "Reportar Pago y Activar Plan"}
              <ArrowRight className={`w-5 h-5 ${isSubmitting ? 'animate-spin' : 'group-hover:translate-x-1 transition-transform'}`} />
            </button>
          </div>
        </form>
      </div>

      {/* SECCIÓN DERECHA - Resumen Sticky (40%) */}
      <div className="w-full lg:w-2/5 bg-[#0B1622] border-l border-white/5 p-8 lg:p-16 xl:p-24 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center">
        
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-1">
            <Logo className="w-8 h-8" />
            <span className="font-serif text-2xl font-bold text-white tracking-widest">FALCON IT</span>
          </div>
          <div className="h-0.5 w-12 bg-[#3D7BFF] rounded-full"></div>
        </div>

        <h3 className="text-sm font-black text-[#8A9199] uppercase tracking-[0.2em] mb-6">Resumen de la orden</h3>
        
        <div className="bg-[#050505] border border-white/5 rounded-3xl p-8 mb-8 backdrop-blur-xl relative overflow-hidden group shadow-2xl">
          <div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700">
            <Logo className="w-48 h-48" />
          </div>
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <span className="inline-block px-3 py-1 bg-[#1F3A5F] text-[#3D7BFF] text-[10px] font-black uppercase tracking-widest rounded-full mb-3 border border-[#3D7BFF]/20">Enterprise B2B</span>
              <h4 className="text-3xl font-serif font-bold text-white tracking-tight">{plan.name}</h4>
            </div>
            <div className="text-right">
              <span className="text-3xl font-serif font-bold text-white">${plan.price}</span>
              <span className="text-sm text-[#8A9199] block font-medium">/mes</span>
            </div>
          </div>
          
          {/* Contenedor de especificaciones con scroll refinado */}
          <div className="relative">
            <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3D7BFF] mb-4">Alcance Operativo Completo</h5>
            
            <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar-thin space-y-3">
              {[
                { label: "Público Objetivo", value: plan.name === "Plan Pymes" ? "Pequeñas empresas" : plan.name === "Plan Empresa" ? "PYMES operativas" : "Empresas críticas" },
                { label: "Soporte Remoto", value: plan.name === "Plan Pymes" ? "Limitado" : plan.name === "Plan Empresa" ? "Prioritario" : "VIP Prioritario" },
                { label: "Visitas Presenciales", value: plan.name === "Plan Pymes" ? "2 mensuales" : plan.name === "Plan Empresa" ? "4 mensuales" : "Según necesidad" },
                { label: "Tiempo de Respuesta", value: plan.name === "Plan Pymes" ? "24–48 horas" : plan.name === "Plan Empresa" ? "12–24 horas" : "4–8 horas" },
                { label: "Mantenimiento", value: plan.name === "Plan Pymes" ? "Correctivo" : plan.name === "Plan Empresa" ? "Preventivo + Correctivo" : "Optimización Continua" },
                { label: "Respaldo en Nube", value: plan.name === "Plan Pymes" ? "No Incluido" : plan.name === "Plan Empresa" ? "Gestión Incluida" : "Gestión + Verificación" },
                { label: "Backup Local", value: plan.name === "Plan Pymes" ? "Básico" : "Incluido + Gestión" },
                { label: "Control de Backups", value: plan.name === "Plan Pymes" ? "No" : plan.name === "Plan Empresa" ? "Básico" : "Periódico" },
                { label: "Asesoría Técnica", value: plan.name === "Plan Pymes" ? "No" : plan.name === "Plan Empresa" ? "Básica" : "Continua VIP" },
                { label: "Monitoreo", value: plan.name === "Plan Pymes" ? "No" : plan.name === "Plan Empresa" ? "Básico" : "Activo 24/7" },
              ].map((spec, i) => (
                <div key={i} className="flex justify-between items-center text-[11px] border-b border-white/5 pb-3 last:border-0 transition-all hover:bg-white/5 rounded-lg px-2 py-1 group/spec">
                  <span className="text-[#8A9199] font-medium group-hover/spec:text-[#C0C6CF]">{spec.label}</span>
                  <span className="text-white font-bold">{spec.value}</span>
                </div>
              ))}
            </div>
            
            {/* Efecto de desvanecimiento para indicar más contenido */}
            <div className="absolute bottom-0 left-0 w-full h-8 bg-linear-to-t from-[#050505] to-transparent pointer-events-none opacity-50"></div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex justify-between items-center mb-10">
          <span className="text-lg text-[#C0C6CF] font-bold">Total a pagar hoy</span>
          <span className="text-4xl font-serif font-bold text-white shadow-sm">${plan.price}.00</span>
        </div>

        <div className="flex items-start gap-4 p-6 bg-[#1F3A5F]/10 border border-[#1F3A5F]/20 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-[#3D7BFF]/5 rounded-bl-full"></div>
          <ShieldCheck className="w-6 h-6 text-[#3D7BFF] shrink-0 mt-0.5" />
          <p className="text-xs text-[#8A9199] leading-relaxed opacity-80">
            Los pagos locales son verificados manualmente por nuestro equipo operativo. Tus datos de facturación están protegidos y encriptados bajo estándares de seguridad corporativa.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>}>
      <BillingContent />
    </Suspense>
  );
}
