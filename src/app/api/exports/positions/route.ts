import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse } from "@/lib/utils";
import { createExcelResponse } from "@/lib/excel";
import { exportQuerySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

const STATUS_LABELS: Record<string, string> = {
  open: "Açık",
  on_hold: "Beklemede",
  closed: "Kapalı",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
  urgent: "Acil",
};

const WORK_MODEL_LABELS: Record<string, string> = {
  office: "Ofis",
  remote: "Uzaktan",
  hybrid: "Hibrit",
};

export async function GET(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = exportQuerySchema.safeParse(searchParams);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Geçersiz parametreler", parsed.error.issues),
      { status: 400 }
    );
  }

  const { dateFrom, dateTo } = parsed.data;
  const where: Prisma.PositionWhereInput = {};
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const positions = await prisma.position.findMany({
    where,
    include: {
      firm: { select: { name: true } },
      _count: { select: { processes: { where: { closedAt: null } } } },
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const columns = [
    { header: "Pozisyon", key: "title", width: 25 },
    { header: "Firma", key: "firmName", width: 25 },
    { header: "Departman", key: "department", width: 20 },
    { header: "Durum", key: "status", width: 15 },
    { header: "Öncelik", key: "priority", width: 12 },
    { header: "Şehir", key: "city", width: 15 },
    { header: "Çalışma Modeli", key: "workModel", width: 15 },
    { header: "Maaş Aralığı", key: "salaryRange", width: 20 },
    { header: "Aktif Süreç", key: "activeProcessCount", width: 12 },
    { header: "Kayıt Tarihi", key: "createdAt", width: 18 },
  ];

  const rows = positions.map((p) => {
    let salaryRange = "";
    if (p.salaryMin || p.salaryMax) {
      const min = p.salaryMin ? Number(p.salaryMin).toLocaleString("tr-TR") : "?";
      const max = p.salaryMax ? Number(p.salaryMax).toLocaleString("tr-TR") : "?";
      salaryRange = `${min} - ${max} ${p.salaryCurrency || ""}`.trim();
    }

    return {
      title: p.title,
      firmName: p.firm.name,
      department: p.department || "",
      status: STATUS_LABELS[p.status] || p.status,
      priority: PRIORITY_LABELS[p.priority] || p.priority,
      city: p.city || "",
      workModel: p.workModel ? WORK_MODEL_LABELS[p.workModel] || p.workModel : "",
      salaryRange,
      activeProcessCount: p._count.processes,
      createdAt: p.createdAt.toLocaleDateString("tr-TR"),
    };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  return createExcelResponse("Pozisyonlar", columns, rows, `pozisyonlar_${timestamp}.xlsx`);
}
