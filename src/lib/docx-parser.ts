import mammoth from "mammoth";

export async function extractTextFromDocx(
  buffer: ArrayBuffer
): Promise<{ success: true; text: string } | { success: false; error: string }> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });

    if (!result.value || result.value.trim().length === 0) {
      return { success: false, error: "DOCX dosyasından metin çıkarılamadı" };
    }

    return { success: true, text: result.value };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "DOCX işleme hatası",
    };
  }
}
