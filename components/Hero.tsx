"use client";

import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { buttonLargeClasses } from "./styles";
import { FloatingSpheres } from "./FloatingSpheres";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-40 pb-20 overflow-hidden bg-black">
      <FloatingSpheres />

      <div className="absolute inset-0 bg-linear-to-br from-[#0B1622]/10 via-[#1F3A5F]/5 to-black -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight font-serif tracking-tight"
        >
          Falcon IT
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#3D7BFF] mb-6 leading-relaxed drop-shadow-[0_0_10px_rgba(61,123,255,0.3)]"
        >
          Servicios de Continuidad Operativa Tecnológica
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="text-lg md:text-xl text-[#8A9199] max-w-3xl mx-auto mb-10 leading-relaxed font-light"
        >
          Nos encargamos de todo el sistema informático de tu empresa para que
          operes sin interrupciones, sin necesidad de contratar personal interno.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative max-w-5xl mx-auto mb-16 px-4"
        >
          {/* Animated Border Container */}
          <div className="relative p-[1px] rounded-2xl overflow-hidden bg-white/5">
            {/* Spinning Neon Gradient */}
            <div className="absolute inset-[-100%] animate-border-spin opacity-70">
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,transparent_90deg,#1F3A5F_180deg,#3D7BFF_270deg,transparent_360deg)]" />
            </div>
            
            {/* Image Wrapper */}
            <div className="relative bg-[#050505] rounded-[15px] overflow-hidden">
              <img 
                src="/screen.png" 
                alt="Dashboard de Trabajo" 
                className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
              />
              {/* Bottom Gradient Overlay */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Glow Effect behind the image */}
          <div className="absolute -inset-4 bg-[#3D7BFF]/10 blur-3xl -z-10 rounded-full" />
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-12 text-[#C0C6CF] text-sm md:text-base font-medium"
        >
          <li className="flex justify-center items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2F5D8C]" /> Mantenimiento
            preventivo y correctivo
          </li>
          <li className="flex justify-center items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2F5D8C]" /> Respuesta
            inmediata garantizada
          </li>
          <li className="flex justify-center items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2F5D8C]" /> Backups seguros
            en la nube
          </li>
          <li className="flex justify-center items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2F5D8C]" /> Soporte remoto y
            presencial
          </li>
        </motion.ul>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-6"
        >
          <a
            href="https://wa.me/584220331995?text=Quiero%20agendar%20una%20visita%20de%20diagnostico"
            target="_blank"
            rel="noopener noreferrer"
            className={buttonLargeClasses}
          >
            Agenda diagnóstico gratuito{" "}
            <ArrowRight className="w-5 h-5 opacity-80" />
          </a>
          <a
            href="#plans"
            className="px-8 py-4 bg-transparent border border-[#8A9199]/30 text-[#C0C6CF] font-semibold rounded-full hover:bg-[#8A9199]/10 hover:border-[#C0C6CF]/60 transition-colors flex items-center justify-center"
          >
            Ver planes
          </a>
        </motion.div>
      </div>
    </section>
  );
};
