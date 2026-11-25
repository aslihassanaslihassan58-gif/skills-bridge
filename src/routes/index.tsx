import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import heroImage from "@/assets/hero-skilled-professional.jpg";
import { CredentialVerificationSection } from "@/components/CredentialVerificationSection";
import { CompetencyAssessmentSection } from "@/components/CompetencyAssessmentSection";
import { BridgingFundingSection } from "@/components/BridgingFundingSection";
import {
  STARTER_STATE,
  loadVeriPathState,
  saveVeriPathState,
  type AssessmentResult,
  type ForeignCredential,
  type FundingRequest,
  type ProfessionField,
  type VeriPathState,
} from "@/lib/veripath-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VeriPath — Credential Recognition & Skills Validation" },
      {
        name: "description",
        content:
          "Verify foreign qualifications, assess real-world competencies, and fund targeted bridging or re-certification steps when paper records are missing or unrecognized.",
      },
      { property: "og:title", content: "VeriPath — Credential Recognition & Skills Validation" },
      {
        property: "og:description",
        content:
          "Practical ways to verify foreign qualifications, validate hands-on skills, and fund targeted bridging steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [state, setState] = useState<VeriPathState>(STARTER_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [selectedField, setSelectedField] = useState<ProfessionField>("electrical");

  useEffect(() => {
    setState(loadVeriPathState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveVeriPathState(state);
  }, [state, hydrated]);

  function handleAddCredential(cred: ForeignCredential) {
    setState((prev) => ({ ...prev, credentials: [cred, ...prev.credentials] }));
  }

  function handleAdvanceCredential(id: string) {
    setState((prev) => ({
      ...prev,
      credentials: prev.credentials.map((c) => (c.id === id ? { ...c, status: "verified" } : c)),
    }));
  }

  function handleRemoveCredential(id: string) {
    setState((prev) => ({
      ...prev,
      credentials: prev.credentials.filter((c) => c.id !== id),
    }));
  }

  function handleCompleteAssessment(result: AssessmentResult) {
    setState((prev) => ({
      ...prev,
      assessments: { ...prev.assessments, [result.field]: result },
    }));
  }

  function handleSubmitFunding(request: FundingRequest) {
    setState((prev) => ({ ...prev, fundingRequests: [request, ...prev.fundingRequests] }));
  }

  function handleRemoveFunding(id: string) {
    setState((prev) => ({
      ...prev,
      fundingRequests: prev.fundingRequests.filter((r) => r.id !== id),
    }));
  }

  const verifiedCount = state.credentials.filter((c) => c.status === "verified").length;
  const assessedCount = Object.keys(state.assessments).length;
  const totalFundingUsd = state.fundingRequests.reduce((sum, r) => sum + r.requestedUsd, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Electrical engineer reviewing blueprints and diagnostic equipment in a workshop"
          width={1600}
          height={912}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="hero-scrim absolute inset-0" aria-hidden="true" />

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pb-28">
          <nav className="flex flex-wrap items-center justify-between gap-4">
            <a href="/" className="font-display text-xl font-semibold tracking-tight text-hero-ink">
              VeriPath
            </a>
            <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-hero-muted">
              <a href="#verify" className="transition-colors hover:text-hero-ink">Verify</a>
              <a href="#assess" className="transition-colors hover:text-hero-ink">Assess</a>
              <a href="#fund" className="transition-colors hover:text-hero-ink">Funding</a>
            </div>
          </nav>

          <div className="mt-16 max-w-2xl sm:mt-24">
            <p className="font-mono text-xs tracking-widest uppercase text-accent">
              SDGs 4 &amp; 8 · Credential Recognition &amp; Skills Validation
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.05] tracking-tight text-hero-ink sm:text-6xl lg:text-7xl">
              Your skills are real. Even when papers aren&apos;t.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-hero-muted sm:text-lg">
              Verify foreign qualifications through alternative pathways, prove real-world competencies, and fund only the bridging step you need to practice again.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#verify" className="hero-cta inline-flex items-center rounded-md px-5 py-3 text-sm font-semibold transition-colors">
                Verify a qualification
              </a>
              <a href="#assess" className="hero-cta-secondary inline-flex items-center rounded-md px-5 py-3 text-sm font-medium transition-colors">
                Take competency check
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-1 divide-y divide-border px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          <div className="py-5 sm:pr-6">
            <p className="font-mono text-xs uppercase text-muted-foreground">Qualifications Logged</p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">
              {state.credentials.length} <span className="font-sans text-sm font-normal text-muted-foreground">({verifiedCount} verified)</span>
            </p>
          </div>
          <div className="py-5 sm:px-6">
            <p className="font-mono text-xs uppercase text-muted-foreground">Competencies Assessed</p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">
              {assessedCount} <span className="font-sans text-sm font-normal text-muted-foreground">of 4 tracks completed</span>
            </p>
          </div>
          <div className="py-5 sm:pl-6">
            <p className="font-mono text-xs uppercase text-muted-foreground">Bridging Grants Requested</p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">
              ${totalFundingUsd} <span className="font-sans text-sm font-normal text-muted-foreground">across {state.fundingRequests.length} step{state.fundingRequests.length === 1 ? "" : "s"}</span>
            </p>
          </div>
        </div>
      </div>

      <main>
        <CredentialVerificationSection
          credentials={state.credentials}
          onAdd={handleAddCredential}
          onAdvanceStatus={handleAdvanceCredential}
          onRemove={handleRemoveCredential}
        />
        <CompetencyAssessmentSection
          assessments={state.assessments}
          selectedField={selectedField}
          onSelectField={setSelectedField}
          onComplete={handleCompleteAssessment}
        />
        <BridgingFundingSection
          selectedField={selectedField}
          assessments={state.assessments}
          requests={state.fundingRequests}
          onSubmitRequest={handleSubmitFunding}
          onRemoveRequest={handleRemoveFunding}
        />
      </main>

      <footer className="border-t border-border bg-surface-subtle py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 text-sm text-muted-foreground sm:px-8">
          <p className="font-display font-medium text-foreground">VeriPath</p>
          <p>Advancing SDG 4 (Quality Education) &amp; SDG 8 (Decent Work) · Records saved in this browser.</p>
        </div>
      </footer>
    </div>
  );
}
