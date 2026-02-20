import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/constants";
import { errorResponse } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // Pre-flight: check Vercel Blob token
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      errorResponse("CONFIG_ERROR", "Dosya depolama servisi yapılandırılmamış. BLOB_READ_WRITE_TOKEN eksik."),
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const candidateId = formData.get("candidateId") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Dosya gerekli"),
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Desteklenmeyen dosya formatı. PDF veya DOCX yükleyin."),
        { status: 400 }
      );
    }

    // Validate empty file
    if (file.size === 0) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Dosya boş, lütfen geçerli bir dosya yükleyin."),
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", `Dosya boyutu 10MB'ı aşamaz (yüklenen: ${(file.size / (1024 * 1024)).toFixed(1)} MB)`),
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`documents/${Date.now()}-${file.name}`, file, {
      access: "public",
    });

    // If candidateId provided, create CandidateDocument record
    let documentId: string | undefined;
    if (candidateId) {
      const candidate = await prisma.candidate.findUnique({
        where: { id: candidateId },
        select: { id: true },
      });

      if (!candidate) {
        return NextResponse.json(
          errorResponse("NOT_FOUND", "Aday bulunamadı"),
          { status: 404 }
        );
      }

      const doc = await prisma.candidateDocument.create({
        data: {
          candidateId,
          fileName: file.name,
          fileUrl: blob.url,
          fileType: file.type,
          fileSize: file.size,
          uploadedById: session!.user.id,
        },
      });
      documentId = doc.id;
    }

    return NextResponse.json({
      success: true,
      data: {
        url: blob.url,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        documentId,
      },
    });
  } catch (err) {
    console.error("Document upload error:", err);
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    // Surface specific error types
    if (message.includes("token") || message.includes("unauthorized") || message.includes("BlobAccessError")) {
      return NextResponse.json(
        errorResponse("BLOB_AUTH_ERROR", "Dosya depolama yetkilendirme hatası. Lütfen yönetici ile iletişime geçin."),
        { status: 500 }
      );
    }
    return NextResponse.json(
      errorResponse("SERVER_ERROR", `Dosya yüklenemedi: ${message}`),
      { status: 500 }
    );
  }
}
