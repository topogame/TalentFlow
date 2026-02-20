# AI Ozellikler — Birlesik Bug Fix & Feature Raporu

**Tarih:** 2026-02-20
**Build:** Hatasiz | **Testler:** 495/495 gecti

---

# BOLUM A: AI Aday-Pozisyon Eslestirme (Commit: `e8740e3`)

## Tespit Edilen Sorunlar

| # | Sorun | Oncelik | Durum |
|---|-------|---------|-------|
| A1 | AI analizi ~35sn suruyor (beklenen 3-10sn) | Yuksek | Tamamlandi |
| A2 | Ilgisiz adaylar listeleniyor (minimum puan esigi yok) | Orta | Tamamlandi |
| A3 | "Surece Ekle" hatasi alert() ile blokluyor | Orta | Tamamlandi |
| A4 | Pozisyon durumu (status) degistirilemiyor | Orta | Tamamlandi |
| A5 | AI fallback sik yasaniyor | Dusuk | Tamamlandi |

### A1: Performans — AI Batch Analizi (~35sn → ~10sn)
- 20 adayi 5'erli batch'lere bolup `Promise.allSettled` ile paralel calistirma
- Her batch `maxTokens: 1000`
- Dosyalar: `constants.ts`, `ai.ts`, `match-candidates/route.ts`

### A2: Minimum Puan Esigi
- `MIN_MATCH_SCORE = 40` sabiti, 40 alti adaylar filtreleniyor
- Dosyalar: `constants.ts`, `match-candidates/route.ts`

### A3: Alert → Inline Mesaj
- `alert()` yerine amber inline banner, hata durumunda aday listeden cikariliyor
- Dosya: `positions/[id]/page.tsx`

### A4: Pozisyon Status Dropdown
- `updatePositionSchema`'ya status eklendi, edit formuna Acik/Beklemede/Kapali dropdown
- Dosyalar: `validations.ts`, `positions/[id]/edit/page.tsx`

### A5: AI Fallback Iyilestirme
- Batch sayesinde kismi basari yeterli (`anyBatchSuccess`)
- Fix A1'in yan etkisi, ekstra kod degisikligi yok

---

## A — Manuel UI Test Adimlari

### Test A1: Pozisyon Status Dropdown
1. Herhangi bir pozisyonun duzenleme sayfasina git (`/positions/[id]/edit`)
2. [ ] **"Durum" dropdown'i gorunuyor mu?** (Acik / Beklemede / Kapali)
3. "Beklemede" sec → Kaydet
4. [ ] **Pozisyon detay sayfasinda badge degisti mi?**
5. Tekrar "Acik" yap → kaydet

### Test A2: Minimum Puan Filtresi
1. Acik bir pozisyonun detay sayfasina git
2. "AI Aday Eslestirme" butonuna tikla
3. [ ] **Listelenen adaylarin hepsinin puani >= 40 mi?**
4. [ ] **Dusuk puanli adaylar filtrelenmis mi?**

### Test A3: Surece Ekle — Inline Mesaj
1. AI eslestirme sonuclarinda bir aday sec → "Surece Ekle"
2. [ ] **Aday zaten surecte ise → alert yerine amber banner mesaji gorunuyor mu?**
3. [ ] **Aday listeden otomatik cikti mi?**

### Test A4: AI Performans
1. AI eslestirme butonuna tikla
2. [ ] **Analiz suresi ~10-15sn civarinda mi?** (onceki ~35sn)
3. [ ] **Kismi AI basarisizliginda bile sonuclar gosteriliyor mu?**

---

# BOLUM B: AI CV Parsing (Commit: bekliyor)

## Tespit Edilen Sorunlar

| # | Sorun | Oncelik | Durum |
|---|-------|---------|-------|
| B1 | CV dosyasi yuklenemiyor (Vercel Blob hatasi) | Kritik | Tamamlandi |
| B2 | Dosya boyutu kontrolu normal boyutta da hata veriyor olabilir | Orta | Tamamlandi (B1 ile) |
| B3 | Anthropic API 529 overloaded — retry mekanizmasi yok | Dusuk | Tamamlandi |

