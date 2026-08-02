import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ── Storage config ──────────────────────────────────────────────
// Files are saved to <project-root>/uploads/ with a timestamp prefix
// to avoid name collisions.
const UPLOAD_DIR = path.resolve(__dirname, "../../../uploads");

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

// 10 MB limit per file, accept common image types only
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = /\.(jpe?g|png|gif|webp|avif|bmp)$/i;
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// ── Single / multi upload ───────────────────────────────────────

/**
 * POST /api/upload
 *
 * Accepts up to 10 images in a "files" field.
 * Returns { urls: string[] } — publicly accessible paths.
 */
router.post(
  "/",
  upload.array("files", 10),
  (req: express.Request, res: express.Response) => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const baseUrl = process.env.UPLOAD_BASE_URL || `http://localhost:${process.env.PORT || "4000"}`;

      const urls = files.map(
        (f) => `${baseUrl}/uploads/${f.filename}`
      );

      return res.json({ urls });
    } catch (err: any) {
      console.error("[Upload] Error:", err.message);
      return res.status(500).json({ error: err.message || "Upload failed" });
    }
  }
);

export default router;
