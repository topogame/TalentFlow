# TalentFlow v2 — Yeni Özellikler Rehberi

> Bu doküman, TalentFlow'un MVP sonrası planladığımız yeni özelliklerini teknik olmayan bir dille açıklar.
> Her özellik için: ne yapılacak, neden önemli ve kullanıcıya ne değer katacak anlatılır.

---

## 1. Yapay Zeka ile CV Okuma (AI CV Parsing)

### Ne yapılacak?
Sisteme bir CV (PDF veya Word) yüklendiğinde, yapay zeka bu CV'yi otomatik olarak okuyacak ve içindeki bilgileri (ad, soyad, telefon, e-posta, iş deneyimi, eğitim, yetenekler, diller) tanıyarak aday formuna otomatik dolduracak.

### Bugün nasıl yapılıyor?
Danışman, her CV'yi açıp tek tek okuyor, bilgileri kopyalayıp sisteme elle giriyor. Bir CV'yi sisteme girmek 5-10 dakika sürüyor.

### Ne değer katacak?
- **Zaman tasarrufu:** 5-10 dakikalık iş 10 saniyeye düşecek
- **Hata azalması:** Elle girişte yapılan yazım hataları, yanlış bilgi girişleri ortadan kalkacak
- **Toplu işlem:** 50 CV'yi bir seferde sisteme yükleyip otomatik aday kaydı oluşturulabilecek
- **Danışman memnuniyeti:** En sıkıcı ve tekrarlayan iş olan veri girişi neredeyse sıfıra inecek

---

## 2. Yapay Zeka ile Aday-Pozisyon Eşleştirme (AI Matching)

### Ne yapılacak?
Bir pozisyon açıldığında, sistem mevcut aday havuzunu otomatik tarayacak ve o pozisyona en uygun adayları puanlayarak sıralayacak. "Bu pozisyon için en iyi 10 aday" listesi otomatik oluşacak.

### Bugün nasıl yapılıyor?
Danışman, pozisyonun gereksinimlerini aklında tutarak aday listesini tek tek inceliyor, deneyim, sektör, şehir, maaş beklentisi gibi kriterleri kendisi karşılaştırıyor. Hafızasına ve tecrübesine dayanıyor.

### Ne değer katacak?
- **Doğru eşleşme:** İnsan gözünün kaçırabileceği uygun adayları yapay zeka bulacak
- **Hız:** Yüzlerce aday arasından saniyeler içinde en uygunları listelenecek
- **Fırsat kaçırmama:** "Aaa bu aday da çok uygunmuş, onu unutmuşum" durumu yaşanmayacak
- **Objektif değerlendirme:** Kişisel önyargılar yerine veri odaklı eşleştirme yapılacak

---

## 3. LinkedIn ve Kariyer.net Entegrasyonu

### Ne yapılacak?
TalentFlow, LinkedIn ve Kariyer.net ile doğrudan bağlantı kuracak. Danışman, LinkedIn'de gördüğü bir profili tek tıkla TalentFlow'a aktarabilecek. Kariyer.net'te yayınlanan ilanlara gelen başvurular otomatik olarak sisteme düşecek.

### Bugün nasıl yapılıyor?
Danışman LinkedIn'de aday bulduğunda bilgileri elle kopyalıyor. Kariyer.net başvurularını e-postayla alıp tek tek sisteme giriyor. İki platform arasında sürekli gidip geliyor.

### Ne değer katacak?
- **Tek ekran:** Tüm aday kaynakları tek bir yerden yönetilecek
- **Hız:** LinkedIn profilini kopyala-yapıştır yerine tek tıkla aktar
- **Başvuru kaçırmama:** Kariyer.net başvuruları otomatik düşecek, hiçbiri gözden kaçmayacak
- **Güncel bilgi:** Adayların LinkedIn profilleri güncellendiğinde sistem de güncellenebilecek

---

## 4. Teams / Zoom Otomatik Toplantı Oluşturma

### Ne yapılacak?
Mülakat planlarken tarih ve saat seçildiğinde, sistem otomatik olarak Microsoft Teams veya Zoom toplantı linki oluşturacak ve bu linki hem adaya hem firma yetkilisine e-posta ile gönderecek.

### Bugün nasıl yapılıyor?
Danışman önce mülakatı sisteme giriyor, sonra ayrıca Teams/Zoom'a gidip toplantı oluşturuyor, linki kopyalıyor, e-posta yazıp herkese gönderiyor. Aynı mülakat için 3-4 farklı uygulama kullanılıyor.

### Ne değer katacak?
- **Tek adımda her şey:** Mülakat oluştur → link otomatik oluşsun → e-posta otomatik gitsin
- **Profesyonellik:** Adaylar ve firma yetkilileri anında düzgün formatlı davetiye alacak
- **Hata önleme:** Yanlış link gönderme, link göndermeyi unutma gibi durumlar ortadan kalkacak
- **Zaman tasarrufu:** Mülakat organizasyonu dakikalar yerine saniyeler sürecek

---

## 5. Aday Self-Service Portalı

### Ne yapılacak?
Adaylar için özel bir giriş portalı oluşturulacak. Aday kendi profiline giriş yapabilecek, CV'sini güncelleyebilecek, başvurduğu pozisyonların durumunu takip edebilecek ve mülakat davetlerini görebilecek.

### Bugün nasıl yapılıyor?
Aday, süreç hakkında bilgi almak için danışmanı arıyor veya e-posta atıyor. "Başvurum ne durumda?" sorusu danışmanın en çok aldığı ve en çok zaman harcadığı soru.