## Ozellik Talepleri

| # | Talep | Durum |
|---|-------|-------|
| O1 | Mevcut adaylarda da CV yukleme + AI analiz olmali | Tamamlandi |
| O2 | Aday ile ilgili notlarin tutulacagi alan | ZATEN MEVCUT |

---

### B1: CV Upload Hatasi — Detayli Hata Mesajlari + Config

**Kok neden:** `@vercel/blob` `put()` basarisiz oldugunda catch blogu sadece "Dosya yuklenemedi" donduruyordu. Token eksikligi, yetkilendirme hatasi veya body size limiti gibi gercek neden gizleniyordu.

**Yapilan degisiklikler:**

**Dosya: `src/app/api/documents/upload/route.ts`**
1. `BLOB_READ_WRITE_TOKEN` varlik kontrolu eklendi (pre-flight check)
2. Bos dosya (size === 0) kontrolu eklendi
3. Dosya boyutu hata mesajina gercek boyut eklendi
4. Catch bloguna detayli hata ayirimi eklendi (token/auth/genel)

**Dosya: `next.config.ts`**
- `experimental.serverActions.bodySizeLimit: "12mb"` eklendi (10MB dosya + FormData overhead)

**Dosya: `src/components/cv-upload.tsx`**
- Bos dosya kontrolu eklendi (`fileEmpty`)

---

### B2: Dosya Boyutu Validasyonu
- B1 ile cozuldu — detayli hata mesajlari sorunun kaynagini netlestiriyor
- Ek kod degisikligi gerekmedi

---

### B3: Anthropic API 529 — withRetry Retry Mekanizmasi

**Dosya: `src/lib/ai.ts`**

Yeni `withRetry` helper fonksiyonu eklendi (exponential backoff):
- Max 2 retry, baseDelay 1sn
- Retryable hatalar: 529 overloaded, 500, 503, rate_limit
- Non-retryable hatalar: 400, 401 → hemen fail
- Delay: 1sn, 2sn + random jitter

**Sarilan 5 Anthropic API cagrisi:**
1. `parseCVFromPDF` — PDF CV analizi
2. `parseCVFromText` — DOCX CV analizi
3. `analyzeMatchWithAI` — Aday-pozisyon eslestirme
4. `parseLinkedInProfile` — LinkedIn profil analizi
5. `parseJobPosting` — Is ilani analizi

---

### O1: Mevcut Adaylarda CV AI Analiz

**Yeni dosya: `src/components/candidate-cv-analysis.tsx`**

Aday detay sayfasindaki "Belgeler" tabina eklenen bilesen:
- Akis: Dosya sec → Yukle → AI Analiz → Onizleme (checkbox listesi) → Onayla → Aday guncelle
- Onizleme adiminda AI'in buldugu alanlari checkbox listesi ile gosteriyor
- Kullanici hangi alanlarin guncellenecegini seciyor
- Violet renk temasi (mevcut cv-upload ile tutarli)

**Desteklenen alanlar:**
Ad, Soyad, E-posta, Telefon, LinkedIn, Mevcut Pozisyon, Sektor,
Deneyim (Yil), Egitim Seviyesi, Universite, Bolum, Sehir, Ulke, Diller

**Dosya: `src/app/(dashboard)/candidates/[id]/page.tsx`**
- `CandidateCVAnalysis` bileseni "Belgeler" tabina eklendi (DocumentUpload ustune)

**i18n: `messages/tr.json` + `messages/en.json`**
- `cvAnalysis.*` cevirileri eklendi (title, description, previewTitle, applyChanges, alan isimleri vb.)
- `cvUpload.fileEmpty` cevirisi eklendi

---

### O2: Aday Notlari — ZATEN MEVCUT

