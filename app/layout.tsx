import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "Falcon IT | Soporte Tecnico Especializado para Empresas",
  description: "Protegemos y optimizamos la infraestructura tecnológica de tu empresa para que puedas enfocarte en tu negocio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth">
      <body className="h-full bg-black">
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
