import { useState, type FormEvent } from "react";
import { CheckCircle2, FileWarning, ShieldCheck, Trash2 } from "lucide-react";
import {
  FIELD_LABELS,
  getRecommendedPath,
  validateCredentialInput,
  type ForeignCredential,
  type ProfessionField,
  type RecordAvailability,
  type VerificationStatus,
} from "@/lib/veripath-store";

interface Props {
  credentials: ForeignCredential[];
  onAdd: (credential: ForeignCredential) => void;
  onAdvanceStatus: (id: string) => void;
  onRemove: (id: string) => void;
}

const STATUS_META: Record<VerificationStatus, { label: string; className: string }> = {
  verified: { label: "Verified", className: "bg-status-verified-bg text-status-verified" },
  "alternative-review": { label: "Alternative Path Active", className: "bg-status-pending-bg text-status-pending" },
  "evidence-needed": { label: "Bridging Evidence Needed", className: "bg-status-gap-bg text-status-gap" },
};

const RECORD_LABELS: Record<RecordAvailability, string> = {
  complete: "Original paper records available",
  missing: "Paper records lost or inaccessible",
  unrecognized: "Foreign qualification not yet recognized locally",
};

export function CredentialVerificationSection({ credentials, onAdd, onAdvanceStatus, onRemove }: Props) {
  const [title, setTitle] = useState("");
  const [country, setCountry] = useState("");
  const [institution, setInstitution] = useState("");
  const [yearAwarded, setYearAwarded] = useState("2020");
  const [field, setField] = useState<ProfessionField>("electrical");
  const [recordAvailability, setRecordAvailability] = useState<RecordAvailability>("missing");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateCredentialInput({ title, country, institution, yearAwarded });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const rec = getRecommendedPath(recordAvailability);
    onAdd({
      id: `cred-${Date.now()}`,
      title: title.trim(),
      country: country.trim(),
      institution: institution.trim(),
      yearAwarded: Number(yearAwarded),
      field,
      recordAvailability,
      verificationPath: rec.path,
      status: rec.status,
    });
    setTitle("");
    setCountry("");
    setInstitution("");
  }

  return (
    <section id="verify" className="border-b border-border py-14 sm:py-18">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-wider uppercase text-primary">Step 01 · Qualification Recognition</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Verify foreign qualifications — even without original papers
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Log your training or degree. When records are lost or unrecognized, VeriPath assigns an alternative verification path instead of a dead end.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12">
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6 lg:col-span-5">
            <h3 className="text-lg font-semibold text-foreground">Submit a foreign qualification</h3>
            <div className="mt-5 space-y-4">
              <div>
                <label htmlFor="cred-title" className="block text-sm font-medium text-foreground">Qualification title</label>
                <input id="cred-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Diploma in Industrial Electricity" className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="cred-country" className="block text-sm font-medium text-foreground">Issuing country</label>
                  <input id="cred-country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. Jordan" className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label htmlFor="cred-year" className="block text-sm font-medium text-foreground">Year awarded</label>
                  <input id="cred-year" type="number" min={1970} max={2026} value={yearAwarded} onChange={(e) => setYearAwarded(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label htmlFor="cred-inst" className="block text-sm font-medium text-foreground">Institution or trade guild</label>
                <input id="cred-inst" value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Amman Polytechnic" className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label htmlFor="cred-field" className="block text-sm font-medium text-foreground">Field</label>
                <select id="cred-field" value={field} onChange={(e) => setField(e.target.value as ProfessionField)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {(Object.keys(FIELD_LABELS) as ProfessionField[]).map((key) => (
                    <option key={key} value={key}>{FIELD_LABELS[key]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cred-record" className="block text-sm font-medium text-foreground">Paper record status</label>
                <select id="cred-record" value={recordAvailability} onChange={(e) => setRecordAvailability(e.target.value as RecordAvailability)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {(Object.keys(RECORD_LABELS) as RecordAvailability[]).map((key) => (
                    <option key={key} value={key}>{RECORD_LABELS[key]}</option>
                  ))}
                </select>
              </div>
              {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}
              <button type="submit" className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                Match verification pathway
              </button>
            </div>
          </form>

          <div className="space-y-4 lg:col-span-7">
            {credentials.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-surface-subtle p-8 text-center">
                <p className="text-sm text-muted-foreground">No qualifications logged yet. Add one on the left to see your recognition pathway.</p>
              </div>
            ) : (
              credentials.map((cred) => {
                const statusInfo = STATUS_META[cred.status];
                return (
                  <article key={cred.id} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">{cred.title}</h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {cred.institution} · {cred.country} ({cred.yearAwarded})
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${statusInfo.className}`}>
                        {cred.status === "verified" ? <CheckCircle2 className="size-3.5" /> : <FileWarning className="size-3.5" />}
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="mt-4 rounded-lg bg-surface-subtle px-3.5 py-2.5 text-sm">
                      <span className="font-medium text-foreground">Assigned pathway: </span>
                      <span className="text-muted-foreground">{cred.verificationPath}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{FIELD_LABELS[cred.field]}</span>
                      <div className="flex items-center gap-2">
                        {cred.status !== "verified" && (
                          <button type="button" onClick={() => onAdvanceStatus(cred.id)} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary">
                            <ShieldCheck className="size-3.5 text-primary" />
                            Confirm attestation
                          </button>
                        )}
                        <button type="button" onClick={() => onRemove(cred.id)} aria-label={`Remove ${cred.title}`} className="inline-flex items-center rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
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