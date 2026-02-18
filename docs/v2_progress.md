# TalentFlow v2 — İlerleme Özeti

**Son güncelleme:** 2026-02-18

---

## Tamamlanan Özellikler

### 1. Excel Import/Export + Özel Raporlar
**Durum:** Tamamlandı | **Commit:** `ad0c5b2`

- Excel şablonu indirme + toplu aday yükleme (4 adımlı wizard)
- Tüm entity'ler için Excel export (Adaylar, Firmalar, Pozisyonlar, Süreçler, Mülakatlar)
- Özel rapor oluşturucu (sütun seçimi, filtreler, sıralama, tarih aralığı)
- 87 yeni test eklendi (toplam: 332)
- **Detay:** [v2_sprint_report.md](v2_sprint_report.md)

### 2. Kanban Sürükle-Bırak (Drag & Drop)
**Durum:** Tamamlandı | **Commit:** `e671ae3`

- Süreçler Kanban görünümünde kartları sürükleyerek aşama değiştirme
- Optimistic UI + hata durumunda rollback
- Olumlu/Olumsuz aşamaya taşımada onay modalı (not alanı ile)
- Kapalı süreçler sürüklenemez (kilit ikonu)
- Sürükleme sırasında görsel feedback (döndürme, büyütme, hedef vurgulama)
- **Detay:** [kanban_dnd_test.md](kanban_dnd_test.md)

### 3. AI CV Parsing (Yapay Zeka ile CV Okuma)
**Durum:** Tamamlandı | **Commit:** `6ce8b47`

- CV yükle → Vercel Blob'a kaydet → AI ile analiz et → form alanlarını otomatik doldur
- PDF (Claude native) ve DOCX (mammoth) desteği
- Aday detay sayfasında belgeler tabına dosya yükleme
- 25 yeni test eklendi (toplam: 357)
- **Detay:** [ai_cv_parsing_test.md](ai_cv_parsing_test.md)

### 4. AI Aday-Pozisyon Eşleştirme
**Durum:** Tamamlandı | **Commit:** `4db6064`

- Hibrit puanlama: Kural tabanlı (%40) + Claude AI (%60)
- 7 kategori: Deneyim, Maaş, Konum, Eğitim, Beceri, Dil, Sektör
- Pozisyon detayında "Önerilen Adaylar" bölümü (puan rozeti, bar grafik, kategori açıklamaları)
- "Sürece Ekle" ile tek tıkla aday havuza ekleme
- Pozisyon formlarına 4 yeni alan: Gerekli Beceriler, Sektör Tercihi, Eğitim Gereksinimi, Dil Gereksinimi
- AI hatası durumunda graceful fallback
- 67 yeni test eklendi (toplam: 424)
- **Detay:** [ai_matching_test.md](ai_matching_test.md)

### 5. Teams / Zoom Otomatik Toplantı
**Durum:** Tamamlandı | **Commit:** (bekliyor)

- Zoom Server-to-Server OAuth + Teams Application Permissions entegrasyonu
- Mülakat formunda "Toplantı Oluşturma" seçici (Zoom/Teams/Manuel)
- Otomatik toplantı linki oluşturma + meetingId ile takip
- Adaya davet e-postası gönderme seçeneği (checkbox)
- Mülakat silindiğinde harici toplantı otomatik iptal (best-effort)
- Provider yapılandırılmamışsa mevcut manuel akış korunur (graceful fallback)
- 26 yeni test eklendi (toplam: 450)
- **Detay:** [meeting_integration_test.md](meeting_integration_test.md)

---

## Kalan Özellikler

| # | Özellik | Öncelik | Açıklama | Durum |
|---|---------|---------|----------|-------|
| 1 | **LinkedIn / Kariyer.net Entegrasyonu** | Orta | Tek tıkla profil aktarma, otomatik başvuru senkronizasyonu | Bekliyor |
| 2 | **Aday Self-Service Portalı** | Orta | Adaylar kendi başvurularını takip edebileceği portal | Bekliyor |
| 3 | **Çok Dilli Destek** | Düşük | Türkçe + İngilizce + potansiyel Arapça arayüz desteği | Bekliyor |
| 4 | **Mobil Uygulama** | Düşük | iOS + Android native uygulama | Bekliyor |

---

## Genel Durum

| Metrik | Değer |
|--------|-------|
| **Tamamlanan özellik** | 5 / 9 |
| **Toplam test** | 450 |
| **Test dosyası** | 12 |
| **API route** | 61 |
| **Build** | Başarılı (Next.js 16.1.6, Turbopack) |
| **Son commit** | `4db6064` — AI Matching |
| **Branch** | `master` |

---

## Faz Durumu (AI_METHODOLOGY)

| Faz | Açıklama | Durum |
|-----|----------|-------|
| 1A | Fikir Doğrulama & Vizyon | Tamamlandı |
| 1B | Kullanıcı Deneyimi Planlaması | Tamamlandı |
| 1C | Teknik Kapsam | Tamamlandı |
| 2 | Mimari & Tasarım | Tamamlandı |
| 3 | Veritabanı Tasarımı | Tamamlandı |
| 4 | API Tasarımı | Tamamlandı |
| 5 | Proje Kurulumu | Tamamlandı |
| **6** | **Geliştirme (İteratif)** | **Devam ediyor** |
| 7 | Güvenlik Denetimi | Bekliyor |
| 8 | Test & QA | Bekliyor |
| 9 | Dağıtım Hazırlığı | Bekliyor |
| 10 | Yayın & Teslim | Bekliyor |
