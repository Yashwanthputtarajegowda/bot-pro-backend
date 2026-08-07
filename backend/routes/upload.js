// ==========================================
// Bot Pro Upload Route
// ==========================================

import express from "express";
import multer from "multer";
import fs from "fs-extra";

import { uploadVideoToTelegram } from "../telegram.js";

const router = express.Router();

// ==========================================
// Upload Folder
// ==========================================

await fs.ensureDir("uploads");

// ==========================================
// Multer
// ==========================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");

    },

    filename: (req, file, cb) => {

        const uniqueName =
            Date.now() + "-" + file.originalname;

        cb(null, uniqueName);

    }

});

const upload = multer({

    storage

});

// ==========================================
// Test Route
// ==========================================

router.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Upload API Ready"

    });

});

// ==========================================
// Video Upload
// ==========================================

router.post(

    "/video",

    upload.single("video"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message: "Video not found"

                });

            }

            const result =
                await uploadVideoToTelegram(

                    req.file.path,

                    req.body.caption || ""

                );

            await fs.remove(req.file.path);

            if (!result.success) {

                return res.status(500).json(result);

            }

            res.json({

                success: true,

                message: "Video Uploaded",

                telegram: result

            });

        }

        catch (error) {

            res.status(500).json({

                success: false,

                error: error.message

            });

        }

    }

);

export default router;
