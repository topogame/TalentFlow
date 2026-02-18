# Kanban Sürükle-Bırak (Drag & Drop) — Test Raporu

## Özellik Özeti

Süreçler sayfasındaki Kanban görünümüne sürükle-bırak desteği eklendi. Kullanıcı bir süreç kartını bir aşama sütunundan diğerine sürükleyerek aşama değişikliği yapabilir.

### Teknik Detaylar

| Öğe | Değer |
|-----|-------|
| **Paket** | `@hello-pangea/dnd` (react-beautiful-dnd fork) |
| **Değişen dosya** | `src/app/(dashboard)/processes/page.tsx` |
| **API** | `PUT /api/processes/[id]/stage` (mevcut, değişiklik yok) |
| **Build** | Hatasız |
| **Test** | 332/332 geçiyor |

### Eklenen Özellikler

- **Optimistic UI:** Kart anında yeni sütuna taşınır, API arka planda çağrılır. Hata olursa rollback yapılır.
- **Onay Modalı:** Olumlu/Olumsuz sütununa bırakıldığında süreç kapatılacağı için onay istenir (opsiyonel not alanı).
- **Kapalı süreç koruması:** `closedAt` olan süreçler sürüklenemez, kilit ikonu gösterilir.
- **Görsel feedback:** Sürükleme sırasında kart döner + büyür + gölge; hedef sütunda mavi ring efekti.
- **Hata toast:** API hatası durumunda kırmızı uyarı mesajı gösterilir.

---

## Manuel UI Test Adımları

### Test 1: Kanban Görünümüne Geçiş

1. `/processes` sayfasına git
2. Filtre satırındaki görünüm toggle'ından **sağdaki butona** (Kanban) tıkla
3. **Beklenen:** 7 aşama sütunu yan yana görünmeli (Havuzda, Ön Görüşme, Firmaya Sunuldu, Mülakat, Olumlu, Olumsuz, Beklemede)

### Test 2: Normal Sürükle-Bırak

1. Kanban görünümünde "Havuzda" sütunundaki bir kartı fare ile tutup sürükle
2. **Sürükleme sırasında:** Kart hafif sağa döner, hafifçe büyür, gölge artar
3. Hedef sütun (ör. "Ön Görüşme") üzerine gel
4. **Hedef sütunda:** Mavi ring (vurgu) efekti görünmeli
5. Kartı bırak
6. **Beklenen:** Kart anında yeni sütunda görünmeli, eski sütundaki sayı azalmalı, yeni sütundaki sayı artmalı
7. Sayfayı yenile (F5)
8. **Beklenen:** Kart hâlâ yeni sütunda olmalı (değişiklik kalıcı)

### Test 3: Aynı Sütun İçinde Sıralama

1. Aynı sütun içinde bir kartı yukarı veya aşağı sürükle
2. **Beklenen:** Kart yeni pozisyonuna yerleşir (aşama değişmez, API çağrısı yapılmaz)

### Test 4: Olumlu Sütununa Kapatma

1. Aktif bir kartı (kapatılmamış) "Olumlu" sütununa sürükle ve bırak
2. **Beklenen:** Onay modalı açılır:
   - Yeşil tik ikonu
   - "Süreç Kapatılacak" başlığı
   - "Bu süreç Olumlu olarak işaretlenecek ve kapatılacak." açıklaması
   - Opsiyonel not (textarea) alanı
   - "İptal" ve "Olumlu Kapat" butonları
3. **İptal tıkla** → Modal kapanır, kart eski yerinde kalır
4. Aynı kartı tekrar "Olumlu" sütununa sürükle
5. Not alanına bir metin yaz (ör. "Aday kabul etti")
6. **"Olumlu Kapat" tıkla**
7. **Beklenen:** Modal kapanır, kart Olumlu sütununda görünür

### Test 5: Olumsuz Sütununa Kapatma

1. Aktif bir kartı "Olumsuz" sütununa sürükle ve bırak
2. **Beklenen:** Onay modalı açılır:
   - Kırmızı çarpı ikonu
   - "Olumsuz Kapat" butonu (kırmızı)
3. "Olumsuz Kapat" tıkla
4. **Beklenen:** Kart Olumsuz sütununa taşınır

### Test 6: Kapalı Süreç Sürüklenemez

1. Olumlu veya Olumsuz sütunundaki kapatılmış bir karta bak
2. **Beklenen:** Kart soluk görünür (opacity düşük), sağ üstte kilit ikonu var
3. Bu kartı sürüklemeye çalış
4. **Beklenen:** Kart sürüklenemez, yerinden oynamaz

### Test 7: Karta Tıklama (Detay Sayfası)

1. Kanban'da herhangi bir karta tıkla (sürüklemeden, sadece tıkla)
2. **Beklenen:** Süreç detay sayfasına (`/processes/[id]`) yönlendirilirsin
3. Geri gel ve tekrar Kanban görünümüne geç

### Test 8: Hata Durumu (Opsiyonel)

1. Network sekmesini aç (DevTools → Network)
2. Bir kartı sürükleyip başka sütuna bırak
3. Eğer API hatası olursa:
   - **Beklenen:** Kart eski yerine geri döner (rollback)
   - Sayfanın üst kısmında kırmızı hata mesajı görünür
   - Hata mesajı 4 saniye sonra otomatik kaybolur

### Test 9: Filtrelerle Birlikte DnD

1. Aşama filtresinden "Havuzda" seç → Sadece Havuzda sütunu dolu olmalı
2. Filtreyi temizle → Tüm sütunlar normal görünmeli
3. Sorumlu filtresinden bir kullanıcı seç
4. Kalan kartları sürükle-bırak ile taşı
5. **Beklenen:** Sürükle-bırak filtrelerle birlikte sorunsuz çalışmalı

---

## Tarih

- **Geliştirme:** 2026-02-18
- **Durum:** Tamamlandı
