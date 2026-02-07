import { createExcelResponse, ExcelColumn } from "./excel";

describe("createExcelResponse", () => {
  const columns: ExcelColumn[] = [
    { header: "Ad", key: "name", width: 20 },
    { header: "E-posta", key: "email", width: 30 },
  ];

  it("returns a NextResponse with xlsx content type", async () => {
    const rows = [{ name: "Alice", email: "alice@test.com" }];
    const response = await createExcelResponse("Test", columns, rows, "test.xlsx");

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
  });

  it("sets Content-Disposition header with filename", async () => {
    const rows = [{ name: "Alice", email: "alice@test.com" }];
    const response = await createExcelResponse("Test", columns, rows, "export_2025.xlsx");

    const disposition = response.headers.get("Content-Disposition");
    expect(disposition).toContain("export_2025.xlsx");
    expect(disposition).toContain("attachment");
  });

  it("returns a non-empty buffer", async () => {
    const rows = [{ name: "Alice", email: "alice@test.com" }];
    const response = await createExcelResponse("Test", columns, rows, "test.xlsx");
    const buffer = await response.arrayBuffer();

    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("handles empty rows", async () => {
    const response = await createExcelResponse("Empty", columns, [], "empty.xlsx");

    expect(response.status).toBe(200);
    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });

  it("handles multiple rows", async () => {
    const rows = [
      { name: "Alice", email: "alice@test.com" },
      { name: "Bob", email: "bob@test.com" },
      { name: "Charlie", email: "charlie@test.com" },
    ];
    const response = await createExcelResponse("Multi", columns, rows, "multi.xlsx");

    expect(response.status).toBe(200);
    const buffer = await response.arrayBuffer();
    expect(buffer.byteLength).toBeGreaterThan(0);
  });
});
