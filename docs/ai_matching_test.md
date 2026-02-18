# AI Aday-Pozisyon Eşleştirme — Test Raporu

## Özellik Özeti

Pozisyon detay sayfasında "AI Eşleşme Analizi Yap" butonuna tıklayarak havuzdaki adayları yapay zeka + kural tabanlı hibrit puanlama ile otomatik sıralama.

### Teknik Detaylar

| Öğe | Değer |
|-----|-------|
| **AI Servisi** | Anthropic Claude (Sonnet 4) |
| **Puanlama** | Hibrit: Kural tabanlı (%40) + AI (%60) |
| **Yeni API route** | `/api/positions/[id]/match-candidates` |
| **Yeni test dosyası** | `ai-matching.test.ts` |
| **Build** | Hatasız (60 route) |
| **Test** | 424/424 geçiyor (+67 yeni) |

### Puanlama Kategorileri

| Kategori | Ağırlık | Tür | Açıklama |
|----------|---------|-----|----------|
| Beceri/Yetkinlik | %25 | AI | Unvan, sektör vs pozisyon gereksinimleri |
| Sektör Uyumu | %20 | AI | Aday sektörü vs pozisyon sektör tercihi |
| Dil | %15 | AI | Aday dilleri vs pozisyon dil gereksinimi |
| Deneyim | %12 | Kural | totalExperienceYears vs minExperienceYears |
| Maaş Uyumu | %12 | Kural | salaryExpectation vs salaryMin/Max |
| Konum | %8 | Kural | Şehir + çalışma modeli uyumu |
| Eğitim | %8 | Kural | Eğitim seviyesi hiyerarşisi |

### Eklenen Özellikler

- Pozisyon formlarına (yeni + düzenle) 4 yeni alan: Gerekli Beceriler, Sektör Tercihi, Eğitim Gereksinimi, Dil Gereksinimi
- Pozisyon detay sayfasında bu alanların gösterimi
- "Önerilen Adaylar" bölümü: puan rozeti, kategori detayı, sürece ekleme
- AI hatası durumunda graceful fallback (sadece kural tabanlı puanlar)
- Kapalı pozisyonlarda eşleştirme butonu gizlenir

---

## Ön Koşullar

`.env.local` dosyasında aşağıdaki anahtarların tanımlı olması gerekir:

