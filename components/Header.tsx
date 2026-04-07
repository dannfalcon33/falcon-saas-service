'use client';

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { navLinks } from "@/lib/constants";
import { Logo } from "./Logo";
import { headerButtonClasses, buttonLargeClasses } from "./styles";

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    setIsOpen(false);
    if (href === "#") {
      e.preventDefault();
      if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: "smooth" });
      }
      router.push("/");
      return;
    }

    if (pathname !== "/") {
      // Si no estamos en el home, navegamos al home primero
      // Next handles this naturally if href is #id
    } else {
      // Si estamos en el home, scroll suave
      if (href.startsWith("#")) {
          e.preventDefault();
          const targetId = href.replace("#", "");
          const elem = document.getElementById(targetId);
          if (elem) {
            elem.scrollIntoView({ behavior: "smooth" });
          }
      }
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
      {/* Efecto espejo ultra-brillante cada 4 segundos */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-[100px] h-full bg-linear-to-r from-transparent via-white/60 to-transparent skew-x-[-25deg] animate-shine"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-20">
          <Link
            href="/"
            onClick={(e) => handleNavClick(e as any, "#")}
            className="flex items-center gap-3 group cursor-pointer relative z-50 px-4 py-2"
          >
            <Logo className="w-10 h-10 lg:w-12 lg:h-12 group-hover:scale-105 transition-transform relative z-10" />
            <span className="font-serif text-2xl font-bold tracking-wider text-white group-hover:text-[#C0C6CF] transition-colors relative z-10">
              FALCON IT
            </span>
          </Link>

          <nav className="hidden lg:flex gap-8">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                onClick={(e) => handleNavClick(e as any, link.href)}
                className="text-sm font-medium text-[#8A9199] hover:text-[#C0C6CF] transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#C0C6CF] transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          <div className="hidden lg:block">
            <Link href="/login" className={headerButtonClasses}>
              Accede a tu cuenta
            </Link>
          </div>

          {!isOpen && (
            <button
              className="lg:hidden text-[#8A9199] hover:text-[#C0C6CF] relative z-50 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <Menu className="w-8 h-8" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 top-0 left-0 w-full h-screen bg-[#05070A] z-40 flex flex-col justify-center items-center px-4"
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-4 text-[#8A9199] hover:text-white p-2 transition-colors z-50 flex items-center justify-center cursor-pointer"
            >
              <X className="w-8 h-8" />
            </button>

            <nav className="flex flex-col gap-8 w-full max-w-sm text-center">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  onClick={(e) => handleNavClick(e as any, link.href)}
                  className="block text-2xl font-serif font-bold text-[#E2E8F0] hover:text-[#C0C6CF] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-6">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className={`${buttonLargeClasses} w-full text-base py-4 flex items-center justify-center`}
                >
                  Accede a tu cuenta
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
