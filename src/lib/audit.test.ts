import { computeChanges } from "./audit";

describe("computeChanges", () => {
  it("returns null when no fields changed", () => {
    const before = { name: "Alice", email: "alice@test.com" };
    const after = { name: "Alice", email: "alice@test.com" };
    expect(computeChanges(before, after)).toBeNull();
  });

  it("detects changed fields", () => {
    const before = { name: "Alice", email: "alice@test.com" };
    const after = { name: "Bob", email: "alice@test.com" };
    const result = computeChanges(before, after);
    expect(result).toEqual({
      before: { name: "Alice" },
      after: { name: "Bob" },
    });
  });

  it("detects multiple changed fields", () => {
    const before = { name: "Alice", city: "Istanbul", sector: "IT" };
    const after = { name: "Bob", city: "Ankara", sector: "IT" };
    const result = computeChanges(before, after);
    expect(result).toEqual({
      before: { name: "Alice", city: "Istanbul" },
      after: { name: "Bob", city: "Ankara" },
    });
  });

  it("excludes default fields (updatedAt, createdAt, passwordHash, id)", () => {
    const before = { id: "1", name: "Alice", updatedAt: "2025-01-01", createdAt: "2025-01-01", passwordHash: "old" };
    const after = { id: "2", name: "Alice", updatedAt: "2025-06-01", createdAt: "2025-06-01", passwordHash: "new" };
    expect(computeChanges(before, after)).toBeNull();
  });

  it("uses custom exclude fields", () => {
    const before = { name: "Alice", secret: "old" };
    const after = { name: "Bob", secret: "new" };
    const result = computeChanges(before, after, ["secret"]);
    expect(result).toEqual({
      before: { name: "Alice" },
      after: { name: "Bob" },
    });
  });

  it("handles null values in before", () => {
    const before = { name: null, city: "Istanbul" };
    const after = { name: "Alice", city: "Istanbul" };
    const result = computeChanges(before, after);
    expect(result).toEqual({
      before: { name: null },
      after: { name: "Alice" },
    });
  });

  it("handles null values in after", () => {
    const before = { name: "Alice", city: "Istanbul" };
    const after = { name: null, city: "Istanbul" };
    const result = computeChanges(before, after);
    expect(result).toEqual({
      before: { name: "Alice" },
      after: { name: null },
    });
  });

  it("handles undefined values in before (new field added)", () => {
    const before = { name: "Alice" };
    const after = { name: "Alice", city: "Ankara" };
    const result = computeChanges(before, after);
    expect(result).toEqual({
      before: { city: undefined },
      after: { city: "Ankara" },
    });
  });

  it("handles nested object changes via JSON comparison", () => {
    const before = { data: { a: 1, b: 2 } };
    const after = { data: { a: 1, b: 3 } };
    const result = computeChanges(before, after);
    expect(result).toEqual({
      before: { data: { a: 1, b: 2 } },
      after: { data: { a: 1, b: 3 } },
    });
  });

  it("treats identical nested objects as unchanged", () => {
    const before = { data: { a: 1, b: 2 } };
    const after = { data: { a: 1, b: 2 } };
    expect(computeChanges(before, after)).toBeNull();
  });
});
