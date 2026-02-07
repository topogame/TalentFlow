# 📊 TalentFlow - Business Case

## Aday Veri Tabanı ve Süreç Yönetim Sistemi

**Versiyon:** 1.0  
**Tarih:** Şubat 2026  
**Durum:** MVP Planlama Aşaması

---

## 1. Yönetici Özeti

Bu doküman, insan kaynakları danışmanlık firmaları için tasarlanan **Aday Veri Tabanı ve Süreç Yönetim Sistemi**'nin iş gerekçesini, hedeflerini ve beklenen faydalarını tanımlamaktadır.

Sistem, danışmanlık firmalarının aday bulma, değerlendirme, süreç takibi ve raporlama faaliyetlerini tek bir platformda yönetmesini sağlayan web tabanlı bir ATS (Applicant Tracking System) ve CRM hibrit çözümüdür.

---

## 2. Problem Tanımı

### 2.1 Mevcut Durum ve Sorunlar

İK danışmanlık firmaları günümüzde şu sorunlarla karşı karşıyadır:

| Sorun | Etki |
|-------|------|
| **Dağınık veri yönetimi** | Excel, e-posta, notlar farklı yerlerde; aday bilgilerine ulaşmak zor |
| **Kurumsal hafıza kaybı** | Danışman ayrıldığında aday bilgileri ve geçmiş süreçler kayboluyor |
| **Mükerrer işlemler** | Aynı adaya farklı danışmanlar ulaşıyor, profesyonellik zedeleniyor |
| **Süreç takipsizliği** | Hangi aday hangi aşamada belirsiz, adaylar "arada" kalıyor |
| **Manuel iş yükü** | E-posta gönderimi, takvim yönetimi, raporlama manuel yapılıyor |
| **Ölçüm eksikliği** | Danışman performansı, süreç verimliliği ölçülemiyor |
| **Aday deneyimi sorunları** | Geç dönüşler, bilgilendirme eksiklikleri, profesyonellik kaybı |

### 2.2 Hedef Kitle

**Birincil Kullanıcılar:**
- İK danışmanlık firmaları (5-50 çalışan ölçeği)
- Headhunting / Executive Search firmaları
- Outsource işe alım hizmeti veren şirketler

**İkincil Paydaşlar:**
- Müşteri firmalar (dolaylı fayda)
- Adaylar (iyileştirilmiş deneyim)

---

## 3. Çözüm Önerisi

### 3.1 Ürün Vizyonu

> *"Danışmanlık firmalarının tüm aday süreçlerini tek platformda, veriye dayalı ve otomasyon destekli yönetmesini sağlayan uçtan uca çözüm."*

### 3.2 Temel Değer Önerileri

| Değer | Açıklama |
|-------|----------|
| **Merkezi Aday Havuzu** | Tüm adaylar tek yerde, herkes erişebilir |
| **Süreç Şeffaflığı** | Aday-Firma-Pozisyon bazlı takip, her aşama görünür |
| **Kurumsal Hafıza** | Geçmiş süreçler, notlar, değerlendirmeler kaybolmaz |
| **Mükerrer Önleme** | Akıllı kontrol sistemi ile çakışmalar engellenir |
| **Otomasyon** | E-posta şablonları, takvim yönetimi, hatırlatmalar |
| **Raporlama** | Performans metrikleri, süreç analizleri, Excel export |

### 3.3 MVP Kapsam

**MVP'de Yer Alan Özellikler:**

✅ Aday yönetimi (CRUD + detaylı profil)  
✅ Müşteri firma yönetimi  
✅ Pozisyon/rol yönetimi  
✅ Aday-Firma-Pozisyon bazlı süreç takibi  
✅ Esnek pipeline (geri dönüş + paralel süreçler)  
✅ Mükerrer kayıt kontrolü (LinkedIn + e-posta + telefon)  
✅ Danışman notları (zaman damgalı)  
✅ CV yükleme (dosya olarak)  
✅ Gelişmiş filtreleme ve arama  
✅ E-posta şablonları ve gönderimi (SMTP)  
✅ Takvim yönetimi + manuel meeting linki  
✅ Dashboard (temel metrikler)  
✅ Excel export  
✅ Loglama (kim, ne zaman, ne değiştirdi)  

**Faz 2'ye Bırakılan Özellikler:**

⏳ LinkedIn/Kariyer.net otomatik entegrasyon  
⏳ CV parsing (AI destekli)  
⏳ Teams/Zoom otomatik meeting oluşturma  
⏳ AI destekli aday-rol eşleştirme  
⏳ Aday portalı  
⏳ Power BI entegrasyonu  
⏳ Çoklu dil desteği  
⏳ Mobil uygulama  

---

## 4. Rekabet Analizi

### 4.1 Mevcut Alternatifler

| Çözüm | Avantajları | Dezavantajları |
|-------|-------------|----------------|
| **Excel / Google Sheets** | Ücretsiz, esnek | Ölçeklenemiyor, süreç takibi yok, mükerrer sorunları |
| **Genel ATS'ler (Workable, Lever)** | Kapsamlı özellikler | Pahalı, kurumsal odaklı, danışmanlık iş modeline uygun değil |
| **CRM'ler (HubSpot, Salesforce)** | Güçlü pipeline | İK'ya özgü değil, uyarlama gerektirir |
| **Yerel ATS'ler** | Türkçe, yerel destek | Genellikle eski teknoloji, sınırlı özellik |

