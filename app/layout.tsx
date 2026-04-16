import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  metadataBase: new URL("https://falconit.xyz"),
  title: {
    default: "Falcon IT | Continuidad Operativa Tecnológica para Empresas",
    template: "%s | Falcon IT",
  },
  description:
    "Proveedor B2B de continuidad operativa tecnológica por suscripción. Externaliza tu departamento IT con monitoreo, mantenimiento preventivo, incidencias, visitas técnicas y reportes de servicio.",
  keywords: [
    "continuidad operativa tecnológica",
    "departamento IT externo",
    "IT por suscripción",
    "mantenimiento preventivo empresarial",
    "gestión de incidencias IT",
    "visitas técnicas empresariales",
    "soporte de infraestructura hardware y software",
    "continuidad de negocio",
    "outsourcing IT B2B",
    "Falcon IT",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Falcon IT | Continuidad Operativa Tecnológica para Empresas",
    description:
      "Operamos tu IT externo para mantener producción y ejecución sin interrupciones: monitoreo, mantenimiento, incidencias, visitas y reportes.",
    url: "https://falconit.xyz",
    siteName: "Falcon IT",
    locale: "es_VE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Falcon IT | Continuidad Operativa Tecnológica para Empresas",
    description:
      "Continuidad operativa tecnológica B2B por suscripción para empresas que no pueden detener su operación.",
  },
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