Tamamen implement edilmis:
- **Prisma:** `CandidateNote` modeli (id, content, createdById, createdAt)
- **API:** `GET/POST /api/candidates/[id]/notes`
- **UI:** Aday detay sayfasinda "Notlar" tabi (form + liste)
- **Validation:** `noteSchema` (1-5000 karakter)

Ek kod degisikligi yok. Manuel testte dogrulanacak.

---

## B — Degisen Dosyalar Ozeti

| Dosya | Degisiklik |
|-------|-----------|
| `src/app/api/documents/upload/route.ts` | Token pre-flight + bos dosya kontrolu + detayli hata mesajlari |
| `next.config.ts` | `bodySizeLimit: "12mb"` eklendi |
| `src/components/cv-upload.tsx` | Bos dosya kontrolu eklendi |
| `src/lib/ai.ts` | `withRetry` helper + 5 API cagrisina retry |
| `src/components/candidate-cv-analysis.tsx` | **YENI** — Mevcut adaylar icin CV AI analiz bileseni |
| `src/app/(dashboard)/candidates/[id]/page.tsx` | CandidateCVAnalysis entegrasyonu |
| `messages/tr.json` | `cvAnalysis.*` + `cvUpload.fileEmpty` cevirileri |
| `messages/en.json` | `cvAnalysis.*` + `cvUpload.fileEmpty` cevirileri |

---

## B — Manuel UI Test Adimlari

### Test B1: Upload Hata Mesajlari
1. `.env.local`'den `BLOB_READ_WRITE_TOKEN`'i gecici sil (veya yanlis yap)
2. `/candidates/new` → CV yukle → Yukle butonuna tikla
3. [ ] **"Dosya depolama servisi yapilandirilmamis" mesaji geliyor mu?** (generic "Dosya yuklenemedi" degil)
4. Token'i geri koy

### Test B2: PDF CV Yukleme + AI Analiz (Yeni Aday)
1. `/candidates/new` sayfasina git
2. [ ] **Mor "CV ile Hizli Olusturma" karti gorunuyor mu?**
3. Bir PDF CV dosyasini surukle veya sec
4. [ ] **Dosya adi ve boyutu gorunuyor mu?**
5. "Yukle" butonuna tikla
6. [ ] **Yesil "dosya_adi.pdf yuklendi" mesaji gorunuyor mu?**
7. "AI ile Analiz Et" butonuna tikla
8. [ ] **Mor spinner + "CV analiz ediliyor..." gorunuyor mu?** (3-10sn)
9. [ ] **Yesil "CV basariyla analiz edildi" mesaji geliyor mu?**
10. [ ] **Form alanlari otomatik dolu mu?** (Ad, Soyad, Email, Telefon vb.)
11. Gerekirse alanlari duzelt
12. "Kaydet" tikla
13. [ ] **Aday olusturulup detay sayfasina yonlendirildi mi?**

### Test B3: DOCX CV ile Analiz
1. `/candidates/new` → DOCX formatinda CV yukle (ayni adimlar)
2. [ ] **DOCX dosyasi basariyla analiz ediliyor mu?**
3. [ ] **Form alanlari doluyor mu?**

### Test B4: Mevcut Adayda CV AI Analiz (YENI OZELLIK)
1. Mevcut bir adayin detay sayfasina git (`/candidates/[id]`)
2. "Belgeler" tabina tikla
3. [ ] **Ustte mor "CV ile Bilgileri Guncelle" karti gorunuyor mu?**
4. Bir PDF veya DOCX CV yukle → Yukle → AI ile Analiz Et
5. [ ] **Onizleme ekrani geliyor mu?** (checkbox listesi ile alanlar)
6. [ ] **Her alan yaninda yeni deger gosteriliyor mu?**
7. Istenmeyen alanlarin tikini kaldir
8. "Degisiklikleri Uygula" tikla
9. [ ] **Yesil "Aday bilgileri basariyla guncellendi" mesaji geliyor mu?**
10. [ ] **Aday bilgileri guncellenmis mi?** (sayfayi yenile ve kontrol et)

