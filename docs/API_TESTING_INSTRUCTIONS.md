# AutoVio API Testing Instructions

Bu doküman, AutoVio API'nin OpenAPI dokümantasyonunu test etmek ve doğrulamak için adım adım talimatlar içerir.

## Ön Hazırlık

### 1. Backend'i Başlat

```bash
cd packages/backend
bun run dev
```

Backend başarıyla başladığında şu mesajı görmelisiniz:
```
[backend] Server running on http://localhost:3001
[backend] OpenAPI documentation available at /api-docs
```

### 2. Swagger UI'ı Aç

Tarayıcıda şu adresi aç:
```
http://localhost:3001/api-docs
```

## Test Senaryoları

### ⚠️ DİKKAT: Test Edilmeyecek Endpoint'ler

Aşağıdaki endpoint'ler **TEST EDİLMEYECEK** (harici AI servisler gerektirir):
- ❌ `POST /api/generate/image` - Image generation (DALL-E, Gemini gerektirir)
- ❌ `POST /api/generate/video` - Video generation (Runway, Gemini gerektirir)

---

## Adım 1: Health Check (Sağlık Kontrolü)

### Test: `GET /api/health`

**Amaç:** API'nin çalıştığını doğrula

**Adımlar:**
1. Swagger UI'da "Health" tag'ini bul
2. `GET /api/health` endpoint'ini aç
3. "Try it out" butonuna tıkla
4. "Execute" butonuna tıkla

