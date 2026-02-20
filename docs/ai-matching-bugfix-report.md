# AI Aday-Pozisyon Eslestirme — Bug Fix Raporu

**Tarih:** 2026-02-20
**Commit:** `e8740e3`
**Build:** Hatasiz | **Testler:** 495/495 gecti

---

## Tespit Edilen Sorunlar

| # | Sorun | Oncelik |
|---|-------|---------|
| 1 | AI analizi ~35sn suruyor (beklenen 3-10sn) | Yuksek |
| 2 | Ilgisiz adaylar listeleniyor (minimum puan esigi yok) | Orta |
| 3 | "Surece Ekle" hatasi alert() ile blokluyor | Orta |
| 4 | Pozisyon durumu (status) degistirilemiyor | Orta |
| 5 | AI fallback sik yasaniyor | Dusuk |

---

## Fix 1: Performans — AI Batch Analizi (~35sn → ~10sn)

**Sorun:** 20 adayin tamami tek bir API cagrisinda analiz ediliyor. Claude API'ye buyuk bir istek gonderildiginde yanitlama suresi ~35 saniyeye cikiyor.

**Cozum:** Adaylari 5'erli gruplara (batch) bolup `Promise.allSettled` ile paralel calistirma.

**Degisen dosyalar:**
- `src/lib/constants.ts` — `AI_MATCH_BATCH_SIZE = 5` sabiti eklendi
- `src/lib/ai.ts` — `analyzeMatchWithAI` fonksiyonuna `maxTokens` opsiyonel parametresi eklendi (default: 3000)
- `src/app/api/positions/[id]/match-candidates/route.ts` — Batch paralel cagri implementasyonu

**Teknik detay:**
```
20 aday → 4 batch (5'erli) → Promise.allSettled ile paralel
Her batch: maxTokens = 1000 (5 aday icin yeterli)
Sonuclar: candidateId bazli Map'e birlestirilir
```

**Oncesi:**
```typescript
const aiResult = await analyzeMatchWithAI(position, allCandidates);
```

**Sonrasi:**
```typescript
const batches = []; // 5'erli gruplar
for (let i = 0; i < candidates.length; i += AI_MATCH_BATCH_SIZE) {
  batches.push(candidates.slice(i, i + AI_MATCH_BATCH_SIZE));
}
const batchResults = await Promise.allSettled(
  batches.map((batch) => analyzeMatchWithAI(position, batch, 1000))
);
```

---

## Fix 2: Ilgisiz Adaylar — Minimum Puan Esigi

**Sorun:** AI eslestirme sonuclarinda dusuk puanli (ornegin %15-20) adaylar da listeleniyor. Kullanici icin gereksiz bilgi kirliligi olusturuyor.

**Cozum:** Minimum puan esigi (40) ile filtreleme.

**Degisen dosyalar:**
- `src/lib/constants.ts` — `MIN_MATCH_SCORE = 40` sabiti eklendi
- `src/app/api/positions/[id]/match-candidates/route.ts` — Sonuclara filtre eklendi

**Teknik detay:**
```typescript
// Oncesi: Tum sonuclar donuluyor
results.sort((a, b) => b.overallScore - a.overallScore);

// Sonrasi: 40 alti filtreleniyor
const filteredResults = results.filter((r) => r.overallScore >= MIN_MATCH_SCORE);
filteredResults.sort((a, b) => b.overallScore - a.overallScore);
```

**Not:** UI zaten bos dizi icin "Uygun aday bulunamadi" mesaji gosteriyor, ek UI degisikligi gerekmedi.

---

## Fix 3: Alert → Inline Mesaj

**Sorun:** "Surece Ekle" butonuna tiklandiginda hata olusursa `alert()` ile tarayici popup'i cikiyor. Bu:
- Kullanici deneyimini bozuyor
- Sayfayi blokluyor
- Modern UI standartlarina uymuyor

**Cozum:** `alert()` yerine amber renkli inline banner.

**Degisen dosya:**
- `src/app/(dashboard)/positions/[id]/page.tsx`

**Degisiklikler:**
1. Yeni state eklendi: `const [addToProcessInfo, setAddToProcessInfo] = useState("")`
2. Hata durumunda: `alert()` → `setAddToProcessInfo(mesaj)` + aday listeden cikarildi
3. Basari durumunda: `setAddToProcessInfo("")` (banner temizlendi)
4. JSX'e amber banner eklendi:

```tsx
{addToProcessInfo && (
  <div className="mb-3 rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-700">
    {addToProcessInfo}
  </div>
)}
```

**Ek iyilestirme:** Hata durumunda da aday listeden cikariliyor (zaten surecte olan aday tekrar gosterilmiyor).

---

## Fix 4: Pozisyon Durumu (Status) Dropdown

