# LinkedIn / Kariyer.net Entegrasyonu — Manuel Test Adımları

## Ön Koşullar
- Uygulama çalışıyor (`npm run dev`)
- Danışman hesabıyla giriş yapılmış
- Seed data yüklenmiş (`npx prisma db seed`)

---

## A. LinkedIn Profil Yapıştır (Aday Formu)

### Test 1: LinkedIn profil metni ile aday formu doldurma
1. Sol menüden **Adaylar** → **Yeni Aday** butonuna tıkla
2. CV Upload bölümünün altında **"LinkedIn Profil Yapıştır"** butonunu gör
3. Butona tıkla → metin alanı açılır
4. Aşağıdaki örnek metni yapıştır:

```
Ahmet Yılmaz
İstanbul, Türkiye

Yazılım Mühendisi | TechCorp

Deneyim:
- Senior Yazılım Mühendisi, TechCorp (2021 - Günümüz)
- Yazılım Mühendisi, StartupXYZ (2018 - 2021)

Eğitim:
- Boğaziçi Üniversitesi, Bilgisayar Mühendisliği, Lisans (2014 - 2018)

Diller:
- İngilizce: İleri düzey
- Almanca: Orta düzey

Beceriler:
React, TypeScript, Node.js, PostgreSQL
```

5. **"AI ile Analiz Et"** butonuna tıkla
6. Beklenen: Loading göstergesi → form alanları dolmuş olmalı
7. Doğrula: Ad=Ahmet, Soyad=Yılmaz, Şehir=İstanbul, Pozisyon=Senior Yazılım Mühendisi
8. Mor banner: "AI tarafından doldurulan alanları kontrol edin" mesajı görünmeli

### Test 2: Kısa metin uyarısı
1. LinkedIn metin alanına "Kısa metin" yaz (50 karakterden az)
2. "AI ile Analiz Et" butonu disabled olmalı
3. Tıklarsan "Profil metni en az 50 karakter olmalıdır" uyarısı

### Test 3: Modalı kapatma
1. LinkedIn metin alanını aç
2. Sağ üst köşedeki X butonuna tıkla
3. Modal kapanır, form değişmez

---

## B. Kariyer.net CSV Import

### Test 4: CSV dosyası ile toplu aday yükleme
1. Sol menüden **Adaylar** → **İçe Aktar** butonuna tıkla
2. Dosya yükleme alanında ".xlsx veya .csv dosyaları" yazdığını doğrula
3. Aşağıdaki içerikle bir `test.csv` dosyası oluştur:

```csv
İsim,Soyisim,E-Posta,Telefon,Şehir,Pozisyon,Sektör,Deneyim Süresi,Eğitim Durumu
Fatma,Kara,fatma@test.com,+90 532 1111111,Ankara,Proje Yöneticisi,Finans,8,Lisans
Mehmet,Demir,mehmet@test.com,+90 533 2222222,İzmir,Muhasebeci,Finans,5,Lisans
```

4. CSV dosyasını yükle
5. Beklenen: "Kariyer.net formatı algılandı" uyarı mesajı
6. Önizleme tablosunda 2 satır görünmeli
7. Ad/Soyad/E-posta sütunları doğru eşleşmiş olmalı
8. "Seçilenleri İçe Aktar" ile devam et

### Test 5: TalentFlow şablonu hala çalışıyor
1. "Şablonu İndir" butonuyla .xlsx şablonunu indir
2. Birkaç satır doldur
3. Tekrar yükle → format "talentflow" olarak algılanmalı → mevcut akış devam eder

---

## C. İlan Metni Yapıştır (Pozisyon Formu)

### Test 6: İş ilanı metni ile pozisyon formu doldurma
1. Sol menüden **Pozisyonlar** → **Yeni Pozisyon** butonuna tıkla
2. Formun üstünde **"İlan Metni Yapıştır"** butonunu gör
3. Butona tıkla → metin alanı açılır
4. Aşağıdaki örnek metni yapıştır:

```
Senior Frontend Developer — TechCorp

Konum: İstanbul (Hibrit çalışma modeli)
Departman: Mühendislik

Maaş: 50.000 - 80.000 TRY

Aranan Nitelikler:
- Minimum 5 yıl frontend deneyimi
- React, TypeScript, Next.js bilgisi
- Lisans mezunu (Bilgisayar Mühendisliği tercihen)
- İngilizce ileri düzey

Sorumluluklar:
- Kullanıcı arayüzlerinin geliştirilmesi
- Kod incelemeleri ve teknik mentorluk
- Performans optimizasyonu

Sektör: Teknoloji
```

5. **"AI ile Analiz Et"** butonuna tıkla
6. Beklenen: Loading → form alanları dolmuş olmalı
7. Doğrula: Başlık=Senior Frontend Developer, Şehir=İstanbul, Çalışma Modeli=Hibrit
8. Maaş: Min=50000, Max=80000, TRY
9. Gerekli Beceriler, Dil Gereksinimi, Eğitim Gereksinimi alanları dolu olmalı
10. İndigo banner: "AI tarafından doldurulan alanları kontrol edin"

### Test 7: Kısa metin uyarısı
1. İlan metin alanına "Kısa" yaz (30 karakterden az)
2. "AI ile Analiz Et" butonu disabled olmalı

### Test 8: Pozisyon formu kontrollü state
1. İlan yapıştır ile formu doldur
2. Manuel olarak bir alanı değiştir (ör. Başlık)
3. Formu kaydet → değişiklik korunmuş olmalı

---

## D. Genel Kontroller

### Test 9: AI hatası durumu
1. ANTHROPIC_API_KEY'i geçici olarak boş yap (.env.local)
2. LinkedIn metin analizi veya ilan analizi yap
3. Hata mesajı modal içinde gösterilmeli, form bozulmamalı

### Test 10: Mevcut akışlar (Regression)
1. CV yükleme (PDF/DOCX) hala çalışıyor mu?
2. Excel import hala çalışıyor mu?
3. AI eşleştirme hala çalışıyor mu?
