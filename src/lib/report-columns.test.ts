import {
  REPORT_COLUMNS,
  REPORT_FILTERS,
  getColumnsForEntity,
  getFiltersForEntity,
  getNestedValue,
  buildReportRow,
  type ReportEntityType,
} from "./report-columns";

// ─── Column Definitions ───

describe("REPORT_COLUMNS", () => {
  const entityTypes: ReportEntityType[] = [
    "candidates",
    "firms",
    "positions",
    "processes",
    "interviews",
  ];

  it("defines columns for all 5 entity types", () => {
    for (const entity of entityTypes) {
      expect(REPORT_COLUMNS[entity]).toBeDefined();
      expect(REPORT_COLUMNS[entity].length).toBeGreaterThan(0);
    }
  });

  it("each column has required properties", () => {
    for (const entity of entityTypes) {
      for (const col of REPORT_COLUMNS[entity]) {
        expect(col.key).toBeTruthy();
        expect(col.label).toBeTruthy();
        expect(col.dbField).toBeTruthy();
        expect(col.width).toBeGreaterThan(0);
      }
    }
  });

  it("has no duplicate keys within an entity", () => {
    for (const entity of entityTypes) {
      const keys = REPORT_COLUMNS[entity].map((c) => c.key);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    }
  });

  it("candidates has at least 15 columns", () => {
    expect(REPORT_COLUMNS.candidates.length).toBeGreaterThanOrEqual(15);
  });

  it("firms includes count columns with _count relation", () => {
    const countCols = REPORT_COLUMNS.firms.filter((c) => c.relation === "_count");
    expect(countCols.length).toBeGreaterThanOrEqual(1);
  });

  it("processes has relation columns for candidate, firm, position", () => {
    const relations = new Set(
      REPORT_COLUMNS.processes.filter((c) => c.relation).map((c) => c.relation)
    );
    expect(relations.has("candidate")).toBe(true);
    expect(relations.has("firm")).toBe(true);
    expect(relations.has("position")).toBe(true);
  });
});

// ─── Filter Definitions ───

describe("REPORT_FILTERS", () => {
  it("defines filters for all entity types", () => {
    const entityTypes: ReportEntityType[] = [
      "candidates",
      "firms",
      "positions",
      "processes",
      "interviews",
    ];
    for (const entity of entityTypes) {
      expect(REPORT_FILTERS[entity]).toBeDefined();
      expect(Array.isArray(REPORT_FILTERS[entity])).toBe(true);
    }
  });

  it("each filter has required properties", () => {
    for (const filters of Object.values(REPORT_FILTERS)) {
      for (const filter of filters) {
        expect(filter.key).toBeTruthy();
        expect(filter.label).toBeTruthy();
        expect(["select", "text"]).toContain(filter.type);
      }
    }
  });

  it("select filters have options", () => {
    for (const filters of Object.values(REPORT_FILTERS)) {
      for (const filter of filters) {
        if (filter.type === "select") {
          expect(filter.options).toBeDefined();
          expect(filter.options!.length).toBeGreaterThan(0);
        }
      }
    }
  });
});

// ─── getColumnsForEntity ───

describe("getColumnsForEntity", () => {
  it("returns columns for a valid entity", () => {
    const cols = getColumnsForEntity("candidates");
    expect(cols.length).toBeGreaterThan(0);
    expect(cols[0].key).toBe("firstName");
  });

  it("returns same reference as REPORT_COLUMNS", () => {
    expect(getColumnsForEntity("firms")).toBe(REPORT_COLUMNS.firms);
  });
});

// ─── getFiltersForEntity ───

describe("getFiltersForEntity", () => {
  it("returns filters for a valid entity", () => {
    const filters = getFiltersForEntity("candidates");
    expect(filters.length).toBeGreaterThan(0);
  });

  it("returns same reference as REPORT_FILTERS", () => {
    expect(getFiltersForEntity("positions")).toBe(REPORT_FILTERS.positions);
  });
});

// ─── getNestedValue ───

describe("getNestedValue", () => {
  it("gets a top-level value", () => {
    expect(getNestedValue({ name: "Test" }, "name")).toBe("Test");
  });

  it("gets a nested value", () => {
    const obj = { firm: { name: "Acme" } };
    expect(getNestedValue(obj as Record<string, unknown>, "firm.name")).toBe("Acme");
  });

  it("gets a deeply nested value", () => {
    const obj = { process: { candidate: { firstName: "Ali" } } };
    expect(
      getNestedValue(obj as Record<string, unknown>, "process.candidate.firstName")
    ).toBe("Ali");
  });

  it("returns undefined for missing path", () => {
    expect(getNestedValue({ name: "Test" }, "missing")).toBeUndefined();
  });

  it("returns undefined for null intermediate", () => {
    expect(getNestedValue({ firm: null } as Record<string, unknown>, "firm.name")).toBeUndefined();
  });
});

