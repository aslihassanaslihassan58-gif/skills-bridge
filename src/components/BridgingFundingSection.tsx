import { useState, type FormEvent } from "react";
import { Banknote, CheckCircle2, Clock, Trash2 } from "lucide-react";
import {
  BRIDGING_MODULES,
  FIELD_LABELS,
  validateFundingAmount,
  type AssessmentResult,
  type BridgingModule,
  type FundingRequest,
  type FundingStatus,
  type ProfessionField,
} from "@/lib/veripath-store";

interface Props {
  selectedField: ProfessionField;
  assessments: Partial<Record<ProfessionField, AssessmentResult>>;
  requests: FundingRequest[];
  onSubmitRequest: (request: FundingRequest) => void;
  onRemoveRequest: (id: string) => void;
}

const FUNDING_STATUS_META: Record<FundingStatus, { label: string; className: string }> = {
  submitted: { label: "Under Review", className: "bg-status-pending-bg text-status-pending" },
  approved: { label: "Grant Approved", className: "bg-status-verified-bg text-status-verified" },
  disbursed: { label: "Disbursed to Provider", className: "bg-status-verified-bg text-status-verified" },
};

export function BridgingFundingSection({ selectedField, assessments, requests, onSubmitRequest, onRemoveRequest }: Props) {
  const defaultModule = BRIDGING_MODULES.find((m) => m.field === selectedField) ?? BRIDGING_MODULES[0];
  const [selectedModuleId, setSelectedModuleId] = useState<string>(defaultModule?.id ?? "");
  const [amountText, setAmountText] = useState<string>(String(defaultModule?.maxGrantUsd ?? 500));
  const [rationale, setRationale] = useState("");
  const [error, setError] = useState<string | null>(null);

  const activeModule: BridgingModule | undefined =
    BRIDGING_MODULES.find((m) => m.id === selectedModuleId) ?? BRIDGING_MODULES[0];

  function handleSelectModule(mod: BridgingModule) {
    setSelectedModuleId(mod.id);
    setAmountText(String(mod.maxGrantUsd));
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activeModule) return;
    const amountErr = validateFundingAmount(amountText, activeModule.maxGrantUsd);
    if (amountErr) {
      setError(amountErr);
      return;
    }
    if (!rationale.trim()) {
      setError("Briefly explain how this bridging step unlocks your local licensing or employment.");
      return;
    }
    setError(null);
    onSubmitRequest({
      id: `fund-${Date.now()}`,
      moduleId: activeModule.id,
      moduleTitle: activeModule.title,
      requestedUsd: Math.round(Number(amountText)),
      rationale: rationale.trim(),
      status: "submitted",
    });
    setRationale("");
  }

  const fieldAssessment = assessments[selectedField];

  return (
    <section id="fund" className="py-14 sm:py-18">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-wider uppercase text-primary">Step 03 · Bridging & Re-Certification Funding</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Fund only the exact step you need
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Instead of paying for a full degree again, request targeted micro-grants for local code prep, licensing exams, or short clinical/technical bridges.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {BRIDGING_MODULES.map((mod) => {
            const isSelected = activeModule?.id === mod.id;
            const matchesGap = fieldAssessment?.gaps.includes(mod.addressesGap) ?? false;
            return (
              <button key={mod.id} type="button" onClick={() => handleSelectModule(mod)} className={`rounded-xl border p-5 text-left transition-colors ${isSelected ? "border-primary bg-surface-tint" : "border-border bg-card hover:border-primary/40"}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{FIELD_LABELS[mod.field]}</span>
                  {matchesGap && (
                    <span className="rounded-full bg-status-gap-bg px-2.5 py-0.5 text-xs font-medium text-status-gap">
                      Matches assessed gap
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-base font-semibold text-foreground">{mod.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{mod.provider} · {mod.durationWeeks} weeks</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                  <span className="text-muted-foreground">Fee: <strong className="font-mono text-foreground">${mod.costUsd}</strong></span>
                  <span className="text-primary font-medium">Grant up to <strong className="font-mono">${mod.maxGrantUsd}</strong></span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 lg:col-span-5">
            <div className="flex items-center gap-2 text-primary">
              <Banknote className="size-5" />
              <h3 className="text-lg font-semibold text-foreground">Request bridging micro-grant</h3>
            </div>
            {activeModule && (
              <p className="mt-2 text-sm text-muted-foreground">
                Selected: <span className="font-medium text-foreground">{activeModule.title}</span> (max grant ${activeModule.maxGrantUsd})
              </p>
            )}
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="grant-amount" className="block text-sm font-medium text-foreground">Requested amount (USD)</label>
                <input id="grant-amount" type="number" min={1} max={activeModule?.maxGrantUsd ?? 1000} value={amountText} onChange={(e) => setAmountText(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label htmlFor="grant-rationale" className="block text-sm font-medium text-foreground">Why this step is needed</label>
                <textarea id="grant-rationale" rows={3} value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="e.g. Verified 5 years of clinical work; only need local pharmacology exam fee covered." className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
              <button type="submit" className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Submit funding request
              </button>
            </div>
          </form>

          <div className="space-y-4 lg:col-span-7">
            <h3 className="text-lg font-semibold text-foreground">Your funding requests</h3>
            {requests.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-subtle p-8 text-center">
                <p className="text-sm text-muted-foreground">No bridging requests submitted yet. Select a module above to apply for targeted funding.</p>
              </div>
            ) : (
              requests.map((req) => {
                const meta = FUNDING_STATUS_META[req.status];
                return (
                  <article key={req.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-foreground">{req.moduleTitle}</h4>
                        <p className="mt-1 font-mono text-sm font-medium text-primary">${req.requestedUsd} requested</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}>
                          {req.status === "submitted" ? <Clock className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                          {meta.label}
                        </span>
                        <button type="button" onClick={() => onRemoveRequest(req.id)} aria-label={`Remove request for ${req.moduleTitle}`} className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{req.rationale}</p>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}