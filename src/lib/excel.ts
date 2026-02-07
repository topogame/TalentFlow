import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export type ExcelColumn = {
  header: string;
  key: string;
  width?: number;
};

export async function createExcelResponse(
  sheetName: string,
  columns: ExcelColumn[],
  rows: Record<string, unknown>[],
  fileName: string
): Promise<NextResponse> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TalentFlow";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 20,
  }));

  // Style header row
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  };

  for (const row of rows) {
    sheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer as ArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
