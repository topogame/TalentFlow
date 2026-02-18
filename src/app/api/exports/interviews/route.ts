import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { errorResponse } from "@/lib/utils";
import { createExcelResponse } from "@/lib/excel";
import { exportQuerySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import { INTERVIEW_TYPE_LABELS } from "@/lib/constants";

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
  const where: Prisma.InterviewWhereInput = {};
  if (dateFrom || dateTo) {
    where.scheduledAt = {
      ...(dateFrom && { gte: dateFrom }),
      ...(dateTo && { lte: dateTo }),
    };
  }

  const interviews = await prisma.interview.findMany({
    where,
    include: {
      process: {
        include: {
          candidate: { select: { firstName: true, lastName: true } },
          firm: { select: { name: true } },
          position: { select: { title: true } },
        },
      },
    },
    orderBy: { scheduledAt: "desc" },
    take: 5000,
  });

  const columns = [
    { header: "Tarih", key: "date", width: 15 },
    { header: "Saat", key: "time", width: 10 },
    { header: "Süre (dk)", key: "durationMinutes", width: 12 },
    { header: "Tür", key: "type", width: 15 },
    { header: "Aday", key: "candidateName", width: 25 },
    { header: "Firma", key: "firmName", width: 25 },
    { header: "Pozisyon", key: "positionTitle", width: 25 },
    { header: "Konum", key: "location", width: 25 },
    { header: "Toplantı Linki", key: "meetingLink", width: 30 },
    { header: "Katılımcılar", key: "clientParticipants", width: 25 },
    { header: "Tamamlandı", key: "isCompleted", width: 12 },
    { header: "Notlar", key: "notes", width: 40 },
    { header: "Sonuç Notu", key: "resultNotes", width: 40 },
  ];

  const rows = interviews.map((i) => ({
    date: i.scheduledAt.toLocaleDateString("tr-TR"),
    time: i.scheduledAt.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    durationMinutes: i.durationMinutes,
    type: INTERVIEW_TYPE_LABELS[i.type] || i.type,
    candidateName: `${i.process.candidate.firstName} ${i.process.candidate.lastName}`,
    firmName: i.process.firm.name,
    positionTitle: i.process.position.title,
    location: i.location || "",
    meetingLink: i.meetingLink || "",
    clientParticipants: i.clientParticipants || "",
    isCompleted: i.isCompleted ? "Evet" : "Hayır",
    notes: i.notes || "",
    resultNotes: i.resultNotes || "",
  }));

  const timestamp = new Date().toISOString().slice(0, 10);
  return createExcelResponse("Mülakatlar", columns, rows, `mulakatlar_${timestamp}.xlsx`);
}
