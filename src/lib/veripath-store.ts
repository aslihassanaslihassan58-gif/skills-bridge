export type ProfessionField = "electrical" | "healthcare" | "civil" | "software";
export type RecordAvailability = "complete" | "missing" | "unrecognized";
export type VerificationStatus = "verified" | "alternative-review" | "evidence-needed";
export type FundingStatus = "submitted" | "approved" | "disbursed";

export interface ForeignCredential {
  id: string;
  title: string;
  country: string;
  institution: string;
  yearAwarded: number;
  field: ProfessionField;
  recordAvailability: RecordAvailability;
  verificationPath: string;
  status: VerificationStatus;
}

export interface CompetencyQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  skillArea: string;
}

export interface AssessmentResult {
  field: ProfessionField;
  yearsExperience: number;
  scorePercent: number;
  tier: "Ready for Licensing" | "Targeted Bridging Needed" | "Foundational Refresher";
  gaps: string[];
  completedAt: string;
}

export interface BridgingModule {
  id: string;
  field: ProfessionField;
  title: string;
  provider: string;
  durationWeeks: number;
  costUsd: number;
  maxGrantUsd: number;
  addressesGap: string;
}

export interface FundingRequest {
  id: string;
  moduleId: string;
  moduleTitle: string;
  requestedUsd: number;
  rationale: string;
  status: FundingStatus;
}

export interface VeriPathState {
  credentials: ForeignCredential[];
  assessments: Partial<Record<ProfessionField, AssessmentResult>>;
  fundingRequests: FundingRequest[];
}

export const FIELD_LABELS: Record<ProfessionField, string> = {
  electrical: "Electrical & Power Trades",
  healthcare: "Nursing & Clinical Care",
  civil: "Civil & Structural Engineering",
  software: "Software & IT Systems",
};

export const COMPETENCY_TRACKS: Record<ProfessionField, CompetencyQuestion[]> = {
  electrical: [
    { id: "e1", prompt: "Before servicing a 400V three-phase distribution panel, what is the first mandatory step?", options: ["Test phase-to-phase voltage", "Isolate, lock-out/tag-out, and verify zero energy", "Wear insulated gloves and disconnect neutral"], correctIndex: 1, skillArea: "Local Electrical Safety & LOTO" },
    { id: "e2", prompt: "A circuit breaker trips repeatedly only when a high-load motor starts. What is the likeliest cause?", options: ["Inrush current exceeding breaker trip curve", "Open ground conductor", "Oversized feeder cable"], correctIndex: 0, skillArea: "Fault Diagnostics & Load Protection" },
    { id: "e3", prompt: "When matching foreign wiring diagrams to host-country code, how should conductor sizing be confirmed?", options: ["Keep original gauge if voltage matches", "Recalculate ampacity against local thermal and derating tables", "Increase every wire by one size"], correctIndex: 1, skillArea: "Host-Country Electrical Code" },
  ],
  healthcare: [
    { id: "h1", prompt: "A post-op patient develops sudden confusion and SpO2 drops to 89%. What is your immediate priority?", options: ["Document in chart and recheck in 15 minutes", "Assess airway, apply oxygen per protocol, and escalate to clinician", "Administer routine oral analgesic"], correctIndex: 1, skillArea: "Acute Triage & Escalation" },
    { id: "h2", prompt: "When a patient's medication order uses a brand name unfamiliar in your host country, what should you do?", options: ["Verify generic active ingredient and dosage with pharmacy before administering", "Substitute the closest local equivalent", "Skip the dose until discharge"], correctIndex: 0, skillArea: "Local Pharmacology & Safe Prescribing" },
    { id: "h3", prompt: "How is informed consent documented when a patient speaks limited host-country language?", options: ["Ask a family member to summarize briefly", "Use a qualified medical interpreter and document comprehension", "Proceed if the procedure is standard"], correctIndex: 1, skillArea: "Clinical Ethics & Patient Documentation" },
  ],
  civil: [
    { id: "c1", prompt: "Soil tests reveal soft clay under a proposed three-story clinic. What design adjustment is required?", options: ["Use standard shallow strip footings", "Evaluate bearing capacity and specify engineered raft or pile foundations", "Increase concrete mix water ratio"], correctIndex: 1, skillArea: "Geotechnical & Foundation Standards" },
    { id: "c2", prompt: "When converting structural calculations from foreign standards to local codes, what must be re-verified?", options: ["Load factors, seismic zones, and safety partial factors", "Only blueprint paper dimensions", "Only steel paint specifications"], correctIndex: 0, skillArea: "Local Structural & Seismic Codes" },
    { id: "c3", prompt: "Fresh concrete arrives on site with slump well above the specified limit. What is the correct action?", options: ["Pour quickly before it sets", "Reject the batch and log non-conformance per QA protocol", "Add dry cement on site"], correctIndex: 1, skillArea: "Site Quality Assurance" },
  ],
  software: [
    { id: "s1", prompt: "A production API shows rising p99 latency under peak traffic. What is the best first diagnostic step?", options: ["Restart all servers immediately", "Inspect traces, slow queries, and resource saturation metrics", "Rewrite the frontend bundle"], correctIndex: 1, skillArea: "Production Observability" },
    { id: "s2", prompt: "How should user passwords be stored in a regulated host-country web service?", options: ["AES-encrypted with a shared key", "Salted adaptive password hash such as Argon2id or bcrypt", "SHA-256 without salt"], correctIndex: 1, skillArea: "Security & Data Protection" },
    { id: "s3", prompt: "Before deploying a schema change on a live transactional table, what practice prevents downtime?", options: ["Run a blocking table rewrite at noon", "Use an expand-and-contract migration with backward-compatible reads", "Drop old columns first"], correctIndex: 1, skillArea: "Safe Release Engineering" },
  ],
};

