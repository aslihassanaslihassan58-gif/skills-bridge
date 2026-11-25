import { describe, expect, it } from "vitest";
import {
  evaluateCompetency,
  getRecommendedPath,
  validateCredentialInput,
  validateFundingAmount,
} from "@/lib/veripath-store";

describe("VeriPath recognition, assessment, and funding rules", () => {
  it("assigns an alternative verification path when paper records are missing or unrecognized", () => {
    expect(getRecommendedPath("missing").status).toBe("alternative-review");
    expect(getRecommendedPath("unrecognized").status).toBe("evidence-needed");
    expect(getRecommendedPath("complete").status).toBe("verified");
  });

  it("rejects empty credential fields and out-of-range award years", () => {
    expect(validateCredentialInput({ title: "", country: "Jordan", institution: "Polytechnic", yearAwarded: "2020" })).not.toBeNull();
    expect(validateCredentialInput({ title: "B.Eng", country: "Jordan", institution: "Polytechnic", yearAwarded: "1965" })).not.toBeNull();
    expect(validateCredentialInput({ title: "B.Eng", country: "Jordan", institution: "Polytechnic", yearAwarded: "2020" })).toBeNull();
  });

  it("scores practical scenarios and flags missed skill areas as targeted bridging gaps", () => {
    const perfect = evaluateCompetency("electrical", { e1: 1, e2: 0, e3: 1 }, 6);
    expect(perfect.scorePercent).toBe(100);
    expect(perfect.tier).toBe("Ready for Licensing");
    expect(perfect.gaps).toEqual([]);

    const withGap = evaluateCompetency("electrical", { e1: 1, e2: 0, e3: 0 }, 4);
    expect(withGap.gaps).toEqual(["Host-Country Electrical Code"]);
    expect(withGap.tier).toBe("Targeted Bridging Needed");
  });

  it("enforces positive funding amounts within the module micro-grant cap", () => {
    expect(validateFundingAmount("0", 550)).not.toBeNull();
    expect(validateFundingAmount("-100", 550)).not.toBeNull();
    expect(validateFundingAmount("600", 550)).not.toBeNull();
    expect(validateFundingAmount("500", 550)).toBeNull();
  });
});