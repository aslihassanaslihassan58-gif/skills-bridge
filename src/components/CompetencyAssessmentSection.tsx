import { useState, type FormEvent } from "react";
import { Award, CheckCircle2 } from "lucide-react";
import {
  COMPETENCY_TRACKS,
  FIELD_LABELS,
  evaluateCompetency,
  type AssessmentResult,
  type ProfessionField,
} from "@/lib/veripath-store";

interface Props {
  assessments: Partial<Record<ProfessionField, AssessmentResult>>;
  selectedField: ProfessionField;
  onSelectField: (field: ProfessionField) => void;
  onComplete: (result: AssessmentResult) => void;
}

export function CompetencyAssessmentSection({ assessments, selectedField, onSelectField, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [yearsText, setYearsText] = useState("4");
  const [error, setError] = useState<string | null>(null);

  const questions = COMPETENCY_TRACKS[selectedField];
  const currentResult = assessments[selectedField];

  function handleFieldChange(field: ProfessionField) {
    onSelectField(field);
    setAnswers({});
    setError(null);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const years = Number(yearsText);
    if (!Number.isFinite(years) || years < 0 || years > 50) {
      setError("Enter hands-on experience between 0 and 50 years.");
      return;
    }
    const unanswered = questions.some((q) => answers[q.id] === undefined);
    if (unanswered) {
      setError("Answer all three practical scenarios to calculate your competency score.");
      return;
    }
    setError(null);
    onComplete(evaluateCompetency(selectedField, answers, years));
  }

  return (
    <section id="assess" className="border-b border-border bg-surface-subtle py-14 sm:py-18">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-wider uppercase text-primary">Step 02 · Real-World Competency</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Prove what you can do on the job
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Select your trade or profession to complete a practical scenario check. Your results identify exact local code or licensing gaps so you never repeat training you already master.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Profession tracks">
          {(Object.keys(FIELD_LABELS) as ProfessionField[]).map((field) => {
            const active = field === selectedField;
            return (
              <button key={field} type="button" role="tab" aria-selected={active} onClick={() => handleFieldChange(field)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:bg-secondary"}`}>
                {FIELD_LABELS[field]}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <h3 className="text-lg font-semibold text-foreground">{FIELD_LABELS[selectedField]} — Practical Check</h3>
              <div className="flex items-center gap-2">
                <label htmlFor="years-exp" className="text-sm text-muted-foreground">Hands-on years</label>
                <input id="years-exp" type="number" min={0} max={50} value={yearsText} onChange={(e) => setYearsText(e.target.value)} className="w-20 rounded-md border border-input bg-background px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>

            {questions.map((q, idx) => (
              <fieldset key={q.id} className="space-y-2.5">
                <legend className="text-sm font-medium text-foreground">
                  {idx + 1}. {q.prompt}
                </legend>
                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => {
                    const checked = answers[q.id] === optIdx;
                    return (
                      <label key={opt} className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${checked ? "border-primary bg-surface-tint text-foreground" : "border-border bg-background text-muted-foreground hover:border-primary/40"}`}>
                        <input type="radio" name={q.id} checked={checked} onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))} className="mt-0.5 accent-primary" />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {error && <p role="alert" className="text-sm font-medium text-destructive">{error}</p>}

            <button type="submit" className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              Score practical assessment
            </button>
          </form>

          <aside className="rounded-xl border border-border bg-card p-6 lg:col-span-4">
            <div className="flex items-center gap-2 text-primary">
              <Award className="size-5" />
              <h3 className="text-lg font-semibold text-foreground">Competency Report</h3>
            </div>
            {currentResult ? (
              <div className="mt-5 space-y-5">
                <div>
                  <p className="font-mono text-4xl font-semibold text-foreground">{currentResult.scorePercent}%</p>
                  <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-status-verified-bg px-3 py-1 text-xs font-medium text-status-verified">
                    <CheckCircle2 className="size-3.5" />
                    {currentResult.tier}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Evaluated with {currentResult.yearsExperience} yrs practical field experience on {currentResult.completedAt}.
                </p>
                <div>
                  <p className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Identified bridging gaps</p>
                  {currentResult.gaps.length === 0 ? (
                    <p className="mt-2 text-sm text-status-verified">No core scenario gaps detected. Eligible for direct licensing exam.</p>
                  ) : (
                    <ul className="mt-2 space-y-1.5">
                      {currentResult.gaps.map((gap) => (
                        <li key={gap} className="rounded-md bg-status-gap-bg px-3 py-1.5 text-sm text-status-gap">{gap}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <a href="#fund" className="inline-block text-sm font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                  Match targeted bridging funding →
                </a>
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                Complete the three scenarios for {FIELD_LABELS[selectedField]} to generate your validated competency score and targeted gap list.
              </p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}