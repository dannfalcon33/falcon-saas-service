'use client';

import React from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { plans } from "@/lib/constants";
import { BinanceIcon, TetherIcon, BitcoinIcon, ZinliIcon, PagoMovilIcon, BdvIcon, BancamigaIcon } from "./PaymentIcons";
import { Logo } from "./Logo";
import { FloatingSpheres } from "./FloatingSpheres";
import { Plan } from "@/lib/types";

export const PlansSection = () => {
  const router = useRouter();

  const handleSelectPlan = (plan: Plan) => {
    router.push(`/billing?plan=${encodeURIComponent(plan.name)}`);
  };

  return (
    <section id="plans" className="py-24 bg-black relative overflow-hidden">
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
            Planes de Servicio
          </h2>
          <p className="text-[#C0C6CF] text-xl mb-8 font-medium">
            Elige el nivel de soporte según la criticidad de tu operación
          </p>
          <div className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 rounded-full mb-8 text-[#8A9199] shadow-inner">
            Desde <span className="text-[#C0C6CF] font-bold">$60/mes</span> vs
            +$800 de un técnico interno
          </div>
          <p className="text-[#C0C6CF] text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#C0C6CF] animate-pulse"></span>{" "}
            Cupos limitados por zona
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative p-8 rounded-4xl border ${
                plan.popular 
                  ? "bg-black border-white/20 shadow-[0_0_30px_rgba(192,198,207,0.1)] scale-100 lg:scale-[1.05] z-10" 
                  : "bg-white/5 border-white/5"
              } flex flex-col`}
            >
              {/* Contenedor interno para efectos de desbordamiento (Brillo y Marca de agua) */}
              {plan.popular && (
                <div className="absolute inset-0 rounded-4xl overflow-hidden pointer-events-none">
                  {/* Brillo para plan destacado */}
                  <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 left-0 w-[150px] h-full bg-linear-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-shine"></div>
                  </div>

                  {/* Marca de agua logo para plan destacado */}
                  <div className="absolute -top-10 -right-10 opacity-[0.05] scale-150 rotate-12">
                    <Logo className="w-64 h-64" />
                  </div>
                </div>
              )}

              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-white text-black text-xs font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] z-50 whitespace-nowrap">
                  Recomendado
                </div>
              )}
              <h3 className="text-2xl font-serif font-bold text-[#E2E8F0] mb-2 relative z-10">
                {plan.name}
              </h3>
              <p className="text-[#8A9199] text-sm font-medium mb-4 relative z-10">
                {plan.target}
              </p>
              <p className="text-[#8A9199] text-sm mb-6 h-10 italic relative z-10">
                {plan.description}
              </p>

              <div className="mb-8 border-b border-white/5 pb-8 relative z-10">
                <span className="text-5xl font-bold text-white font-serif">
                  ${plan.price}
                </span>
                <span className="text-[#8A9199]"> /mes</span>
              </div>

              <ul className="space-y-4 mb-10 flex-1 relative z-10">
                {plan.features.map((feature: string, fIndex: number) => (
                  <li
                    key={fIndex}
                    className="flex items-start gap-3 text-[#C0C6CF]"
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#2F5D8C] shrink-0" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-4 rounded-full font-bold transition-all duration-300 relative z-10 ${
                  plan.popular 
                    ? "bg-white text-black hover:bg-gray-200" 
                    : "bg-white/5 border border-white/10 text-[#C0C6CF] hover:bg-white/10"
                }`}
              >
                Seleccionar Plan
              </button>

              <div className="mt-4 space-y-2 text-center text-xs text-[#8A9199]/70 font-medium relative z-10">
                <p>⚡ Implementación en 48h</p>
                <p>🔓 Sin contratos largos</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 mb-16 text-center"
        >
          <Link
            href="/planes"
            className="inline-flex items-center gap-2 text-[#8A9199] hover:text-white transition-colors text-sm font-bold uppercase tracking-wider group"
          >
            <span>Ver tabla comparativa detallada</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Payment Methods Carousel */}
        <div className="mt-8 mb-4 max-w-full overflow-hidden relative pb-8">
          <div className="text-center mb-8">
            <p className="text-[#8A9199] text-sm uppercase tracking-widest font-bold">Métodos de Pago Aceptados</p>
          </div>
          {/* Gradient Shadows */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none mt-12"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none mt-12"></div>

          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, containerIndex) => (
              <div key={containerIndex} className="flex gap-4 sm:gap-6 pr-4 sm:pr-6">
                {/* We double the elements inside each half to ensure they fill wide screens */}
                {[...Array(2)].map((_, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[#E2E8F0] shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                      <BinanceIcon className="w-6 h-6 text-[#F3BA2F]" />
                      <span className="font-bold whitespace-nowrap text-sm sm:text-base">Binance Pay</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[#E2E8F0] shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                      <ZinliIcon className="w-6 h-6 text-[#8D4AF8]" />
                      <span className="font-bold whitespace-nowrap text-sm sm:text-base">Zinli</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[#E2E8F0] shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                      <PagoMovilIcon className="w-6 h-6 text-[#00A859]" />
                      <span className="font-bold whitespace-nowrap text-sm sm:text-base">Pago Móvil</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[#E2E8F0] shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                      <BdvIcon className="w-6 h-6 text-[#0A417A]" />
                      <span className="font-bold whitespace-nowrap text-sm sm:text-base">Banco de Venezuela</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[#E2E8F0] shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                      <BancamigaIcon className="w-6 h-6 text-[#008236]" />
                      <span className="font-bold whitespace-nowrap text-sm sm:text-base">Bancamiga</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[#E2E8F0] shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                      <TetherIcon className="w-6 h-6 text-[#26A17B]" />
                      <span className="font-bold whitespace-nowrap text-sm sm:text-base">USDT</span>
                    </div>
                    <div className="flex items-center gap-3 px-5 sm:px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[#E2E8F0] shadow-[0_0_15px_rgba(255,255,255,0.03)] hover:bg-white/10 hover:border-white/20 transition-all cursor-default">
                      <BitcoinIcon className="w-6 h-6 text-[#F7931A]" />
                      <span className="font-bold whitespace-nowrap text-sm sm:text-base">Bitcoin</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
