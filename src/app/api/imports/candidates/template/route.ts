import { requireAuth } from "@/lib/auth-guard";
import { createTemplateResponse, TemplateColumn } from "@/lib/excel";

const TEMPLATE_COLUMNS: TemplateColumn[] = [
  { header: "Ad", key: "firstName", width: 15, required: true, description: "Adayın adı" },
  { header: "Soyad", key: "lastName", width: 15, required: true, description: "Adayın soyadı" },
  { header: "E-posta", key: "email", width: 25, description: "E-posta adresi" },
  { header: "Telefon", key: "phone", width: 18, description: "Telefon numarası (ör: +90 555 123 4567)" },
  { header: "LinkedIn URL", key: "linkedinUrl", width: 30, description: "LinkedIn profil linki" },
  { header: "Eğitim Seviyesi", key: "educationLevel", width: 18, description: "Eğitim durumu (ör: Lisans, Yüksek Lisans)" },
  { header: "Üniversite", key: "universityName", width: 25, description: "Üniversite adı" },
  { header: "Bölüm", key: "universityDepartment", width: 25, description: "Üniversite bölümü" },
  { header: "Toplam Deneyim (Yıl)", key: "totalExperienceYears", width: 20, description: "Toplam deneyim yılı (0-50 arası sayı)" },
  { header: "Sektör", key: "currentSector", width: 20, description: "Mevcut çalıştığı sektör" },
  { header: "Mevcut Pozisyon", key: "currentTitle", width: 25, description: "Mevcut iş unvanı" },
  { header: "Maaş Beklentisi", key: "salaryExpectation", width: 18, description: "Maaş beklentisi (sayı)" },
  {
    header: "Para Birimi",
    key: "salaryCurrency",
    width: 12,
    description: "Para birimi",
    validValues: ["TRY", "USD", "EUR"],
  },
  {
    header: "Maaş Tipi",
    key: "salaryType",
    width: 12,
    description: "Net veya brüt",
    validValues: ["net", "gross"],
  },
  { header: "Ülke", key: "country", width: 15, description: "Yaşadığı ülke" },
  { header: "Şehir", key: "city", width: 15, description: "Yaşadığı şehir" },
  {
    header: "Uzaktan Çalışma",
    key: "isRemoteEligible",
    width: 15,
    description: "Uzaktan çalışmaya uygun mu?",
    validValues: ["Evet", "Hayır"],
  },
  {
    header: "Hibrit Çalışma",
    key: "isHybridEligible",
    width: 15,
    description: "Hibrit çalışmaya uygun mu?",
    validValues: ["Evet", "Hayır"],
  },
  {
    header: "Diller",
    key: "languages",
    width: 35,
    description: "Dil bilgileri: Dil:seviye formatında, virgülle ayrılmış (ör: İngilizce:advanced, Almanca:intermediate). Seviyeler: beginner, intermediate, advanced, native",
  },
];

const SAMPLE_ROWS = [
  {
    firstName: "Ayşe",
    lastName: "Yılmaz",
    email: "ayse.yilmaz@email.com",
    phone: "+90 532 123 4567",
    linkedinUrl: "https://linkedin.com/in/ayseyilmaz",
    educationLevel: "Lisans",
    universityName: "İTÜ",
    universityDepartment: "Bilgisayar Mühendisliği",
    totalExperienceYears: 5,
    currentSector: "Teknoloji",
    currentTitle: "Yazılım Mühendisi",
    salaryExpectation: 45000,
    salaryCurrency: "TRY",
    salaryType: "net",
    country: "Türkiye",
    city: "İstanbul",
    isRemoteEligible: "Evet",
    isHybridEligible: "Evet",
    languages: "İngilizce:advanced, Almanca:intermediate",
  },
  {
    firstName: "Mehmet",
    lastName: "Kaya",
    email: "mehmet.kaya@email.com",
    phone: "+90 544 987 6543",
    educationLevel: "Yüksek Lisans",
    universityName: "ODTÜ",
    universityDepartment: "İşletme",
    totalExperienceYears: 8,
    currentSector: "Finans",
    currentTitle: "Finans Müdürü",
    salaryExpectation: 65000,
    salaryCurrency: "TRY",
    salaryType: "gross",
    country: "Türkiye",
    city: "Ankara",
    isRemoteEligible: "Hayır",
    isHybridEligible: "Evet",
    languages: "İngilizce:advanced",
  },
];

const INSTRUCTIONS = TEMPLATE_COLUMNS.map((col) => [
  col.required ? `${col.header} *` : col.header,
  col.description || "",
  col.required ? "Evet" : "Hayır",
  col.validValues ? col.validValues.join(", ") : "",
]);

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  return createTemplateResponse(
    "Adaylar",
    TEMPLATE_COLUMNS,
    "aday_sablonu.xlsx",
    SAMPLE_ROWS,
    INSTRUCTIONS
  );
}
