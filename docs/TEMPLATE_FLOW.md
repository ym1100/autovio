# Template akışı (UI + API)

## Genel

Şablonlar **proje bazında** saklanır. Editor’da videoya eklediğin **metin ve görsel overlay’ler** bir şablon olarak kaydedilebilir; sonra aynı veya başka bir videoya **şablon uygulayarak** aynı overlay yapısı eklenir.

---

## UI akışı (Su bardağı örneği)

1. **Video oluşturulur**  
   Generate adımında sahne(ler) için resim + video üretilir; Editor adımına geçilir.

2. **Editor’da overlay’ler eklenir (isteğe bağlı)**  
   Metin overlay’leri, proje asset’lerinden görsel overlay’ler eklenir; timeline’da konum ve süre ayarlanır.

3. **Şablon kaydetme**  
   - "Templates" paneli açılır.  
   - "Save current as template" → mevcut editor state’ten şablon çıkarılır (`extractTemplateFromEditorState`: text/image overlay’ler, timing relative/absolute, isteğe bağlı export ayarları).  
   - **POST /api/projects/{projectId}/templates** ile `name`, `description`, `tags`, `content` (EditorTemplateContent) gönderilir.  
   - Şablon projeye kaydedilir.

4. **Var olan şablonu videoya ekleme**  
   - "Templates" panelinde listeden bir şablon seçilir (liste **GET /api/projects/{projectId}/templates** ile gelir).  
   - "Apply" → şablon detayı **GET /api/projects/{projectId}/templates/{templateId}** ile alınır.  
   - Apply dialog’da placeholder’lar (örn. `{{product_name}}`, `{{brand}}`) doldurulabilir.  
   - **POST /api/projects/{projectId}/templates/{templateId}/apply** çağrılır:  
     - Body: `{ templateId, videoDuration, placeholderValues? }`. **workId yok** – backend hangi work’e ekleneceğini bilmez.  
     - Backend sadece şablonu `videoDuration`’a göre çözümleyip overlay + track verisini döndürür.  
   - UI bu sonucu **şu an açık olan work**’ün editor state’ine yazar (hangi work’ün açık olduğu sadece client’ta belli). Kalıcı olması için work **PUT** ile ayrıca kaydedilir.

4b. **Şablonu work'e otomatik uygulayıp kaydetme (API)**  
   - **POST /api/projects/{projectId}/works/{workId}/apply-template** ile tek istekte şablon uygulanır ve work'in `editorState`'i güncellenip kaydedilir.  
   - Body: `{ templateId, placeholderValues? }`. `videoDuration` gönderilmez; work'in `videoDuration` değeri veya sahnelerin toplam süresi kullanılır.  
   - Bu endpoint, "apply + save" akışını otomatikleştirir: work'teki tüm sahne süreleri tek bir timeline gibi kullanılır, şablon overlay'leri bu süreye göre yerleştirilir ve doğrudan work'e yazılır.

5. **Şablon silme**  
   Panelden "Delete" → **DELETE /api/projects/{projectId}/templates/{templateId}**.

---

## API özeti (templates)

| Method | Path | Açıklama |
|--------|------|----------|
| GET | `/api/projects/{projectId}/templates` | Projedeki şablon listesi (meta; thumbnail URL dahil). |
| POST | `/api/projects/{projectId}/templates` | Yeni şablon: body’de `name`, `content` (zorunlu), `description`, `tags`. |
| GET | `/api/projects/{projectId}/templates/{templateId}` | Tek şablon (content dahil). |
| PUT | `/api/projects/{projectId}/templates/{templateId}` | Şablon güncelle: `name`, `description`, `tags`, `content`. |
| DELETE | `/api/projects/{projectId}/templates/{templateId}` | Şablon sil. |
| POST | `/api/projects/{projectId}/templates/{templateId}/apply` | Şablonu videoya uygula: body'de `templateId`, `videoDuration`, isteğe bağlı `placeholderValues`. Yanıt: overlay'ler + track aksiyonları; client bunu editor state'e yazar. |
| POST | `/api/projects/{projectId}/works/{workId}/apply-template` | Şablonu work'e uygula ve kaydet: body'de templateId, isteğe bağlı placeholderValues. videoDuration work'ten hesaplanır; sonuç work.editorState'e merge edilir ve work kaydedilir. |

---

## Placeholder’lar

Şablondaki metin overlay’lerinde `{{product_name}}`, `{{brand}}`, `{{date}}`, `{{custom:label}}` gibi placeholder’lar kullanılabilir. Apply isteğinde `placeholderValues: { "product_name": "Su bardağı", "brand": "Marka Adı" }` verilerek bu alanlar doldurulur.

---

## Önemli noktalar

- Şablonlar **proje** ile ilişkilidir; work (çalışma) bazında değildir.  
- **POST .../templates/{id}/apply** sonucu doğrudan work’e yazılmaz; API sadece overlay + track verisini döndürür. Client (Editor) bu veriyi alıp kendi state’ine yazar; kalıcılık için work **PUT** (editor state ile) ayrıca yapılır.  
- **POST .../works/{workId}/apply-template** ile tek istekte apply + merge + save yapılır; video süresi work'ten (videoDuration veya sahnelerin toplamı) alınır.
- Apply’da `videoDuration` şablon içindeki relative timing’in (yüzde) saniyeye çevrilmesi için kullanılır.
