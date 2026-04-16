import React from "react";
import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, Zap, Shield, Crown } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Planes de IT por Suscripción para Empresas",
  description:
    "Compara los planes Básico, Empresarial y Corporativo de Falcon IT para continuidad operativa tecnológica y gestión IT externa por suscripción.",
  alternates: {
    canonical: "/planes",
  },
};

export default function PlanesPage() {
  const comparisonData = [
    { label: "Público objetivo", basico: "Pequeñas empresas", empresarial: "PYMES operativas", corporativo: "Empresas críticas" },
    { label: "Soporte remoto", basico: "Limitado", empresarial: "Prioritario", corporativo: "Prioritario VIP" },
    { label: "Visitas presenciales", basico: "2 mensuales", empresarial: "4 mensuales", corporativo: "Según necesidad" },
    { label: "Tiempo de respuesta", basico: "24–48 horas", empresarial: "12–24 horas", corporativo: "4–8 horas" },
    { label: "Mantenimiento", basico: "Correctivo", empresarial: "Preventivo + Correctivo", corporativo: "Optimización Continua" },
    { label: "Respaldo en nube", basico: "No incluido", empresarial: "Gestión incluida", corporativo: "Gestión + Verificación", isStatus: true },
    { label: "Backup Local", basico: "Básico", empresarial: "Incluido", corporativo: "Incluido + Supervisión" },
    { label: "Control de Backups", basico: "No", empresarial: "Básico", corporativo: "Periódico", isStatus: true },
    { label: "Asesoría Tecnológica", basico: "No", empresarial: "Básica", corporativo: "Continua", isStatus: true },
    { label: "Monitoreo", basico: "No", empresarial: "Básico", corporativo: "Activo", isStatus: true },
  ];

  return (
    <div className="bg-black py-24 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[#8A9199] hover:text-white transition-colors mb-12 font-semibold">
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-6">
            Comparación de Planes
          </h1>
          <p className="text-[#8A9199] text-xl max-w-2xl mx-auto leading-relaxed">
            Analice detalladamente cuál de nuestras soluciones tecnológicas se
            adapta mejor a la escala y criticidad operativa de su negocio.
          </p>
        </div>

        {/* Tabla Comparativa */}
        <div className="overflow-x-auto rounded-3xl border border-white/5 bg-[#0B1622] mb-20 shadow-2xl">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-[#3D7BFF]">Característica</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-blue-400">Básico ($60)</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-amber-400">Empresarial ($80)</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-purple-400">Corporativo ($120)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comparisonData.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-6 text-sm font-bold text-[#E2E8F0] tracking-wide">{row.label}</td>
                  <td className={`p-6 text-sm font-medium ${row.basico === "No incluido" || row.basico === "No" ? 'text-rose-500/60' : 'text-[#8A9199]'}`}>
                    {row.basico}
                  </td>
                  <td className="p-6 text-sm font-bold text-amber-200/80">{row.empresarial}</td>
                  <td className="p-6 text-sm font-bold text-purple-200/80">{row.corporativo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detalle de Planes */}
        <div className="space-y-8">
          {/* Plan Básico */}
          <div className="p-10 rounded-[2.5rem] bg-[#0B1622] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500/50" />
            <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 border border-blue-500/20">Entrada</span>
            <h3 className="text-3xl font-serif font-bold text-white mb-4 italic">Plan Básico - Soporte Operativo Inicial</h3>
            <p className="text-[#8A9199] text-lg mb-10 max-w-2xl font-medium">
              Orientado a resolver incidencias puntuales y mantener la
              operatividad mínima del negocio con una inversión optimizada.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Soporte Reactivo", desc: "Enfocado en resolver problemas cuando ocurren." },
                { title: "Operación Sencilla", desc: "Ideal para oficinas con baja dependencia tecnológica." },
                { title: "Backup Local", desc: "Gestión de respaldos en sitio para datos críticos." },
                { title: "Visitas", desc: "Cobertura de 2 visitas presenciales para fallas de hardware." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                  <p className="text-[#C0C6CF] text-sm leading-relaxed">
                    <strong className="text-white">{item.title}:</strong> {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Empresarial */}
          <div className="p-10 rounded-[2.5rem] bg-[#0B1622] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500/50" />
            <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 border border-amber-500/20">Recomendado</span>
            <h3 className="text-3xl font-serif font-bold text-white mb-4 italic">Plan Empresarial - Operación Estable</h3>
            <p className="text-[#8A9199] text-lg mb-10 max-w-2xl font-medium">
              Diseñado para mantener la estabilidad, prevenir fallas y asegurar la
              continuidad operativa de PYMES en crecimiento.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Soporte Prioritario", desc: "Canal de atención rápida para reducción de tiempos muertos." },
                { title: "Mantenimiento Preventivo", desc: "Revision periódica para evitar fallas antes de que ocurran." },
                { title: "Cloud Backup", desc: "Configuración y supervisión de respaldos en nube." },
                { title: "Asesoría Básica", desc: "Recomendaciones oportunas sobre hardware y seguridad." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-amber-500 shrink-0" />
                  <p className="text-[#C0C6CF] text-sm leading-relaxed">
                    <strong className="text-white">{item.title}:</strong> {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Plan Corporativo */}
          <div className="p-10 rounded-[2.5rem] bg-[#0B1622] border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500/50" />
            <span className="inline-block px-3 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-6 border border-purple-500/20">Continuidad Crítica</span>
            <h3 className="text-3xl font-serif font-bold text-white mb-4 italic">Plan Corporativo - Protección Total</h3>
            <p className="text-[#8A9199] text-lg mb-10 max-w-2xl font-medium">
              Garantiza la máxima continuidad operativa, seguridad de datos y
              soporte prioritario VIP para infraestructuras complejas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Soporte VIP", desc: "Respuesta inmediata en máximo 8 horas para casos críticos." },
                { title: "Control de Datos", desc: "Validación periódica de recuperación de desastres." },
                { title: "Monitoreo Activo", desc: "Supervisión remota de servidores y red de la empresa." },
                { title: "Visitas Ilimitadas", desc: "Soporte presencial según necesidad del cliente." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
                  <p className="text-[#C0C6CF] text-sm leading-relaxed">
                    <strong className="text-white">{item.title}:</strong> {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 text-center text-[#8A9199]/50 text-sm font-medium">
          © 2026 Falcon IT. Los servicios están sujetos a la infraestructura
          actual del cliente. Los tiempos de respuesta pueden variar según la zona
          geográfica.
        </div>
      </div>
    </div>
  );
}
