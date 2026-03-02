import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { ProjectAsset, ProjectAssetList } from "@viragen/shared";
import { projectExists } from "./projects.js";
import { assetsDir, assetsJsonPath, assetFilePath } from "./path.js";

const ASSETS_JSON = "assets.json";

const MIME_TO_TYPE: Record<string, ProjectAsset["type"]> = {
  "image/png": "image",
  "image/jpeg": "image",
  "image/jpg": "image",
  "image/webp": "image",
  "image/gif": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "audio/mpeg": "audio",
  "audio/mp3": "audio",
  "audio/wav": "audio",
  "audio/m4a": "audio",
  "audio/x-m4a": "audio",
  "font/ttf": "font",
  "font/otf": "font",
  "application/font-woff": "font",
  "application/font-woff2": "font",
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

async function ensureAssetsDir(projectId: string): Promise<string> {
  const dir = assetsDir(projectId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function readAssetsMeta(projectId: string): Promise<ProjectAsset[]> {
  const filePath = assetsJsonPath(projectId);
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data) as { assets?: ProjectAsset[] };
    return Array.isArray(parsed.assets) ? parsed.assets : [];
  } catch {
    return [];
  }
}

async function writeAssetsMeta(projectId: string, assets: ProjectAsset[]): Promise<void> {
  await ensureAssetsDir(projectId);
  const filePath = assetsJsonPath(projectId);
  await fs.writeFile(
    filePath,
    JSON.stringify({ assets }, null, 2),
    "utf-8"
  );
}

function inferType(mimeType: string): ProjectAsset["type"] {
  const lower = mimeType.toLowerCase();
  if (MIME_TO_TYPE[lower]) return MIME_TO_TYPE[lower];
  if (lower.startsWith("image/")) return "image";
  if (lower.startsWith("video/")) return "video";
  if (lower.startsWith("audio/")) return "audio";
  if (lower.includes("font") || lower.includes("woff") || lower.includes("ttf") || lower.includes("otf")) return "font";
  return "image";
}

function safeFilename(original: string): string {
  const ext = path.extname(original) || "";
  const base = path.basename(original, ext).replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 80) || "file";
  return `${base}${ext}`;
}

export async function listAssets(
  projectId: string,
  filterType?: ProjectAsset["type"]
): Promise<ProjectAssetList> {
  const assets = await readAssetsMeta(projectId);
  const filtered = filterType ? assets.filter((a) => a.type === filterType) : assets;
  const totalSize = filtered.reduce((sum, a) => sum + a.size, 0);
  return {
    assets: filtered,
    totalSize,
    count: filtered.length,
  };
}

export async function getAsset(
  projectId: string,
  assetId: string,
  userId?: string
): Promise<ProjectAsset | null> {
  if (userId && !(await projectExists(projectId, userId))) return null;
  const assets = await readAssetsMeta(projectId);
  return assets.find((a) => a.id === assetId) ?? null;
}

export async function getAssetFilePath(
  projectId: string,
  assetId: string
): Promise<string | null> {
  const asset = await getAsset(projectId, assetId);
  if (!asset) return null;
  const dir = assetsDir(projectId);
  const fullPath = path.resolve(dir, asset.filename);
  try {
    await fs.access(fullPath);
    return fullPath;
  } catch {
    return null;
  }
}

export interface UploadAssetInput {
  projectId: string;
  userId?: string;
  file: { buffer: Buffer; mimetype: string; originalname: string; size: number };
  name?: string;
  tags?: string[];
}

export async function uploadAsset(input: UploadAssetInput): Promise<ProjectAsset> {
  const { projectId, userId, file, name, tags } = input;
  if (userId && !(await projectExists(projectId, userId))) {
    throw new Error("Project not found");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large (max 50MB)");
  }
  const assetType = inferType(file.mimetype);
  const allowed = ["image", "video", "audio", "font"].includes(assetType);
  if (!allowed) {
    throw new Error("Unsupported file type");
  }

  const id = "asset_" + randomUUID().replace(/-/g, "").slice(0, 12);
  const ext = path.extname(file.originalname) || (file.mimetype === "image/jpeg" ? ".jpg" : ".bin");
  const filename = `${id}_${safeFilename(file.originalname)}`;
  const dir = await ensureAssetsDir(projectId);
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, file.buffer);

  const now = Date.now();
  const asset: ProjectAsset = {
    id,
    name: (name || file.originalname || "Asset").trim().slice(0, 200),
    type: assetType,
    filename,
    mimeType: file.mimetype,
    size: file.size,
    createdAt: now,
    updatedAt: now,
    tags: tags && tags.length > 0 ? tags : undefined,
  };

  const assets = await readAssetsMeta(projectId);
  assets.push(asset);
  await writeAssetsMeta(projectId, assets);
  return asset;
}

export async function deleteAsset(
  projectId: string,
  assetId: string,
  userId?: string
): Promise<boolean> {
  if (userId && !(await projectExists(projectId, userId))) return false;
  const assets = await readAssetsMeta(projectId);
  const index = assets.findIndex((a) => a.id === assetId);
  if (index === -1) return false;
  const [removed] = assets.splice(index, 1);
  const fullPath = path.join(assetsDir(projectId), removed.filename);
  try {
    await fs.unlink(fullPath);
  } catch {
    // ignore if already missing
  }
  await writeAssetsMeta(projectId, assets);
  return true;
}

export async function updateAssetMeta(
  projectId: string,
  assetId: string,
  updates: { name?: string; tags?: string[] },
  userId?: string
): Promise<ProjectAsset | null> {
  if (userId && !(await projectExists(projectId, userId))) return null;
  const assets = await readAssetsMeta(projectId);
  const asset = assets.find((a) => a.id === assetId);
  if (!asset) return null;
  if (updates.name !== undefined) asset.name = updates.name.trim().slice(0, 200);
  if (updates.tags !== undefined) asset.tags = updates.tags.length > 0 ? updates.tags : undefined;
  asset.updatedAt = Date.now();
  await writeAssetsMeta(projectId, assets);
  return asset;
}
