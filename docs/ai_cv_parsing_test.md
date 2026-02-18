# AI CV Parsing — Test Raporu

## Özellik Özeti

Yeni aday oluştururken veya mevcut adayın belgeler tabında CV (PDF/DOCX) yükleyerek yapay zeka ile aday bilgilerinin otomatik çıkarılması.

### Teknik Detaylar

| Öğe | Değer |
|-----|-------|
| **AI Servisi** | Anthropic Claude (Sonnet 4) |
| **Dosya Depolama** | Vercel Blob (`@vercel/blob`) |
| **DOCX Parser** | mammoth |
| **Yeni API route** | `/api/documents/upload`, `/api/documents/parse-cv` |
| **Yeni bileşen** | `cv-upload.tsx`, `document-upload.tsx` |
| **Build** | Hatasız (58 route) |
| **Test** | 357/357 geçiyor (+25 yeni) |

### Eklenen Özellikler

- CV yükle → Vercel Blob'a kaydet → AI ile analiz et → form alanlarını otomatik doldur
- PDF: Claude'a base64 document olarak gönderilir (native PDF okuma)
- DOCX: mammoth ile metin çıkarılır, sonra Claude'a gönderilir
- Aday detay sayfasında belgeler tabına dosya yükleme
- Optimistic UX: yükleme ve analiz ayrı adımlarda, kullanıcı kontrolünde
- Hata durumlarında graceful fallback (form hâlâ kullanılabilir)

---

## Ön Koşullar

`.env.local` dosyasında aşağıdaki anahtarların tanımlı olması gerekir:

```
ANTHROPIC_API_KEY=sk-ant-xxxxx
BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx
```

Test için bir örnek PDF veya DOCX CV dosyası hazırlayın. İçinde ad, soyad, e-posta, telefon, iş deneyimi, eğitim ve dil bilgileri bulunan bir CV idealdir.

---

## Manuel UI Test Adımları

### Test 1: CV ile Hızlı Aday Oluşturma (Ana Akış)

1. `/candidates/new` sayfasına git
2. **Beklenen:** Formun üstünde mor renkli "CV ile Hızlı Oluşturma" kartı görünmeli
   - Sparkle ikonu + "CV yükleyerek aday bilgilerini otomatik doldurun" açıklaması
3. Bir PDF CV dosyasını sürükle veya "seçin" yazısına tıklayarak seç
4. **Beklenen:** Dosya adı ve boyutu görünmeli, "Yükle" ve "Kaldır" butonları
5. **"Yükle"** butonuna tıkla
6. **Beklenen:** Spinner → "Yükleniyor..." → yeşil kutuda "dosya_adi.pdf yüklendi" mesajı
7. **"AI ile Analiz Et"** butonuna (mor, sparkle ikonu) tıkla
8. **Beklenen:** Mor spinner → "CV analiz ediliyor..." (3-10 saniye sürebilir)
9. **Beklenen:** Yeşil kutuda "CV başarıyla analiz edildi — alanları kontrol edin" mesajı
10. **Beklenen:** Mor uyarı banner: "AI tarafından doldurulan alanları kontrol edin ve gerekirse düzeltin"
11. **Beklenen:** Form alanları otomatik dolu olmalı:
    - Ad, Soyad
    - E-posta, Telefon
    - LinkedIn URL (varsa)
    - Mevcut Pozisyon, Sektör
    - Toplam Deneyim (Yıl)
    - Eğitim Seviyesi, Üniversite, Bölüm
    - Şehir, Ülke
    - Yabancı Diller (otomatik eklenmiş olmalı)
12. Gerekirse alanları düzelt veya eksikleri tamamla
13. **"Kaydet"** butonuna tıkla
14. **Beklenen:** Aday oluşturulup detay sayfasına yönlendirilmeli
15. Aday detay sayfasında "Belgeler" tabına tıkla
16. **Beklenen:** Yüklenen CV dosyası belge olarak listelenmiş olmalı

