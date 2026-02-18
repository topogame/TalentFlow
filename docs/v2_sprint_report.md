# v2 Sprint Raporu — Excel Import/Export + Özel Raporlar

**Tarih:** 2026-02-18
**Durum:** Tamamlandı

---

## Özet

5 sprintte planlanan Excel Import/Export ve Özel Rapor Oluşturucu özellikleri tamamlandı.

- **Test:** 332 test geçti (önceki: 245, yeni: +87)
- **Build:** Başarılı, tüm route'lar aktif
- **Yeni API endpoint'ler:** 6 adet
- **Yeni UI sayfalar:** 1 adet (Import Wizard)
- **Güncellenen UI sayfalar:** 2 adet (Raporlar, Adaylar)

---

## Sprint Detayları

### Sprint 1: Altyapı
- `src/lib/excel.ts` — Excel okuma fonksiyonları eklendi (`parseExcelBuffer`, `createTemplateResponse`)
- `src/app/api/imports/candidates/template/route.ts` — Şablon indirme endpoint'i
- `src/app/api/exports/firms/route.ts` — Firma export
- `src/app/api/exports/interviews/route.ts` — Mülakat export
- Raporlar sayfasına 2 yeni export butonu (Firmalar, Mülakatlar)

### Sprint 2: Backend
- `src/lib/validations.ts` — `importCandidateRowSchema` + `customReportSchema` eklendi
- `src/lib/import-helpers.ts` — Header mapping, dil parsing, veri temizleme
- `src/app/api/imports/candidates/preview/route.ts` — Önizleme (validate + duplicate check)
- `src/app/api/imports/candidates/execute/route.ts` — Toplu aday oluşturma

### Sprint 3: Import UI
- `src/app/(dashboard)/candidates/import/page.tsx` — 4 adımlı wizard (Yükle → Önizle → İçe Aktar → Sonuç)
- `src/app/(dashboard)/candidates/page.tsx` — "Toplu Yükleme" butonu eklendi

### Sprint 4: Özel Rapor Oluşturucu
- `src/lib/report-columns.ts` — 5 entity için sütun tanımları, filtreler, transform fonksiyonları
- `src/app/api/exports/custom/route.ts` — POST endpoint, dinamik Prisma sorgusu + Excel
- `src/app/(dashboard)/reports/page.tsx` — Özel rapor builder UI eklendi

### Sprint 5: Testler
- `src/lib/import-helpers.test.ts` — 28 unit test
- `src/lib/report-columns.test.ts` — 24 unit test
- `src/lib/validations.test.ts` — 39 yeni test (importCandidateRowSchema + customReportSchema)
- `src/__tests__/integration/api.test.ts` — 14 yeni integration test (firm export, interview export, bulk import, custom report)

---

## Dosya Listesi

### Yeni Dosyalar (8)
| Dosya | Amaç |
|---|---|
| `src/app/api/imports/candidates/template/route.ts` | Şablon indirme |
| `src/app/api/imports/candidates/preview/route.ts` | Yükle + validate + önizle |
| `src/app/api/imports/candidates/execute/route.ts` | Toplu aday oluşturma |
| `src/app/api/exports/firms/route.ts` | Firma Excel export |
| `src/app/api/exports/interviews/route.ts` | Mülakat Excel export |
| `src/app/api/exports/custom/route.ts` | Özel rapor export |
| `src/lib/import-helpers.ts` | Import yardımcı fonksiyonlar |
| `src/lib/report-columns.ts` | Sütun tanım registry |
| `src/app/(dashboard)/candidates/import/page.tsx` | Import wizard UI |

### Değişen Dosyalar (3)
| Dosya | Değişiklik |
|---|---|
| `src/lib/excel.ts` | `parseExcelBuffer()` + `createTemplateResponse()` eklendi |
| `src/lib/validations.ts` | `importCandidateRowSchema` + `customReportSchema` eklendi |
| `src/app/(dashboard)/reports/page.tsx` | Yeni export butonları + özel rapor builder UI |
| `src/app/(dashboard)/candidates/page.tsx` | "Toplu Yükleme" butonu eklendi |

### Yeni Test Dosyaları (2)
| Dosya | Test Sayısı |
|---|---|
| `src/lib/import-helpers.test.ts` | 28 |
| `src/lib/report-columns.test.ts` | 24 |

---

## Manuel UI Test Adımları

### Test 1: Import Wizard

