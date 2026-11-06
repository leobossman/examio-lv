import { describe, expect, it } from "vitest";
import { computeGap } from "@/lib/profile";

describe("computeGap", () => {
  it("below 40% aiming for budget place (80%) is a 50-point maximum-intensity gap", () => {
    const g = computeGap("lt40", "budget");
    expect(g.gap).toBe(50);
    expect(g.intensity).toBe("maksimālā");
  });
  it("80-100% aiming to just pass has no gap", () => {
    expect(computeGap("80-100", "pass").gap).toBe(0);
  });
});
