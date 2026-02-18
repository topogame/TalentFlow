import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { successResponse, errorResponse } from "@/lib/utils";
import { createInterviewSchema } from "@/lib/validations";
import { createMeeting, buildInterviewInviteEmail, type MeetingProvider } from "@/lib/meeting";
import { sendEmail } from "@/lib/email";

type RouteParams = { params: Promise<{ id: string }> };

const interviewSelect = {
  id: true,
  scheduledAt: true,
  durationMinutes: true,
  type: true,
  meetingLink: true,
  meetingProvider: true,
  meetingId: true,
  location: true,
  clientParticipants: true,
  notes: true,
  resultNotes: true,
  isCompleted: true,
  createdAt: true,
  createdBy: {
    select: { firstName: true, lastName: true },
  },
} as const;

// GET /api/processes/:id/interviews
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const proc = await prisma.process.findUnique({ where: { id }, select: { id: true } });
  if (!proc) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Süreç bulunamadı"), { status: 404 });
  }

  const interviews = await prisma.interview.findMany({
    where: { processId: id },
    orderBy: { scheduledAt: "asc" },
    select: interviewSelect,
  });

  return NextResponse.json(successResponse(interviews));
}

// POST /api/processes/:id/interviews
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const proc = await prisma.process.findUnique({
    where: { id },
    select: {
      id: true,
      closedAt: true,
      candidateId: true,
      candidate: { select: { firstName: true, lastName: true, email: true } },
      position: { select: { title: true } },
      firm: { select: { name: true } },
    },
  });
  if (!proc) {
    return NextResponse.json(errorResponse("NOT_FOUND", "Süreç bulunamadı"), { status: 404 });
  }
  if (proc.closedAt) {
    return NextResponse.json(
      errorResponse("PROCESS_CLOSED", "Kapatılmış süreç için mülakat planlanamaz"),
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(errorResponse("INVALID_JSON", "Geçersiz JSON"), { status: 400 });
  }

  const parsed = createInterviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Doğrulama hatası", parsed.error.issues),
      { status: 400 }
    );
  }

  // Clean empty strings to null
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parsed.data)) {
    cleaned[key] = value === "" ? null : value;
  }

  let meetingLink = (cleaned.meetingLink as string) || null;
  let meetingProvider: MeetingProvider | null = (parsed.data.meetingProvider as MeetingProvider) || null;
  let meetingId: string | null = null;

  // Auto-create meeting if provider is selected
  if (meetingProvider && parsed.data.type === "online") {
    const topic = `Mülakat: ${proc.candidate.firstName} ${proc.candidate.lastName} - ${proc.position.title} (${proc.firm.name})`;

    const result = await createMeeting(meetingProvider, {
      topic,
      startTime: parsed.data.scheduledAt,
      durationMinutes: parsed.data.durationMinutes,
    });

    if (result.success) {
      meetingLink = result.data.joinUrl;
      meetingId = result.data.meetingId;
    } else {
      return NextResponse.json(
        errorResponse("MEETING_CREATE_FAILED", result.error),
        { status: 502 }
      );
    }
  } else {
    meetingProvider = null;
  }

  const interview = await prisma.interview.create({
    data: {
      processId: id,
      scheduledAt: parsed.data.scheduledAt,
      durationMinutes: parsed.data.durationMinutes,
      type: parsed.data.type,
      meetingLink,
      meetingProvider,
      meetingId,
      location: (cleaned.location as string) || null,
      clientParticipants: (cleaned.clientParticipants as string) || null,
      notes: (cleaned.notes as string) || null,
      createdById: session!.user.id,
    },
    select: interviewSelect,
  });

  // Send invite email if requested
  if (parsed.data.sendInviteEmail && proc.candidate.email) {
    const interviewDate = parsed.data.scheduledAt.toLocaleDateString("tr-TR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const emailBody = buildInterviewInviteEmail({
      candidateName: `${proc.candidate.firstName} ${proc.candidate.lastName}`,
      firmName: proc.firm.name,
      position: proc.position.title,
      interviewDate,
      durationMinutes: parsed.data.durationMinutes,
      meetingLink: meetingLink || undefined,
      interviewType: parsed.data.type,
    });

    const subject = `Mülakat Daveti: ${proc.position.title} - ${proc.firm.name}`;

    const emailResult = await sendEmail({
      to: proc.candidate.email,
      subject,
      body: emailBody,
    });

    await prisma.emailLog.create({
      data: {
        candidateId: proc.candidateId,
        processId: id,
        toEmail: proc.candidate.email,
        subject,
        body: emailBody,
        sentById: session!.user.id,
        status: emailResult.success ? "sent" : "failed",
        errorMessage: emailResult.success ? null : emailResult.error,
      },
    });
  }

  return NextResponse.json(successResponse(interview), { status: 201 });
}
