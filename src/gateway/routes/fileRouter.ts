// routes/fileRouter.js
import express from "express";

import { getPresignedUrl } from "../services/fileService"; // ✅ correct import

const router = express.Router();

/**
 * Optional health check
 */
router.get("/presign-url", (req, res) => {
  res.json({ message: "Use POST /presign-url" });
});

/**
 * POST → Generate GCS Signed URL
 */
router.post("/presign-url", authGuard.middleware(), async (req, res) => {
  try {
    const userId = req.user?.id;
    const { fileName, fileType } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized (userId missing)" });
    }

    if (!fileName || !fileType) {
      return res.status(400).json({
        error: "fileName and fileType required",
      });
    }

    // Build key correctly
    const uniqueKey = `${Date.now()}-${fileName}`;

    // Generate signed URL using your service
    const { uploadUrl, key } = await getPresignedUrl({
      fileKey: uniqueKey,
      userId,
      contentType: fileType,
    });

    return res.json({
      uploadUrl,
      key,
    });

  } catch (err) {
    console.error("🔥 PRESIGN ERROR:", err);
    return res.status(500).json({
      error: "Failed to generate presign URL",
      details: err.message,
    });
  }
});

export default router;
