import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { TrustSection } from "@/components/TrustSection";
import { ProblemSolution } from "@/components/ProblemSolution";
import { ScopeOfService } from "@/components/ScopeOfService";
import { ProcessSection } from "@/components/ProcessSection";
import { ComparisonSection } from "@/components/ComparisonSection";
import { PlansSection } from "@/components/PlansSection";
import { UseCasesSection } from "@/components/UseCasesSection";
import { FAQSection } from "@/components/FAQSection";
import { FinalCTA } from "@/components/FinalCTA";

export const metadata: Metadata = {
  title: "Continuidad Operativa Tecnológica por Suscripción",
  description:
    "Falcon IT ayuda a empresas a sostener su operación con IT externo por suscripción: monitoreo, mantenimiento preventivo, incidencias, visitas técnicas y reportes.",
};

export default function Home() {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Falcon IT",
    url: "https://falconit.xyz",
    description:
      "Proveedor B2B de continuidad operativa tecnológica por suscripción para empresas.",
    areaServed: "VE",
    knowsAbout: [
      "Continuidad operativa tecnológica",
      "Mantenimiento preventivo empresarial",
      "Gestión de incidencias IT",
      "Servicios IT por suscripción",
      "Departamento IT externo",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <Hero />
      <TrustSection />
      <ProblemSolution />
      <ScopeOfService />
      <ProcessSection />
      <ComparisonSection />
      <PlansSection />
      <UseCasesSection />
      <FAQSection />
      <FinalCTA />
    </>
  );
}
