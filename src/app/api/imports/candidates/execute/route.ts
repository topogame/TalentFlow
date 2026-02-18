import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse, successResponse } from "@/lib/utils";
import { createCandidateSchema } from "@/lib/validations";
import { createAuditLog } from "@/lib/audit";

const MAX_BATCH_SIZE = 500;

type CandidateImportItem = {
  rowNumber: number;
  data: Record<string, unknown>;
};

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  let body: { candidates: CandidateImportItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      errorResponse("INVALID_JSON", "Geçersiz JSON"),
      { status: 400 }
    );
  }

  if (!Array.isArray(body.candidates) || body.candidates.length === 0) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "En az bir aday verisi gerekli"),
      { status: 400 }
    );
  }

  if (body.candidates.length > MAX_BATCH_SIZE) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", `En fazla ${MAX_BATCH_SIZE} aday gönderilebilir`),
      { status: 400 }
    );
  }

  const results: {
    rowNumber: number;
    status: "success" | "error";
    candidateId?: string;
    error?: string;
  }[] = [];

  // Process each candidate individually within a transaction
  for (const item of body.candidates) {
    try {
      // Re-validate with createCandidateSchema
      const parsed = createCandidateSchema.safeParse(item.data);
      if (!parsed.success) {
        results.push({
          rowNumber: item.rowNumber,
          status: "error",
          error: parsed.error.issues.map((i) => i.message).join(", "),
        });
        continue;
      }

      const { languages, ...candidateFields } = parsed.data;

      // Clean empty strings to null
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(candidateFields)) {
        cleaned[key] = value === "" ? null : value;
      }

      const candidate = await prisma.candidate.create({
        data: {
          ...cleaned,
          createdById: session!.user.id,
          ...(languages && languages.length > 0
            ? { languages: { create: languages } }
            : {}),
        } as Parameters<typeof prisma.candidate.create>[0]["data"],
      });

      results.push({
        rowNumber: item.rowNumber,
        status: "success",
        candidateId: candidate.id,
      });

      // Audit log (fire-and-forget)
      createAuditLog({
        userId: session!.user.id,
        action: "create",
        entityType: "Candidate",
        entityId: candidate.id,
        changes: { after: { source: "excel_import", firstName: candidate.firstName, lastName: candidate.lastName } },
      });
    } catch (err) {
      results.push({
        rowNumber: item.rowNumber,
        status: "error",
        error: err instanceof Error ? err.message : "Bilinmeyen hata",
      });
    }
  }

  const imported = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "error").length;

  return NextResponse.json(
    successResponse({
      imported,
      failed,
      total: results.length,
      results,
    }),
    { status: imported > 0 ? 201 : 400 }
  );
}