```
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

Seed verilerinde açık pozisyonlar ve aktif adaylar bulunmalıdır.

---

## Manuel UI Test Adımları

### Test 1: Pozisyon Formunda Yeni Alanlar

1. `/positions/new` sayfasına git
2. **Beklenen:** Pozisyon Bilgileri kartında yeni alanlar görünmeli:
   - Sektör Tercihi (text input, placeholder: "ör. Teknoloji, Finans")
   - Eğitim Gereksinimi (text input, placeholder: "ör. Lisans")
   - Dil Gereksinimi (text input, placeholder: "ör. İngilizce (İleri), Almanca (Orta)")
   - Gerekli Beceriler (textarea, placeholder: "ör. React, TypeScript, Node.js, SQL")
3. Tüm alanları doldur + firma seç + başlık yaz
4. **"Kaydet"** tıkla
5. **Beklenen:** Pozisyon oluşturulmalı, detay sayfasına yönlendirilmeli
6. **Beklenen:** Detay sayfasında yeni alanlar görünmeli:
   - "Gerekli Beceriler" bölümü
   - Sektör Tercihi, Eğitim Gereksinimi, Dil Gereksinimi satırları

### Test 2: Pozisyon Düzenleme — Yeni Alanlar

1. Mevcut bir pozisyonun düzenle sayfasına git (`/positions/[id]/edit`)
2. **Beklenen:** Yeni alanlar mevcut değerlerle dolu (veya boş)
3. Alanları güncelle
4. **"Güncelle"** tıkla
5. **Beklenen:** Detay sayfasında güncellenmiş değerler görünmeli

### Test 3: AI Eşleşme Analizi (Ana Akış)

1. Açık durumda bir pozisyonun detay sayfasına git
2. **Beklenen:** Sayfanın altında "Önerilen Adaylar" bölümü görünmeli
3. **Beklenen:** Mor renkli "AI Eşleşme Analizi Yap" butonu (sparkle ikonu ile)
4. **Beklenen:** Alt bilgi: "AI ile adayları analiz etmek için yukarıdaki butona tıklayın"
5. **"AI Eşleşme Analizi Yap"** butonuna tıkla
6. **Beklenen:** Spinner + "Adaylar analiz ediliyor..." (3-10 saniye)
7. **Beklenen:** Adaylar puanla sıralı listelenir (en yüksek puan üstte)
8. Her adayda:
   - Puan rozeti: yeşil (75-100), sarı (50-74), kırmızı (0-49)
   - Aday adı (tıklanabilir link), mevcut unvan, sektör, şehir
   - "Sürece Ekle" butonu

### Test 4: Kategori Detayı

1. Test 3'ü tamamla (aday listesi görünür)
2. Bir adayın satırına tıkla
3. **Beklenen:** Kategori detayı açılmalı:
   - 7 kategori: Deneyim, Maaş Uyumu, Konum, Eğitim, Beceri/Yetkinlik, Dil, Sektör Uyumu
   - Her kategori için: renkli bar grafik + puan (0-100) + açıklama
4. Aynı adaya tekrar tıkla
5. **Beklenen:** Detay kapanmalı

### Test 5: Sürece Ekle

1. Test 3'ü tamamla (aday listesi görünür)
2. Bir adayın "Sürece Ekle" butonuna tıkla
3. **Beklenen:** Buton loading durumuna geçmeli (spinner)
4. **Beklenen:** Aday başarıyla eklendikten sonra:
   - Aday önerilen listesinden kalkmalı
   - Sağ üst "Süreçler" kartında yeni süreç ("Havuzda" aşamasında) görünmeli
5. Süreçler kartındaki aday linkine tıkla
6. **Beklenen:** Aday detay sayfasına yönlendirilmeli

### Test 6: Yeniden Analiz

1. Test 3 ve 5'i tamamla (bir aday eklendi)
2. **Beklenen:** Buton metni "Yeniden Analiz Et" olarak değişmeli
3. "Yeniden Analiz Et" butonuna tıkla
4. **Beklenen:** Yeni analiz yapılmalı, daha önce eklenen aday listede olmamalı

### Test 7: Boş Sonuç

1. Tüm adayları süreçlere ekle (veya hiç aktif aday olmasın)
2. "AI Eşleşme Analizi Yap" tıkla
3. **Beklenen:** "Uygun aday bulunamadı" mesajı (boş durum ikonu ile)

### Test 8: AI API Hatası (Graceful Fallback)

1. `.env.local`'den `ANTHROPIC_API_KEY`'i geçici olarak sil veya yanlış yap
2. Açık bir pozisyonda "AI Eşleşme Analizi Yap" tıkla
3. **Beklenen:** Adaylar yine listelenmeli (kural tabanlı puanlarla)
4. **Beklenen:** Sarı uyarı banner: "AI analizi yapılamadı, sadece kural tabanlı puanlama kullanıldı"
5. Kategori detayında "skills", "language", "sector" açıklamaları "AI analizi yapılamadı" olmalı
6. API key'i geri koy

### Test 9: Kapalı Pozisyonda Eşleştirme Yok

1. `closed` veya `on_hold` durumunda bir pozisyonun detay sayfasına git
2. **Beklenen:** "Önerilen Adaylar" bölümü görünmemeli (buton yok)

### Test 10: Puan Renkleri Doğrulaması

1. Eşleşme analizi yap
2. **Beklenen:** Farklı puanlar farklı renklerde:
   - 75-100: Yeşil rozet (emerald)
   - 50-74: Sarı rozet (amber)
   - 0-49: Kırmızı rozet (rose)
3. Kategori bar grafiklerinde de aynı renk mantığı geçerli olmalı

---

## Tarih

- **Geliştirme:** 2026-02-18
- **Durum:** Tamamlandı
