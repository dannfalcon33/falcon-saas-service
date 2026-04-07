'use client';

import React from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { buttonLargeClasses } from "./styles";
import { FloatingSpheres } from "./FloatingSpheres";

export const FinalCTA = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-black border-t border-white/5">
      <FloatingSpheres />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-[#0B1622]/40 backdrop-blur-md p-12 md:p-16 rounded-[3rem] border border-[#1F3A5F]/30 shadow-[0_0_50px_rgba(31,58,95,0.2)]"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif leading-tight">
            Deja de apagar incendios IT. <br className="hidden md:block" />
            <span className="text-[#C0C6CF]">
              Empieza a crecer con tranquilidad.
            </span>
          </h2>
          <p className="text-[#8A9199] text-xl mb-10 max-w-2xl mx-auto font-medium">
            Agenda tu diagnóstico gratuito y detecta riesgos antes de que afecten tu negocio.
          </p>
          <a
            href="https://wa.me/584220331995?text=Quiero%20agendar%20una%20visita%20de%20diagnostico"
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonLargeClasses} mx-auto`}
          >
            Agendar Evaluación Gratuita <ArrowRight className="w-5 h-5" />
          </a>
          <p className="mt-6 text-sm text-[#8A9199] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Sin
            compromiso. Sin tarjeta de crédito.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
