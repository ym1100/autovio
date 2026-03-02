import type { TimelineRow, TimelineAction } from "@xzdarcy/timeline-engine";
import type { TimelineEffect } from "@xzdarcy/timeline-engine";

export type TransitionType =
  | "cut"
  | "fade"
  | "dissolve"
  | "wipeleft"
  | "wiperight"
  | "slideup"
  | "slidedown";

export interface ClipMeta {
  sceneIndex: number;
  imageUrl?: string;
  videoUrl?: string;
  label: string;
  originalDuration?: number;
  trimStart?: number;
  trimEnd?: number;
  transitionType?: TransitionType;
  transitionDuration?: number;
}

export type ClipMetaMap = Record<string, ClipMeta>;

export interface ImageOverlay {
  id: string;
  assetId: string;
  assetUrl?: string;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  opacity: number;
  rotation: number;
  maintainAspectRatio: boolean;
}

export type ImageOverlayMap = Record<string, ImageOverlay>;

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  fontColor: string;
  centerX: number;
  centerY: number;
}

export type TextOverlayMap = Record<string, TextOverlay>;

export interface AudioMeta {
  volume: number;
}

export interface ExportSettings {
  width: number;
  height: number;
  fps: number;
}

export type SelectedItem =
  | { type: "clip"; actionId: string }
  | { type: "text"; actionId: string }
  | { type: "image"; actionId: string }
  | { type: "audio"; actionId: string }
  | null;

export type { TimelineRow, TimelineAction, TimelineEffect };
