# i18n Manuel UI Test Adimlar

## Onkosu

1. `npm run dev` ile uygulamayi baslatin
2. Tarayicida `http://localhost:3000` adresine gidin
3. Varsayilan dil **Turkce** olmali

---

## Test 1: Dil Degistirici

- [ ] Sag ustteki **"EN"** butonuna tiklayin — sayfa yeniden yuklenecek, tum arayuz Ingilizce'ye donecek
- [ ] **"TR"** butonuna tiklayin — Turkce'ye geri donecek
- [ ] Sayfayi yenileyin (F5) — secilen dil korunmali (cookie kaydediliyor)
- [ ] Tarayici DevTools > Application > Cookies'te `NEXT_LOCALE` cookie'sini kontrol edin (`tr` veya `en`)

---

## Test 2: Login Sayfasi

- [ ] `/login` sayfasina gidin
- [ ] TR modda: "Giris Yap", "E-posta", "Sifre", "Sifremi Unuttum" gorunmeli
- [ ] EN'e gecin: "Sign In", "Email", "Password", "Forgot Password" gorunmeli
- [ ] Hatali giris yapin — hata mesaji secilen dilde gorunmeli

---

## Test 3: Dashboard

- [ ] `/dashboard` sayfasina gidin
- [ ] TR: Istatistik kartlari (Aktif Adaylar, Acik Pozisyonlar, Haftanin Mulakatlari, Yerlesim Orani)
- [ ] EN: (Active Candidates, Open Positions, Week's Interviews, Placement Rate)
- [ ] Grafik basliklari ve son aktiviteler dile gore degismeli
- [ ] Tarih formatlari locale'e uygun olmali (TR: 19.02.2026, EN: 2/19/2026)

---

## Test 4: Sidebar Navigasyon

- [ ] TR: Ana Menu (Dashboard, Adaylar, Firmalar, Pozisyonlar, Surecler) + Araclar (E-postalar, Takvim, Raporlar, Ayarlar)
- [ ] EN: Main Menu (Dashboard, Candidates, Firms, Positions, Processes) + Tools (Emails, Calendar, Reports, Settings)
- [ ] Mobil gorunumde (< 768px) hamburger menusunu acin — ayni ceviri kontrolu

---

## Test 5: Adaylar (Candidates)

### Liste Sayfasi (`/candidates`)
- [ ] Sayfa basligi, arama placeholder, filtre etiketleri dile gore
- [ ] Tablo baslik satirlari (Ad, E-posta, Telefon, Kaynak, Durum, Islemler)
- [ ] "Sonuc bulunamadi" mesaji (filtreleme yaparak test edin)

### Yeni Aday (`/candidates/new`)
- [ ] Form etiketleri: Ad, Soyad, E-posta, Telefon, LinkedIn, Deneyim, Egitim vb.
- [ ] Egitim secenekleri (Lise, On Lisans, Lisans, Yuksek Lisans, Doktora)
- [ ] Dil isimleri ve seviyeleri
- [ ] Kaydet/Iptal butonlari

### Aday Detay (`/candidates/[id]`)
- [ ] Sekme basliklari (Surecler, Notlar, Belgeler)
- [ ] Iletisim ve profesyonel bilgi etiketleri
- [ ] Portal erisimi gonder butonu ve mesajlari
- [ ] Tarih ve maas formatlari locale'e uygun

### Aday Duzenle (`/candidates/[id]/edit`)
- [ ] Form etiketleri yeni adayla ayni sekilde cevrili olmali
- [ ] Basari/hata mesajlari

### Aday Iceri Aktar (`/candidates/import`)
- [ ] 4 adim etiketleri (Dosya Yukle, Onizleme, Iceaktarma, Sonuclar)
- [ ] Tablo basliklari ve durum etiketleri

---

## Test 6: Firmalar (Firms)

### Liste (`/firms`)
- [ ] Sayfa basligi, arama, filtre etiketleri

### Yeni Firma (`/firms/new`)
- [ ] Form etiketleri: Firma Adi, Sektor, Buyukluk, Sehir, Ulke, Website, Notlar

### Firma Detay (`/firms/[id]`)
- [ ] Firma bilgileri bolumu, surecler, pozisyonlar

### Firma Duzenle (`/firms/[id]/edit`)
- [ ] Form etiketleri + basari/hata mesajlari

---

## Test 7: Pozisyonlar (Positions)

### Liste (`/positions`)
- [ ] Durum ve oncelik filtreleri dile gore (Acik/Kapali, Dusuk/Yuksek vb.)

### Yeni Pozisyon (`/positions/new`)
- [ ] Form etiketleri: Firma, Baslik, Departman, Deneyim, Maas Araligi, Beceriler
- [ ] Oncelik secenekleri (Dusuk/Normal/Yuksek/Acil)
- [ ] Calisma modeli (Ofis/Uzaktan/Hibrit)

### Pozisyon Detay (`/positions/[id]`)
- [ ] Detay kartlari, surecler, AI eslestirme butonu
- [ ] Maas ve deneyim formatlari

### Pozisyon Duzenle (`/positions/[id]/edit`)
- [ ] Form + basari/hata mesajlari

---

## Test 8: Surecler (Processes)

### Liste (`/processes`)
- [ ] Asama filtreleri (Havuz, Ilk Gorusme, Sunuldu vb.)

### Yeni Surec (`/processes/new`)
- [ ] Aday, Pozisyon, Firma secim etiketleri

### Surec Detay (`/processes/[id]`)
- [ ] Asama degisikligi, mulakat ekleme, not ekleme, belge yukleme
- [ ] E-posta gonderme modali
- [ ] Tarih/saat formatlari

---

## Test 9: E-postalar (`/emails`)

- [ ] Sekme etiketleri (Gelen Kutusu, Gonderilenler, Sablonlar)
- [ ] Sablon olusturma/duzenleme formu
- [ ] E-posta yazma modali
- [ ] Durum etiketleri (Gonderildi, Basarisiz)

---

## Test 10: Takvim (`/calendar`)

- [ ] Gun ve ay isimleri dile gore (Pazartesi..Pazar / Monday..Sunday)
- [ ] "Bugun", "Ay", "Hafta" butonlari
- [ ] Mulakat detay modali etiketleri
- [ ] Tip etiketleri (Yuz Yuze, Online, Telefon)

---

## Test 11: Raporlar (`/reports`)

- [ ] Rapor turu secenekleri
- [ ] Tarih araligi etiketleri
- [ ] Grafik basliklari ve tooltip'ler
- [ ] Disa aktar butonu

---

## Test 12: Ayarlar (`/settings`)

- [ ] Sekme etiketleri (Profil, Kullanicilar, Denetim Kaydi)
- [ ] Kullanici ekleme formu (Ad, Soyad, E-posta, Sifre, Rol)
- [ ] Rol etiketleri (Admin, Danisan)
- [ ] Denetim kaydi tablo basliklari

---

## Test 13: Portal (Aday Tarafi)

### Portal Login (`/portal/login`)
- [ ] Baslik ve aciklama metinleri

### Portal Ana Sayfa (`/portal`)
- [ ] Basvurularim basligi
- [ ] Basvuru kartlari
- [ ] "Henuz aktif basvurunuz yok" bos durumu

### Portal Profil (`/portal/profile`)
- [ ] Kisisel ve profesyonel bilgi etiketleri
- [ ] Dil seviyeleri

### Portal E-postalar (`/portal/emails`)
- [ ] Tablo basliklari (Konu, Tarih, Durum)

### Portal Surec Detay (`/portal/processes/[id]`)
- [ ] Asama bilgisi, mulakatlar, belgeler

---

## Test 14: Header & Genel

- [ ] Sag ust profil dropdown: "Profil", "Cikis Yap" / "Profile", "Sign Out"
- [ ] Rol etiketi: "Admin" / "Danisan" — "Admin" / "Consultant"
- [ ] 404 sayfasi (`/nonexistent`): baslik ve mesaj dile gore
- [ ] Portal header: navigasyon + cikis butonu

---

## Test 15: Bileslenler (Components)

- [ ] CV Yukleme: Dosya surukle-birak alani, format/boyut bilgisi, yukleme durumu
- [ ] LinkedIn Yapistir: Adim adim talimatlar, yapistirma alani
- [ ] Is Ilani Yapistir: Adim adim talimatlar, yapistirma alani
- [ ] Belge Yukleme: Dosya format/boyut bilgisi

---

## Sonuc

- [ ] Tum sayfalarda Turkce/Ingilizce gecis sorunsuz calisiyor
- [ ] Hicbir sayfada hardcoded Turkce metin kalmadigini dogrulayin (EN modda)
- [ ] Tarih/saat/sayi formatlari locale'e uygun
- [ ] Cookie (NEXT_LOCALE) sayfa yenilemelerinde korunuyor
