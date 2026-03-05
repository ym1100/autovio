# UI Resim ve Video Üretim Akışı

Bu dokümanda UI’daki **Generate** adımında resim ve video üretiminin nasıl çalıştığı adım adım özetleniyor.

---

## Genel akış

1. Kullanıcı **Scenario** adımında senaryoyu oluşturur (sahneler: `image_prompt`, `video_prompt`, `duration_seconds`).
2. **Generate** adımına geçer; her sahne için önce **resim**, onaydan sonra **video** üretilir.
3. Üretilen resim/video isteğe bağlı olarak work media endpoint’leri ile projeye kaydedilir.

---

## Adım 1: Resim üretimi (tek sahne)

**UI:** `GenerateStep` → sahne kartında “Click to generate” / resim alanına tıklanınca `generateSceneImage(sceneIndex)` çağrılır.

**Store (`useStore.ts`):**

1. Sahne bilgisi: `scenes[sceneIndex]` → `image_prompt`, `negative_prompt`.
2. Durum: `generatedScenes[sceneIndex].status = "generating_image"`.
3. **API:** `POST /api/generate/image`
   - Body: `prompt` (sahne `image_prompt`), `negative_prompt`, isteğe bağlı `image_instruction` (work/proje image system prompt), isteğe bağlı `styleGuide`.
   - Header’lar: `Authorization: Bearer <token>`, `x-image-provider`, `x-model-id`, **`x-api-key`** (zorunlu).
4. Yanıt: `{ imageUrl }` (URL string).
5. İsteğe bağlı kalıcılık: `projectId` ve `workId` varsa:
   - Resim URL’den fetch → blob → `saveImageBlob(...)` → **`POST /api/projects/{projectId}/works/{workId}/media/scene/{sceneIndex}/image`** (multipart/form-data, `file`).
   - Kaydedilen resim için auth’lı URL’den blob alınır → `URL.createObjectURL` ile UI’da gösterilir.
6. Durum: `imageUrl`, `remoteImageUrl`, `status: "image_ready"`.

**Backend (`routes/generate.ts`):**

- `POST /api/generate/image`: Body’den `prompt`, `negative_prompt`, `image_instruction`, `styleGuide` alır. Style guide + image_instruction + prompt birleştirilip provider’a verilir. Yanıt: `{ imageUrl }`.

---

## Adım 2: Resmi onaylayıp video üretimi

**UI:** Sahne “image_ready” iken “Generate Video” / onay butonu → `approveImageAndGenerateVideo(sceneIndex)`.

**Store:**

1. Görsel URL: `generatedScenes[sceneIndex].remoteImageUrl` veya `imageUrl` (internal media URL ise origin ile tam URL).
2. Durum: `status = "generating_video"`.
3. **API:** `POST /api/generate/video`
   - Body: `image_url` (yukarıdaki URL), `prompt` (sahne `video_prompt`), `duration` (sahne `duration_seconds`), isteğe bağlı `video_instruction`, `styleGuide`.
   - Header’lar: `Authorization`, `x-video-provider`, `x-model-id`, **`x-api-key`** (zorunlu).
4. Yanıt: `{ videoUrl }`.
5. İsteğe bağlı kalıcılık: `persistVideoUrlAndGetObjectUrl` → fetch video blob → **`POST /api/projects/{projectId}/works/{workId}/media/scene/{sceneIndex}/video`** (multipart, `file`).
6. Durum: `videoUrl`, `status: "done"`.

**Backend:**

- `POST /api/generate/video`: `image_url` kendi media URL’imizse (`/api/projects/.../media/scene/.../image`) auth ile fetch edilip base64 data URL’e çevrilir; provider’a bu verilir. Yanıt: `{ videoUrl }`.

---

## Adım 3: Medya kaydetme (UI tarafı)

| İşlem | Method | Endpoint | Açıklama |
|--------|--------|----------|----------|
| Resim kaydet | POST | `/api/projects/{projectId}/works/{workId}/media/scene/{sceneIndex}/image` | multipart `file` |
| Video kaydet | POST | `/api/projects/{projectId}/works/{workId}/media/scene/{sceneIndex}/video` | multipart `file` |
| Resim oku | GET | Aynı path (GET) | Auth gerekli |
| Video oku | GET | Aynı path (GET) | Auth gerekli |

---

## API özeti (resim/video üretim)

| Endpoint | Body (JSON) | Zorunlu header | Yanıt |
|----------|-------------|----------------|--------|
| `POST /api/generate/image` | `prompt`, `negative_prompt` (opsiyonel), `image_instruction`, `styleGuide` | `x-api-key` | `{ imageUrl }` |
| `POST /api/generate/video` | `image_url`, `prompt`, `duration` (default 5), `video_instruction`, `styleGuide` | `x-api-key` | `{ videoUrl }` |

---

## Ek davranışlar (UI)

- **Generate All Images:** Tüm sahneler için sırayla `generateSceneImage` çağrılır.
- **Resmi düzenle / yeniden üret:** `updateAndRegenerateImage(sceneIndex, imagePrompt, negativePrompt)` → sahne prompt’ları güncellenir, sonra `generateSceneImage` tekrar çalışır.
- **Videoyu yeniden üret:** `updateAndRegenerateVideo(sceneIndex, videoPrompt, duration)` → aynı `image_url` ile `POST /api/generate/video` tekrar çağrılır.
- **Resim aşamasına dön:** `backToImageStage(sceneIndex)` → ilgili sahne için video temizlenir, durum `image_ready` yapılır.

---

## Work-scope endpoint (backend, UI ile aynı akış)

**`POST /api/projects/{projectId}/works/{workId}/generate/scene/{sceneIndex}`**

- Work’teki bir sahne için **önce resim** üretilir, **sonra bu resim doğrudan video AI’a verilir** (aynı görsel; yeniden fetch yok).
- Header’lar: `x-api-key` (zorunlu), `x-image-provider`, `x-image-model-id` veya `x-model-id`, `x-video-provider`, `x-video-model-id` veya `x-model-id`.
- İstek gövdesi yok; sahne verisi `work.scenes[sceneIndex]` ve proje/work ayarları (imageSystemPrompt, videoSystemPrompt, styleGuide) kullanılır.
- Yanıt: `{ imageUrl, videoUrl }` (work media path’leri; resim ve video diske yazılmış ve `work.generatedScenes` güncellenmiş olur).

Bu adımlarla API testi, dokümantasyon güncellemesi veya yeni entegrasyonlar yapılabilir.
