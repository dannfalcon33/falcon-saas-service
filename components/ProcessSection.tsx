'use client';

import React from "react";
import { motion } from "framer-motion";
import { processSteps } from "@/lib/constants";

export const ProcessSection = () => {
  return (
    <section className="py-24 bg-[#05070A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#FFFFFF] font-serif">
            Así funciona Falcon IT
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {/* Línea conectora rediseñada más brillante */}
          <div className="hidden md:block absolute top-[52px] left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-[#C0C6CF]/50 to-transparent z-0"></div>

          {processSteps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Círculo activo brillante con hover y números grandes */}
              <div className="w-28 h-28 rounded-full bg-linear-to-b from-[#0B1622] to-[#1F3A5F]/40 border-2 border-[#8A9199]/30 flex items-center justify-center mb-6 group-hover:border-[#C0C6CF] group-hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(31,58,95,0.6)] group-hover:shadow-[0_0_30px_rgba(192,198,207,0.4)]">
                <span className="text-4xl font-serif font-extrabold text-[#C0C6CF] group-hover:text-white transition-colors drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                  {step.number}
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#E2E8F0] mb-3">
                {step.title}
              </h3>
              <p className="text-[#8A9199] text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
