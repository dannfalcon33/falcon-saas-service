'use client';

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight, Zap, Shield, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import { plans } from "@/lib/constants";
import { Plan } from "@/lib/types";

interface PlansModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlansModal: React.FC<PlansModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();

  const handleSelectPlan = (plan: Plan) => {
    onClose();
    router.push(`/billing?plan=${encodeURIComponent(plan.name)}`);
  };

  const getIcon = (name: string) => {
    if (name.includes("Pymes")) return <Zap className="w-5 h-5 text-blue-400" />;
    if (name.includes("Empresa")) return <Shield className="w-5 h-5 text-emerald-400" />;
    return <Crown className="w-5 h-5 text-amber-400" />;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl bg-[#0B1622] border border-white/10 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative"
          >
            {/* Botón Cerrar */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all z-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 sm:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">Selecciona tu Plan de Soporte</h2>
                <p className="text-[#8A9199] font-medium max-w-2xl mx-auto">
                  Elige el nivel de cobertura que mejor se adapte a tu infraestructura tecnológica. Implementación inmediata.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-300 ${
                      plan.popular 
                        ? "bg-white/5 border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.1)]" 
                        : "bg-black/40 border-white/5 hover:border-white/10"
                    }`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                        Más popular
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                        {getIcon(plan.name)}
                      </div>
                      <h3 className="text-lg font-serif font-bold text-white">{plan.name}</h3>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">${plan.price}</span>
                        <span className="text-[#8A9199] text-xs font-medium">/mes</span>
                      </div>
                      <p className="text-[11px] text-[#8A9199] mt-2 font-medium leading-relaxed italic">
                        {plan.target}
                      </p>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.slice(0, 4).map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-3 text-[11px] text-[#C0C6CF] font-medium">
                          <Check className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group ${
                        plan.popular 
                          ? "bg-white text-black hover:bg-gray-200" 
                          : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                      }`}
                    >
                      Seleccionar <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-bold text-[#8A9199] uppercase tracking-[0.3em]">
                  🔓 Sin contratos obligatorios • Facturación Mensual • Soporte 24/7
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
