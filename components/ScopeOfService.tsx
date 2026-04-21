"use client";

import React from "react";
import { motion } from "framer-motion";
import { features } from "@/lib/constants";
import { FloatingSpheres } from "./FloatingSpheres";

export const ScopeOfService = () => {
  return (
    <section id="solutions" className="py-24 bg-black relative overflow-hidden">
      <FloatingSpheres />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 font-serif">
            Alcance del Servicio
          </h2>
          <p className="text-[#8A9199] text-lg">
            Continuidad operativa en hardware y software diseñado
            específicamente para las necesidades de tu empresa, aportando
            beneficios reales y tangibles.
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 pb-10 rounded-2xl bg-[#05070A] border border-[#C0C6CF]/5 hover:border-[#C0C6CF]/20 transition-all group shadow-md hover:shadow-[0_0_20px_rgba(31,58,95,0.4)]"
            >
              <div className="w-14 h-14 rounded-xl bg-[#0B1622] border border-[#1F3A5F] flex items-center justify-center text-[#C0C6CF] mb-6 group-hover:scale-110 group-hover:bg-[#1F3A5F]/30 transition-all duration-300">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-[#E2E8F0] mb-3 font-serif drop-shadow-sm">
                {feature.title}
              </h3>
              <p className="text-[#8A9199] leading-relaxed text-lg">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
