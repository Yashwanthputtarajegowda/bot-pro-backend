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
// Multer Storage
// ==========================================

const storage = multer.diskStorage({

    destination(req, file, cb) {

        cb(null, "uploads/");

    },

    filename(req, file, cb) {

        const fileName =
            Date.now() + "-" + file.originalname;

        cb(null, fileName);

    }

});

const upload = multer({

    storage

});

// ==========================================
// Test API
// ==========================================

router.get("/", (req, res) => {

    res.json({

        success: true,

        message: "Bot Pro Upload API Ready"

    });

});

router.get("/video", (req, res) => {

    res.json({

        success: true,

        route: "Video Route Working"

    });

});

// ==========================================
// Upload Video
// ==========================================

router.post(

    "/video",

    upload.single("video"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message: "No video selected"

                });

            }

            const telegramResult =
                await uploadVideoToTelegram(

                    req.file.path,

                    req.body.caption || ""

                );

            await fs.remove(req.file.path);

            if (!telegramResult.success) {

                return res.status(500).json({

                    success: false,

                    error: telegramResult.error

                });

            }

            res.json({

                success: true,

                message: "Video Uploaded Successfully",

                telegram: telegramResult

            });

        }

        catch (error) {

    console.error(error);

    res.status(500).json({

        success: false,

        error: error.message,

        stack: error.stack

    });

}

    }

);

// ==========================================
// Export
// ==========================================

export default router;
