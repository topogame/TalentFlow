import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@talentflow.local" },
    update: {},
    create: {
      email: "admin@talentflow.local",
      passwordHash,
      firstName: "Admin",
      lastName: "TalentFlow",
      role: "admin",
      isActive: true,
    },
  });
  console.log(`Admin user created: ${admin.email}`);

  // Create default email templates
  const templates = [
    {
      name: "İlk Temas",
      subject: "{pozisyon} pozisyonu hakkında",
      body: "Sayın {aday_adi} {aday_soyadi},\n\n{firma} bünyesindeki {pozisyon} pozisyonu için profilinizi değerlendirmek istiyoruz.\n\nDetayları görüşmek üzere sizinle iletişime geçmek isteriz.\n\nSaygılarımızla,\n{danisman_adi}",
      category: "ilk_temas",
    },
    {
      name: "Süreç Bilgilendirme",
      subject: "Süreciniz hakkında güncelleme",
      body: "Sayın {aday_adi} {aday_soyadi},\n\n{firma} - {pozisyon} süreciniz hakkında sizi bilgilendirmek isteriz.\n\nSaygılarımızla,\n{danisman_adi}",
      category: "bilgilendirme",
    },
    {
      name: "Mülakat Daveti",
      subject: "Mülakat Daveti - {firma} - {pozisyon}",
      body: "Sayın {aday_adi} {aday_soyadi},\n\n{firma} bünyesindeki {pozisyon} pozisyonu için mülakata davetlisiniz.\n\nTarih: {mulakat_tarihi}\nSaat: {mulakat_saati}\n\nSaygılarımızla,\n{danisman_adi}",
      category: "mulakat_daveti",
    },
    {
      name: "Olumlu Sonuç",
      subject: "Tebrikler! - {pozisyon}",
      body: "Sayın {aday_adi} {aday_soyadi},\n\nSizi tebrik ederiz! {firma} bünyesindeki {pozisyon} pozisyonu için süreciniz olumlu sonuçlanmıştır.\n\nDetaylar için sizinle iletişime geçeceğiz.\n\nSaygılarımızla,\n{danisman_adi}",
      category: "olumlu_sonuc",
    },
    {
      name: "Olumsuz Sonuç",
      subject: "Süreç Sonucu - {pozisyon}",
      body: "Sayın {aday_adi} {aday_soyadi},\n\n{firma} bünyesindeki {pozisyon} pozisyonu için süreciniz hakkında sizi bilgilendirmek isteriz. Maalesef bu pozisyon için süreciniz olumsuz sonuçlanmıştır.\n\nUygun pozisyonlarda tekrar iletişime geçeceğiz.\n\nSaygılarımızla,\n{danisman_adi}",
      category: "olumsuz_sonuc",
    },
    {
      name: "Bekleme Bildirimi",
      subject: "Süreç Güncelleme - {pozisyon}",
      body: "Sayın {aday_adi} {aday_soyadi},\n\n{firma} bünyesindeki {pozisyon} pozisyonu için süreciniz geçici olarak beklemeye alınmıştır. Gelişme olduğunda sizi bilgilendireceğiz.\n\nSaygılarımızla,\n{danisman_adi}",
      category: "bekleme",
    },
  ];

  for (const template of templates) {
    await prisma.emailTemplate.upsert({
      where: { id: template.category },
      update: {},
      create: {
        ...template,
        createdById: admin.id,
      },
    });
  }
  console.log(`${templates.length} email templates created.`);

  // Create default settings
  const settings = [
    { key: "company_name", value: "TalentFlow" },
    { key: "session_timeout_hours", value: "8" },
    { key: "stale_process_days", value: "7" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        updatedById: admin.id,
      },
    });
  }
  console.log(`${settings.length} default settings created.`);

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
