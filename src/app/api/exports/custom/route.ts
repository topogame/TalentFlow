import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse } from "@/lib/utils";
import { createExcelResponse } from "@/lib/excel";
import { customReportSchema } from "@/lib/validations";
import {
  REPORT_COLUMNS,
  buildReportRow,
  type ReportEntityType,
  type ReportColumnDef,
} from "@/lib/report-columns";
import { Prisma } from "@prisma/client";

const MAX_ROWS = 5000;

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz JSON"),
      { status: 400 }
    );
  }

  const parsed = customReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { entityType, columns: selectedKeys, filters, sort, dateFrom, dateTo } = parsed.data;

  // Resolve column definitions
  const allColumns = REPORT_COLUMNS[entityType as ReportEntityType];
  if (!allColumns) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz veri tipi"),
      { status: 400 }
    );
  }

  const selectedColumns: ReportColumnDef[] = [];
  for (const key of selectedKeys) {
    const col = allColumns.find((c) => c.key === key);
    if (col) selectedColumns.push(col);
  }

  if (selectedColumns.length === 0) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "En az bir geçerli sütun seçin"),
      { status: 400 }
    );
  }

  // Determine which relations to include
  const neededRelations = new Set<string>();
  for (const col of selectedColumns) {
    if (col.relation) neededRelations.add(col.relation);
  }

  try {
    const records = await queryEntity(
      entityType as ReportEntityType,
      neededRelations,
      filters || {},
      sort,
      dateFrom,
      dateTo
    );

    // Build Excel columns & rows
    const excelColumns = selectedColumns.map((col) => ({
      header: col.label,
      key: col.key,
      width: col.width,
    }));

    const rows = records.map((record) =>
      buildReportRow(
        record as Record<string, unknown>,
        selectedColumns,
        entityType as ReportEntityType
      )
    );

    const entityLabels: Record<string, string> = {
      candidates: "Adaylar",
      firms: "Firmalar",
      positions: "Pozisyonlar",
      processes: "Süreçler",
      interviews: "Mülakatlar",
    };

    const sheetName = entityLabels[entityType] || entityType;
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `ozel_rapor_${entityType}_${timestamp}.xlsx`;

    return createExcelResponse(sheetName, excelColumns, rows, fileName);
  } catch (err) {
    console.error("Custom report error:", err);
    return NextResponse.json(
      errorResponse("SERVER_ERROR", "Rapor oluşturulurken hata oluştu"),
      { status: 500 }
    );
  }
}

// ─── Query Builder ───

async function queryEntity(
  entityType: ReportEntityType,
  relations: Set<string>,
  filters: Record<string, unknown>,
  sort?: { field: string; order: "asc" | "desc" },
  dateFrom?: Date,
  dateTo?: Date
): Promise<unknown[]> {
  switch (entityType) {
    case "candidates":
      return queryCandidates(relations, filters, sort, dateFrom, dateTo);
    case "firms":
      return queryFirms(relations, filters, sort, dateFrom, dateTo);
    case "positions":
      return queryPositions(relations, filters, sort, dateFrom, dateTo);
    case "processes":
      return queryProcesses(relations, filters, sort, dateFrom, dateTo);
    case "interviews":
      return queryInterviews(relations, filters, sort, dateFrom, dateTo);
    default:
      return [];
  }
}

async function queryCandidates(
  _relations: Set<string>,
  filters: Record<string, unknown>,
  sort?: { field: string; order: "asc" | "desc" },
  dateFrom?: Date,
  dateTo?: Date
) {
  const where: Prisma.CandidateWhereInput = {};

  if (filters.status) where.status = filters.status as Prisma.EnumCandidateStatusFilter;
  if (filters.city) where.city = { contains: filters.city as string, mode: "insensitive" };
  if (filters.currentSector) where.currentSector = { contains: filters.currentSector as string, mode: "insensitive" };

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const orderBy = buildOrderBy(sort, "createdAt");

  return prisma.candidate.findMany({
    where,
    orderBy,
    take: MAX_ROWS,
  });
}

