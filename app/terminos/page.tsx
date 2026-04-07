import React from "react";
import { FileText, CheckCircle2, Terminal, ShieldAlert, Edit3 } from "lucide-react";

export default function TerminosPage() {
  return (
    <div className="bg-black py-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <div className="inline-flex p-3 rounded-xl bg-[#1F3A5F]/20 border border-[#1F3A5F]/30 text-[#3D7BFF] mb-8">
          <FileText className="w-8 h-8" />
        </div>
        
        <h1 className="text-5xl font-serif font-bold text-white mb-2 leading-tight">
          Términos y Condiciones
        </h1>
        <div className="text-[#8A9199] text-sm mb-12 font-medium">
          Última actualización: 6 de abril, 2026
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-[#3D7BFF]" /> 1. Aceptación de los Términos
            </h2>
            <p className="text-[#8A9199] leading-relaxed text-lg">
              Al acceder y utilizar los servicios de Falcon IT, usted acepta estar
              sujeto a los siguientes términos y condiciones. Si no está de acuerdo
              con alguno de estos términos, le solicitamos que no utilice nuestros
              servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-4">
              <Terminal className="w-6 h-6 text-[#3D7BFF]" /> 2. Uso de los Servicios
            </h2>
            <p className="text-[#8A9199] leading-relaxed mb-6 text-lg">
              Usted acepta utilizar nuestros servicios únicamente para fines lícitos
              y de acuerdo con estos términos. Se prohíbe cualquier uso que pueda
              dañar, deshabilitar o sobrecargar la infraestructura de Falcon IT o
              interferir con el uso de otros clientes.
            </p>
            <ul className="space-y-3">
              {[
                "La cuenta es personal e intransferible.",
                "Usted es responsable de la seguridad de sus credenciales.",
                "No se permite el uso de software malintencionado."
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
              <ShieldAlert className="w-6 h-6 text-[#3D7BFF]" /> 3. Limitación de Responsabilidad
            </h2>
            <p className="text-[#8A9199] leading-relaxed mb-4 text-lg">
              Aunque nos esforzamos por proporcionar un servicio de excelencia,
              Falcon IT no garantiza que los servicios sean ininterrumpidos o libres
              de errores. No seremos responsables de daños indirectos, incidentales
              o consecuentes que resulten del uso de nuestros servicios.
            </p>
            <p className="text-[#8A9199] leading-relaxed text-lg italic bg-white/5 p-4 rounded-xl border border-white/5">
              La responsabilidad total de Falcon IT no excederá los montos pagados
              por el cliente por el servicio durante el período de la incidencia
              reportada.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-4">
              <Edit3 className="w-6 h-6 text-[#3D7BFF]" /> 4. Modificaciones
            </h2>
            <p className="text-[#8A9199] leading-relaxed text-lg">
              Falcon IT se reserva el derecho de modificar estos términos en
              cualquier momento. Los cambios entrarán en vigor inmediatamente
              después de su publicación. El uso continuado de los servicios tras
              dichos cambios constituirá su aceptación de los nuevos términos.
            </p>
          </section>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 text-center text-[#8A9199]/50 text-sm font-medium">
          © 2026 Falcon IT. Si tiene alguna pregunta, contáctenos en
          soporte@falconit.com.
        </div>
      </div>
    </div>
  );
}
