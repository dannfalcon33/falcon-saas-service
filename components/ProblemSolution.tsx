'use client';

import React from "react";
import { XCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";

export const ProblemSolution = () => {
  return (
    <section id="about" className="py-24 bg-[#05070A] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Orbe sutil decorativo */}
        <div className="absolute top-1/2 -right-[15%] -translate-y-1/2 w-[500px] h-[500px] bg-[#1F3A5F]/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-10 font-serif leading-tight">
              Garantizamos la continuidad operativa de tu empresa
            </h2>

            <ul className="space-y-8 mb-12">
              <li className="flex items-start gap-4">
                <div className="p-2.5 bg-[#0B1622] rounded-lg shrink-0 mt-1 border border-[#8A9199]/20 shadow-inner">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-[#C0C6CF] font-semibold mb-1 text-lg">
                    Equipos lentos
                  </h4>
                  <p className="text-[#8A9199]">
                    Optimizamos tus sistemas continuamente para máximo
                    rendimiento.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2.5 bg-[#0B1622] rounded-lg shrink-0 mt-1 border border-[#8A9199]/20 shadow-inner">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-[#C0C6CF] font-semibold mb-1 text-lg">
                    Caídas de red
                  </h4>
                  <p className="text-[#8A9199]">
                    Monitoreo activo para evitar interrupciones en tu
                    conectividad.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2.5 bg-[#0B1622] rounded-lg shrink-0 mt-1 border border-[#8A9199]/20 shadow-inner">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-[#C0C6CF] font-semibold mb-1 text-lg">
                    Pérdida de datos
                  </h4>
                  <p className="text-[#8A9199]">
                    Implementamos respaldo híbrido seguro en servidores físicos
                    y en la nube.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2.5 bg-[#0B1622] rounded-lg shrink-0 mt-1 border border-[#8A9199]/20 shadow-inner">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h4 className="text-[#C0C6CF] font-semibold mb-1 text-lg">
                    Falta de soporte
                  </h4>
                  <p className="text-[#8A9199]">
                    Atención inmediata resolviendo tus problemas en tiempo
                    récord.
                  </p>
                </div>
              </li>
            </ul>

            <div className="p-6 bg-[#0B1622] border-l-4 border-[#C0C6CF] rounded-r-xl shadow-lg mt-8">
              <p className="text-[#E2E8F0] font-bold text-xl leading-relaxed">
                Evitamos que los problemas tecnológicos detengan tu negocio.
              </p>
              <p className="text-[#8A9199] mt-2 font-medium">
                Nos convertimos en tu departamento de IT externo.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Contenedor central simulando un servidor o escudo blindado */}
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#C0C6CF]/10 bg-gradient-to-br from-[#0B1622] to-[#05070A] relative flex items-center justify-center p-8 shadow-[0_0_50px_rgba(11,22,34,0.8)]">
              <div className="w-full h-full border border-dashed border-[#8A9199]/30 rounded-xl flex items-center justify-center bg-[#05070A]/50 overflow-hidden relative backdrop-blur-sm">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1F3A5F]/20 via-transparent to-transparent"></div>
                <Logo className="w-32 h-40 opacity-80" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
