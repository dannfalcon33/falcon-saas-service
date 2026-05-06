import type { Metadata } from "next";
import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "Falcon IT | Continuidad Operativa Tecnológica",
  description:
    "Nos encargamos de todo el sistema informático de tu empresa para que operes sin interrupciones, sin necesidad de contratar personal interno.",
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
