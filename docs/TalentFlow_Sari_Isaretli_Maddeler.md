# TalentFlow — Sarı İşaretli Test Maddeleri

## Adaylar (CAND)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| CAND-01 | Aday Listesi Yüklenmesi | Sol menüden 'Adaylar' tıkla | Aday listesi yüklenir. Mevcut 8 aday tablo formatında görünür. Her satırda ad, soyad, unvan, sektör, şehir, deneyim yılı bilgileri bulunur. | ☐ süreçler sekmesinde sadece Burak Şahin boş geliyor aktif de yazmıyor |
| CAND-06 | Sayfalama | Sayfa başına gösterim sayısını değiştir veya sonraki sayfa butonuna tıkla | Sonraki sayfadaki adaylar görünür. Sayfa numarası güncellenir. | ☐ bu alanı göremedim |
| CAND-07 | Yeni Aday Sayfası | 'Adaylar' sayfasında 'Yeni Aday' butonuna tıkla | Aday oluşturma formu açılır. Ad, Soyad, E-posta, Telefon, LinkedIn, Eğitim, Deneyim, Sektör, Unvan, Maaş, Şehir, Diller alanları bulunur. | ☐ ok ancak üniversite adı ve bölümü bilgileri de ayrı 2 alan olarak eklenmeli |
| CAND-10 | Başarılı Aday Oluşturma | 1. Ad: 'Test' 2. Soyad: 'Kullanıcı' 3. E-posta: test.kullanici@test.com 4. Telefon: +90 555 000 0000 5. Sektör: Test 6. Unvan: Test Mühendisi 7. Deneyim: 3 8. Şehir: Ankara 9. 'Kaydet' tıkla | Başarı mesajı görünür. Aday detay sayfasına yönlendirilir. Girilen bilgiler doğru şekilde gösterilir. | ☐ nok kaydetti ancak deneyim yılını 2 olarak gösterdi |
| CAND-11 | Dil Ekleme | 1. Yeni aday formunda 'Dil Ekle' butonuna tıkla 2. Dil: İngilizce, Seviye: İleri seç 3. Tekrar 'Dil Ekle' tıkla 4. Dil: Almanca, Seviye: Başlangıç seç 5. Kaydet | Aday 2 dil bilgisi ile kaydedilir. Detay sayfasında diller doğru gösterilir. | ☐ nok dil seviyesi görünüyor ancak dil bilgisi girilen alan yok |
| CAND-14 | Aday Bilgi Güncelleme | 1. Aday detayında 'Düzenle' butonuna tıkla 2. Unvanı 'Lead Software Engineer' olarak değiştir 3. Kaydet | Başarı mesajı görünür. Unvan güncellenir. | ☐ nok düzenle butonu çalışmıyor sayfa bulunamadı hatası var |

## Firmalar (FIRM)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| FIRM-06 | Firma Güncelleme | 1. Firma detayında 'Düzenle' tıkla 2. Sektörü değiştir 3. Kaydet | Firma bilgileri güncellenir. Başarı mesajı görünür. | ☐ nok düzenleme alanı yok |

## Pozisyonlar (POS)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| POS-03 | Yeni Pozisyon Oluşturma | 1. 'Yeni Pozisyon' tıkla 2. Firma: TechVista seç 3. Başlık: 'QA Engineer' 4. Departman: 'Kalite' 5. Min Deneyim: 2 6. Maaş: 40.000 - 60.000 TRY 7. Çalışma Modeli: Hibrit 8. Şehir: İstanbul 9. Öncelik: Normal 10. Kaydet | Pozisyon başarıyla oluşturulur. Detay sayfasına yönlendirilir. | ☐ nok kayıt yapılamıyor |
| POS-06 | Pozisyon Güncelleme | 1. Pozisyon detayında 'Düzenle' tıkla 2. Önceliği 'Acil' olarak değiştir 3. Kaydet | Öncelik güncellenir. Detay sayfasında 'Acil' etiketi görünür. | ☐ nok düzenle |

## Süreçler (PROC)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| PROC-11 | Uyum Puanı Güncelleme | 1. Süreç detayında uyum puanını 5'e güncelle 2. Kaydet | Uyum puanı güncellenir (5 yıldız gösterimi). | ☐ nok aday aktif bir süreçte uyarı veriyor güncelleme yapmıyor |

