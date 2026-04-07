import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.13-1.47-.13-.08-.26-.17-.38-.26v5.48c.01 1.17-.2 2.35-.66 3.43-.82 2.04-2.6 3.77-4.75 4.39-2.03.58-4.3.39-6.17-.58-2.13-1.1-3.77-3.26-4.07-5.7-.36-3 1.23-6.02 3.96-7.19a6.002 6.002 0 0 1 5.9.56V.02z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="bg-[#050505] text-[#8A9199] py-12 border-t border-[#1F3A5F]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Logo className="w-8 h-8 opacity-80" />
              <span className="font-serif text-xl font-bold text-[#E2E8F0] tracking-wider">
                FALCON IT
              </span>
            </div>
            <p className="text-sm max-w-sm">
              Protegemos y optimizamos la infraestructura tecnológica de tu
              empresa para que puedas enfocarte en tu negocio.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/planes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C0C6CF] transition-colors"
                >
                  Detalle de Planes
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C0C6CF] transition-colors"
                >
                  Detalles de Servicios
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>yoshuasoto54@gmail.com</li>
              <li>+58 (422) 033-1995</li>
              <li className="flex gap-4 mt-4">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  <LinkedinIcon className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                  aria-label="YouTube"
                >
                  <YoutubeIcon className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-white transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="w-5 h-5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-[#1F3A5F]/10 text-sm flex flex-col md:flex-row justify-between items-center opacity-70">
          <p>© 2026 Falcon IT. Todos los derechos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              href="/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
