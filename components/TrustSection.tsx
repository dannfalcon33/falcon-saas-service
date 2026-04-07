'use client';

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { stats } from "@/lib/constants";
import { FloatingSpheres } from "./FloatingSpheres";

const AnimatedStat: React.FC<{ stat: { value: string; label: string }, delay: number }> = ({ stat, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      // Extraer número incluso si contiene comas miles
      const match = stat.value.match(/^([^0-9]*)([0-9.,]+)([^0-9]*)$/);
      const targetNumber = match ? parseFloat(match[2].replace(/,/g, "")) : 0;
      
      let startTime: number;
      const duration = 2000;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCurrentValue(targetNumber * easeOutQuart);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      const animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    }
  }, [isInView, stat.value]);

  const match = stat.value.match(/^([^0-9]*)([0-9.,]+)([^0-9]*)$/);
  const prefix = match ? match[1] : "";
  const suffix = match ? match[3] : "";
  const isDecimal = match && match[2].includes(".");

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="py-4 md:py-0"
    >
      <h3 className="text-4xl lg:text-5xl font-bold text-[#C0C6CF] mb-2 font-serif drop-shadow-[0_0_8px_rgba(192,198,207,0.2)]">
        {prefix}
        {isDecimal 
          ? currentValue.toFixed(1) 
          : Math.floor(currentValue).toLocaleString("en-US")}
        {suffix}
      </h3>
      <p className="text-sm uppercase tracking-widest text-[#8A9199] font-medium">
        {stat.label}
      </p>
    </motion.div>
  );
};

export const TrustSection = () => {
  return (
    <section className="py-12 border-y border-white/5 bg-black relative overflow-hidden">
      <FloatingSpheres />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#C0C6CF]/10">
          {stats.map((stat, idx) => (
            <AnimatedStat key={idx} stat={stat} delay={idx * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
};