1. Giriş yapın, **Adaylar** sayfasına gidin
2. **"Toplu Yükleme"** butonuna tıklayın → `/candidates/import` sayfası açılmalı
3. **Adım 1 — Yükle:**
   - "Şablonu İndir" butonuna tıklayın → `aday_sablonu.xlsx` indirilmeli
   - İndirilen Excel'i açın:
     - **Adaylar** sayfasında Türkçe başlıklar, zorunlu alanlarda `*` işareti, örnek satırlar (italic gri), dropdown'lar (Para Birimi, Maaş Tipi, Çalışma modelleri)
     - **Talimatlar** sayfasında alan açıklamaları, zorunlu/opsiyonel bilgisi, kabul edilen değerler
   - Şablonu doldurun: 2-3 geçerli satır + 1 hatalı satır (ör. ad boş bırakın)
   - Dosyayı sürükle-bırak veya "Dosya Seç" ile yükleyin
   - "Yükle ve Önizle" butonuna tıklayın
4. **Adım 2 — Önizleme:**
   - Üst kısımda özet: X geçerli (yeşil), Y uyarılı (sarı), Z hatalı (kırmızı)
   - Tablo satırları renk kodlu olmalı
   - Hatalı satırın yanındaki ok'a tıklayarak detay görebilmelisiniz
   - Checkbox'larla satır seçimi/kaldırma yapabilmelisiniz
   - "İçe Aktar" butonuna tıklayın
5. **Adım 3 — İçe Aktarma:** Spinner görünmeli
6. **Adım 4 — Sonuç:**
   - Kaç başarılı, kaç hatalı gösterilmeli
   - "Aday Listesine Git" butonu çalışmalı
   - Aday listesinde yeni eklenen adaylar görünmeli

### Test 2: Yeni Export Butonları

1. **Raporlar** sayfasına gidin
2. Export butonlarından **"Firmalar Excel"** tıklayın → `.xlsx` indirilmeli
3. **"Mülakatlar Excel"** tıklayın → `.xlsx` indirilmeli
4. İndirilen dosyaları açıp kontrol edin:
   - Firmalar: Ad, Sektör, Büyüklük, Şehir, Website, Açık Pozisyon, Toplam Süreç, İletişim bilgileri
   - Mülakatlar: Tarih, Saat, Tür, Aday, Firma, Pozisyon, Konum/Link, Tamamlandı, Notlar

### Test 3: Özel Rapor Oluşturucu

1. **Raporlar** sayfasında aşağı kaydırın → **"Özel Rapor Oluşturucu"** bölümü
2. **Veri tipi** seçin (ör. "Adaylar")
   - Veri tipi değiştirince sütunlar ve filtreler sıfırlanmalı
3. **Sütun seçimi:**
   - "Tümünü Seç" tıklayın → tüm sütunlar seçili (indigo arka plan + tik)
   - "Temizle" tıklayın → hepsi kaldırılmalı
   - Tek tek tıklayarak birkaç sütun seçin (ör. Ad, Soyad, E-posta, Şehir)
   - Sayaç doğru göstermeli: "Sütunlar (4 / 20)"
4. **Filtre** ekleyin (ör. Durum: Aktif)
5. **Sıralama** seçin (ör. Kayıt Tarihi, Azalan)
6. **Tarih aralığı** girin (opsiyonel)
7. **"Raporu İndir"** butonuna tıklayın → `ozel_rapor_candidates_*.xlsx` indirilmeli
8. Excel'i açın: sadece seçtiğiniz sütunlar + filtrelenmiş veri olmalı
9. Diğer entity tipleri de deneyin:
   - **Firmalar** → Firma Adı, Sektör, Açık Pozisyon sayısı
   - **Pozisyonlar** → Firma adı ile birlikte, durum/öncelik filtreleri
   - **Süreçler** → Aday, Firma, Pozisyon adlarıyla, aşama filtresi
   - **Mülakatlar** → Aday/Firma/Pozisyon bilgileriyle, tür/tamamlanma filtresi
10. Hata kontrolleri:
    - Sütun seçmeden "Raporu İndir" → buton disabled olmalı
    - Hiç veri yoksa (çok dar filtre) → boş Excel inmeli (sadece başlık satırı)

---

## Test Sonuçları

```
Test Files  8 passed (8)
     Tests  332 passed (332)
  Duration  16.49s

Breakdown:
  - validations.test.ts:      160 tests
  - integration/api.test.ts:   85 tests
  - import-helpers.test.ts:    28 tests
  - report-columns.test.ts:    24 tests
  - utils.test.ts:             15 tests
  - audit.test.ts:             10 tests
  - excel.test.ts:              5 tests
  - email.test.ts:              5 tests
```

Build: Başarılı (Next.js 16.1.6, Turbopack, 56 route)