// ─── buildReportRow ───

describe("buildReportRow", () => {
  it("builds a row for candidates with transforms", () => {
    const record = {
      firstName: "Ayşe",
      lastName: "Yılmaz",
      isRemoteEligible: true,
      status: "active",
      createdAt: new Date("2025-01-15"),
    };
    const columns = REPORT_COLUMNS.candidates.filter((c) =>
      ["firstName", "lastName", "isRemoteEligible", "status", "createdAt"].includes(c.key)
    );
    const row = buildReportRow(record as Record<string, unknown>, columns, "candidates");

    expect(row.firstName).toBe("Ayşe");
    expect(row.lastName).toBe("Yılmaz");
    expect(row.isRemoteEligible).toBe("Evet");
    expect(row.status).toBe("Aktif");
    expect(row.createdAt).toBeTruthy();
  });

  it("builds a row for processes with nested relations", () => {
    const record = {
      candidate: { firstName: "Ali", lastName: "Kaya" },
      firm: { name: "Acme Corp" },
      position: { title: "Developer" },
      stage: "interview",
      assignedTo: { firstName: "Mehmet", lastName: "Demir" },
    };
    const columns = REPORT_COLUMNS.processes.filter((c) =>
      ["candidateName", "firmName", "positionTitle", "stage", "assignedToName"].includes(c.key)
    );
    const row = buildReportRow(record as Record<string, unknown>, columns, "processes");

    expect(row.candidateName).toBe("Ali Kaya");
    expect(row.firmName).toBe("Acme Corp");
    expect(row.positionTitle).toBe("Developer");
    expect(row.stage).toBe("Mülakat");
    expect(row.assignedToName).toBe("Mehmet Demir");
  });

  it("builds a row for interviews with nested process relations", () => {
    const record = {
      scheduledAt: new Date("2025-03-20T14:00:00Z"),
      type: "online",
      isCompleted: false,
      process: {
        candidate: { firstName: "Zeynep", lastName: "Ak" },
        firm: { name: "TechCo" },
        position: { title: "PM" },
      },
    };
    const columns = REPORT_COLUMNS.interviews.filter((c) =>
      ["scheduledAt", "type", "isCompleted", "candidateName", "firmName", "positionTitle"].includes(c.key)
    );
    const row = buildReportRow(record as Record<string, unknown>, columns, "interviews");

    expect(row.candidateName).toBe("Zeynep Ak");
    expect(row.firmName).toBe("TechCo");
    expect(row.positionTitle).toBe("PM");
    expect(row.type).toBe("Online");
    expect(row.isCompleted).toBe("Hayır");
  });

  it("builds a row for firms with count columns", () => {
    const record = {
      name: "Test Firma",
      _count: { positions: 3, processes: 10 },
    };
    const columns = REPORT_COLUMNS.firms.filter((c) =>
      ["name", "positionCount", "processCount"].includes(c.key)
    );
    const row = buildReportRow(record as Record<string, unknown>, columns, "firms");

    expect(row.name).toBe("Test Firma");
    expect(row.positionCount).toBe("3");
    expect(row.processCount).toBe("10");
  });

  it("handles null/undefined values gracefully", () => {
    const record = {
      firstName: "Ali",
      email: null,
      phone: undefined,
    };
    const columns = REPORT_COLUMNS.candidates.filter((c) =>
      ["firstName", "email", "phone"].includes(c.key)
    );
    const row = buildReportRow(record as Record<string, unknown>, columns, "candidates");

    expect(row.firstName).toBe("Ali");
    expect(row.email).toBe("");
    expect(row.phone).toBe("");
  });

  it("handles missing relation objects gracefully", () => {
    const record = {
      candidate: undefined,
      firm: undefined,
      stage: "pool",
    };
    const columns = REPORT_COLUMNS.processes.filter((c) =>
      ["candidateName", "firmName", "stage"].includes(c.key)
    );
    const row = buildReportRow(record as Record<string, unknown>, columns, "processes");

    expect(row.candidateName).toBe("");
    expect(row.firmName).toBe("");
    expect(row.stage).toBe("Havuzda");
  });
});
