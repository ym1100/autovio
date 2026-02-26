# Plan: Step-by-Step Image/Video Generation with Approval Flow

> **Status:** Planning
> **Created:** February 2026
> **Author:** AI Assistant (UI/UX decisions included)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Problem Statement](#2-problem-statement)
3. [Proposed Solution](#3-proposed-solution)
4. [User Flow](#4-user-flow)
5. [Technical Architecture](#5-technical-architecture)
6. [UI/UX Design](#6-uiux-design)
7. [Implementation Plan](#7-implementation-plan)
8. [File Changes](#8-file-changes)
9. [Migration Notes](#9-migration-notes)

---

## 1. Overview

### Goal

Transform the current automatic image+video generation flow into a step-by-step approval-based workflow where users have full control over each generation phase.

### Key Changes

| Aspect | Current | Proposed |
|--------|---------|----------|
| Generation Flow | Automatic (image → video in one click) | Step-by-step with approval gates |
| User Control | Minimal - regenerate entire scene | Full - approve/edit at each stage |
| Prompt Editing | Only in ScenarioStep | Inline editing during generation |
| Batch Generation | "Generate All" processes everything | "Generate All Images" then individual approval |
| Scene Order | Sequential only | User can choose any order |

---

## 2. Problem Statement

### Current Issues

1. **No Intermediate Control**: Users cannot see/approve the generated image before video generation starts
2. **Wasted Resources**: If image is bad, video generation (expensive API call) still runs
3. **Limited Editing**: To change a prompt, users must go back to ScenarioStep
4. **All-or-Nothing**: "Generate All" doesn't allow selective regeneration

### User Needs

- Preview image before committing to video generation
- Edit prompts without leaving the generation step
- Selectively regenerate individual images or videos
- Control the generation pace and order

---

## 3. Proposed Solution

### New Generation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PHASE 1: IMAGE                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [pending] ──── [Generate Image] ───→ [generating_image]            │
│                                              │                      │
│                                              ▼                      │
│                                       [image_ready]                 │
│                                          │    │                     │
│                        ┌─────────────────┘    └──────────────┐      │
│                        ▼                                     ▼      │
│              [Approve & Continue]                [Edit & Regenerate]│
│                        │                                     │      │
│                        │                         ┌───────────┘      │
│                        │                         ▼                  │
│                        │                   Side Panel Opens         │
│                        │                   - Edit image_prompt      │
│                        │                   - Edit negative_prompt   │
│                        │                   - [Regenerate Image]     │
│                        │                         │                  │
│                        │                         └──→ [generating_image]
│                        ▼                                            │
└────────────────────────┼────────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────────────┐
│                        ▼        PHASE 2: VIDEO                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│              [generating_video] ───────→ [done]                     │
│                                            │                        │
│                              ┌─────────────┴─────────────┐          │
│                              ▼                           ▼          │
│                    [Scene Complete]            [Regenerate Video]   │
│                                                          │          │
│                                                          ▼          │
│                                                   Side Panel Opens  │
│                                                   - Edit video_prompt│
│                                                   - Edit duration   │
│                                                   - [Regenerate]    │
│                                                          │          │
│                    ┌─────────────────────────────────────┘          │
│                    ▼                                                │
│           [generating_video] ───→ [done]                            │
│                                                                     │
│              [Back to Image] ───→ Returns to [image_ready]          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Status State Machine

```
                    ┌──────────────────────────────────┐
                    │                                  │
                    ▼                                  │
┌─────────┐    ┌─────────────────┐    ┌────────────┐  │
│ pending │───→│ generating_image│───→│ image_ready│──┤
└─────────┘    └─────────────────┘    └────────────┘  │
                    │                      │          │
                    ▼                      ▼          │
                ┌───────┐          ┌──────────────────┴──┐
                │ error │          │ generating_video    │
                └───────┘          └─────────────────────┘
                    ▲                      │
                    │                      ▼
                    │                  ┌──────┐
                    └──────────────────│ done │
                                       └──────┘
                                           │
                                           ▼
                                    (back to image)
                                           │
                                           ▼
                                    ┌────────────┐
                                    │ image_ready│
                                    └────────────┘
```

---

## 4. User Flow

### 4.1 Single Scene Generation (Primary Flow)

```
1. User enters GenerateStep
   └── All scenes show "pending" status

2. User clicks [Generate Image] on Scene 1
   └── Status: pending → generating_image
   └── Spinner shows on image area
   └── API call: POST /api/generate/image

3. Image generation completes
   └── Status: generating_image → image_ready
   └── Image preview displays
   └── Buttons appear: [Approve & Generate Video] [Edit & Regenerate]

4a. User APPROVES image
    └── Clicks [Approve & Generate Video]
    └── Status: image_ready → generating_video
    └── API call: POST /api/generate/video
    └── Video generation completes
    └── Status: generating_video → done
    └── Video preview displays (playable)
    └── Buttons: [Regenerate Video] [Back to Image]

4b. User wants to EDIT image
    └── Clicks [Edit & Regenerate]
    └── Side panel slides in (fade-in animation)
    └── Panel shows:
        - Current image thumbnail
        - image_prompt textarea (editable)
        - negative_prompt textarea (editable)
        - [Regenerate Image] button
    └── User edits prompts
    └── Clicks [Regenerate Image]
    └── Panel closes
    └── Status: image_ready → generating_image
    └── New image generates
    └── Returns to step 3

5. Scene complete - user moves to next scene
```

### 4.2 Batch Image Generation (Optional Flow)

```
1. User clicks [Generate All Images] button (top of page)
   └── All pending scenes start image generation sequentially
   └── Each scene: pending → generating_image → image_ready

2. All images complete
   └── User sees all generated images
   └── Each scene shows [Approve & Generate Video] [Edit & Regenerate]

3. User reviews each image individually
   └── Approves good ones → video generates
   └── Edits bad ones → regenerates image
   └── No automatic video generation
```

### 4.3 Video Regeneration Flow

```
1. Scene is in "done" status
   └── User sees video preview

2a. User wants different video
    └── Clicks [Regenerate Video]
    └── Side panel opens with video_prompt
    └── User edits prompt/duration
    └── Clicks [Regenerate]
    └── Status: done → generating_video → done

2b. User wants different image entirely
    └── Clicks [Back to Image]
    └── Status: done → image_ready
    └── Video is discarded
    └── User can edit image prompt and regenerate
```

### 4.4 Error Handling Flow

```
1. Generation fails at any stage
   └── Status: * → error
   └── Error message displays

2. User can:
   └── [Retry] - Attempt same generation again
   └── [Edit Prompt] - Open side panel, edit, regenerate
```

---

## 5. Technical Architecture

### 5.1 Status Type Update

**File:** `packages/shared/src/types/project.ts`

Current:
```typescript
status: "pending" | "generating_image" | "generating_video" | "done" | "error"
```

New:
```typescript
status: "pending" | "generating_image" | "image_ready" | "generating_video" | "done" | "error"
```

### 5.2 GeneratedSceneSnapshot Update

**File:** `packages/shared/src/types/project.ts`

No structural changes needed. The `imageUrl` field will be populated at `image_ready` status.

```typescript
interface GeneratedSceneSnapshot {
  sceneIndex: number;
  imageUrl?: string;      // Set when image_ready
  videoUrl?: string;      // Set when done
  status: GeneratedSceneStatus;
  error?: string;
}
```

### 5.3 Store Actions

**File:** `packages/frontend/src/store/useStore.ts`

New actions to add:

```typescript
// Generate only image, stop at image_ready
generateSceneImage: (sceneIndex: number) => Promise<void>

// Approve image and generate video
approveImageAndGenerateVideo: (sceneIndex: number) => Promise<void>

// Update image prompt and regenerate
updateAndRegenerateImage: (
  sceneIndex: number, 
  imagePrompt: string, 
  negativePrompt: string
) => Promise<void>

// Update video prompt and regenerate
updateAndRegenerateVideo: (
  sceneIndex: number, 
  videoPrompt: string, 
  duration: number
) => Promise<void>

// Go back from done to image_ready (discard video)
backToImageStage: (sceneIndex: number) => void

// Generate all images (batch)
generateAllImages: () => Promise<void>
```

### 5.4 API Calls (No Backend Changes Needed)

The existing API endpoints are sufficient:

| Action | Endpoint | Notes |
|--------|----------|-------|
| Generate Image | `POST /api/generate/image` | No change |
| Generate Video | `POST /api/generate/video` | No change |
| Save Work | `PUT /api/projects/:id/works/:id` | Saves updated prompts |

### 5.5 Scene Prompt Updates

When user edits prompts in side panel, we need to update the `scenes` array in the store:

```typescript
// Update scene prompts (persisted to work)
updateScenePrompts: (
  sceneIndex: number,
  updates: {
    image_prompt?: string;
    negative_prompt?: string;
    video_prompt?: string;
    duration_seconds?: number;
  }
) => void
```

---

## 6. UI/UX Design

### 6.1 GenerateStep Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Step 3: Generate                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Progress: 2/5 scenes complete          [Generate All Images]        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Scene 1                                                    [done]   │   │
│  │ ┌──────────────────────┐  ┌──────────────────────┐                  │   │
│  │ │    Image Preview     │  │    Video Preview     │                  │   │
│  │ │                      │  │    [▶ Play]          │                  │   │
│  │ └──────────────────────┘  └──────────────────────┘                  │   │
│  │ [Regenerate Video]  [Back to Image]                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Scene 2                                              [image_ready]  │   │
│  │ ┌──────────────────────┐  ┌──────────────────────┐                  │   │
│  │ │    Image Preview     │  │    Waiting for       │                  │   │
│  │ │                      │  │    approval...       │                  │   │
│  │ └──────────────────────┘  └──────────────────────┘                  │   │
│  │ [Approve & Generate Video]  [Edit & Regenerate]                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Scene 3                                                  [pending]  │   │
│  │ ┌──────────────────────┐  ┌──────────────────────┐                  │   │
│  │ │    Empty             │  │    Empty             │                  │   │
│  │ │    [Generate Image]  │  │                      │                  │   │
│  │ └──────────────────────┘  └──────────────────────┘                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ... more scenes ...                                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    [← Back to Scenario]    [Continue to Editor →]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Scene Card States

#### State: `pending`

```
┌─────────────────────────────────────────────────────────────────────┐
│ Scene 1                                                  ○ Pending  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐            │
│  │                        │  │                        │            │
│  │     [Image Icon]       │  │     [Video Icon]       │            │
│  │                        │  │                        │            │
│  │  Click to generate     │  │    Waiting for image   │            │
│  │                        │  │                        │            │
│  └────────────────────────┘  └────────────────────────┘            │
│                                                                     │
│                    [Generate Image]                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### State: `generating_image`

```
┌─────────────────────────────────────────────────────────────────────┐
│ Scene 1                                      ◐ Generating Image...  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐            │
│  │                        │  │                        │            │
│  │     [Spinner]          │  │     [Video Icon]       │            │
│  │                        │  │                        │            │
│  │  Generating image...   │  │    Waiting for image   │            │
│  │                        │  │      (dimmed)          │            │
│  └────────────────────────┘  └────────────────────────┘            │
│                                                                     │
│                    (buttons disabled)                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### State: `image_ready`

```
┌─────────────────────────────────────────────────────────────────────┐
│ Scene 1                                         ◑ Image Ready       │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │                        │            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │   Waiting for         │            │
│  │ ▓▓ Generated Image ▓▓ │  │   approval...         │            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │                        │            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │   [Hourglass Icon]    │            │
│  └────────────────────────┘  └────────────────────────┘            │
│                                                                     │
│  [✓ Approve & Generate Video]     [✎ Edit & Regenerate]            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### State: `generating_video`

```
┌─────────────────────────────────────────────────────────────────────┐
│ Scene 1                                      ◐ Generating Video...  │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │                        │            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │     [Spinner]          │            │
│  │ ▓▓ Approved Image  ▓▓ │  │                        │            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │  Generating video...   │            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │                        │            │
│  └────────────────────────┘  └────────────────────────┘            │
│                                                                     │
│                    (buttons disabled)                               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### State: `done`

```
┌─────────────────────────────────────────────────────────────────────┐
│ Scene 1                                               ● Complete    │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │            │
│  │ ▓▓   Final Image   ▓▓ │  │ ▓▓  Final Video    ▓▓ │            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │ ▓▓▓▓▓ [▶ Play] ▓▓▓▓▓ │            │
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │            │
│  └────────────────────────┘  └────────────────────────┘            │
│                                                                     │
│  [↻ Regenerate Video]                        [← Back to Image]     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

#### State: `error`

```
┌─────────────────────────────────────────────────────────────────────┐
│ Scene 1                                               ✕ Error       │
├─────────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐  ┌────────────────────────┐            │
│  │                        │  │                        │            │
│  │     [Error Icon]       │  │     [Error Icon]       │            │
│  │                        │  │                        │            │
│  │  Failed to generate    │  │                        │            │
│  │                        │  │                        │            │
│  └────────────────────────┘  └────────────────────────┘            │
│                                                                     │
│  Error: API rate limit exceeded                                     │
│                                                                     │
│  [↻ Retry]                              [✎ Edit Prompt]            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Side Panel Design

#### General Properties

| Property | Value |
|----------|-------|
| Width | 400px |
| Position | Right side of screen |
| Animation | Fade-in (200ms ease-out) |
| Backdrop | Semi-transparent overlay (click to close) |
| Close | X button or click outside |
| Z-index | Above main content |

#### Image Edit Panel

```
┌────────────────────────────────────────┐
│                                    [✕] │
│         Edit Image Prompt              │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │     [Current Image Thumbnail]    │  │
│  │           150x150                │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│                                        │
│  Image Prompt *                        │
│  ┌──────────────────────────────────┐  │
│  │ A red sports car parked on a    │  │
│  │ mountain road at sunset,        │  │
│  │ cinematic lighting, dramatic    │  │
│  │ clouds in the background...     │  │
│  │                                  │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│  Characters: 156/500                   │
│                                        │
│  Negative Prompt (optional)            │
│  ┌──────────────────────────────────┐  │
│  │ blurry, low quality, text,      │  │
│  │ watermark, deformed...          │  │
│  └──────────────────────────────────┘  │
│                                        │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │       [Regenerate Image]         │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

#### Video Edit Panel

```
┌────────────────────────────────────────┐
│                                    [✕] │
│         Edit Video Prompt              │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │                                  │  │
│  │   [Approved Image Thumbnail]     │  │
│  │      (Reference Frame)           │  │
│  │           150x150                │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│  This image will be animated           │
│                                        │
│  Video Prompt *                        │
│  ┌──────────────────────────────────┐  │
│  │ Camera slowly pans around the   │  │
│  │ car, sun rays flicker through   │  │
│  │ the clouds, subtle wind         │  │
│  │ movement in the grass...        │  │
│  │                                  │  │
│  │                                  │  │
│  └──────────────────────────────────┘  │
│  Characters: 142/500                   │
│                                        │
│  Duration                              │
│  ┌────────────────┐                    │
│  │  5 seconds  ▼  │                    │
│  └────────────────┘                    │
│  Options: 3, 4, 5, 6, 7, 8, 9, 10 sec  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │       [Regenerate Video]         │  │
│  └──────────────────────────────────┘  │
│                                        │
└────────────────────────────────────────┘
```

### 6.4 Button Styling

| Button | Style | Color |
|--------|-------|-------|
| Generate Image | Primary | Blue |
| Approve & Generate Video | Success | Green |
| Edit & Regenerate | Secondary | Gray outline |
| Regenerate Video | Secondary | Gray outline |
| Back to Image | Text/Link | Gray text |
| Retry | Primary | Blue |
| Generate All Images | Primary outline | Blue outline |

### 6.5 Status Badge Colors

| Status | Badge Color | Icon |
|--------|-------------|------|
| pending | Gray | Circle outline |
| generating_image | Yellow/Amber | Spinner |
| image_ready | Blue | Half-filled circle |
| generating_video | Blue | Spinner |
| done | Green | Checkmark |
| error | Red | X mark |

---

## 7. Implementation Plan

### Phase 1: Type & Schema Updates

**Priority:** High
**Effort:** Small
**Files:**
- `packages/shared/src/types/project.ts`
- `packages/backend/src/db/models/Work.ts`

**Tasks:**
1. Add `image_ready` to `GeneratedSceneStatus` type
2. Update Work model status enum
3. No database migration needed (string enum)

### Phase 2: Store Updates

**Priority:** High
**Effort:** Medium
**Files:**
- `packages/frontend/src/store/useStore.ts`

**Tasks:**
1. Add new store actions:
   - `generateSceneImage`
   - `approveImageAndGenerateVideo`
   - `updateAndRegenerateImage`
   - `updateAndRegenerateVideo`
   - `backToImageStage`
   - `generateAllImages`
   - `updateScenePrompts`
2. Refactor existing `generateScene` to use new flow

### Phase 3: UI Components

**Priority:** High
**Effort:** Large
**Files:**
- `packages/frontend/src/components/ui/SidePanel.tsx` (new)
- `packages/frontend/src/components/steps/ImageEditPanel.tsx` (new)
- `packages/frontend/src/components/steps/VideoEditPanel.tsx` (new)
- `packages/frontend/src/components/steps/GenerateStep.tsx` (refactor)

**Tasks:**
1. Create `SidePanel` base component
   - Fade-in animation
   - Backdrop overlay
   - Close functionality

2. Create `ImageEditPanel` component
   - Image thumbnail
   - Prompt textareas
   - Regenerate button

3. Create `VideoEditPanel` component
   - Image thumbnail
   - Video prompt textarea
   - Duration selector
   - Regenerate button

4. Refactor `SceneCard` component (or create new)
   - State-based rendering
   - Action buttons per state
   - Image/Video preview areas

5. Update `GenerateStep` component
   - Remove "Generate All" button
   - Add "Generate All Images" button
   - Integrate side panel
   - Handle panel open/close state

### Phase 4: Integration & Testing

**Priority:** High
**Effort:** Medium

**Tasks:**
1. Wire up all components
2. Test complete flow for each state
3. Test error handling
4. Test persistence (refresh page)
5. Test batch image generation

---

## 8. File Changes

### New Files

| File | Purpose |
|------|---------|
| `packages/frontend/src/components/ui/SidePanel.tsx` | Reusable side panel wrapper |
| `packages/frontend/src/components/steps/ImageEditPanel.tsx` | Image prompt editing |
| `packages/frontend/src/components/steps/VideoEditPanel.tsx` | Video prompt editing |

### Modified Files

| File | Changes |
|------|---------|
| `packages/shared/src/types/project.ts` | Add `image_ready` to status enum |
| `packages/backend/src/db/models/Work.ts` | Add `image_ready` to status enum |
| `packages/frontend/src/store/useStore.ts` | Add new actions |
| `packages/frontend/src/components/steps/GenerateStep.tsx` | Major refactor - new flow |

### Potentially Modified Files

| File | Changes |
|------|---------|
| `packages/frontend/src/components/steps/SceneCard.tsx` | If exists, refactor for new states |
| `packages/frontend/src/styles/*.css` | Side panel styles if not using Tailwind |

---

## 9. Migration Notes

### Backward Compatibility

The change is backward compatible:

1. **Existing works with `done` status**: Will continue to work normally
2. **Existing works with `generating_image` or `generating_video`**: May need manual intervention (rare edge case)
3. **New status `image_ready`**: Old clients won't understand, but data remains valid

### Data Migration

No database migration required:
- Status field is a string enum
- Adding new enum value doesn't break existing data
- Mongoose/MongoDB will accept the new value

### Rollback Plan

If issues arise:
1. Revert frontend changes
2. Backend can keep the new status (no harm)
3. Any scenes stuck in `image_ready` can be manually set to `pending`

---

## Appendix A: Component Props

### SidePanel Props

```typescript
interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

### ImageEditPanel Props

```typescript
interface ImageEditPanelProps {
  sceneIndex: number;
  currentImageUrl?: string;
  imagePrompt: string;
  negativePrompt: string;
  onRegenerate: (imagePrompt: string, negativePrompt: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}
```

### VideoEditPanel Props

```typescript
interface VideoEditPanelProps {
  sceneIndex: number;
  referenceImageUrl?: string;
  videoPrompt: string;
  duration: number;
  onRegenerate: (videoPrompt: string, duration: number) => void;
  onClose: () => void;
  isLoading?: boolean;
}
```

### SceneCard Props

```typescript
interface SceneCardProps {
  scene: ScenarioScene;
  generatedScene: GeneratedSceneSnapshot;
  onGenerateImage: () => void;
  onApproveAndGenerateVideo: () => void;
  onEditImage: () => void;
  onEditVideo: () => void;
  onBackToImage: () => void;
  onRetry: () => void;
}
```

---

## Appendix B: Store Actions Signature

```typescript
interface StoreActions {
  // Generate only image, stop at image_ready
  generateSceneImage: (sceneIndex: number) => Promise<void>;

  // Approve image and generate video
  approveImageAndGenerateVideo: (sceneIndex: number) => Promise<void>;

  // Update image prompt and regenerate
  updateAndRegenerateImage: (
    sceneIndex: number,
    imagePrompt: string,
    negativePrompt: string
  ) => Promise<void>;

  // Update video prompt and regenerate
  updateAndRegenerateVideo: (
    sceneIndex: number,
    videoPrompt: string,
    duration: number
  ) => Promise<void>;

  // Go back from done to image_ready (discard video)
  backToImageStage: (sceneIndex: number) => void;

  // Generate all images (batch) - sequential processing
  generateAllImages: () => Promise<void>;

  // Update scene prompts in scenes array
  updateScenePrompts: (
    sceneIndex: number,
    updates: {
      image_prompt?: string;
      negative_prompt?: string;
      video_prompt?: string;
      duration_seconds?: number;
    }
  ) => void;
}
```

---

*Document Version: 1.0*
*Last Updated: February 2026*
