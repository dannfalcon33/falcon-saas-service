'use client';

import React from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { buttonLargeClasses } from "./styles";
import { FloatingSpheres } from "./FloatingSpheres";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-20 overflow-hidden bg-black">
      <FloatingSpheres />

      <div className="absolute inset-0 bg-linear-to-br from-[#0B1622]/10 via-[#1F3A5F]/5 to-black -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight font-serif tracking-tight"
        >
          Continuidad operativa tecnológica para empresas en menos de{" "}
          <span className="text-[#C0C6CF] drop-shadow-[0_0_15px_rgba(192,198,207,0.5)]">
            24h
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xl md:text-2xl text-[#8A9199] max-w-4xl mx-auto mb-8 leading-relaxed font-light"
        >
          Operamos tu departamento IT externo por suscripción para mantener tu
          producción y ejecución sin interrupciones, sin ampliar nómina interna.
        </motion.p>

        <motion.ul
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-12 text-[#C0C6CF] text-sm md:text-base font-medium"
        >
          <li className="flex justify-center items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2F5D8C]" /> Gestión de
            incidencias remota y en sitio
          </li>
          <li className="flex justify-center items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2F5D8C]" /> Monitoreo y SLA
            orientados a continuidad
          </li>
          <li className="flex justify-center items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2F5D8C]" /> Backups y
            reportes técnicos auditables
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
