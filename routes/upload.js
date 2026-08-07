// ==========================================
// Bot Pro Upload Route
// ==========================================

import express from "express";
import multer from "multer";
import fs from "fs-extra";

import cloudinary from "../cloudinary.js";
import { db } from "../firebase.js";

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

        cb(null, Date.now() + "-" + file.originalname);

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

            const uploadResult = await cloudinary.uploader.upload(

                req.file.path,

                {

                    resource_type: "video",

                    folder: "bot-pro/videos"

                }

            );

            const postId = Date.now().toString();

            await db.ref("posts/" + postId).set({

                id: postId,

                type: "video",

                url: uploadResult.secure_url,

                publicId: uploadResult.public_id,

                caption: req.body.caption || "",

                createdAt: Date.now()

            });

            await fs.remove(req.file.path);

            res.json({

                success: true,

                message: "Video Uploaded Successfully",

                id: postId,

                videoUrl: uploadResult.secure_url,

                publicId: uploadResult.public_id

            });

        }

        catch (error) {

            console.error(error);

            if (req.file) {

                await fs.remove(req.file.path).catch(() => {});

            }

            res.status(500).json({

                success: false,

                error: error.message

            });

        }

    }

);

// ==========================================
// Export
// ==========================================

export default router;