async function queryFirms(
  relations: Set<string>,
  filters: Record<string, unknown>,
  sort?: { field: string; order: "asc" | "desc" },
  dateFrom?: Date,
  dateTo?: Date
) {
  const where: Prisma.FirmWhereInput = {};

  if (filters.status) where.status = filters.status as Prisma.EnumFirmStatusFilter;
  if (filters.city) where.city = { contains: filters.city as string, mode: "insensitive" };
  if (filters.sector) where.sector = { contains: filters.sector as string, mode: "insensitive" };

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const orderBy = buildOrderBy(sort, "createdAt");

  return prisma.firm.findMany({
    where,
    orderBy,
    take: MAX_ROWS,
    include: relations.has("_count")
      ? {
          _count: {
            select: { positions: true, processes: true },
          },
        }
      : undefined,
  });
}

async function queryPositions(
  relations: Set<string>,
  filters: Record<string, unknown>,
  sort?: { field: string; order: "asc" | "desc" },
  dateFrom?: Date,
  dateTo?: Date
) {
  const where: Prisma.PositionWhereInput = {};

  if (filters.status) where.status = filters.status as Prisma.EnumPositionStatusFilter;
  if (filters.priority) where.priority = filters.priority as Prisma.EnumPositionPriorityFilter;
  if (filters.workModel) where.workModel = filters.workModel as Prisma.EnumWorkModelNullableFilter;
  if (filters.city) where.city = { contains: filters.city as string, mode: "insensitive" };

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const orderBy = buildOrderBy(sort, "createdAt");

  const include: Prisma.PositionInclude = {};
  if (relations.has("firm")) include.firm = { select: { name: true } };
  if (relations.has("_count")) include._count = { select: { processes: true } };

  return prisma.position.findMany({
    where,
    orderBy,
    take: MAX_ROWS,
    include: Object.keys(include).length > 0 ? include : undefined,
  });
}

async function queryProcesses(
  relations: Set<string>,
  filters: Record<string, unknown>,
  sort?: { field: string; order: "asc" | "desc" },
  dateFrom?: Date,
  dateTo?: Date
) {
  const where: Prisma.ProcessWhereInput = {};

  if (filters.stage) where.stage = filters.stage as Prisma.EnumProcessStageFilter;

  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const orderBy = buildOrderBy(sort, "createdAt");

  const include: Prisma.ProcessInclude = {};
  if (relations.has("candidate")) include.candidate = { select: { firstName: true, lastName: true } };
  if (relations.has("firm")) include.firm = { select: { name: true } };
  if (relations.has("position")) include.position = { select: { title: true } };
  if (relations.has("assignedTo")) include.assignedTo = { select: { firstName: true, lastName: true } };

  return prisma.process.findMany({
    where,
    orderBy,
    take: MAX_ROWS,
    include: Object.keys(include).length > 0 ? include : undefined,
  });
}

async function queryInterviews(
  relations: Set<string>,
  filters: Record<string, unknown>,
  sort?: { field: string; order: "asc" | "desc" },
  dateFrom?: Date,
  dateTo?: Date
) {
  const where: Prisma.InterviewWhereInput = {};

  if (filters.type) where.type = filters.type as Prisma.EnumInterviewTypeFilter;
  if (filters.isCompleted !== undefined) {
    where.isCompleted = filters.isCompleted === "true" || filters.isCompleted === true;
  }

  if (dateFrom || dateTo) {
    where.scheduledAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const orderBy = buildOrderBy(sort, "scheduledAt");

  const include: Prisma.InterviewInclude = {};
  if (relations.has("process")) {
    include.process = {
      include: {
        candidate: { select: { firstName: true, lastName: true } },
        firm: { select: { name: true } },
        position: { select: { title: true } },
      },
    };
  }

  return prisma.interview.findMany({
    where,
    orderBy,
    take: MAX_ROWS,
    include: Object.keys(include).length > 0 ? include : undefined,
  });
}

// ─── Helpers ───

function buildOrderBy(
  sort: { field: string; order: "asc" | "desc" } | undefined,
  defaultField: string
): Record<string, "asc" | "desc"> {
  if (sort?.field) {
    // Only allow direct fields (no nested)
    if (!sort.field.includes(".")) {
      return { [sort.field]: sort.order };
    }
  }
  return { [defaultField]: "desc" };
}