### Ne değer katacak?
- **Aday memnuniyeti:** Aday istediği zaman durumunu görebilecek, belirsizlik azalacak
- **Danışman yükü azalır:** "Başvurum ne aşamada?" telefonları ve e-postaları büyük ölçüde bitecek
- **Güncel bilgi:** Aday telefon numarasını değiştirdiğinde kendisi güncelleyebilecek
- **Profesyonel izlenim:** Modern, şeffaf bir süreç yönetimi firmanın itibarını artıracak

---

## 6. Excel Import — Toplu Veri Aktarımı

### Ne yapılacak?
Excel dosyasından toplu aday, firma veya pozisyon verisi yüklenebilecek. Mevcut Excel tablolarındaki veriler sisteme otomatik aktarılacak.

### Bugün nasıl yapılıyor?
Firmalar yıllardır Excel'de biriktirdikleri aday verilerini sisteme geçirmek için her kaydı tek tek elle giriyor. 500 adaylık bir Excel'i aktarmak günler sürebiliyor.

### Ne değer katacak?
- **Kolay geçiş:** Excel'den TalentFlow'a geçiş acısız olacak
- **Toplu aktarım:** Yüzlerce kaydı dakikalar içinde yükle
- **Veri doğrulama:** Yükleme sırasında hatalı/eksik veriler otomatik tespit edilecek
- **Yeni müşteri kazanımı:** "Mevcut verilerimi nasıl aktarırım?" sorusu artık engel olmayacak

---

## 7. Excel Export ve Özel Rapor Oluşturucu

### Ne yapılacak?
Sistemdeki verileri Excel'e aktarma ve özelleştirilebilir raporlar oluşturma. Kullanıcı hangi sütunları, hangi filtreleri, hangi sıralamayı istediğini seçerek kendi raporunu oluşturabilecek.

### Bugün nasıl yapılıyor?
Yöneticiler rapor ihtiyaçları için danışmanlardan bilgi topluyor, elle Excel tabloları hazırlıyor. "Bu ay kaç aday yerleştirdik?", "Hangi sektörde en çok pozisyon açtık?" gibi sorulara cevap bulmak saatler alıyor.

### Ne değer katacak?
- **Anlık raporlama:** İstenen rapor saniyeler içinde hazır
- **Yönetici memnuniyeti:** Performans takibi, müşteri sunumları, haftalık toplantılar için hazır veriler
- **Veri odaklı kararlar:** "Hissediyorum" yerine "veriler gösteriyor ki..." diyebilme
- **Müşteri raporları:** Firma müşterilerine profesyonel ilerleme raporları sunabilme

---

## 8. Çok Dilli Destek (Multi-language)

### Ne yapılacak?
Sistem arayüzü Türkçe'nin yanı sıra İngilizce ve potansiyel olarak Arapça gibi dillerde de kullanılabilecek.

### Bugün nasıl yapılıyor?
Sistem sadece Türkçe. Yabancı müşteriler veya uluslararası projeler için kullanılamıyor.

### Ne değer katacak?
- **Uluslararası büyüme:** Ortadoğu, Doğu Avrupa pazarlarına açılma imkanı
- **Yabancı müşteriler:** Türkiye'deki çok uluslu şirketlere de hizmet verilebilecek
- **Geniş pazar:** Potansiyel müşteri havuzu birkaç kat büyüyecek

---

## 9. Mobil Uygulama

### Ne yapılacak?
TalentFlow'un iOS ve Android için mobil uygulaması geliştirilecek. Danışmanlar telefondan aday bilgilerini görüntüleyebilecek, not ekleyebilecek, mülakat takvimini takip edebilecek ve anlık bildirimler alabilecek.

### Bugün nasıl yapılıyor?
Danışmanlar sadece bilgisayar başında sistemi kullanabiliyor. Dışarıdayken (mülakatta, toplantıda, yolda) sisteme erişmeleri zor.

### Ne değer katacak?
- **Her yerden erişim:** Mülakat öncesi adayın bilgilerine telefondan hızlıca bak
- **Anlık bildirimler:** Yeni başvuru geldi, mülakat 1 saat sonra gibi hatırlatmalar
- **Hızlı not alma:** Mülakatın hemen ardından izlenimleri telefondan kaydet
- **Rekabet avantajı:** Rakiplerin çoğunun mobil uygulaması yok

---

## Öncelik Sıralaması (Önerilen)

| Sıra | Özellik | Neden önce? |
|------|---------|-------------|
| 1 | Excel Import/Export + Raporlar | Mevcut müşterilerin en çok istediği, satışı kolaylaştıran |
| 2 | AI CV Parsing | En büyük zaman tasarrufu, "vay be!" etkisi yaratır |
| 3 | AI Aday-Pozisyon Eşleştirme | CV parsing'in doğal devamı, veri birikince daha etkili |
| 4 | LinkedIn / Kariyer.net | Danışmanların günlük iş akışını en çok iyileştiren |
| 5 | Teams/Zoom Entegrasyonu | Mülakat sürecini tamamlayan pratik özellik |
| 6 | Aday Self-Service Portalı | Hem aday hem danışman memnuniyetini artıran |
| 7 | Çok Dilli Destek | Uluslararası büyüme için gerekli altyapı |
| 8 | Mobil Uygulama | Responsive web zaten çalışıyor, mobil app "güzel olur" |

---

> **Not:** Bu sıralama bir öneridir. Müşteri geri bildirimlerine ve iş önceliklerine göre değişebilir. Her özellik bağımsız olarak geliştirilebilir, birbirine bağımlılık minimumdur.