**Sorun:** Pozisyon duzenleme formunda status alani yok. Kullanici bir pozisyonu "Kapali" veya "Beklemede" yapamiyordu.

**Cozum:** Validation schema'ya status alani + edit formuna dropdown eklendi.

**Degisen dosyalar:**
- `src/lib/validations.ts` — `updatePositionSchema`'ya status eklendi
- `src/app/(dashboard)/positions/[id]/edit/page.tsx` — Form body + JSX select

**Teknik detay:**

Validation:
```typescript
// Oncesi
export const updatePositionSchema = createPositionSchema.partial();

// Sonrasi
export const updatePositionSchema = createPositionSchema.partial().extend({
  status: z.enum(["open", "on_hold", "closed"]).optional(),
});
```

Form body:
```typescript
status: formData.get("status") || undefined,
```

JSX (oncelik dropdown'inin yanina):
```tsx
<select name="status" defaultValue={position.status} className={inputClass}>
  <option value="open">{t("statusOpen")}</option>
  <option value="on_hold">{t("statusOnHold")}</option>
  <option value="closed">{t("statusClosed")}</option>
</select>
```

**Not:** API route degisiklik gerektirmedi — `updatePositionSchema` zaten kullaniliyor. Ceviri anahtarlari (`statusOpen`, `statusOnHold`, `statusClosed`) zaten mevcut.

---

## Fix 5: AI Fallback Iyilestirme

**Sorun:** Tek bir AI cagrisinda hata olursa tum adaylar icin fallback (skor: 50) kullaniliyor. Gercek AI puanlari tamamen kayboluyor.

**Cozum:** Fix 1'in yan etkisi olarak cozuldu. Batch yaklasimi sayesinde bir batch basarisiz olsa bile diger batch'lerin sonuclari kullaniliyor.

**Teknik detay:**
```typescript
let anyBatchSuccess = false;
for (const result of batchResults) {
  if (result.status === "fulfilled" && result.value.success) {
    anyBatchSuccess = true;
    // Bu batch'in sonuclarini map'e ekle
  }
}
// aiAvailable = anyBatchSuccess (en az 1 batch basariliysa true)
```

**Ornek senaryo:**
- 4 batch'ten 3'u basarili, 1'i basarisiz → 15 adayin gercek AI puani var, 5 adaya fallback (50) uygulanir
- Onceki durumda: Tek cagri basarisiz → 20 adayin hepsine fallback uygulanirdi

---

## Degisen Dosyalar Ozeti

| Dosya | Degisiklik |
|-------|-----------|
| `src/lib/constants.ts` | `MIN_MATCH_SCORE = 40`, `AI_MATCH_BATCH_SIZE = 5` eklendi |
| `src/lib/ai.ts` | `analyzeMatchWithAI`'ye `maxTokens` parametresi eklendi |
| `src/lib/validations.ts` | `updatePositionSchema`'ya status alani eklendi |
| `src/app/api/positions/[id]/match-candidates/route.ts` | Batch paralel AI + skor filtresi |
| `src/app/(dashboard)/positions/[id]/page.tsx` | alert → inline banner + aday listeden cikarma |
| `src/app/(dashboard)/positions/[id]/edit/page.tsx` | Status dropdown eklendi |

---

## Risk Analizi

| # | Risk | Seviye | Onlem |
|---|------|--------|-------|
| 1 | Anthropic rate limiting (4 paralel API cagrisi) | Orta | `Promise.allSettled` ile basarisiz batch'ler graceful handle ediliyor |
| 2 | maxTokens yetersiz (5 aday icin 1000 token) | Dusuk | 5 aday x 3 kategori ≈ 500-800 token. Yetmezse fallback devreye girer |
| 3 | Cok az aday gosterilmesi (esik 40) | Dusuk | UI "Uygun aday bulunamadi" gosteriyor. Esik gerekirse dusurulur |
| 4 | Pozisyon kapatilinca surecler etkilenir mi? | Dusuk | Hayir — status sadece bilgi amacli. Surecler kendi stage/closedAt'ina sahip |
| 5 | Mevcut testlerin kirilmasi | Cok Dusuk | Sadece additive degisiklikler. 495 test gecti |

---

## Dogrulama

- [x] `npx next build` — Hatasiz
- [x] `npx vitest run` — 495/495 test gecti
- [ ] Manuel: Pozisyon duzenle → status "Kapali" → kaydet → badge dogrula
- [ ] Manuel: AI eslestirme → dusuk puanli adaylar filtrelenmis mi (>= 40)
- [ ] Manuel: "Surece Ekle" → hata → alert yerine amber mesaj + listeden cikma
- [ ] Manuel: AI analiz suresi ~10-15sn civarinda mi