export const BRIDGING_MODULES: BridgingModule[] = [
  { id: "m-elec-code", field: "electrical", title: "Host-Country Electrical Code & LOTO Exam Prep", provider: "National Trades Institute", durationWeeks: 4, costUsd: 650, maxGrantUsd: 550, addressesGap: "Host-Country Electrical Code" },
  { id: "m-health-pharm", field: "healthcare", title: "Clinical Pharmacology & Nursing Registration Bridge", provider: "Allied Health Board", durationWeeks: 6, costUsd: 920, maxGrantUsd: 800, addressesGap: "Local Pharmacology & Safe Prescribing" },
  { id: "m-civil-seismic", field: "civil", title: "Regional Structural & Seismic Code Certification", provider: "Civic Engineers Council", durationWeeks: 5, costUsd: 780, maxGrantUsd: 650, addressesGap: "Local Structural & Seismic Codes" },
  { id: "m-soft-sec", field: "software", title: "Cloud Security & Regulated Systems Audit Credential", provider: "Open Tech Guild", durationWeeks: 3, costUsd: 480, maxGrantUsd: 420, addressesGap: "Security & Data Protection" },
];

export function getRecommendedPath(availability: RecordAvailability): { path: string; status: VerificationStatus } {
  if (availability === "complete") return { path: "Direct Institutional Registry Check", status: "verified" };
  if (availability === "missing") return { path: "Sworn Affidavit + Employer/Peer Attestation + Practical Challenge", status: "alternative-review" };
  return { path: "Competency Equivalence Review + Targeted Bridging Exam", status: "evidence-needed" };
}

export function validateCredentialInput(input: { title: string; country: string; institution: string; yearAwarded: string }): string | null {
  if (!input.title.trim()) return "Enter the qualification title.";
  if (!input.country.trim()) return "Enter the country where it was issued.";
  if (!input.institution.trim()) return "Enter the issuing institution or guild.";
  const year = Number(input.yearAwarded);
  if (!Number.isInteger(year) || year < 1970 || year > 2026) return "Enter a valid year between 1970 and 2026.";
  return null;
}

export function evaluateCompetency(field: ProfessionField, answers: Record<string, number>, yearsExperience: number): AssessmentResult {
  const questions = COMPETENCY_TRACKS[field];
  let correct = 0;
  const gaps: string[] = [];
  for (const q of questions) {
    if (answers[q.id] === q.correctIndex) correct += 1;
    else gaps.push(q.skillArea);
  }
  const scenarioScore = Math.round((correct / questions.length) * 85);
  const expBonus = Math.min(15, Math.max(0, Math.round(yearsExperience * 2.5)));
  const scorePercent = Math.min(100, scenarioScore + expBonus);
  const tier = scorePercent >= 80 && gaps.length === 0 ? "Ready for Licensing" : scorePercent >= 55 ? "Targeted Bridging Needed" : "Foundational Refresher";
  return { field, yearsExperience, scorePercent, tier, gaps, completedAt: new Date().toISOString().slice(0, 10) };
}

export function validateFundingAmount(amountStr: string, maxGrantUsd: number): string | null {
  const amount = Number(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) return "Enter a funding amount greater than $0.";
  if (amount > maxGrantUsd) return `Requested amount cannot exceed the $${maxGrantUsd} micro-grant cap.`;
  return null;
}

const STORAGE_KEY = "veripath_state_v1";

export const STARTER_STATE: VeriPathState = {
  credentials: [
    { id: "cred-1", title: "Diploma in Industrial Electrical Systems", country: "Sudan", institution: "Khartoum Technical College", yearAwarded: 2018, field: "electrical", recordAvailability: "missing", verificationPath: "Sworn Affidavit + Employer/Peer Attestation + Practical Challenge", status: "alternative-review" },
    { id: "cred-2", title: "B.Sc. Nursing & Midwifery", country: "Syria", institution: "University of Aleppo", yearAwarded: 2019, field: "healthcare", recordAvailability: "unrecognized", verificationPath: "Competency Equivalence Review + Targeted Bridging Exam", status: "evidence-needed" },
    { id: "cred-3", title: "B.Eng. Civil Engineering", country: "Ukraine", institution: "Kyiv National University of Construction", yearAwarded: 2020, field: "civil", recordAvailability: "complete", verificationPath: "Direct Institutional Registry Check", status: "verified" },
  ],
  assessments: {},
  fundingRequests: [
    { id: "fund-1", moduleId: "m-elec-code", moduleTitle: "Host-Country Electrical Code & LOTO Exam Prep", requestedUsd: 500, rationale: "Paper diploma lost during relocation; practical assessment confirmed strong diagnostics, only local code exam needed.", status: "approved" },
  ],
};

export function loadVeriPathState(): VeriPathState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return STARTER_STATE;
    const parsed = JSON.parse(raw) as Partial<VeriPathState>;
    return {
      credentials: Array.isArray(parsed.credentials) ? parsed.credentials : [],
      assessments: parsed.assessments && typeof parsed.assessments === "object" ? parsed.assessments : {},
      fundingRequests: Array.isArray(parsed.fundingRequests) ? parsed.fundingRequests : [],
    };
  } catch {
    return STARTER_STATE;
  }
}

export function saveVeriPathState(state: VeriPathState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable in restricted browsing contexts.
  }
}