### Test 2: DOCX CV ile Analiz

1. `/candidates/new` sayfasına git
2. Bir DOCX formatında CV yükle (aynı adımlar: sürükle → yükle → analiz)
3. **Beklenen:** DOCX dosyası da başarıyla analiz edilmeli, form alanları dolmalı
4. PDF ile aynı akış sorunsuz çalışmalı

### Test 3: Farklı Dosya Seçme

1. Bir CV yükle ve "AI ile Analiz Et" aşamasına gel
2. **"Farklı Dosya"** butonuna tıkla
3. **Beklenen:** Yükleme alanı sıfırlanmalı, drop zone tekrar görünmeli
4. Yeni bir CV seçip tekrar yükle ve analiz et
5. **Beklenen:** Yeni CV'nin bilgileri ile form dolmalı

### Test 4: Analiz Sonrası Manuel Düzenleme

1. CV yükle ve AI analiz ettir
2. Form alanlarını değiştir (ör. şehir bilgisini düzelt)
3. Yeni bir dil ekle (Dil Ekle butonu ile)
4. **"Kaydet"** tıkla
5. **Beklenen:** Düzeltilmiş bilgilerle aday oluşturulmalı (AI'ın doldurduğu değil, düzeltilmiş hali)

### Test 5: CV Olmadan Normal Kayıt

1. `/candidates/new` sayfasına git
2. CV yüklemeden, form alanlarını elle doldur
3. **"Kaydet"** tıkla
4. **Beklenen:** Aday normal şekilde oluşturulmalı (CV upload bölümü engellemez)

### Test 6: Aday Detay — Belge Yükleme

1. Mevcut bir adayın detay sayfasına git (ör. `/candidates/[id]`)
2. **"Belgeler"** tabına tıkla
3. **Beklenen:** Üstte dosya yükleme alanı: "Belge yükle (PDF, DOCX — Maks. 10MB)"
4. Bir dosya sürükle veya tıklayarak seç
5. **Beklenen:** Spinner → yükleme tamamlanır → belge listesine yeni dosya eklenir
6. **"İndir"** linkine tıkla
7. **Beklenen:** Dosya yeni sekmede açılmalı veya indirilmeli

### Test 7: Desteklenmeyen Dosya Formatı

1. `/candidates/new` → CV yükleme alanına `.txt` veya `.jpg` dosyası sürükle
2. **Beklenen:** Kırmızı hata: "Desteklenmeyen format. PDF veya DOCX yükleyin."
3. "Tekrar Dene" butonuna tıkla
4. **Beklenen:** Drop zone tekrar görünmeli

### Test 8: Büyük Dosya

1. 10MB'dan büyük bir dosya seç
2. **Beklenen:** Kırmızı hata: "Dosya boyutu 10MB'ı aşamaz."
3. "Tekrar Dene" ile normal boyutta dosya yüklenebilmeli

### Test 9: AI API Hatası

1. `.env.local`'den `ANTHROPIC_API_KEY`'i geçici olarak sil veya yanlış yap
2. CV yükle → "AI ile Analiz Et" tıkla
3. **Beklenen:** Kırmızı hata mesajı (ör. "AI analiz hatası" veya API hata mesajı)
4. "Tekrar Dene" butonuna tıkla → drop zone'a dönmeli
5. Form hâlâ elle doldurulabilir olmalı (AI hatası formu engellemez)
6. API key'i geri koy

### Test 10: Sürükle-Bırak (Drag & Drop)

1. `/candidates/new` → CV kartının drop zone'u üzerine dosya sürükle (bırakmadan)
2. **Beklenen:** Drop zone mor/violet renkte vurgulanmalı (border + arka plan değişimi)
3. Dosyayı bırak
4. **Beklenen:** Dosya seçilmeli, adı ve boyutu görünmeli

---

## Tarih

- **Geliştirme:** 2026-02-18
- **Durum:** Tamamlandı
