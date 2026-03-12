import { Router, type Request } from "express";
import multer from "multer";
import {
  listAssets,
  getAsset,
  getAssetFilePath,
  uploadAsset,
  deleteAsset,
  updateAssetMeta,
} from "../storage/assets.js";
import { projectExists } from "../storage/projects.js";
import { authenticate, requireScope } from "../middleware/auth.js";

const router = Router({ mergeParams: true });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Allow token in query for img src / direct links (e.g. asset file GET)
router.use((req, _res, next) => {
  if (!req.headers.authorization && typeof (req.query as { token?: string }).token === "string") {
    req.headers.authorization = `Bearer ${(req.query as { token: string }).token}`;
  }
  next();
});
router.use(authenticate);

function getProjectId(req: Request): string {
  return String((req.params as { projectId?: string }).projectId ?? "");
}

function getAssetId(req: Request): string {
  return String((req.params as { assetId?: string }).assetId ?? "");
}

// List assets
router.get("/", requireScope("projects:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const type = req.query.type as string | undefined;
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const filterType = type && ["image", "video", "audio", "font"].includes(type)
      ? (type as "image" | "video" | "audio" | "font")
      : undefined;
    const list = await listAssets(projectId, filterType);
    const baseUrl = `/api/projects/${projectId}/assets`;
    const assetsWithUrl = list.assets.map((a) => ({
      ...a,
      url: `${baseUrl}/${a.id}`,
    }));
    res.json({
      assets: assetsWithUrl,
      totalSize: list.totalSize,
      count: list.count,
    });
  } catch (e) {
    next(e);
  }
});

// Upload asset
router.post("/", requireScope("projects:write"), upload.single("file"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    if (!(await projectExists(projectId, userId))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const name = (req.body?.name as string) || file.originalname;
    const description = req.body?.description as string | undefined;
    let tags: string[] | undefined;
    try {
      const tagsRaw = req.body?.tags;
      if (typeof tagsRaw === "string") tags = JSON.parse(tagsRaw);
      else if (Array.isArray(tagsRaw)) tags = tagsRaw;
    } catch {
      // ignore
    }
    const asset = await uploadAsset({
      projectId,
      userId,
      file: {
        buffer: file.buffer,
        mimetype: file.mimetype,
        originalname: file.originalname,
        size: file.size,
      },
      name,
      tags,
      description,
    });
    const baseUrl = `/api/projects/${projectId}/assets`;
    res.status(201).json({
      ...asset,
      url: `${baseUrl}/${asset.id}`,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed";
    if (message.includes("too large") || message.includes("Unsupported")) {
      res.status(400).json({ error: message });
      return;
    }
    next(e);
  }
});

// Get asset metadata
router.get("/:assetId/meta", requireScope("projects:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const assetId = getAssetId(req);
    const asset = await getAsset(projectId, assetId, userId);
    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    const baseUrl = `/api/projects/${projectId}/assets`;
    res.json({ ...asset, url: `${baseUrl}/${asset.id}` });
  } catch (e) {
    next(e);
  }
});

// Update asset metadata
router.put("/:assetId", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const assetId = getAssetId(req);
    const { name, tags } = req.body ?? {};
    const asset = await updateAssetMeta(
      projectId,
      assetId,
      { name, tags },
      userId
    );
    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    const baseUrl = `/api/projects/${projectId}/assets`;
    res.json({ ...asset, url: `${baseUrl}/${asset.id}` });
  } catch (e) {
    next(e);
  }
});

// Get asset file (stream)
router.get("/:assetId", requireScope("projects:read"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const assetId = getAssetId(req);
    const asset = await getAsset(projectId, assetId, userId);
    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    const filePath = await getAssetFilePath(projectId, assetId);
    if (!filePath) {
      res.status(404).json({ error: "Asset file not found" });
      return;
    }
    res.setHeader("Content-Type", asset.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(asset.name)}"`);
    res.sendFile(filePath, (err) => {
      if (err && !res.headersSent) next(err);
    });
  } catch (e) {
    next(e);
  }
});

// Delete asset
router.delete("/:assetId", requireScope("projects:write"), async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const projectId = getProjectId(req);
    const assetId = getAssetId(req);
    const deleted = await deleteAsset(projectId, assetId, userId);
    if (!deleted) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
