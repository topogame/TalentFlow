import ExcelJS from "exceljs";
import { NextResponse } from "next/server";

export type ExcelColumn = {
  header: string;
  key: string;
  width?: number;
};

export type TemplateColumn = ExcelColumn & {
  required?: boolean;
  validValues?: string[];
  description?: string;
};

export type ParsedRow = {
  rowNumber: number;
  data: Record<string, unknown>;
  rawValues: Record<string, string>;
};

export type ExcelParseResult = {
  rows: ParsedRow[];
  headers: string[];
  totalRows: number;
  warnings: string[];
};

const MAX_IMPORT_ROWS = 5000;

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

// ─── Template Generation ───

export async function createTemplateResponse(
  sheetName: string,
  columns: TemplateColumn[],
  fileName: string,
  sampleRows?: Record<string, unknown>[],
  instructions?: string[][]
): Promise<NextResponse> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "TalentFlow";
  workbook.created = new Date();

  // Data sheet
  const sheet = workbook.addWorksheet(sheetName);
  sheet.columns = columns.map((col) => ({
    header: col.required ? `${col.header} *` : col.header,
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

  // Add data validation dropdowns for enum columns
  for (let colIdx = 0; colIdx < columns.length; colIdx++) {
    const col = columns[colIdx];
    if (col.validValues && col.validValues.length > 0) {
      const colLetter = String.fromCharCode(65 + colIdx);
      for (let rowIdx = 2; rowIdx <= 5002; rowIdx++) {
        sheet.getCell(`${colLetter}${rowIdx}`).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${col.validValues.join(",")}"`],
        };
      }
    }
  }

  // Add sample rows
  if (sampleRows) {
    for (const row of sampleRows) {
      const addedRow = sheet.addRow(row);
      addedRow.font = { italic: true, color: { argb: "FF9CA3AF" } };
    }
  }

  // Instructions sheet
  if (instructions && instructions.length > 0) {
    const instrSheet = workbook.addWorksheet("Talimatlar");
    instrSheet.columns = [
      { header: "Alan", key: "field", width: 25 },
      { header: "Açıklama", key: "description", width: 50 },
      { header: "Zorunlu", key: "required", width: 12 },
      { header: "Kabul Edilen Değerler", key: "values", width: 40 },
    ];

    const instrHeader = instrSheet.getRow(1);
    instrHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
    instrHeader.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" },
    };

    for (const row of instructions) {
      instrSheet.addRow(row);
    }
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

// ─── Excel Parsing ───

function cellToString(cell: ExcelJS.CellValue): string {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) {
    return cell.toISOString();
  }
  if (typeof cell === "object") {
    const obj = cell as unknown as Record<string, unknown>;
    if ("text" in obj) return String(obj.text).trim();
    if ("result" in obj) return String(obj.result).trim();
    return String(cell).trim();
  }
  return String(cell).trim();
}

function coerceValue(raw: string): unknown {
  if (raw === "") return undefined;

  // Boolean
  const lower = raw.toLowerCase();
  if (lower === "true" || lower === "evet") return true;
  if (lower === "false" || lower === "hayır" || lower === "hayir") return false;

  // Number (only if pure numeric)
  if (/^-?\d+(\.\d+)?$/.test(raw)) {
    const num = Number(raw);
    if (!isNaN(num)) return num;
  }

  return raw;
}

// ─── CSV Parsing ───

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === "," || ch === ";") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
}

