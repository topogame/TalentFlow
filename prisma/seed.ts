import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // ─── Users ───
  const passwordHash = await bcrypt.hash("Admin123!", 12);
  const consultantHash = await bcrypt.hash("Consultant1!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@talentflow.local" },
    update: {},
    create: {
      email: "admin@talentflow.local",
      passwordHash,
      firstName: "Ayça",
      lastName: "Yönetici",
      role: "admin",
      isActive: true,
    },
  });

  const consultant = await prisma.user.upsert({
    where: { email: "danisiman@talentflow.local" },
    update: {},
    create: {
      email: "danisiman@talentflow.local",
      passwordHash: consultantHash,
      firstName: "Elif",
      lastName: "Kaya",
      role: "consultant",
      isActive: true,
    },
  });

  console.log(`Users: ${admin.email}, ${consultant.email}`);

  // ─── Firms ───
  const existingFirms = await prisma.firm.count();
  if (existingFirms > 0) {
    console.log("Data already seeded, skipping mock data.");
    await seedTemplatesAndSettings(admin.id);
    console.log("Seeding complete!");
    return;
  }

  const firmsData = [
    {
      name: "TechVista Yazılım",
      sector: "Bilişim / Yazılım",
      companySize: "51-200",
      city: "İstanbul",
      country: "Türkiye",
      website: "https://techvista.com.tr",
      notes: "Hızlı büyüyen SaaS şirketi. Yazılım geliştirme odaklı.",
    },
    {
      name: "FinansPlus A.Ş.",
      sector: "Finans / Bankacılık",
      companySize: "201-500",
      city: "İstanbul",
      country: "Türkiye",
      website: "https://finansplus.com.tr",
      notes: "Dijital bankacılık alanında lider.",
    },
    {
      name: "MediCare Sağlık Grubu",
      sector: "Sağlık",
      companySize: "501-1000",
      city: "Ankara",
      country: "Türkiye",
      website: "https://medicare.com.tr",
      notes: "5 hastane zinciri. Sürekli sağlık profesyoneli arıyorlar.",
    },
    {
      name: "GreenEnergy Enerji",
      sector: "Enerji / Yenilenebilir",
      companySize: "11-50",
      city: "İzmir",
      country: "Türkiye",
      notes: "Güneş enerjisi paneli üretimi ve kurulumu.",
    },
    {
      name: "LogiTrans Lojistik",
      sector: "Lojistik / Taşımacılık",
      companySize: "201-500",
      city: "Mersin",
      country: "Türkiye",
      website: "https://logitrans.com.tr",
      notes: "Uluslararası lojistik ve gümrük hizmetleri.",
    },
  ];

  const firms = [];
  for (const f of firmsData) {
    const firm = await prisma.firm.create({
      data: { ...f, createdById: admin.id },
    });
    firms.push(firm);
  }
  console.log(`${firms.length} firms created.`);

  // ─── Positions ───
  const positionsData = [
    {
      firmId: firms[0].id,
      title: "Senior Full-Stack Developer",
      department: "Yazılım Geliştirme",
      minExperienceYears: 5,
      salaryMin: 80000,
      salaryMax: 120000,
      salaryCurrency: "TRY",
      workModel: "hybrid",
      city: "İstanbul",
      country: "Türkiye",
      requiredSkills: "React, Node.js, PostgreSQL, Docker, TypeScript",
      priority: "high",
      status: "open",
    },
    {
      firmId: firms[0].id,
      title: "DevOps Engineer",
      department: "Altyapı",
      minExperienceYears: 3,
      salaryMin: 60000,
      salaryMax: 90000,
      salaryCurrency: "TRY",
      workModel: "remote",
      city: "İstanbul",
      country: "Türkiye",
      requiredSkills: "AWS, Docker, Kubernetes, Terraform, CI/CD",
      priority: "normal",
      status: "open",
    },
    {
      firmId: firms[1].id,
      title: "Veri Analisti",
      department: "Veri Bilimi",
      minExperienceYears: 2,
      salaryMin: 45000,
      salaryMax: 65000,
      salaryCurrency: "TRY",
      workModel: "office",
      city: "İstanbul",
      country: "Türkiye",
      requiredSkills: "SQL, Python, Power BI, finans bilgisi",
      priority: "normal",
      status: "open",
    },
    {
      firmId: firms[1].id,
      title: "Uyum Uzmanı (Compliance)",
      department: "Risk & Uyum",
      minExperienceYears: 4,
      salaryMin: 55000,
      salaryMax: 80000,
      salaryCurrency: "TRY",
      workModel: "office",
      city: "İstanbul",
      country: "Türkiye",
      requiredSkills: "BDDK, SPK düzenlemeleri, risk yönetimi, iç denetim",
      priority: "urgent",
      status: "open",
    },
    {
      firmId: firms[2].id,
      title: "Hastane Müdürü",
      department: "Yönetim",
      minExperienceYears: 10,
      salaryMin: 100000,
      salaryMax: 150000,
      salaryCurrency: "TRY",
      workModel: "office",
      city: "Ankara",
      country: "Türkiye",
      requiredSkills: "Hastane yönetimi, operasyon, sağlık mevzuatı",
      priority: "high",
      status: "open",
    },
    {
      firmId: firms[3].id,
      title: "Elektrik Mühendisi",
      department: "Mühendislik",
      minExperienceYears: 3,
      salaryMin: 40000,
      salaryMax: 55000,
      salaryCurrency: "TRY",
      workModel: "office",
      city: "İzmir",
      country: "Türkiye",
      requiredSkills: "Elektrik mühendisliği, güneş enerjisi, PV sistemleri",
      priority: "normal",
      status: "open",
    },
    {
      firmId: firms[4].id,
      title: "Operasyon Müdürü",
      department: "Operasyon",
      minExperienceYears: 7,
      salaryMin: 70000,
      salaryMax: 100000,
      salaryCurrency: "TRY",
      workModel: "office",
      city: "Mersin",
      country: "Türkiye",
      requiredSkills: "Lojistik operasyon, depo yönetimi, filo yönetimi",
      priority: "normal",
      status: "on_hold",
    },
  ];

  const positions = [];
  for (const p of positionsData) {
    const position = await prisma.position.create({
      data: { ...p, createdById: admin.id } as any,
    });
    positions.push(position);
  }
  console.log(`${positions.length} positions created.`);

  // ─── Candidates ───
  const candidatesData = [
    {
      firstName: "Ahmet",
      lastName: "Yılmaz",
      email: "ahmet.yilmaz@gmail.com",
      phone: "+90 532 111 2233",
      linkedinUrl: "https://linkedin.com/in/ahmetyilmaz",
      educationLevel: "Lisans - Bilgisayar Mühendisliği",
      totalExperienceYears: 7,
      currentSector: "Bilişim",
      currentTitle: "Senior Software Engineer",
      salaryExpectation: 95000,
      salaryCurrency: "TRY",
      salaryType: "net",
      country: "Türkiye",
      city: "İstanbul",
      isRemoteEligible: true,
      isHybridEligible: true,
      languages: [
        { language: "İngilizce", level: "advanced" },
        { language: "Almanca", level: "beginner" },
      ],
    },
    {
      firstName: "Zeynep",
      lastName: "Demir",
      email: "zeynep.demir@outlook.com",
      phone: "+90 533 222 3344",
      linkedinUrl: "https://linkedin.com/in/zeynepdemir",
      educationLevel: "Yüksek Lisans - Veri Bilimi",
      totalExperienceYears: 4,
      currentSector: "Finans",
      currentTitle: "Data Analyst",
      salaryExpectation: 60000,
      salaryCurrency: "TRY",
      salaryType: "gross",
      country: "Türkiye",
      city: "İstanbul",
      isRemoteEligible: false,
      isHybridEligible: true,
      languages: [
        { language: "İngilizce", level: "advanced" },
      ],
    },
    {
      firstName: "Mehmet",
      lastName: "Öztürk",
      email: "mehmet.ozturk@yahoo.com",
      phone: "+90 534 333 4455",
      educationLevel: "Lisans - İşletme",
      totalExperienceYears: 12,
      currentSector: "Sağlık",
      currentTitle: "Hastane Operasyon Direktörü",
      salaryExpectation: 130000,
      salaryCurrency: "TRY",
      salaryType: "net",
      country: "Türkiye",
      city: "Ankara",
      isRemoteEligible: false,
      isHybridEligible: false,
      languages: [
        { language: "İngilizce", level: "intermediate" },
      ],
    },
    {
      firstName: "Elif",
      lastName: "Çelik",
      email: "elif.celik@gmail.com",
      phone: "+90 535 444 5566",
      linkedinUrl: "https://linkedin.com/in/elifcelik",
      educationLevel: "Lisans - Elektrik-Elektronik Mühendisliği",
      totalExperienceYears: 5,
      currentSector: "Enerji",
      currentTitle: "Elektrik Mühendisi",
      salaryExpectation: 50000,
      salaryCurrency: "TRY",
      salaryType: "net",
      country: "Türkiye",
      city: "İzmir",
      isRemoteEligible: false,
      isHybridEligible: false,
      languages: [
        { language: "İngilizce", level: "intermediate" },
        { language: "Fransızca", level: "beginner" },
      ],
    },
    {
      firstName: "Can",
      lastName: "Arslan",
      email: "can.arslan@hotmail.com",
      phone: "+90 536 555 6677",
      linkedinUrl: "https://linkedin.com/in/canarslan",
      educationLevel: "Lisans - Bilgisayar Mühendisliği",
      totalExperienceYears: 3,
      currentSector: "Bilişim",
      currentTitle: "DevOps Engineer",
      salaryExpectation: 70000,
      salaryCurrency: "TRY",
      salaryType: "net",
      country: "Türkiye",
      city: "İstanbul",
      isRemoteEligible: true,
      isHybridEligible: true,
      languages: [
        { language: "İngilizce", level: "advanced" },
      ],
    },
    {
      firstName: "Selin",
      lastName: "Koç",
      email: "selin.koc@gmail.com",
      phone: "+90 537 666 7788",
      educationLevel: "Yüksek Lisans - Hukuk",
      totalExperienceYears: 6,
      currentSector: "Finans",
      currentTitle: "Compliance Manager",
      salaryExpectation: 75000,
      salaryCurrency: "TRY",
      salaryType: "gross",
      country: "Türkiye",
      city: "İstanbul",
      isRemoteEligible: false,
      isHybridEligible: true,
      languages: [
        { language: "İngilizce", level: "advanced" },
        { language: "İspanyolca", level: "intermediate" },
      ],
    },
    {
      firstName: "Burak",
      lastName: "Şahin",
      email: "burak.sahin@gmail.com",
      phone: "+90 538 777 8899",
      educationLevel: "Lisans - Uluslararası Ticaret",
      totalExperienceYears: 9,
      currentSector: "Lojistik",
      currentTitle: "Lojistik Operasyon Müdürü",
      salaryExpectation: 85000,
      salaryCurrency: "TRY",
      salaryType: "net",
      country: "Türkiye",
      city: "Mersin",
      isRemoteEligible: false,
      isHybridEligible: false,
      languages: [
        { language: "İngilizce", level: "advanced" },
        { language: "Arapça", level: "intermediate" },
      ],
    },
    {
      firstName: "Deniz",
      lastName: "Aktaş",
      email: "deniz.aktas@outlook.com",
      phone: "+90 539 888 9900",
      linkedinUrl: "https://linkedin.com/in/denizaktas",
      educationLevel: "Lisans - Yazılım Mühendisliği",
      totalExperienceYears: 2,
      currentSector: "Bilişim",
      currentTitle: "Junior Full-Stack Developer",
      salaryExpectation: 40000,
      salaryCurrency: "TRY",
      salaryType: "net",
      country: "Türkiye",
      city: "İstanbul",
      isRemoteEligible: true,
      isHybridEligible: true,
      languages: [
        { language: "İngilizce", level: "intermediate" },
      ],
    },
  ];

  const candidates = [];
  for (const c of candidatesData) {
    const { languages, ...data } = c;
    const candidate = await prisma.candidate.create({
      data: {
        ...data,
        createdById: admin.id,
        languages: {
          create: languages.map((l) => ({
            language: l.language,
            level: l.level as any,
          })),
        },
      },
    });
    candidates.push(candidate);
  }
  console.log(`${candidates.length} candidates created.`);

  // ─── Candidate Notes ───
  const notesData = [
    { candidateId: candidates[0].id, content: "Çok deneyimli, React ve Node.js konusunda güçlü. İlk görüşmede olumlu izlenim bıraktı." },
    { candidateId: candidates[0].id, content: "Maaş beklentisi biraz yüksek ama müzakereye açık." },
    { candidateId: candidates[1].id, content: "Veri analizi konusunda güçlü portfolio. Power BI sertifikası var." },
    { candidateId: candidates[2].id, content: "Hastane yönetimi konusunda çok deneyimli. 3 hastanede müdürlük yapmış." },
    { candidateId: candidates[4].id, content: "AWS sertifikaları mevcut. Kubernetes tecrübesi güçlü." },
    { candidateId: candidates[5].id, content: "BDDK düzenlemeleri konusunda uzman. Hukuk geçmişi büyük avantaj." },
  ];

  for (const n of notesData) {
    await prisma.candidateNote.create({
      data: { ...n, createdById: admin.id },
    });
  }
  console.log(`${notesData.length} candidate notes created.`);

  // ─── Processes ───
  const processesData = [
    // Ahmet → TechVista Senior Full-Stack
    { candidateId: candidates[0].id, firmId: firms[0].id, positionId: positions[0].id, stage: "interview", fitnessScore: 4 },
    // Can → TechVista DevOps
    { candidateId: candidates[4].id, firmId: firms[0].id, positionId: positions[1].id, stage: "submitted", fitnessScore: 5 },
    // Zeynep → FinansPlus Veri Analisti
    { candidateId: candidates[1].id, firmId: firms[1].id, positionId: positions[2].id, stage: "initial_interview", fitnessScore: 4 },
    // Selin → FinansPlus Uyum Uzmanı
    { candidateId: candidates[5].id, firmId: firms[1].id, positionId: positions[3].id, stage: "interview", fitnessScore: 5 },
    // Mehmet → MediCare Hastane Müdürü
    { candidateId: candidates[2].id, firmId: firms[2].id, positionId: positions[4].id, stage: "submitted", fitnessScore: 4 },
    // Elif → GreenEnergy Elektrik Mühendisi
    { candidateId: candidates[3].id, firmId: firms[3].id, positionId: positions[5].id, stage: "pool", fitnessScore: 3 },
    // Deniz → TechVista Senior Full-Stack (junior ama deneniyor)
    { candidateId: candidates[7].id, firmId: firms[0].id, positionId: positions[0].id, stage: "pool", fitnessScore: 2 },
  ];

  const createdProcesses = [];
  for (const p of processesData) {
    const proc = await prisma.process.create({
      data: {
        ...p,
        stage: p.stage as any,
        assignedToId: consultant.id,
        createdById: admin.id,
      },
    });
    createdProcesses.push({ ...proc, targetStage: p.stage });
  }
  console.log(`${processesData.length} processes created.`);

  // ─── Process Stage History ───
  // Simulate realistic stage transitions for each process
  const stagePath: Record<string, string[]> = {
    pool: ["pool"],
    initial_interview: ["pool", "initial_interview"],
    submitted: ["pool", "initial_interview", "submitted"],
    interview: ["pool", "initial_interview", "submitted", "interview"],
  };

  const now = new Date();
  for (const proc of createdProcesses) {
    const stages = stagePath[proc.targetStage] || ["pool"];
    for (let i = 0; i < stages.length; i++) {
      const daysAgo = (stages.length - i) * 3; // each transition ~3 days apart
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(9 + i, 30, 0, 0);

      await prisma.processStageHistory.create({
        data: {
          processId: proc.id,
          fromStage: i === 0 ? null : stages[i - 1],
          toStage: stages[i],
          note: i === 0 ? "Süreç başlatıldı" : undefined,
          changedById: i % 2 === 0 ? admin.id : consultant.id,
          createdAt,
        },
      });
    }
  }
  console.log("Process stage history created.");

  // ─── Interviews ───
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(10, 0, 0, 0);

  // Get process IDs for interviews
  const processes = await prisma.process.findMany({
    where: { stage: "interview" },
    select: { id: true, candidateId: true },
  });

  if (processes.length > 0) {
    await prisma.interview.create({
      data: {
        processId: processes[0].id,
        scheduledAt: tomorrow,
        durationMinutes: 60,
        type: "online",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        clientParticipants: "CTO, Engineering Manager",
        notes: "Teknik mülakat - Sistem tasarımı odaklı",
        createdById: admin.id,
      },
    });

    if (processes.length > 1) {
      await prisma.interview.create({
        data: {
          processId: processes[1].id,
          scheduledAt: dayAfter,
          durationMinutes: 45,
          type: "face_to_face",
          location: "FinansPlus Genel Müdürlük, Levent",
          clientParticipants: "HR Direktörü, Risk Müdürü",
          notes: "İK ve teknik değerlendirme",
          createdById: admin.id,
        },
      });
    }

    // Extra interviews for a fuller calendar
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    threeDays.setHours(11, 0, 0, 0);

    const fiveDays = new Date();
    fiveDays.setDate(fiveDays.getDate() + 5);
    fiveDays.setHours(15, 30, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(10, 0, 0, 0);

    // Get submitted processes too
    const submittedProcesses = await prisma.process.findMany({
      where: { stage: "submitted" },
      select: { id: true },
    });

    if (submittedProcesses.length > 0) {
      await prisma.interview.create({
        data: {
          processId: submittedProcesses[0].id,
          scheduledAt: threeDays,
          durationMinutes: 30,
          type: "phone",
          notes: "Telefon ile ön değerlendirme",
          createdById: consultant.id,
        },
      });
    }

    if (submittedProcesses.length > 1) {
      await prisma.interview.create({
        data: {
          processId: submittedProcesses[1].id,
          scheduledAt: fiveDays,
          durationMinutes: 60,
          type: "online",
          meetingLink: "https://zoom.us/j/12345678",
          clientParticipants: "Hastane Genel Müdürü",
          notes: "Yönetim pozisyonu mülakatı",
          createdById: admin.id,
        },
      });
    }

    if (processes.length > 0) {
      await prisma.interview.create({
        data: {
          processId: processes[0].id,
          scheduledAt: nextWeek,
          durationMinutes: 90,
          type: "face_to_face",
          location: "TechVista Ofis, Maslak",
          clientParticipants: "CTO, VP Engineering, Team Lead",
          notes: "Final mülakat - Takım ile tanışma",
          createdById: admin.id,
        },
      });
    }

    console.log("Interviews created.");
  }

  // ─── Templates & Settings ───
  await seedTemplatesAndSettings(admin.id);

  console.log("Seeding complete!");
}

async function seedTemplatesAndSettings(adminId: string) {
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

  const existingTemplates = await prisma.emailTemplate.count();
  if (existingTemplates === 0) {
    await prisma.emailTemplate.createMany({
      data: templates.map((t) => ({ ...t, createdById: adminId })),
    });
    console.log(`${templates.length} email templates created.`);
  }

  const settings = [
    { key: "company_name", value: "TalentFlow" },
    { key: "session_timeout_hours", value: "8" },
    { key: "stale_process_days", value: "7" },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value, updatedById: adminId },
    });
  }
  console.log(`${settings.length} default settings created.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
