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
  const where: Prisma.FirmWhereInput = {};
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const firms = await prisma.firm.findMany({
    where,
    include: {
      contacts: { where: { isPrimary: true }, take: 1 },
      _count: {
        select: {
          positions: { where: { status: "open" } },
          processes: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const columns = [
    { header: "Firma Adı", key: "name", width: 25 },
    { header: "Sektör", key: "sector", width: 20 },
    { header: "Şirket Büyüklüğü", key: "companySize", width: 18 },
    { header: "Şehir", key: "city", width: 15 },
    { header: "Ülke", key: "country", width: 15 },
    { header: "Website", key: "website", width: 30 },
    { header: "Açık Pozisyon", key: "openPositionCount", width: 15 },
    { header: "Toplam Süreç", key: "totalProcessCount", width: 15 },
    { header: "İletişim Kişisi", key: "primaryContact", width: 25 },
    { header: "İletişim E-posta", key: "contactEmail", width: 25 },
    { header: "İletişim Telefon", key: "contactPhone", width: 18 },
    { header: "Notlar", key: "notes", width: 40 },
    { header: "Kayıt Tarihi", key: "createdAt", width: 18 },
  ];

  const rows = firms.map((f) => {
    const contact = f.contacts[0];
    return {
      name: f.name,
      sector: f.sector || "",
      companySize: f.companySize || "",
      city: f.city || "",
      country: f.country || "",
      website: f.website || "",
      openPositionCount: f._count.positions,
      totalProcessCount: f._count.processes,
      primaryContact: contact?.name || "",
      contactEmail: contact?.email || "",
      contactPhone: contact?.phone || "",
      notes: f.notes || "",
      createdAt: f.createdAt.toLocaleDateString("tr-TR"),
    };
  });

  const timestamp = new Date().toISOString().slice(0, 10);
  return createExcelResponse("Firmalar", columns, rows, `firmalar_${timestamp}.xlsx`);
}