**Beklenen Sonuç:**
- Status Code: `200 OK`
- Response body:
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
  ```

**Doğrulama:**
- ✅ `status` alanı "ok" olmalı
- ✅ `timestamp` geçerli ISO 8601 formatında olmalı

---

## Adım 2: Authentication (Kimlik Doğrulama)

### Test 2.1: `POST /api/auth/register` - Kullanıcı Kaydı

**Amaç:** Yeni kullanıcı oluştur

**Adımlar:**
1. "Authentication" tag'ini bul
2. `POST /api/auth/register` endpoint'ini aç
3. "Try it out" butonuna tıkla
4. Request body'yi düzenle:
   ```json
   {
     "email": "test@example.com",
     "password": "TestPassword123!",
     "name": "Test User"
   }
   ```
5. "Execute" butonuna tıkla

**Beklenen Sonuç:**
- Status Code: `201 Created`
- Response body:
  ```json
  {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "507f...",
      "email": "test@example.com",
      "name": "Test User"
    }
  }
  ```

**Doğrulama:**
- ✅ `accessToken` ve `refreshToken` JWT formatında olmalı
- ✅ `user.email` request'teki email ile eşleşmeli
- ✅ `user.id` MongoDB ObjectId formatında olmalı

**Not:** `accessToken` değerini kopyala, sonraki testlerde kullanılacak!

---

### Test 2.2: `POST /api/auth/login` - Kullanıcı Girişi

**Amaç:** Mevcut kullanıcı ile giriş yap

**Adımlar:**
1. `POST /api/auth/login` endpoint'ini aç
2. "Try it out" butonuna tıkla
3. Request body:
   ```json
   {
     "email": "test@example.com",
     "password": "TestPassword123!"
   }
   ```
4. "Execute" butonuna tıkla

**Beklenen Sonuç:**
- Status Code: `200 OK`
- Response aynı `accessToken` ve `user` bilgilerini içermeli

**Hata Senaryosu - Yanlış Şifre:**
1. Password'u değiştir: `"password": "WrongPassword"`
2. Execute
3. Beklenen: `401 Unauthorized` ve hata mesajı

---

### Test 2.3: `GET /api/auth/me` - Kullanıcı Bilgisi

**Amaç:** Token ile kullanıcı bilgisini al

**Adımlar:**
1. Swagger UI'ın sağ üst köşesindeki **"Authorize"** butonuna tıkla
2. Bearer token alanına Test 2.1'den kopyaladığın `accessToken`'ı yapıştır
   - Format: `Bearer eyJhbGc...` (başında "Bearer " olmamalı, sadece token)
3. "Authorize" butonuna tıkla, "Close" ile kapat
4. `GET /api/auth/me` endpoint'ini aç
5. "Try it out" ve "Execute"

**Beklenen Sonuç:**
- Status Code: `200 OK`
- Response:
  ```json
  {
    "id": "507f...",
    "email": "test@example.com",
    "name": "Test User",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
  ```

**Hata Senaryosu - Token Olmadan:**
1. "Authorize" butonundan "Logout" yap
2. Aynı endpoint'i tekrar dene
3. Beklenen: `401 Unauthorized`

---

## Adım 3: Projects (Projeler)

### Test 3.1: `POST /api/projects` - Proje Oluştur

**Amaç:** Yeni video projesi oluştur

**Ön Koşul:** Authorization token aktif olmalı

**Adımlar:**
1. "Projects" tag'ini bul
2. `POST /api/projects` endpoint'ini aç
3. "Try it out" butonuna tıkla
4. Request body:
   ```json
   {
     "name": "Test Campaign",
     "systemPrompt": "You are a creative assistant",
     "knowledge": "Our brand is innovative and eco-friendly",
     "styleGuide": {
       "tone": "professional",
       "color_palette": ["#FF5733", "#3498DB"],
       "tempo": "moderate",
       "camera_style": "dynamic"
     }
   }
   ```
5. "Execute" butonuna tıkla

**Beklenen Sonuç:**
- Status Code: `201 Created`
- Response body:
  ```json
  {
    "_id": "507f...",
    "userId": "507f...",
    "name": "Test Campaign",
    "systemPrompt": "You are a creative assistant",
    "knowledge": "Our brand is innovative and eco-friendly",
    "styleGuide": { ... },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

**Doğrulama:**
- ✅ `_id` MongoDB ObjectId formatında
- ✅ `userId` authenticated user'ın ID'si ile eşleşmeli
- ✅ `name` request'teki name ile eşleşmeli
- ✅ `styleGuide` object'i doğru şekilde kaydedilmeli

**Not:** Project ID'yi (`_id`) kopyala, sonraki testlerde kullanılacak!

---

### Test 3.2: `GET /api/projects` - Proje Listesi

**Amaç:** Kullanıcının tüm projelerini listele

**Adımlar:**
1. `GET /api/projects` endpoint'ini aç
2. "Try it out" ve "Execute"

**Beklenen Sonuç:**
- Status Code: `200 OK`
- Response: Array içinde en az 1 proje
  ```json
  [
    {
      "_id": "507f...",
      "name": "Test Campaign",
      ...
    }
  ]
  ```

**Doğrulama:**
- ✅ Response bir array olmalı
- ✅ Array içinde Test 3.1'de oluşturduğun proje olmalı

---

### Test 3.3: `GET /api/projects/{id}` - Tek Proje Getir

**Amaç:** Spesifik projeyi ID ile getir

**Adımlar:**
1. `GET /api/projects/{id}` endpoint'ini aç
2. "Try it out" butonuna tıkla
3. `id` parametresine Test 3.1'den kopyaladığın project ID'yi yapıştır
4. "Execute" butonuna tıkla

**Beklenen Sonuç:**
- Status Code: `200 OK`
- Response: İlgili projenin tüm detayları

**Hata Senaryosu - Geçersiz ID:**
1. `id` parametresine geçersiz bir ID yaz: `"invalid-id-123"`
2. Execute
3. Beklenen: `404 Not Found` veya `400 Bad Request`

---

### Test 3.4: `PUT /api/projects/{id}` - Proje Güncelle

**Amaç:** Mevcut projeyi güncelle

**Adımlar:**
1. `PUT /api/projects/{id}` endpoint'ini aç
2. "Try it out" butonuna tıkla
3. `id` parametresine project ID'yi gir
4. Request body:
   ```json
   {
     "name": "Updated Campaign Name",
     "styleGuide": {
       "tone": "casual",
       "color_palette": ["#00FF00", "#0000FF"]
     }
   }
   ```
5. "Execute" butonuna tıkla

**Beklenen Sonuç:**
- Status Code: `200 OK`
- Response: Güncellenmiş proje
- `name` alanı "Updated Campaign Name" olmalı
- `updatedAt` timestamp'i değişmiş olmalı

---

### Test 3.5: `DELETE /api/projects/{id}` - Proje Sil

**Amaç:** Projeyi sil

**⚠️ DİKKAT:** Bu testi en son yap, projeyi silecek!

**Adımlar:**
1. `DELETE /api/projects/{id}` endpoint'ini aç
2. "Try it out" butonuna tıkla
3. `id` parametresine project ID'yi gir
4. "Execute" butonuna tıkla

**Beklenen Sonuç:**
- Status Code: `204 No Content`
- Response body boş olmalı

**Doğrulama:**
1. `GET /api/projects` ile proje listesini tekrar getir
2. Silinen proje listede olmamalı

---

## Adım 4: Works (Video Pipeline)

### Ön Hazırlık: Yeni Proje Oluştur

Test 3.1'i tekrar çalıştırarak yeni bir proje oluştur ve ID'yi kaydet.

---

### Test 4.1: `POST /api/projects/{projectId}/works` - Work Oluştur

**Amaç:** Proje altında yeni work (video pipeline) başlat

**Adımlar:**
1. "Works" tag'ini bul
2. `POST /api/projects/{projectId}/works` endpoint'ini aç
3. "Try it out" butonuna tıkla
4. `projectId` parametresine proje ID'sini gir
5. Request body:
   ```json
   {
     "mode": "style_transfer",
     "productName": "EcoBottle Pro",
     "productDescription": "Sustainable stainless steel water bottle",
     "targetAudience": "Eco-conscious millennials"
   }
   ```
6. "Execute" butonuna tıkla

**Beklenen Sonuç:**
- Status Code: `201 Created`
- Response:
  ```json
  {
    "_id": "507f...",
    "projectId": "507f...",
    "userId": "507f...",
    "currentStep": 0,
    "mode": "style_transfer",
    "hasReferenceVideo": false,
    "productName": "EcoBottle Pro",
    "productDescription": "Sustainable stainless steel water bottle",
    "targetAudience": "Eco-conscious millennials",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
  ```

**Doğrulama:**
- ✅ `projectId` request parametresiyle eşleşmeli
- ✅ `currentStep` 0 olmalı (başlangıç)
- ✅ `mode` "style_transfer" veya "content_remix" olmalı
- ✅ `hasReferenceVideo` false olmalı (henüz video yüklenmedi)

**Not:** Work ID'yi (`_id`) kopyala!

---

### Test 4.2: `GET /api/projects/{projectId}/works` - Work Listesi

**Amaç:** Proje altındaki tüm work'leri listele

**Adımlar:**
1. `GET /api/projects/{projectId}/works` endpoint'ini aç
2. "Try it out" butonuna tıkla
3. `projectId` parametresini gir
4. "Execute"

**Beklenen Sonuç:**
- Status Code: `200 OK`
- Response: Array içinde Test 4.1'de oluşturulan work

---

## Adım 5: AI Analysis (Video Analizi)

### Test 5.1: `POST /api/analyze` - Video Analizi

**⚠️ NOT:** Bu endpoint multipart/form-data kullanır ve gerçek video dosyası gerektirir.

**Swagger UI'da Test (Opsiyonel):**

Eğer test etmek isterseniz:

**Adımlar:**
1. "AI Analysis" tag'ini bul
2. `POST /api/analyze` endpoint'ini aç
3. "Try it out" butonuna tıkla
4. Headers:
   - `x-vision-provider`: `gemini` (veya `claude`, `openai`)
   - `x-model-id`: `gemini-2.0-flash-exp`
   - `x-api-key`: *Gemini API key'iniz* (yoksa testi atla)
5. Request body:
   - `video`: Bir video dosyası seç (file upload)
   - `mode`: `style_transfer`
   - `analyzerPrompt`: (opsiyonel)
6. "Execute"

**Beklenen Sonuç (API key varsa):**
- Status Code: `200 OK`
- Response:
  ```json
  {
    "scenes": [
      {
        "timestamp": 0,
        "duration": 5,
        "description": "...",
        "visualElements": "...",
        "cameraMovement": "...",
        "transition": "..."
      }
    ],
    "tone": "professional",
    "colors": ["#FF5733"],
    "tempo": "moderate",
    "cameraMovements": ["zoom", "pan"]
  }
  ```

**API Key Yoksa:**
- Bu testi atla veya
- Expected: `400 Bad Request` veya `401 Unauthorized`

---

## Adım 6: AI Scenario (Senaryo Üretimi)

### Test 6.1: `POST /api/scenario` - Senaryo Üret

**⚠️ NOT:** Bu endpoint LLM API key gerektirir.

**Swagger UI'da Test (Opsiyonel):**

**Adımlar:**
1. "AI Scenario" tag'ini bul
2. `POST /api/scenario` endpoint'ini aç
3. "Try it out" butonuna tıkla
4. Headers:
   - `x-llm-provider`: `openai` (veya `gemini`, `claude`)
   - `x-model-id`: `gpt-4`
   - `x-api-key`: *OpenAI API key'iniz* (yoksa testi atla)
5. Request body:
   ```json
   {
     "intent": "Create a 15-second product showcase video for a water bottle",
     "styleGuide": {
       "tone": "modern",
       "color_palette": ["#3498DB", "#2ECC71"],
       "tempo": "moderate"
     }
   }
   ```
6. "Execute"

**Beklenen Sonuç (API key varsa):**
- Status Code: `200 OK`
- Response:
  ```json
  {
    "scenes": [
      {
        "index": 0,
        "imagePrompt": "...",
        "videoPrompt": "...",
        "duration": 5,
        "transition": "fade",
        "textOverlays": []
      }
    ]
  }
  ```

**API Key Yoksa:**
- Bu testi atla

---

## Adım 7: Providers (AI Provider Listesi)

### Test 7.1: `GET /api/providers` - Provider Listesi

**Amaç:** Kullanılabilir AI provider'ları listele

**Adımlar:**
1. "Providers" tag'ini bul
2. `GET /api/providers` endpoint'ini aç
3. "Try it out" ve "Execute"

**Beklenen Sonuç:**
- Status Code: `200 OK`
- Response:
  ```json
  {
    "vision": [
      {
        "id": "gemini",
        "name": "Google Gemini",
        "models": ["gemini-2.0-flash-exp", ...]
      },
      {
        "id": "claude",
        "name": "Anthropic Claude",
        "models": ["claude-3-5-sonnet-20241022"]
      },
      {
        "id": "openai",
        "name": "OpenAI",
        "models": ["gpt-4o"]
      }
    ],
    "llm": [...],
    "image": [
      {
        "id": "dalle",
        "name": "DALL-E",
        "models": ["dall-e-3"]
      },
      {
        "id": "gemini",
        "name": "Google Gemini (Imagen)",
        "models": ["imagen-3.0-generate-001"]
      }
    ],
    "video": [
      {
        "id": "runway",
        "name": "Runway",
        "models": ["gen-3"]
      },
      {
        "id": "gemini",
        "name": "Google Gemini (Veo)",
        "models": ["veo-001"]
      }
    ]
  }
  ```

**Doğrulama:**
- ✅ Response 4 kategori içermeli: `vision`, `llm`, `image`, `video`
- ✅ Her kategori array olmalı
- ✅ Her provider `id`, `name`, `models` alanlarına sahip olmalı

**Not:** Bu endpoint authentication gerektirmez!

---

## Adım 8: OpenAPI Spec Doğrulama

### Test 8.1: OpenAPI JSON Formatı

**Amaç:** OpenAPI spec'inin geçerli olduğunu doğrula

**Adımlar:**
1. Tarayıcıda şu adresi aç:
   ```
   http://localhost:3001/api/openapi.json
   ```
2. JSON formatının geçerli olduğunu kontrol et

**Alternatif - Terminal:**
```bash
curl http://localhost:3001/api/openapi.json | python3 -m json.tool
```

**Beklenen Sonuç:**
- Geçerli JSON formatı
- `openapi: "3.0.0"` field'i mevcut
- `info`, `servers`, `paths`, `components` bölümleri mevcut

---

### Test 8.2: OpenAPI Validator (Opsiyonel)

Online validator ile doğrula:

**Adımlar:**
1. https://editor.swagger.io/ adresini aç
2. `File` > `Import URL`
3. URL gir: `http://localhost:3001/api/openapi.json`
4. Hataları ve uyarıları kontrol et

**Beklenen Sonuç:**
- Kritik hata (error) olmamalı
- Varsa sadece minor uyarılar (warnings) olabilir

---

## Hata Düzeltme Talimatları

### Yaygın Hatalar ve Çözümleri

#### 1. Schema Hataları

**Sorun:** Request/response schema'ları OpenAPI spec'te yanlış tanımlanmış

**Nasıl Bulunur:**
- Swagger UI'da "Try it out" yaptığında response'un schema ile eşleşmediğini görürsün
- Örnek: Field tipi `string` ama `number` dönüyor

**Nasıl Düzeltilir:**
1. `/packages/backend/src/openapi/document.ts` dosyasını aç
2. `components.schemas` bölümünde ilgili schema'yı bul
3. Field tipini düzelt (örn: `type: "string"` → `type: "number"`)
4. Backend'i yeniden başlat (`bun run dev`)
5. Testi tekrar et

---

#### 2. Eksik/Yanlış Parametreler

**Sorun:** Endpoint path/query parametresi yanlış veya eksik

**Nasıl Bulunur:**
- Swagger UI'da parametre girmene izin vermiyor veya
- "Required parameter missing" hatası alıyorsun

**Nasıl Düzeltilir:**
1. `/packages/backend/src/openapi/document.ts` dosyasını aç
2. `paths` bölümünde ilgili endpoint'i bul
3. `parameters` array'ini kontrol et:
   ```javascript
   parameters: [
     {
       name: "id",              // Parametre adı doğru mu?
       in: "path",              // path/query/header doğru mu?
       required: true,          // Required olmalı mı?
       schema: { type: "string" } // Tip doğru mu?
     }
   ]
   ```
4. Düzelt, backend'i yeniden başlat, testi tekrar et

---

#### 3. Authentication Hataları

**Sorun:** "Authorize" butonundan sonra bile 401 Unauthorized alıyorsun

**Nasıl Düzeltilir:**
1. Token'ın doğru format olduğunu kontrol et
   - Başında "Bearer " **OLMAMALI** (Swagger UI otomatik ekler)
   - Sadece: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
2. Token'ın expired olmadığını kontrol et
   - Yeni token almak için `/api/auth/login` yap
3. Endpoint'in `security` tanımını kontrol et:
   ```javascript
   security: [{ bearerAuth: [] }]  // Bu satır olmalı
   ```

---

#### 4. Response Status Code Hataları

**Sorun:** Endpoint farklı status code dönüyor (örn: 200 bekliyorsun, 201 geliyor)

**Nasıl Düzeltilir:**
1. Gerçek API'den dönen status code'u not et
2. OpenAPI spec'te ilgili endpoint'i bul
3. `responses` bölümünde status code'u düzelt:
   ```javascript
   responses: {
     200: { ... }  // Eğer gerçekte 201 dönüyorsa burası 201 olmalı
   }
   ```

---

#### 5. Missing Required Fields

**Sorun:** Request gönderirken "required field missing" hatası alıyorsun ama field'i doldurdun

**Nasıl Düzeltilir:**
1. Schema tanımındaki `required` array'ini kontrol et:
   ```javascript
   {
     type: "object",
     required: ["email", "password"],  // Bu array'deki fieldlar zorunlu
     properties: {
       email: { type: "string" },
       password: { type: "string" }
     }
   }
   ```
2. Gereksiz field'ları `required` array'inden kaldır
3. Backend kodunu kontrol et - gerçekten zorunlu mu?

---

## Test Raporu Şablonu

Testleri tamamladıktan sonra doldurun:

```markdown
# AutoVio API Test Raporu

**Test Tarihi:** [Tarih]
**Test Eden:** [İsim]
**Backend Version:** 0.1.0

## Test Sonuçları

### Health Check
- [ ] ✅ GET /api/health - PASSED
- [ ] ❌ Hata varsa açıklama: ...

### Authentication
- [ ] ✅ POST /api/auth/register - PASSED
- [ ] ✅ POST /api/auth/login - PASSED
- [ ] ✅ GET /api/auth/me - PASSED
- [ ] ❌ Hatalar: ...

### Projects
- [ ] ✅ POST /api/projects - PASSED
- [ ] ✅ GET /api/projects - PASSED
- [ ] ✅ GET /api/projects/{id} - PASSED
- [ ] ✅ PUT /api/projects/{id} - PASSED
- [ ] ✅ DELETE /api/projects/{id} - PASSED
- [ ] ❌ Hatalar: ...

### Works
- [ ] ✅ POST /api/projects/{projectId}/works - PASSED
- [ ] ✅ GET /api/projects/{projectId}/works - PASSED
- [ ] ❌ Hatalar: ...

### AI Analysis
- [ ] ⏭️ POST /api/analyze - SKIPPED (API key gerekli)
- [ ] ✅ PASSED (eğer test ettiysen)
- [ ] ❌ Hatalar: ...

### AI Scenario
- [ ] ⏭️ POST /api/scenario - SKIPPED (API key gerekli)
- [ ] ✅ PASSED (eğer test ettiysen)
- [ ] ❌ Hatalar: ...

### Providers
- [ ] ✅ GET /api/providers - PASSED
- [ ] ❌ Hatalar: ...

### OpenAPI Validation
- [ ] ✅ OpenAPI JSON geçerli - PASSED
- [ ] ✅ Swagger Editor validation - PASSED
- [ ] ❌ Hatalar: ...

## Bulunan Hatalar

### Hata 1: [Kısa Açıklama]
- **Endpoint:** ...
- **Beklenen:** ...
- **Gerçekleşen:** ...
- **Düzeltme:** ...

## Genel Notlar

[Test sürecinde dikkat çeken noktalar, öneriler, vb.]
```

---

## Özet

✅ **Test Edilecek Endpoint'ler (Toplam: ~15)**
- Health Check (1)
- Authentication (3)
- Projects (5)
- Works (2)
- Providers (1)
- AI Analysis (1 - opsiyonel)
- AI Scenario (1 - opsiyonel)

❌ **Test Edilmeyecek Endpoint'ler (2)**
- `/api/generate/image`
- `/api/generate/video`

---

**Test Süresi Tahmini:** 30-45 dakika (AI endpoint'ler hariç)

**Başarı Kriteri:** Tüm zorunlu testler PASSED olmalı, kritik hata bulunmamalı.
