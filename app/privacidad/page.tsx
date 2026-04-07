import React from "react";
import { Shield, Eye, FileText, Lock, UserCheck } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div className="bg-black py-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <div className="inline-flex p-3 rounded-xl bg-[#1F3A5F]/20 border border-[#1F3A5F]/30 text-[#3D7BFF] mb-8">
          <Shield className="w-8 h-8" />
        </div>
        
        <h1 className="text-5xl font-serif font-bold text-white mb-2 leading-tight">
          Política de Privacidad
        </h1>
        <div className="text-[#8A9199] text-sm mb-12 font-medium">
          Última actualización: 6 de abril, 2026
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-4">
              <Eye className="w-6 h-6 text-[#3D7BFF]" /> 1. Información que recopilamos
            </h2>
            <p className="text-[#8A9199] leading-relaxed mb-6 text-lg">
              En Falcon IT, respetamos su privacidad. Recopilamos información
              personal que usted nos proporciona directamente cuando solicita
              nuestros servicios, se suscribe a un plan o se pone en contacto con
              nuestro equipo de soporte.
            </p>
            <ul className="space-y-3">
              {[
                "Nombre y datos de contacto (Email, teléfono).",
                "Información de la empresa.",
                "Detalles técnicos de la infraestructura para diagnóstico."
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#C0C6CF]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3D7BFF]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-4">
              <FileText className="w-6 h-6 text-[#3D7BFF]" /> 2. Cómo usamos su información
            </h2>
            <p className="text-[#8A9199] leading-relaxed mb-6 text-lg">
              Utilizamos la información recopilada para:
            </p>
            <ul className="space-y-3">
              {[
                "Prestar, operar y mantener nuestros servicios de soporte IT.",
                "Mejorar, personalizar y expandir nuestras soluciones.",
                "Entender y analizar cómo utiliza nuestros servicios.",
                "Comunicarnos con usted para soporte técnico y actualizaciones."
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#C0C6CF]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#3D7BFF]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-4">
              <Lock className="w-6 h-6 text-[#3D7BFF]" /> 3. Protección de datos
            </h2>
            <p className="text-[#8A9199] leading-relaxed mb-4 text-lg">
              Implementamos una variedad de medidas de seguridad para mantener la
              seguridad de su información personal. Sus datos están protegidos bajo
              estrictos protocolos de cifrado y acceso limitado solo a personal
              autorizado.
            </p>
            <p className="text-[#8A9199] leading-relaxed text-lg">
              No vendemos, intercambiamos ni transferimos a terceros su información
              personal identificable sin su consentimiento expreso, excepto para
              cumplir con requerimientos legales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-4">
              <UserCheck className="w-6 h-6 text-[#3D7BFF]" /> 4. Sus derechos
            </h2>
            <p className="text-[#8A9199] leading-relaxed text-lg italic">
              Usted tiene derecho a acceder, corregir o eliminar sus datos
              personales en cualquier momento. Si desea ejercer estos derechos,
              contacte a nuestro oficial de privacidad en yoshuasoto54@gmail.com.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 text-center text-[#8A9199]/50 text-sm font-medium">
          © 2026 Falcon IT. Al utilizar nuestro sitio web y servicios, usted
          acepta nuestras prácticas de privacidad.
        </div>
      </div>
    </div>
  );
}