### 4.2 Farklılaştırıcılar

Bu sistemin farkı:

1. **Danışmanlık odaklı tasarım** - Müşteri firma + pozisyon bazlı süreç yönetimi
2. **Çoklu süreç desteği** - Bir aday birden fazla firmada paralel takip edilebilir
3. **Akıllı mükerrer kontrolü** - LinkedIn bazlı benzersiz tanımlama
4. **Esnek pipeline** - Geri dönüşlere izin veren akış
5. **Kurumsal hafıza** - Tüm geçmiş kayıtlı ve erişilebilir
6. **Uygun maliyet** - KOBİ danışmanlık firmalarına uygun fiyatlandırma

---

## 5. Beklenen Faydalar

### 5.1 Operasyonel Faydalar

| Metrik | Mevcut Durum | Hedef | İyileşme |
|--------|--------------|-------|----------|
| Aday bilgisine erişim süresi | 5-10 dk | < 30 sn | %90+ |
| Mükerrer iletişim oranı | %15-20 | < %2 | %85+ |
| E-posta gönderim süresi | 5-10 dk/aday | < 1 dk | %80+ |
| Rapor hazırlama süresi | 2-4 saat | < 15 dk | %90+ |
| Aday bilgilendirme oranı | %60-70 | %95+ | %40+ |

### 5.2 Stratejik Faydalar

- **Danışman verimliliği:** Daha fazla adaya, daha kısa sürede ulaşım
- **Müşteri memnuniyeti:** Daha hızlı ve kaliteli aday sunumu
- **Aday deneyimi:** Profesyonel iletişim, zamanında bilgilendirme
- **Yönetim görünürlüğü:** Gerçek zamanlı performans takibi
- **Ölçeklenebilirlik:** Firma büyüdükçe sistem de büyür

---

## 6. Başarı Kriterleri

### 6.1 MVP Başarı Metrikleri

| Kriter | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| Sistem uptime | %99+ | Monitoring |
| Kullanıcı adoptasyonu | İlk ayda %80+ aktif kullanım | Login/aktivite logları |
| Aday kayıt sayısı | İlk 3 ayda 1000+ aday | Veritabanı |
| Süreç tamamlama oranı | %70+ süreç sonlandırılmış | Pipeline analizi |
| Kullanıcı memnuniyeti | 4+/5 puan | Anket |

### 6.2 Uzun Vadeli Başarı Kriterleri

- Yerleştirme süresinde %20+ kısalma
- Danışman başına aday kapasitesinde %30+ artış
- Müşteri firma memnuniyetinde ölçülebilir iyileşme

---

## 7. Risk Analizi

| Risk | Olasılık | Etki | Azaltma Stratejisi |
|------|----------|------|---------------------|
| Kullanıcı direnci / düşük adopsiyon | Orta | Yüksek | Kullanıcı eğitimi, basit arayüz, aşamalı geçiş |
| Veri göçü sorunları | Orta | Orta | Detaylı import araçları, veri temizleme desteği |
| Performans sorunları | Düşük | Yüksek | Ölçeklenebilir mimari, yük testleri |
| Güvenlik açıkları | Düşük | Çok Yüksek | KVKK uyumu, güvenlik testleri, şifreleme |
| Kapsam kayması | Orta | Orta | Net MVP tanımı, değişiklik yönetimi |

---

## 8. Proje Planı (Yüksek Seviye)

### 8.1 Fazlar

| Faz | Süre | Çıktı |
|-----|------|-------|
| **Faz 0: Planlama** | 2 hafta | Business case, user guide, teknik spec |
| **Faz 1: MVP Geliştirme** | 8-10 hafta | Çalışan MVP |
| **Faz 2: Test & İyileştirme** | 2-3 hafta | Stabil versiyon |
| **Faz 3: Pilot Kullanım** | 4 hafta | Gerçek kullanıcı feedback |
| **Faz 4: Genişleme** | Sürekli | Yeni özellikler |

### 8.2 MVP Geliştirme Detayı

| Hafta | Odak Alanı |
|-------|------------|
| 1-2 | Altyapı, veritabanı, authentication |
| 3-4 | Aday, firma, pozisyon modülleri |
| 5-6 | Süreç yönetimi, pipeline |
| 7-8 | E-posta, takvim, dashboard |
| 9-10 | Raporlama, test, iyileştirme |

---

## 9. Sonuç ve Öneri

Bu sistem, İK danışmanlık firmalarının en temel operasyonel sorunlarını çözmek üzere tasarlanmıştır. MVP kapsamı bilinçli olarak dar tutulmuş, hızlı değer üretimi hedeflenmiştir.

**Öneri:** Projenin onaylanması ve Faz 0 (Planlama) çalışmalarına başlanması.

---

## Ekler

- **Ek A:** Detaylı özellik listesi (SPEC.md)
- **Ek B:** Kullanıcı kılavuzu (USER_GUIDE.md)
- **Ek C:** Teknik spesifikasyon (TECHNICAL_SPEC.md)

---

*Doküman Sahibi: [Firma Adı]*  
*Son Güncelleme: Şubat 2026*
