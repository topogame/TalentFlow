import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { cvParseRequestSchema } from "@/lib/validations";
import { parseCVFromPDF, parseCVFromText } from "@/lib/ai";
import { extractTextFromDocx } from "@/lib/docx-parser";
import { errorResponse } from "@/lib/utils";

const PDF_TYPE = "application/pdf";
const DOCX_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export async function POST(request: NextRequest) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = cvParseRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        errorResponse("VALIDATION_ERROR", "Geçersiz istek: fileUrl ve fileType alanları gerekli"),
        { status: 400 }
      );
    }

    const { fileUrl, fileType } = parsed.data;

    // Fetch the file from Blob URL
    const fileRes = await fetch(fileUrl);
    if (!fileRes.ok) {
      return NextResponse.json(
        errorResponse("NOT_FOUND", "Dosya bulunamadı veya erişilemedi"),
        { status: 404 }
      );
    }

    const buffer = await fileRes.arrayBuffer();

    // Parse based on file type
    if (fileType === PDF_TYPE) {
      const base64 = Buffer.from(buffer).toString("base64");
      const result = await parseCVFromPDF(base64);

      if (!result.success) {
        return NextResponse.json(
          errorResponse("AI_PARSE_ERROR", result.error),
          { status: 422 }
        );
      }

      return NextResponse.json({ success: true, data: result.data });
    }

    if (fileType === DOCX_TYPE) {
      const textResult = await extractTextFromDocx(buffer);

      if (!textResult.success) {
        return NextResponse.json(
          errorResponse("PARSE_ERROR", textResult.error),
          { status: 422 }
        );
      }

      const result = await parseCVFromText(textResult.text);

      if (!result.success) {
        return NextResponse.json(
          errorResponse("AI_PARSE_ERROR", result.error),
          { status: 422 }
        );
      }

      return NextResponse.json({ success: true, data: result.data });
    }

    // Unsupported type (legacy .doc)
    return NextResponse.json(
      errorResponse("VALIDATION_ERROR", "Desteklenmeyen format. Lütfen PDF veya DOCX yükleyin."),
      { status: 400 }
    );
  } catch (err) {
    console.error("CV parse error:", err);
    return NextResponse.json(
      errorResponse("SERVER_ERROR", "CV analiz edilemedi"),
      { status: 500 }
    );
  }
}
