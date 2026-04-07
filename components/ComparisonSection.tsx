'use client';

import React from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { FloatingSpheres } from "./FloatingSpheres";

export const ComparisonSection = () => {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      <FloatingSpheres />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white font-serif">
            ¿Por qué externalizar tu IT?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-3xl bg-[#05070A] border border-[#3E1C1F]/40 shadow-inner overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-900/5 rounded-bl-full blur-2xl"></div>
            <h3 className="text-2xl font-bold text-[#8A9199] mb-8 text-center border-b border-[#8A9199]/10 pb-4">
              IT Interno
            </h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-4 text-[#8A9199] opacity-80">
                <X className="text-red-900 shrink-0 w-6 h-6" /> Coste alto
                mensual (nómina, cargas)
              </li>
              <li className="flex items-center gap-4 text-[#8A9199] opacity-80">
                <X className="text-red-900 shrink-0 w-6 h-6" /> Disponibilidad
                limitada (vacaciones, bajas)
              </li>
              <li className="flex items-center gap-4 text-[#8A9199] opacity-80">
                <X className="text-red-900 shrink-0 w-6 h-6" /> Riesgo de no
                contar con especialización en todo
              </li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-10 rounded-3xl bg-gradient-to-br from-[#1F3A5F]/20 to-[#0B1622] border border-[#C0C6CF]/30 shadow-[0_0_40px_rgba(31,58,95,0.4)] relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 opacity-[0.03] scale-150 rotate-12">
              <Logo className="w-64 h-64" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-8 text-center border-b border-[#C0C6CF]/10 pb-4 relative z-10 drop-shadow-sm">
              Falcon IT
            </h3>
            <ul className="space-y-6 relative z-10">
              <li className="flex items-center gap-4 text-[#C0C6CF] font-medium text-lg">
                <Check className="text-[#2F5D8C] shrink-0 w-6 h-6" /> Tarifa
                fija mensual sin sorpresas
              </li>
              <li className="flex items-center gap-4 text-[#C0C6CF] font-medium text-lg">
                <Check className="text-[#2F5D8C] shrink-0 w-6 h-6" /> Soporte
                continuo siempre disponible
              </li>
              <li className="flex items-center gap-4 text-[#C0C6CF] font-medium text-lg">
                <Check className="text-[#2F5D8C] shrink-0 w-6 h-6" /> Equipo
                especializado multidisciplinario
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-xl md:text-2xl font-bold text-[#C0C6CF] font-serif tracking-wide border-t border-[#1F3A5F]/30 pt-8 inline-block drop-shadow-md">
            Externalizar tu IT no es un gasto, es reducir riesgos y costos operativos.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
