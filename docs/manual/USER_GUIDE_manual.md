# 📖 TalentFlow - Kullanıcı Kılavuzu

## Aday Veri Tabanı ve Süreç Yönetim Sistemi

**Versiyon:** 1.0 (MVP)  
**Tarih:** Şubat 2026  
**Hedef Kitle:** Danışmanlar ve Yöneticiler

---

## İçindekiler

1. [Giriş](#1-giriş)
2. [Sisteme Giriş](#2-sisteme-giriş)
3. [Ana Ekran ve Dashboard](#3-ana-ekran-ve-dashboard)
4. [Aday Yönetimi](#4-aday-yönetimi)
5. [Müşteri Firma Yönetimi](#5-müşteri-firma-yönetimi)
6. [Pozisyon Yönetimi](#6-pozisyon-yönetimi)
7. [Süreç Yönetimi](#7-süreç-yönetimi)
8. [E-posta Yönetimi](#8-e-posta-yönetimi)
9. [Takvim ve Mülakat Planlama](#9-takvim-ve-mülakat-planlama)
10. [Raporlama](#10-raporlama)
11. [Sık Sorulan Sorular](#11-sık-sorulan-sorular)

---

## 1. Giriş

### 1.1 Sistem Hakkında

Bu sistem, İK danışmanlık firmalarının aday bulma, değerlendirme ve süreç yönetimi faaliyetlerini tek bir platformda yönetmesini sağlar.

### 1.2 Temel Kavramlar

| Kavram | Açıklama |
|--------|----------|
| **Aday** | Potansiyel işe alım adayı |
| **Müşteri Firma** | Hizmet verdiğiniz, aday aradığınız şirket |
| **Pozisyon** | Müşteri firmadaki açık rol/iş ilanı |
| **Süreç** | Bir adayın belirli bir firma+pozisyon için takip edildiği akış |
| **Pipeline** | Sürecin aşamaları (Havuzda → İlk Görüşme → ... → Sonuç) |

### 1.3 Temel İş Akışı

```
Aday Ekle → Firma+Pozisyon Eşleştir → Süreç Başlat → Aşamaları Takip Et → Sonuçlandır
```

---

## 2. Sisteme Giriş

### 2.1 Giriş Yapma

1. Tarayıcınızda sistem adresine gidin
2. Kullanıcı adı ve şifrenizi girin
3. **"Giriş Yap"** butonuna tıklayın

### 2.2 Şifre Sıfırlama

1. Giriş ekranında **"Şifremi Unuttum"** linkine tıklayın
2. E-posta adresinizi girin
3. Gelen e-postadaki linke tıklayarak yeni şifre belirleyin

### 2.3 Çıkış Yapma

Sağ üst köşedeki profil menüsünden **"Çıkış Yap"** seçeneğini kullanın.

---

## 3. Ana Ekran ve Dashboard

### 3.1 Dashboard Görünümü

Giriş yaptığınızda karşınıza çıkan ana ekran şu bilgileri içerir:

| Widget | Açıklama |
|--------|----------|
| **Aktif Aday Sayısı** | Herhangi bir süreçte olan aday sayısı |
| **Açık Pozisyonlar** | Aktif pozisyon sayısı |
| **Bu Hafta Mülakatlar** | Planlanan görüşme sayısı |
| **Bekleyen Aksiyonlar** | Takip gerektiren süreçler |
| **Süreç Durumu Özeti** | Pipeline aşamalarına göre dağılım |
| **Son Aktiviteler** | Sistemdeki son işlemler |

### 3.2 Hızlı Erişim Menüsü

Sol taraftaki ana menüden şu bölümlere erişebilirsiniz:

- 🏠 Dashboard
- 👤 Adaylar
- 🏢 Firmalar
- 💼 Pozisyonlar
- 🔄 Süreçler
- 📧 E-postalar
- 📅 Takvim
- 📊 Raporlar
- ⚙️ Ayarlar

---

## 4. Aday Yönetimi

### 4.1 Aday Listesi

**Adaylar** menüsüne tıkladığınızda tüm adayları görürsünüz.

**Filtreleme Seçenekleri:**
- İsim / E-posta / Telefon ile arama
- Sektör
- Deneyim yılı
- Lokasyon
- Ücret beklentisi aralığı
- Yabancı dil
- Süreç durumu

### 4.2 Yeni Aday Ekleme

1. **"+ Yeni Aday"** butonuna tıklayın
2. Aşağıdaki bilgileri girin:

**Temel Bilgiler (Zorunlu):**
- Ad Soyad
- Telefon
- E-posta

**Profesyonel Bilgiler:**
- Eğitim durumu
- Toplam deneyim yılı
- Mevcut/son sektör
- Mevcut pozisyon/unvan
- Yabancı dil (dil + seviye)
- Ücret beklentisi (net/brüt + para birimi)

**Lokasyon:**
- Ülke / Şehir
- Uzaktan çalışma uygunluğu (Evet/Hayır)
- Hibrit çalışma uygunluğu (Evet/Hayır)

**Dokümanlar:**
- LinkedIn profil linki
- CV yükle (PDF veya Word)

3. **"Kaydet"** butonuna tıklayın

### 4.3 Mükerrer Aday Kontrolü

Sistem, aday eklerken otomatik olarak mükerrer kontrolü yapar:

**Kontrol Hiyerarşisi:**
1. **LinkedIn URL** (birincil) - Eşleşirse kesin mükerrer
2. **E-posta adresi** - Eşleşirse uyarı
3. **Telefon numarası** - Eşleşirse uyarı
4. **Ad-Soyad benzerliği** - Yüksek benzerlikte uyarı

**Mükerrer Bulunduğunda:**
- Sistem uyarı gösterir
- Mevcut aday profilini görüntüleyebilirsiniz
- İki seçenek sunulur:
  - "Mevcut Kayda Bağla" → Bilgiler mevcut adaya eklenir
  - "Yeni Aday Olarak Oluştur" → Ayrı kayıt açılır (dikkatli kullanın)

### 4.4 Aday Profili Görüntüleme

Aday listesinde bir adaya tıkladığınızda detaylı profil açılır:

**Sekmeler:**
- **Özet:** Temel bilgiler, ücret, lokasyon
- **Süreçler:** Bu adayın dahil olduğu tüm süreçler
- **Notlar:** Danışman notları (zaman damgalı)
- **Dokümanlar:** CV ve diğer yüklenen dosyalar
- **Geçmiş:** Tüm değişiklik logları

### 4.5 Aday Düzenleme

1. Aday profilinde **"Düzenle"** butonuna tıklayın
2. Gerekli değişiklikleri yapın
3. **"Kaydet"** butonuna tıklayın

> 💡 **Not:** Tüm değişiklikler loglanır ve geçmişte görüntülenebilir.

### 4.6 Danışman Notu Ekleme

1. Aday profilinde **"Notlar"** sekmesine gidin
2. **"+ Yeni Not"** butonuna tıklayın
3. Notunuzu yazın
4. **"Ekle"** butonuna tıklayın

Notlar otomatik olarak tarih, saat ve ekleyen danışman bilgisiyle kaydedilir.

### 4.7 CV Yükleme ve Güncelleme

1. Aday profilinde **"Dokümanlar"** sekmesine gidin
2. **"CV Yükle"** butonuna tıklayın
3. PDF veya Word dosyası seçin
4. Yükleme tamamlandığında CV güncelleme tarihi otomatik kaydedilir

> ⚠️ **Dikkat:** Yeni CV yüklendiğinde eski CV silinmez, geçmişte saklanır.

---

## 5. Müşteri Firma Yönetimi

### 5.1 Firma Listesi

**Firmalar** menüsünden tüm müşteri firmaları görüntüleyebilirsiniz.

### 5.2 Yeni Firma Ekleme

1. **"+ Yeni Firma"** butonuna tıklayın
2. Aşağıdaki bilgileri girin:

**Firma Bilgileri:**
- Firma adı
- Sektör
- Şirket büyüklüğü (çalışan sayısı aralığı)
- Lokasyon (şehir/ülke)
- Website

**İletişim Bilgileri:**
- İletişim kişisi adı
- Görevi/unvanı
- Telefon
- E-posta

**Notlar:**
- Firma hakkında genel notlar

3. **"Kaydet"** butonuna tıklayın

### 5.3 Firma Profili

Firma profilinde şunları görürsünüz:
- Firma bilgileri
- Bu firmaya ait açık pozisyonlar
- Bu firma için yürütülen aktif süreçler
- Geçmiş yerleştirmeler
- Firma ile ilgili notlar

---

## 6. Pozisyon Yönetimi

### 6.1 Pozisyon Listesi

**Pozisyonlar** menüsünden tüm açık pozisyonları görüntüleyebilirsiniz.

**Filtreleme:**
- Firma
- Sektör
- Pozisyon başlığı
- Durum (Açık/Kapalı/Beklemede)
- Lokasyon
- Ücret aralığı

### 6.2 Yeni Pozisyon Ekleme

1. **"+ Yeni Pozisyon"** butonuna tıklayın
2. Aşağıdaki bilgileri girin:

**Temel Bilgiler:**
- Pozisyon başlığı
- Müşteri firma (listeden seçin)
- Departman
- Raporlama yapısı (üst pozisyon)

**Gereksinimler:**
- Minimum deneyim yılı
- Eğitim gereksinimleri
- Teknik beceriler
- Yabancı dil gereksinimleri
- Sektör deneyimi tercihi

**Çalışma Koşulları:**
- Lokasyon
- Çalışma modeli (Ofis/Uzaktan/Hibrit)
- Seyahat gereksinimi

**Ücret Bilgileri:**
- Ücret aralığı (min-max)
- Net/Brüt
- Para birimi
- Ek menfaatler

**Pozisyon Durumu:**
- Açık / Beklemede / Kapalı
- Öncelik seviyesi (Düşük/Normal/Yüksek/Acil)
- Açılış tarihi
- Hedef kapanış tarihi

3. **"Kaydet"** butonuna tıklayın

### 6.3 Pozisyona Aday Eşleştirme

1. Pozisyon detayında **"Aday Eşleştir"** butonuna tıklayın
2. Aday arama ekranı açılır
3. Uygun adayı seçin
4. **"Sürece Ekle"** butonuna tıklayın

Bu işlem otomatik olarak yeni bir süreç kaydı oluşturur.

---

## 7. Süreç Yönetimi

### 7.1 Süreç Kavramı

Süreç, bir **Aday + Firma + Pozisyon** kombinasyonudur.

Örnek:
- Aday: Ahmet Yılmaz
- Firma: ABC Teknoloji
- Pozisyon: Yazılım Müdürü
- Süreç: Ahmet'in ABC'deki Yazılım Müdürü pozisyonu için takibi

> 💡 **Önemli:** Bir aday, aynı anda birden fazla süreçte olabilir. Örneğin Ahmet, ABC için "Mülakat" aşamasındayken, XYZ firması için "Sunuldu" aşamasında olabilir.

### 7.2 Pipeline Aşamaları

| Aşama | Açıklama |
|-------|----------|
| **Havuzda** | Aday pozisyon için değerlendiriliyor |
| **İlk Görüşme** | Danışman adayla görüştü |
| **Müşteriye Sunuldu** | Aday CV'si müşteri firmaya gönderildi |
| **Mülakat** | Müşteri firma ile görüşme planlandı/yapıldı |
| **Olumlu** | Aday işe alındı ✅ |
| **Olumsuz** | Süreç sonlandırıldı ❌ |
| **Beklemede** | Süreç geçici olarak durduruldu ⏸️ |

### 7.3 Süreç Listesi

**Süreçler** menüsünden tüm aktif süreçleri görüntüleyebilirsiniz.

**Görünüm Seçenekleri:**
- **Liste görünümü:** Tablo formatında
- **Kanban görünümü:** Aşamalara göre sütunlar halinde

**Filtreleme:**
- Aday
- Firma
- Pozisyon
- Aşama
- Danışman
- Tarih aralığı

### 7.4 Yeni Süreç Başlatma

**Yöntem 1 - Aday Profilinden:**
1. Aday profilini açın
2. **"Sürece Ekle"** butonuna tıklayın
3. Firma ve pozisyon seçin
4. Başlangıç aşamasını seçin (varsayılan: Havuzda)
5. **"Başlat"** butonuna tıklayın

**Yöntem 2 - Pozisyon Profilinden:**
1. Pozisyon profilini açın
2. **"Aday Ekle"** butonuna tıklayın
3. Aday seçin veya yeni aday oluşturun
4. **"Sürece Ekle"** butonuna tıklayın

### 7.5 Aşama Değiştirme

1. Süreç detayını açın
2. Mevcut aşama yanındaki **"Aşama Değiştir"** butonuna tıklayın
3. Yeni aşamayı seçin
4. (Opsiyonel) Not ekleyin
5. **"Güncelle"** butonuna tıklayın

> 💡 **Esneklik:** Sistem geri dönüşlere izin verir. "Mülakat" aşamasından "Havuzda"ya dönebilirsiniz. Ancak "Olumlu" veya "Olumsuz" seçildiğinde süreç kapanır.

### 7.6 Süreç Notları

Her süreç için ayrı notlar tutabilirsiniz:
1. Süreç detayında **"Not Ekle"** butonuna tıklayın
2. Notunuzu yazın
3. **"Kaydet"** butonuna tıklayın

### 7.7 Role Uygunluk Skoru

Her süreç için 1-5 arası uygunluk skoru verebilirsiniz:

| Skor | Anlam |
|------|-------|
| 5 | Mükemmel uyum |
| 4 | Çok uygun |
| 3 | Uygun |
| 2 | Kısmen uygun |
| 1 | Düşük uyum |

Skor, süreç detayında veya listede güncellenebilir.

### 7.8 Uyarı ve Bilgilendirmeler

Sistem şu durumlarda otomatik uyarı verir:

- **Mükerrer süreç:** Aynı aday + firma + pozisyon kombinasyonu varsa
- **Geçmiş süreç:** Aday daha önce bu firmaya sunulmuşsa
- **Olumsuz geçmiş:** Aday daha önce bu firmada olumsuz sonuçlanmışsa
- **Uzun süredir hareketsiz:** 7+ gündür aşama değişikliği olmayan süreçler

---

## 8. E-posta Yönetimi

### 8.1 E-posta Şablonları

Sistem, sık kullanılan e-postalar için şablonlar sunar:

| Şablon | Kullanım Amacı |
|--------|----------------|
| İlk Temas | Adaya ilk ulaşım |
| Süreç Bilgilendirme | Adayı süreç hakkında bilgilendirme |
| Mülakat Daveti | Görüşme planı gönderimi |
| Olumlu Sonuç | Teklif bildirimi |
| Olumsuz Sonuç | Ret bildirimi |
| Bekleme Bildirimi | Sürecin beklemeye alındığı bilgisi |

### 8.2 Şablon Düzenleme

1. **Ayarlar > E-posta Şablonları** menüsüne gidin
2. Düzenlemek istediğiniz şablonu seçin
3. İçeriği düzenleyin
4. **"Kaydet"** butonuna tıklayın

**Dinamik Alanlar:**
Şablonlarda aşağıdaki alanlar otomatik doldurulur:

```
{aday_adi} - Adayın adı
{aday_soyadi} - Adayın soyadı
{pozisyon} - Pozisyon başlığı
{firma} - Müşteri firma adı
{danisman_adi} - Danışman adı
{tarih} - Bugünün tarihi
{mulakat_tarihi} - Mülakat tarihi (varsa)
{mulakat_saati} - Mülakat saati (varsa)
```

### 8.3 E-posta Gönderme

**Tek Adaya Gönderim:**
1. Aday veya süreç profilinde **"E-posta Gönder"** butonuna tıklayın
2. Şablon seçin veya serbest yazın
3. İçeriği kontrol edin/düzenleyin
4. **"Gönder"** butonuna tıklayın

**Toplu Gönderim:**
1. Aday listesinde göndermek istediğiniz adayları seçin
2. **"Toplu İşlem > E-posta Gönder"** seçin
3. Şablon seçin
4. Önizleme yapın
5. **"Gönder"** butonuna tıklayın

### 8.4 Gönderim Geçmişi

Tüm gönderilen e-postalar loglanır:
- Aday profilinde **"E-posta Geçmişi"** sekmesinden görüntülenebilir
- Tarih, konu, içerik ve gönderen bilgisi kaydedilir

---

## 9. Takvim ve Mülakat Planlama

### 9.1 Takvim Görünümü

**Takvim** menüsünden tüm planlanmış görüşmeleri görebilirsiniz:
- Günlük görünüm
- Haftalık görünüm
- Aylık görünüm

### 9.2 Mülakat Planlama

1. Süreç detayında **"Mülakat Planla"** butonuna tıklayın
2. Aşağıdaki bilgileri girin:
   - Tarih ve saat
   - Süre (dakika)
   - Görüşme türü (Yüz yüze / Online / Telefon)
   - Online ise meeting linki (manuel giriş)
   - Katılımcılar (müşteri tarafı)
   - Lokasyon veya adres
   - Notlar
3. **"Planla"** butonuna tıklayın

### 9.3 Otomatik Hatırlatmalar

Sistem şu hatırlatmaları gönderir:
- Mülakattan 24 saat önce (adaya e-posta)
- Mülakattan 1 saat önce (danışmana bildirim)

### 9.4 Mülakat Sonucu Kaydetme

Mülakat sonrasında:
1. Takvimden ilgili görüşmeye tıklayın
2. **"Sonuç Kaydet"** butonuna tıklayın
3. Sonuç notlarını girin
4. Bir sonraki aşamayı seçin (opsiyonel)
5. **"Kaydet"** butonuna tıklayın

---

## 10. Raporlama

### 10.1 Hazır Raporlar

**Raporlar** menüsünden aşağıdaki raporlara erişebilirsiniz:

| Rapor | İçerik |
|-------|--------|
| **Aday Özet Raporu** | Tüm adaylar, durumları, temel bilgileri |
| **Firma Bazlı Rapor** | Firma başına süreç sayısı, aşama dağılımı |
| **Pozisyon Bazlı Rapor** | Pozisyon başına aday sayısı, süre analizi |
| **Danışman Performans** | Danışman başına aktivite metrikleri |
| **Pipeline Analizi** | Aşama bazlı aday dağılımı, geçiş süreleri |
| **Süreç Süre Analizi** | Ortalama kapanma süreleri |

### 10.2 Özel Rapor Oluşturma

1. **"Yeni Rapor"** butonuna tıklayın
2. Rapor türünü seçin (Aday/Firma/Pozisyon/Süreç)
3. Görüntülemek istediğiniz sütunları seçin
4. Filtreler ekleyin
5. Sıralama tercihini belirleyin
6. **"Rapor Oluştur"** butonuna tıklayın

### 10.3 Excel Export

Her rapor Excel formatında dışa aktarılabilir:
1. Raporu görüntüleyin
2. **"Excel'e Aktar"** butonuna tıklayın
3. Dosya otomatik indirilir

---

## 11. Sık Sorulan Sorular

### Genel

**S: Şifremi nasıl değiştiririm?**
C: Sağ üst köşedeki profil menüsünden "Şifre Değiştir" seçeneğini kullanın.

**S: Oturumum ne kadar süre açık kalır?**
C: 8 saat işlem yapılmazsa oturum otomatik kapanır.

### Aday Yönetimi

**S: Bir adayı silebilir miyim?**
C: Hayır, KVKK ve veri bütünlüğü nedeniyle aday silinemez. Ancak "Pasif" durumuna alabilirsiniz.

**S: Aday bilgilerini toplu olarak yükleyebilir miyim?**
C: Evet, Excel import özelliği mevcuttur. Ayarlar > Veri Import menüsünden şablonu indirin.

### Süreç Yönetimi

**S: Kapatılan bir süreci tekrar açabilir miyim?**
C: Hayır, "Olumlu" veya "Olumsuz" olarak kapatılan süreçler yeniden açılamaz. Ancak aynı aday için yeni süreç başlatabilirsiniz.

**S: Aynı aday aynı pozisyon için tekrar süreçe alınabilir mi?**
C: Evet, ancak sistem önceki süreç hakkında uyarı verir.

### E-posta

**S: E-postalar hangi adresten gidiyor?**
C: Sistem e-posta adresi üzerinden gider. Ayarlardan görüntüleyebilirsiniz.

**S: Gönderdiğim e-postanın ulaşıp ulaşmadığını görebilir miyim?**
C: Gönderim durumu loglanır. İletim onayı veya okundu bilgisi şu an desteklenmemektedir.

---

## Destek

Teknik destek için:
- 📧 E-posta: destek@[sistem].com
- 📞 Telefon: [destek hattı]
- 💬 Sistem içi: Sağ alt köşedeki yardım butonu

---

*Bu kılavuz MVP (Versiyon 1.0) özelliklerini kapsamaktadır.*  
*Son Güncelleme: Şubat 2026*
