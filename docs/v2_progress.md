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

---

## Kalan Özellikler

| # | Özellik | Öncelik | Açıklama | Durum |
|---|---------|---------|----------|-------|
| 1 | **AI CV Parsing** | Yüksek | PDF/Word CV yükleyince yapay zeka ile otomatik aday formu doldurma | Bekliyor |
| 2 | **AI Aday-Pozisyon Eşleştirme** | Yüksek | Pozisyon açıldığında en uygun adayları otomatik puanlama ve sıralama | Bekliyor |
| 3 | **LinkedIn / Kariyer.net Entegrasyonu** | Orta | Tek tıkla profil aktarma, otomatik başvuru senkronizasyonu | Bekliyor |
| 4 | **Teams / Zoom Otomatik Toplantı** | Orta | Mülakat oluştururken otomatik toplantı linki + davetiye e-postası | Bekliyor |
| 5 | **Aday Self-Service Portalı** | Orta | Adaylar kendi başvurularını takip edebileceği portal | Bekliyor |
| 6 | **Çok Dilli Destek** | Düşük | Türkçe + İngilizce + potansiyel Arapça arayüz desteği | Bekliyor |
| 7 | **Mobil Uygulama** | Düşük | iOS + Android native uygulama | Bekliyor |

---

## Genel Durum

| Metrik | Değer |
|--------|-------|
| **Tamamlanan özellik** | 2 / 9 |
| **Toplam test** | 332 |
| **Test dosyası** | 8 |
| **API route** | 56 |
| **Build** | Başarılı (Next.js 16.1.6, Turbopack) |
| **Son commit** | `e671ae3` — Kanban DnD |
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
