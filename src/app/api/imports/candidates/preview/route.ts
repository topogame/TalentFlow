import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/utils";
import { parseExcelBuffer } from "@/lib/excel";
import { importCandidateRowSchema } from "@/lib/validations";
import {
  mapExcelRowToCandidate,
  cleanCandidateData,
  EXPECTED_HEADERS,
  ImportRowResult,
} from "@/lib/import-helpers";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  // Parse FormData
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      errorResponse("INVALID_REQUEST", "FormData bekleniyor"),
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Dosya gerekli"),
      { status: 400 }
    );
  }

  // Validate file type
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".xlsx")) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Sadece .xlsx dosyaları desteklenir"),
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Dosya boyutu en fazla 5MB olabilir"),
      { status: 400 }
    );
  }

  // Parse Excel
  const buffer = await file.arrayBuffer();
  const parseResult = await parseExcelBuffer(buffer, EXPECTED_HEADERS);

  if (parseResult.rows.length === 0) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Dosyada veri satırı bulunamadı"),
      { status: 400 }
    );
  }

  // Validate each row
  const rowResults: ImportRowResult[] = [];

  for (const parsedRow of parseResult.rows) {
    const mapped = mapExcelRowToCandidate(parsedRow.data);
    const cleaned = cleanCandidateData(mapped);

    const validation = importCandidateRowSchema.safeParse(cleaned);

    const result: ImportRowResult = {
      rowNumber: parsedRow.rowNumber,
      status: "valid",
      data: cleaned,
      errors: [],
      warnings: [],
      duplicates: [],
    };

    if (!validation.success) {
      result.status = "error";
      result.errors = validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
    }

    rowResults.push(result);
  }

  // Batch duplicate detection for valid rows
  const validRows = rowResults.filter((r) => r.status === "valid");

  if (validRows.length > 0) {
    // Collect values for batch queries
    const emails = validRows
      .map((r) => r.data?.email as string | undefined)
      .filter((e): e is string => !!e && e.trim() !== "");

    const phones = validRows
      .map((r) => r.data?.phone as string | undefined)
      .filter((p): p is string => !!p && p.trim() !== "");

    const linkedinUrls = validRows
      .map((r) => r.data?.linkedinUrl as string | undefined)
      .filter((l): l is string => !!l && l.trim() !== "");

    // Batch query: emails
    const emailMatches =
      emails.length > 0
        ? await prisma.candidate.findMany({
            where: { email: { in: emails, mode: "insensitive" } },
            select: { id: true, firstName: true, lastName: true, email: true },
          })
        : [];

    // Batch query: phones
    const phoneMatches =
      phones.length > 0
        ? await prisma.candidate.findMany({
            where: {
              OR: phones.map((p) => ({
                phone: { contains: p.replace(/\D/g, "") },
              })),
            },
            select: { id: true, firstName: true, lastName: true, phone: true },
          })
        : [];

    // Batch query: LinkedIn URLs
    const linkedinMatches =
      linkedinUrls.length > 0
        ? await prisma.candidate.findMany({
            where: { linkedinUrl: { in: linkedinUrls, mode: "insensitive" } },
            select: { id: true, firstName: true, lastName: true, linkedinUrl: true },
          })
        : [];

    // Map duplicates back to rows
    for (const row of validRows) {
      const rowEmail = (row.data?.email as string)?.toLowerCase();
      const rowPhone = (row.data?.phone as string)?.replace(/\D/g, "");
      const rowLinkedin = (row.data?.linkedinUrl as string)?.toLowerCase();

      // Check LinkedIn
      if (rowLinkedin) {
        for (const match of linkedinMatches) {
          if (match.linkedinUrl?.toLowerCase() === rowLinkedin) {
            row.duplicates.push({
              candidateId: match.id,
              name: `${match.firstName} ${match.lastName}`,
              matchType: "linkedin",
              confidence: "exact",
            });
          }
        }
      }

      // Check email
      if (rowEmail && row.duplicates.length === 0) {
        for (const match of emailMatches) {
          if (match.email?.toLowerCase() === rowEmail) {
            row.duplicates.push({
              candidateId: match.id,
              name: `${match.firstName} ${match.lastName}`,
              matchType: "email",
              confidence: "exact",
            });
          }
        }
      }

      // Check phone
      if (rowPhone && row.duplicates.length === 0) {
        for (const match of phoneMatches) {
          if (match.phone?.replace(/\D/g, "").includes(rowPhone)) {
            row.duplicates.push({
              candidateId: match.id,
              name: `${match.firstName} ${match.lastName}`,
              matchType: "phone",
              confidence: "exact",
            });
          }
        }
      }

      // Mark as warning if duplicates found
      if (row.duplicates.length > 0) {
        row.status = "warning";
      }
    }
  }

  const validCount = rowResults.filter((r) => r.status === "valid").length;
  const warningCount = rowResults.filter((r) => r.status === "warning").length;
  const errorCount = rowResults.filter((r) => r.status === "error").length;

  return NextResponse.json(
    successResponse({
      totalRows: rowResults.length,
      validCount,
      warningCount,
      errorCount,
      rows: rowResults,
      parseWarnings: parseResult.warnings,
    })
  );
}
