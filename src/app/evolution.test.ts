import { forceTruthFlip, growOnce, recurse, shrinkOnce, treeDepth } from "./evolution";

describe("evolution invariants", () => {
  it("builds recursive statements with expected depth", () => {
    expect(treeDepth(recurse(0))).toBe(1);
    expect(treeDepth(recurse(1))).toBe(2);
    expect(treeDepth(recurse(4))).toBe(5);
  });

  it("growOnce never decreases depth", () => {
    const base = recurse(4);
    const next = growOnce(base);
    expect(treeDepth(next)).toBeGreaterThanOrEqual(treeDepth(base));
  });

  it("shrinkOnce never increases depth", () => {
    const base = recurse(5);
    const next = shrinkOnce(base);
    expect(treeDepth(next)).toBeLessThanOrEqual(treeDepth(base));
  });

  it("forceTruthFlip always returns a valid statement tree", () => {
    const base = recurse(5);
    const next = forceTruthFlip(base);
    expect(treeDepth(next)).toBeGreaterThan(0);
    expect(typeof next.value).toBe("boolean");
  });
});