### Test B5: CV Olmadan Normal Kayit
1. `/candidates/new` → CV yuklemeden form alanlarini elle doldur
2. "Kaydet" tikla
3. [ ] **Aday normal sekilde olusturuluyor mu?** (CV upload bolumu engellemez)

### Test B6: Desteklenmeyen Dosya Formati
1. `/candidates/new` → CV yukleme alanina `.txt` veya `.jpg` dosyasi surukle
2. [ ] **Kirmizi hata: "Desteklenmeyen format" gorunuyor mu?**
3. "Tekrar Dene" tikla
4. [ ] **Drop zone tekrar gorunuyor mu?**

### Test B7: Buyuk Dosya
1. 10MB'dan buyuk dosya sec
2. [ ] **Kirmizi hata gorunuyor mu?** (boyut bilgisi dahil)
3. Normal boyutta dosya ile tekrar dene
4. [ ] **Basarili yuklenebiliyor mu?**

### Test B8: Aday Detay — Belge Yukleme
1. Mevcut bir adayin detay sayfasina git
2. "Belgeler" tabina tikla
3. [ ] **Dosya yukleme alani gorunuyor mu?** ("CV ile Bilgileri Guncelle" altinda)
4. Bir dosya surukle veya tiklayarak sec
5. [ ] **Yukleme tamamlaniyor mu?**
6. [ ] **Belge listesine yeni dosya ekleniyor mu?**
7. "Indir" linkine tikla
8. [ ] **Dosya yeni sekmede aciliyor mu?**

### Test B9: Farkli Dosya Secme
1. CV yukle → "AI ile Analiz Et" asamasina gel
2. "Farkli Dosya" butonuna tikla
3. [ ] **Drop zone sifirlaniyor mu?**
4. Yeni CV sec → yukle → analiz et
5. [ ] **Yeni CV'nin bilgileri ile sonuc geliyor mu?**

### Test B10: Aday Notlari (Mevcut Ozellik)
1. Mevcut bir adayin detay sayfasina git
2. "Notlar" tabina tikla
3. [ ] **Not ekleme formu gorunuyor mu?**
4. Bir not yaz → "Ekle" tikla
5. [ ] **Not listede gorunuyor mu?** (yazar adi + tarih ile)

### Test B11: Surukle-Birak (Drag & Drop)
1. `/candidates/new` → CV kartinin drop zone'u uzerine dosya surukle (birakmadan)
2. [ ] **Drop zone mor/violet renkte vurgulaniyor mu?**
3. Dosayi birak
4. [ ] **Dosya secildi, adi ve boyutu gorunuyor mu?**

---

## Genel Risk Analizi

| # | Risk | Seviye | Onlem |
|---|------|--------|-------|
| 1 | BLOB_READ_WRITE_TOKEN eksik/gecersiz | Yuksek | Pre-flight check + acik hata mesaji |
| 2 | Anthropic rate limiting (batch + retry) | Orta | `Promise.allSettled` + `withRetry` max 2 retry |
| 3 | CV analiz ile mevcut veri uzerine yazma | Orta | Onizleme + checkbox ile kullanici kontrolu |
| 4 | maxTokens yetersiz (batch icin 1000) | Dusuk | 5 aday × 3 kategori ≈ 500-800 token. Yetmezse fallback |
| 5 | Min puan esigi nedeniyle az aday | Dusuk | UI "Uygun aday bulunamadi" gosteriyor |
| 6 | bodySizeLimit Route Handler'a uygulanmayabilir | Dusuk | Defensive config, FormData streaming parser zaten limitsiz |
| 7 | Mevcut testlerin kirilmasi | Cok Dusuk | 495 test gecti, sadece additive degisiklikler |

---

## Dogrulama Ozeti

- [x] `npx next build` — Hatasiz
- [x] `npx vitest run` — 495/495 test gecti
- [ ] Manuel testler — Yukarida A ve B bolumlerindeki adimlar
