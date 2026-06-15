import { calculateFootprint, calculateScore, treesEquivalent } from "@/lib/carbon";

describe("carbon calculations", () => {
  it("calculates a complete footprint", () => {
    const result = calculateFootprint({
      carKm: 100,
      publicTransitKm: 20,
      flightsHours: 0,
      electricityKwh: 200,
      lpgKg: 10,
      diet: "vegetarian",
      shoppingSpend: 100
    });

    expect(result.monthly).toBeGreaterThan(300);
    expect(result.annual).toBeCloseTo(result.monthly * 12, 0);
    expect(result.food).toBe(125);
  });

  it("keeps scores within zero and one hundred", () => {
    expect(calculateScore(0)).toBe(100);
    expect(calculateScore(5000)).toBe(0);
  });

  it("converts saved carbon to tree equivalents", () => {
    expect(treesEquivalent(210)).toBe(10);
    expect(treesEquivalent(-20)).toBe(0);
  });
});
