# AutoVio TODO

## Reference Mode İyileştirmesi

**Sorun:** Reference mode'da asset description'ları sadece senaryo LLM'ine veriliyor. Image generation sırasında bu context doğrudan kullanılmıyor - LLM'in asset stilini doğru yansıtmasına güveniyoruz.

**Mevcut Akış:**
1. Asset description'ları senaryo system prompt'una ekleniyor
2. LLM bunları dikkate alarak `image_prompt` yazıyor (umut ediyoruz)
3. Image generation sadece `image_prompt`'u kullanıyor

**Önerilen İyileştirme:**
Asset description'larını doğrudan image generation prompt'una da eklemek:

```typescript
// Frontend generateSceneImage - Reference mode
let fullImagePrompt = scene.image_prompt;
if (assetUsageMode === "reference" && assetDescriptions) {
  fullImagePrompt = `Style reference: ${assetDescriptions}\n\n${scene.image_prompt}`;
}
const remoteImageUrl = await apiGenerateImage(fullImagePrompt, ...);
```

**Etkilenen Dosyalar:**
- `packages/frontend/src/store/useStore.ts` - `generateSceneImage` fonksiyonu
- Alternatif: Backend'de `/api/generate/image` endpoint'ine asset context ekleme

**Öncelik:** Düşük-Orta (mevcut haliyle de çalışıyor)
