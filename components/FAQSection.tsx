'use client';

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { faqs } from "@/lib/constants";

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-[#0B1622] border-y border-[#C0C6CF]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white font-serif mb-6">
            Preguntas Frecuentes
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-4">
          {/* Columna Izquierda (Primeras 5) */}
          <div className="space-y-4">
            {faqs.slice(0, 5).map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="border border-[#C0C6CF]/10 rounded-2xl bg-[#0B1622] overflow-hidden hover:border-[#C0C6CF]/20 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                  className={`w-full flex justify-between items-center p-6 text-left transition-colors ${openIndex === idx ? 'bg-[#1F3A5F]/10' : 'hover:bg-[#1F3A5F]/5'}`}
                >
                  <span className="text-lg font-medium text-[#C0C6CF]">
                    {faq.question}
                  </span>
                  {openIndex === idx ? (
                    <Minus className="text-[#8A9199] shrink-0" />
                  ) : (
                    <Plus className="text-[#8A9199] shrink-0" />
                  )}
                </button>
                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-6 text-[#8A9199] overflow-hidden"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Columna Derecha (Siguientes 4) */}
          <div className="space-y-4">
            {faqs.slice(5).map((faq, idx) => {
              const actualIdx = idx + 5;
              return (
                <motion.div
                  key={actualIdx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="border border-[#C0C6CF]/10 rounded-2xl bg-[#0B1622] overflow-hidden hover:border-[#C0C6CF]/20 transition-colors"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === actualIdx ? null : actualIdx)}
                    className={`w-full flex justify-between items-center p-6 text-left transition-colors ${openIndex === actualIdx ? 'bg-[#1F3A5F]/10' : 'hover:bg-[#1F3A5F]/5'}`}
                  >
                    <span className="text-lg font-medium text-[#C0C6CF]">
                      {faq.question}
                    </span>
                    {openIndex === actualIdx ? (
                      <Minus className="text-[#8A9199] shrink-0" />
                    ) : (
                      <Plus className="text-[#8A9199] shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openIndex === actualIdx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 text-[#8A9199] overflow-hidden"
                      >
                        {faq.answer}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
