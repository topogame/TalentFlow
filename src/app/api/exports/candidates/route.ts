import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse } from "@/lib/utils";
import { createExcelResponse } from "@/lib/excel";
import { exportQuerySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

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
  const where: Prisma.CandidateWhereInput = { status: "active" };
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const candidates = await prisma.candidate.findMany({
    where,
    include: {
      languages: true,
      notes: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const columns = [
    { header: "Ad", key: "firstName", width: 15 },
    { header: "Soyad", key: "lastName", width: 15 },
    { header: "E-posta", key: "email", width: 25 },
    { header: "Telefon", key: "phone", width: 18 },
    { header: "Unvan", key: "currentTitle", width: 25 },
    { header: "Sektör", key: "currentSector", width: 20 },
    { header: "Deneyim (Yıl)", key: "totalExperienceYears", width: 15 },
    { header: "Şehir", key: "city", width: 15 },
    { header: "Ülke", key: "country", width: 15 },
    { header: "Maaş Beklentisi", key: "salaryExpectation", width: 18 },
    { header: "Para Birimi", key: "salaryCurrency", width: 12 },
    { header: "Diller", key: "languages", width: 30 },
    { header: "Notlar", key: "latestNote", width: 40 },
    { header: "Kayıt Tarihi", key: "createdAt", width: 20 },
  ];

  const rows = candidates.map((c) => ({
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email || "",
    phone: c.phone || "",
    currentTitle: c.currentTitle || "",
    currentSector: c.currentSector || "",
    totalExperienceYears: c.totalExperienceYears ?? "",
    city: c.city || "",
    country: c.country || "",
    salaryExpectation: c.salaryExpectation ? Number(c.salaryExpectation) : "",
    salaryCurrency: c.salaryCurrency || "",
    languages: c.languages.map((l) => `${l.language} (${l.level})`).join(", "),
    latestNote: c.notes[0]?.content || "",
    createdAt: c.createdAt.toLocaleDateString("tr-TR"),
  }));

  const timestamp = new Date().toISOString().slice(0, 10);
  return createExcelResponse("Adaylar", columns, rows, `adaylar_${timestamp}.xlsx`);
}
