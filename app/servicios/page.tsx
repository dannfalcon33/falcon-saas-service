import React from "react";
import type { Metadata } from "next";
import { ArrowLeft, Layers, BookOpen, ShieldAlert, AlertTriangle, Briefcase } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Servicios de Continuidad Operativa Tecnológica",
  description:
    "Conoce el alcance operativo de Falcon IT: incidencias, mantenimiento preventivo, visitas técnicas, monitoreo y gestión de continuidad para empresas.",
  alternates: {
    canonical: "/servicios",
  },
};

export default function ServiciosPage() {
  const definitions = [
    { title: "Soporte Remoto", desc: "Atención técnica a distancia para resolución de incidencias, configuración de software y asistencia inmediata mediante herramientas de control remoto." },
    { title: "Visitas Presenciales", desc: "Intervenciones en sitio programadas (preventivas) o necesarias (correctivas) según el plan contratado y la disponibilidad geográfica." },
    { title: "Tiempo de Respuesta (SLA)", desc: "Tiempo máximo estipulado para dar inicio a la atención de una incidencia reportada. Nota: No garantiza el tiempo total de resolución." },
    { title: "Monitoreo Activo", desc: "Seguimiento continuo de la salud de los sistemas clave para detectar y corregir fallas antes de que impacten la operación del negocio." },
    { title: "Uso Razonable (SLA Corporativo)", desc: "El servicio, aunque flexible, no es ilimitado. Se gestiona bajo criterios de uso justo basados en la carga operativa estándar de la infraestructura del cliente.", fullWidth: true },
  ];

  const limits = [
    { title: "Proyectos de Infraestructura", desc: "Instalaciones nuevas de red, cableado estructurado o despliegues masivos no están incluidos y se cotizan de forma independiente." },
    { title: "Almacenamiento Cloud", desc: "El costo de almacenamiento en la nube (Google Drive, AWS, Azure, etc.) es responsabilidad directa del cliente." },
    { title: "Responsabilidad de Datos", desc: "Aunque gestionamos backups, el cliente es el responsable legal de su información y de contratar el almacenamiento necesario." },
    { title: "Protección Total", desc: "No existe la 'protección total' contra la pérdida de datos; Falcon IT implementa las mejores prácticas para minimizar el riesgo al máximo." },
    { title: "Logística", desc: "Las visitas presenciales se organizan por zonas geográficas y rutas programadas para optimizar tiempos." },
  ];

  return (
    <div className="bg-black py-24 min-h-screen font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[#8A9199] hover:text-white transition-colors mb-12 font-semibold">
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight">
            Detalles de Servicios
          </h1>
          <p className="text-[#8A9199] text-xl max-w-2xl mx-auto leading-relaxed italic font-serif opacity-80">
            Información operativa detallada sobre el modelo de continuidad
            operativa tecnológica de Falcon IT, alcances y definiciones
            contractuales.
          </p>
        </div>

        <section className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-white mb-8 flex items-center gap-4 border-b border-white/5 pb-4">
            <Layers className="w-8 h-8 text-[#3D7BFF]" /> 1. Enfoque del Modelo
          </h2>
          <div className="p-10 rounded-3xl bg-[#0B1622] border border-white/5 shadow-2xl">
            <p className="text-[#8A9199] text-lg mb-8 leading-relaxed font-medium">
              Falcon IT ofrece un servicio de continuidad operativa tecnológica
              por suscripción, estructurado en tres niveles según la criticidad
              del negocio y su dependencia tecnológica.
            </p>
            <p className="text-[#C0C6CF] font-bold mb-6 uppercase tracking-widest text-xs">Cada plan define una estructura clara de:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Nivel de prioridad en atención remoto y presencial.",
                "Frecuencia de visitas preventivas y correctivas.",
                "Profundidad del mantenimiento técnico.",
                "Nivel de protección de datos y gestión de backups.",
                "Grado de acompañamiento técnico y asesoría estratégica."
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#8A9199] text-sm font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3D7BFF]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-white mb-8 flex items-center gap-4 border-b border-white/5 pb-4">
            <BookOpen className="w-8 h-8 text-[#3D7BFF]" /> 2. Definiciones Clave
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {definitions.map((def, i) => (
              <div key={i} className={`p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors ${def.fullWidth ? 'md:col-span-2' : ''}`}>
                <h4 className="text-white font-bold mb-3 text-lg">{def.title}</h4>
                <p className="text-[#8A9199] text-sm leading-relaxed">{def.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-white mb-8 flex items-center gap-4 border-b border-white/5 pb-4">
            <ShieldAlert className="w-8 h-8 text-rose-500" /> 3. Límites del Servicio
          </h2>
          <div className="p-10 rounded-3xl bg-rose-500/[0.03] border border-rose-500/20 shadow-inner">
            <div className="flex items-center gap-3 text-rose-500 font-black uppercase tracking-[0.2em] mb-6 text-sm">
              <AlertTriangle className="w-5 h-5" /> IMPORTANTE - LEA CON DETALLE
            </div>
            <p className="text-rose-200/60 mb-8 font-medium">Para mantener la calidad y el enfoque de nuestros servicios de mantenimiento, se establecen las siguientes exclusiones:</p>
            <ul className="space-y-6">
              {limits.map((limit, i) => (
                <li key={i} className="flex gap-4">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <p className="text-rose-100/70 text-sm leading-relaxed">
                    <strong className="text-rose-400 font-black uppercase tracking-wider text-[10px] block mb-1">{limit.title}</strong>
                    {limit.desc}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-3xl font-serif font-bold text-white mb-8 flex items-center gap-4 border-b border-white/5 pb-4">
            <Briefcase className="w-8 h-8 text-[#3D7BFF]" /> 4. Alcance Operativo por Plan
          </h2>
          <div className="space-y-6">
            {[
              { plan: "Plan Básico", color: "border-[#3D7BFF]", desc: "Soporte reactivo. El objetivo es resolver problemas críticos cuando ocurren para evitar parálisis total." },
              { plan: "Plan Empresarial", color: "border-[#F3BA2F]", desc: "Operación estable. El núcleo del negocio se protege con mantenimiento preventivo continuo y soporte prioritario." },
              { plan: "Plan Corporativo", color: "border-[#6B3CF1]", desc: "Continuidad crítica. Enfoque en protección empresarial total, prevención activa y control riguroso de datos." }
            ].map((item, i) => (
              <div key={i} className={`p-6 rounded-2xl bg-[#0B1622] border-l-4 ${item.color} shadow-lg`}>
                <h4 className="text-white font-bold mb-2">{item.plan}</h4>
                <p className="text-[#8A9199] text-sm font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-20 pt-10 border-t border-white/5 text-center text-[#8A9199]/50 text-sm font-medium">
          © 2026 Falcon IT. Este documento define la base operativa de nuestros servicios IT. Para ver la tabla comparativa de precios, visite la sección de <Link href="/planes" className="text-[#3D7BFF] hover:underline">Detalle de Planes</Link>.
        </div>
      </div>
    </div>
  );
}
