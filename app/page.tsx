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

export default function Home() {
  return (
    <>
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