export function parseCSVBuffer(
  buffer: Buffer | ArrayBuffer,
  expectedHeaders?: string[]
): ExcelParseResult {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  let text: string;

  // Try UTF-8 first, then fallback
  const decoder = new TextDecoder("utf-8");
  text = decoder.decode(bytes);

  // Remove BOM if present
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");

  if (lines.length === 0) {
    return { rows: [], headers: [], totalRows: 0, warnings: ["CSV dosyası boş."] };
  }

  const warnings: string[] = [];

  // Extract headers from first line
  const headerCells = parseCSVLine(lines[0]);
  const headers = headerCells.map((h) => h.replace(/\s*\*\s*$/, "").trim()).filter(Boolean);

  if (headers.length === 0) {
    return { rows: [], headers: [], totalRows: 0, warnings: ["Başlık satırı boş."] };
  }

  // Validate expected headers
  if (expectedHeaders) {
    const missing = expectedHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      warnings.push(`Eksik sütunlar: ${missing.join(", ")}`);
    }
  }

  // Parse data rows
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length && rows.length < MAX_IMPORT_ROWS; i++) {
    const cells = parseCSVLine(lines[i]);
    const data: Record<string, unknown> = {};
    const rawValues: Record<string, string> = {};
    let hasAnyValue = false;

    for (let j = 0; j < headers.length && j < cells.length; j++) {
      const header = headers[j];
      const raw = cells[j];

      if (raw !== "") {
        hasAnyValue = true;
        rawValues[header] = raw;
        // Basic coercion
        const lower = raw.toLowerCase();
        if (lower === "true" || lower === "evet") data[header] = true;
        else if (lower === "false" || lower === "hayır" || lower === "hayir") data[header] = false;
        else if (/^-?\d+(\.\d+)?$/.test(raw)) data[header] = Number(raw);
        else data[header] = raw;
      }
    }

    if (hasAnyValue) {
      rows.push({ rowNumber: i + 1, data, rawValues });
    }
  }

  if (lines.length - 1 > MAX_IMPORT_ROWS) {
    warnings.push(`Dosyada ${lines.length - 1} satır var, en fazla ${MAX_IMPORT_ROWS} satır işlenebilir.`);
  }

  return { rows, headers, totalRows: rows.length, warnings };
}

export async function parseExcelBuffer(
  buffer: Buffer | ArrayBuffer,
  expectedHeaders?: string[]
): Promise<ExcelParseResult> {
  const workbook = new ExcelJS.Workbook();
  const arrayBuffer = buffer instanceof ArrayBuffer ? buffer : buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  await workbook.xlsx.load(arrayBuffer as ArrayBuffer);

  const sheet = workbook.worksheets[0];
  if (!sheet) {
    return { rows: [], headers: [], totalRows: 0, warnings: ["Dosyada çalışma sayfası bulunamadı."] };
  }

  const warnings: string[] = [];

  // Extract headers from row 1
  const headerRowData = sheet.getRow(1);
  const headers: string[] = [];
  const headerMap: Record<number, string> = {};

  headerRowData.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const header = cellToString(cell.value).replace(/\s*\*\s*$/, "").trim();
    headers.push(header);
    headerMap[colNumber] = header;
  });

  if (headers.length === 0) {
    return { rows: [], headers: [], totalRows: 0, warnings: ["Başlık satırı boş."] };
  }

  // Validate expected headers
  if (expectedHeaders) {
    const missing = expectedHeaders.filter((h) => !headers.includes(h));
    if (missing.length > 0) {
      warnings.push(`Eksik sütunlar: ${missing.join(", ")}`);
    }
  }

  // Parse data rows
  const rows: ParsedRow[] = [];
  let totalDataRows = 0;

  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    totalDataRows++;

    if (rows.length >= MAX_IMPORT_ROWS) {
      return;
    }

    const rawValues: Record<string, string> = {};
    const data: Record<string, unknown> = {};
    let hasAnyValue = false;

    row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
      const header = headerMap[colNumber];
      if (!header) return;

      const raw = cellToString(cell.value);
      if (raw !== "") {
        hasAnyValue = true;
        rawValues[header] = raw;
        data[header] = coerceValue(raw);
      }
    });

    // Skip completely empty rows
    if (hasAnyValue) {
      rows.push({ rowNumber, data, rawValues });
    }
  });

  if (totalDataRows > MAX_IMPORT_ROWS) {
    warnings.push(`Dosyada ${totalDataRows} satır var, en fazla ${MAX_IMPORT_ROWS} satır işlenebilir.`);
  }

  return { rows, headers, totalRows: rows.length, warnings };
}