## Mülakatlar (INT)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| INT-03 | Mülakat Oluşturma (Yüz Yüze) | 1. Mülakat ekle 2. Tür: Yüz Yüze 3. Tarih: İleriki bir tarih 4. Konum: 'Firma Ofisi, Levent' 5. Kaydet | Mülakat oluşturulur. Konum bilgisi detayda görünür. | ☐ ok ancak süreç listesinin başına gelip filtreli alanda mülakatları listelediğimde çıkmıyor, ancak takvimde görünüyor |
| INT-05 | Geçmiş Tarih Validasyonu | 1. Mülakat ekle 2. Geçmiş bir tarih gir 3. Kaydet | 'Mülakat tarihi gelecekte olmalı' hata mesajı görünür. | ☐ nok kaydetmiyor ancak |
| INT-06 | Mülakat Güncelleme | 1. Mevcut bir mülakatın detayına git 2. Tarihi veya notları değiştir 3. Kaydet | Mülakat bilgileri güncellenir. | ☐ nok notlar değişmiyor sadece yeni not ekleme alanı var mülakat tarihi de güncellenmiyor |
| INT-07 | Mülakat Tamamlama | 1. Mevcut bir mülakatı 'Tamamlandı' olarak işaretle 2. Sonuç notu ekle | Mülakat tamamlandı olarak işaretlenir. Sonuç notu kaydedilir. | ☐ nok sadece süreçlerde aşama değiştir butonundan olumlu olumsuz seçeneği ile kapatılabiliyor mülakat tamamlandı alanı yok |
| INT-08 | Mülakat Silme | 1. Bir mülakatın 'Sil' butonuna tıkla 2. Onay ver | Mülakat silinir ve listeden kaldırılır. | ☐ nok böyle |

## Takvim (CAL)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| CAL-02 | Mülakat Gösterimi | 1. Takvimde mülakat olan günleri kontrol et | Mülakat olan günlerde etkinlik işareti/kartı görünür. Aday adı, firma ve mülakat türü bilgisi gösterilir. | ☐ nok takvim üzerinde sadece aday adı ve mülakat saati var firma adı ve pozisyon bilgisi yok |
| CAL-05 | Mülakat Detay (Takvimden) | 1. Takvimdeki bir mülakat etkinliğine tıkla | Mülakat detayları görünür (tarih, saat, tür, konum/link, katılımcılar). | ☐ nok direkt mülakat bilgilerine gitmiyor süreç sayfasında adayın profilini gösteriyor |

## E-posta (EMAIL)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| EMAIL-01 | E-posta Gönderim Sayfası | 1. 'E-postalar' sayfasına git 2. 'Yeni E-posta' veya gönderim bölümünü kontrol et | E-posta gönderim formu görünür: Aday seçimi, süreç seçimi, şablon seçimi, alıcı e-posta, konu, içerik alanları. | ☐ nok bu alan mevcut değil |
| EMAIL-03 | E-posta Gönderimi | 1. Tüm alanları doldur 2. 'Gönder' tıkla | E-posta gönderilir (veya test ortamında simüle edilir). Başarı mesajı görünür. E-posta log'unda kayıt oluşur. | ☐ nok uyarı verdi "E-posta gönderilemedi: Missing API key. Pass it to the constructor `new Resend(\"re_123\")`" |

## Denetim Kayıtları (AUD)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| AUD-03 | Audit Log Oluşumu — Güncelleme | 1. Bir adayın bilgilerini güncelle 2. Denetim kayıtlarına git | Listede 'candidate.update' kaydı görünür. Satıra tıklayınca before/after değişiklik detayları gösterilir. | ☐ nok aday güncelleme alanı yok düzenleme alanı var ancak not found uyarısı veriyor |
| AUD-08 | Tarih Filtresi | 1. Başlangıç ve bitiş tarihi gir | Sadece belirtilen tarih aralığındaki kayıtlar görünür. | ☐ nok denetim kaydı bulunamadı uyarısı veriyor |

## UI / Responsive (UI)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| UI-01 | Responsive Tasarım (Mobil) | 1. Tarayıcı penceresini daralt (mobil boyut) 2. Tüm sayfaları kontrol et | Sayfa düzeni mobil uyumlu olarak yeniden düzenlenir. Hamburger menü çıkar. Tablolar yatay kaydırılabilir. | ☐ nok sadece dikey kaydır |

## Güvenlik (SEC)

| ID | Test Adı | Adımlar | Beklenen Sonuç | UI Test Tespitleri |
|---|---|---|---|---|
| SEC-04 | Giriş Sonrası Yönlendirme | 1. /candidates URL'sine giriş yapmadan git 2. Login sayfasına yönlendirilir 3. Giriş yap | Başarılı giriş sonrası dashboard'a yönlendirilir. | ☐ nok "Bu siteye erişiminiz site yöneticisi tarafından geçici olarak sınırlandırıldı" uyarısı aldım |
