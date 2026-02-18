# Aday Self-Service Portalı — Manuel Test Senaryoları

## Ön Koşullar
- Uygulama çalışıyor (`npm run dev`)
- Veritabanında en az 1 aday, 1 süreç, 1 mülakat mevcut (seed data yeterli)
- Resend API key yapılandırılmış (`.env.local`)

---

## Test 1: Portal Erişimi Gönder — Danışman Tarafı

1. Dashboard'a giriş yapın (danışman hesabı)
2. **Adaylar** → e-posta adresi olan bir adayı seçin
3. Aday detay sayfasında sağ üstte **"Portal Erişimi Gönder"** butonunu görmelisiniz
4. Butona tıklayın
5. **Beklenen:** Yeşil bildirim "Portal erişim bağlantısı gönderildi!" çıkmalı
6. 5 saniye sonra bildirim kaybolmalı

## Test 2: E-posta'sız Aday — Buton Disabled

1. E-posta adresi olmayan bir aday açın
2. **Beklenen:** "Portal Erişimi Gönder" butonu soluk (disabled) olmalı
3. Butona tıklayamayın, hover'da "Aday e-posta adresi gerekli" tooltip görünmeli

## Test 3: Portal Giriş — Geçerli Token

1. Test 1'deki e-posta'dan gelen linki açın (veya token URL'ini kopyalayın)
2. Link formatı: `http://localhost:3000/portal/login?token=<64-char-hex>`
3. **Beklenen:** "Giriş yapılıyor..." spinner → otomatik `/portal`'a redirect
4. Portal dashboard açılmalı (aday adı sağ üstte)

## Test 4: Portal Giriş — Süresi Dolmuş veya Kullanılmış Token

1. Aynı linki tekrar açın (token tek kullanım)
2. **Beklenen:** Kırmızı ikon + "Bağlantı geçersiz veya süresi dolmuş." mesajı
3. "Lütfen danışmanınızdan yeni bir erişim bağlantısı isteyin." alt mesajı görünmeli

## Test 5: Portal Giriş — Token'sız URL

1. `http://localhost:3000/portal/login` adresine gidin (token parametresi yok)
2. **Beklenen:** Sarı ikon + "Portala erişmek için size gönderilen e-postadaki bağlantıyı kullanın."

## Test 6: Portal Dashboard — Başvurularım

1. Geçerli bir token ile giriş yapın
2. **Beklenen:** "Başvurularım" başlığı
3. Adayın süreçleri kart formatında listelenmeli
4. Her kartta: pozisyon başlığı, firma adı, aşama rozeti (renkli), başvuru tarihi
5. Karta tıklayın → süreç detay sayfasına yönlendirmeli

## Test 7: Portal Süreç Detay

1. Dashboard'dan bir süreç kartına tıklayın
2. **Beklenen:**
   - Pozisyon başlığı + firma adı
   - Aşama rozeti (PORTAL_STAGE_LABELS: "Değerlendirme Aşaması", "Ön Görüşme" vb.)
   - Mülakatlar listesi: tarih, tür, süre, durum (Planlandı/Tamamlandı/Bekliyor)
   - Online mülakat varsa "Toplantıya Katıl" butonu (sadece gelecek tarihli mülakatlar)
3. "← Başvurularıma Dön" linki çalışmalı

## Test 8: Portal Profil

1. Üst menüden **"Profilim"** seçin
2. **Beklenen:** Read-only profil bilgileri
   - Kişisel: ad, email, telefon, konum
   - Profesyonel: mevcut pozisyon, sektör, deneyim
   - Eğitim: seviye, üniversite, bölüm
   - Diller: dil adı ve seviye
3. Hiçbir alan düzenlenebilir olmamalı

## Test 9: Portal E-postalar

1. Üst menüden **"E-postalarım"** seçin
2. **Beklenen:** Adaya gönderilen e-postaların tablosu
   - Konu, tarih, durum (Gönderildi/Başarısız)
   - Portal erişim e-postası da bu listede görünmeli
3. E-posta yoksa: "Henüz gönderilmiş e-posta bulunmuyor."

## Test 10: Yetki Kontrolü

1. Portal'da giriş yaptıktan sonra URL'yi `/dashboard` olarak değiştirin
2. **Beklenen:** `/portal`'a redirect olmalı (adaylar dashboard'a erişemez)
3. Dashboard'a giriş yaptıktan sonra URL'yi `/portal` olarak değiştirin
4. **Beklenen:** Portal sayfası açılabilir (middleware kısıtlama yok, API guard korur)
5. Portal'dan **"Çıkış"** butonuna tıklayın
6. **Beklenen:** `/portal/login` sayfasına yönlendirmeli

---

## Kontrol Listesi

| # | Test | Durum |
|---|------|-------|
| 1 | Portal erişimi gönder butonu | ☐ |
| 2 | Email'siz aday — disabled buton | ☐ |
| 3 | Geçerli token ile giriş | ☐ |
| 4 | Kullanılmış/süresi dolmuş token | ☐ |
| 5 | Token'sız URL | ☐ |
| 6 | Portal dashboard — başvurular | ☐ |
| 7 | Süreç detay sayfası | ☐ |
| 8 | Profil sayfası | ☐ |
| 9 | E-postalar sayfası | ☐ |
| 10 | Yetki kontrolü + çıkış | ☐ |
