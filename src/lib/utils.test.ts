import { describe, it, expect } from "vitest";
import { cn, successResponse, errorResponse, paginationMeta } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("px-2", false && "py-1")).toBe("px-2");
  });

  it("resolves tailwind conflicts", () => {
    const result = cn("px-2", "px-4");
    expect(result).toBe("px-4");
  });

  it("handles empty input", () => {
    expect(cn()).toBe("");
  });
});

describe("successResponse", () => {
  it("returns success structure", () => {
    const result = successResponse({ id: "1", name: "Test" });
    expect(result).toEqual({
      success: true,
      data: { id: "1", name: "Test" },
      error: null,
    });
  });

  it("includes pagination when provided", () => {
    const pagination = { page: 1, limit: 20, total: 100, totalPages: 5 };
    const result = successResponse([], { pagination });
    expect(result.pagination).toEqual(pagination);
  });

  it("includes warnings when provided", () => {
    const warnings = [{ code: "WARN_1", message: "Something" }];
    const result = successResponse(null, { warnings });
    expect(result.warnings).toEqual(warnings);
  });

  it("omits pagination and warnings when not provided", () => {
    const result = successResponse("data");
    expect(result.pagination).toBeUndefined();
    expect(result.warnings).toBeUndefined();
  });
});

describe("errorResponse", () => {
  it("returns error structure", () => {
    const result = errorResponse("NOT_FOUND", "Resource not found");
    expect(result).toEqual({
      success: false,
      data: null,
      error: { code: "NOT_FOUND", message: "Resource not found" },
    });
  });

  it("includes details when provided", () => {
    const details = [{ field: "email", message: "Required" }];
    const result = errorResponse("VALIDATION", "Validation failed", details);
    expect(result.error?.details).toEqual(details);
  });

  it("omits details when not provided", () => {
    const result = errorResponse("ERROR", "Msg");
    expect(result.error?.details).toBeUndefined();
  });
});

describe("paginationMeta", () => {
  it("calculates totalPages correctly", () => {
    expect(paginationMeta(1, 20, 100)).toEqual({
      page: 1,
      limit: 20,
      total: 100,
      totalPages: 5,
    });
  });

  it("handles non-exact division", () => {
    expect(paginationMeta(1, 20, 45)).toEqual({
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
    });
  });

  it("handles zero total", () => {
    expect(paginationMeta(1, 20, 0)).toEqual({
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    });
  });

  it("handles single page", () => {
    expect(paginationMeta(1, 20, 15)).toEqual({
      page: 1,
      limit: 20,
      total: 15,
      totalPages: 1,
    });
  });
});
