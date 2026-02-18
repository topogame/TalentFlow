# Teams / Zoom Otomatik Toplantı - Manuel Test Senaryoları

## Ön Koşullar
- Uygulama çalışır durumda (`npm run dev`)
- En az 1 aday, 1 firma, 1 pozisyon, 1 aktif süreç mevcut
- Süreç sayfasında "Mülakatlar" sekmesi erişilebilir

---

## Senaryo 1: Provider Yapılandırılmamış — Mevcut Davranış
**Adımlar:**
1. Zoom/Teams env var'larını kaldırın (veya boş bırakın)
2. Süreç detay sayfasına gidin
3. "Mülakat Planla" butonuna tıklayın
4. Tür olarak "Online" seçin

**Beklenen:**
- "Toplantı Oluşturma" dropdown'u görünmez
- Sadece "Toplantı Linki" input alanı görünür (mevcut davranış)
- Manuel link girişi zorunlu

---

## Senaryo 2: Zoom Provider ile Toplantı Oluşturma
**Ön koşul:** `.env.local`'de `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` tanımlı

**Adımlar:**
1. Süreç detay sayfasına gidin
2. "Mülakat Planla" butonuna tıklayın
3. Tür: "Online" seçin
4. "Toplantı Oluşturma" dropdown'unda "Zoom Toplantısı Oluştur" seçin
5. Tarih, saat, süre girin
6. "Kaydet" butonuna tıklayın

**Beklenen:**
- "Toplantı Linki" input alanı kaybolur
- "Zoom toplantı linki otomatik oluşturulacak" bilgi mesajı görünür
- Kaydet sonrası mülakat listesinde "Zoom Linki" olarak görünür
- Link tıklanabilir ve Zoom'a yönlendirir

---

## Senaryo 3: Teams Provider ile Toplantı Oluşturma
**Ön koşul:** `.env.local`'de `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_ORGANIZER_USER_ID` tanımlı

**Adımlar:**
1. Aynı adımları "Teams Toplantısı Oluştur" seçeneği ile tekrarlayın

**Beklenen:**
- "Teams toplantı linki otomatik oluşturulacak" bilgi mesajı
- Mülakat listesinde "Microsoft Teams Linki" olarak görünür

---

## Senaryo 4: Manuel Link Girişi (Provider Varken)
**Adımlar:**
1. Provider'lar yapılandırılmış durumda
2. Online mülakat oluştururken "Manuel Link Girişi" seçin
3. Elle bir URL girin: `https://meet.google.com/abc-123`
4. Kaydedin

**Beklenen:**
- URL input alanı görünür
- Kaydedilen mülakat "Toplantı Linki" olarak gösterilir (provider badge yok)

---

## Senaryo 5: Davet E-postası Gönderme
**Ön koşul:** Adayın e-posta adresi kayıtlı

**Adımlar:**
1. Mülakat oluştururken "Adaya davet e-postası gönder" checkbox'ını işaretleyin
2. Kaydedin
3. "E-postalar" sekmesine geçin

**Beklenen:**
- E-posta logunda "Mülakat Daveti: [Pozisyon] - [Firma]" konulu kayıt görünür
- Status: "sent" (Resend yapılandırılmışsa) veya "failed"

---

## Senaryo 6: E-posta Adresi Olmayan Aday
**Adımlar:**
1. E-posta adresi boş olan bir adayın sürecine gidin
2. Mülakat formu açın

**Beklenen:**
- "Adaya davet e-postası gönder" checkbox'u görünmez

---

## Senaryo 7: Mülakatı Silme — Harici Toplantı İptali
**Adımlar:**
1. Provider ile oluşturulmuş bir mülakatı silin

**Beklenen:**
- Mülakat silinir (UI'dan kalkar)
- Harici toplantı da iptal edilir (best-effort, hata olsa da silme başarılı)

---

## Senaryo 8: Mülakatı Düzenleme
**Adımlar:**
1. Provider ile oluşturulmuş bir mülakatın "Düzenle" butonuna tıklayın

**Beklenen:**
- Mevcut provider seçili olarak gösterilir
- Toplantı linki görünür (değiştirilebilir)

---

## Senaryo 9: Kapalı Süreçte Mülakat
**Adımlar:**
1. "Olumlu" veya "Olumsuz" aşamadaki bir sürece gidin

**Beklenen:**
- "Mülakat Planla" butonu görünmez (mevcut davranış korunur)

---

## Senaryo 10: Hatalı Provider Yanıtı
**Adımlar:**
1. Geçersiz Zoom/Teams API anahtarları ile toplantı oluşturmayı deneyin

**Beklenen:**
- Hata mesajı form üzerinde görünür (kırmızı banner)
- Mülakat kaydedilmez (veri kaybı olmaz)
