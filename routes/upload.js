// ==========================================
// Bot Pro Upload Route
// Video + Photo Upload
// Home Feed Posts
// Like + Save + Comments
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

        cb(
            null,
            "uploads/"
        );

    },

    filename(req, file, cb) {

        cb(
            null,
            Date.now() +
            "-" +
            file.originalname
        );

    }

});


const upload =
    multer({
        storage
    });


// ==========================================
// Test API
// ==========================================

router.get(
    "/",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Bot Pro Upload API Ready"

        });

    }
);


// ==========================================
// Video Test
// ==========================================

router.get(
    "/video",
    (req, res) => {

        res.json({

            success: true,

            route:
                "Video Route Working"

        });

    }
);


// ==========================================
// Photo Test
// ==========================================

router.get(
    "/photo",
    (req, res) => {

        res.json({

            success: true,

            route:
                "Photo Route Working"

        });

    }
);


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

                    message:
                        "No video selected"

                });

            }


            const uploadResult =
                await cloudinary.uploader.upload(

                    req.file.path,

                    {

                        resource_type:
                            "video",

                        folder:
                            "bot-pro/videos"

                    }

                );


            const postId =
                Date.now().toString();


            await db
                .ref(
                    "posts/" +
                    postId
                )
                .set({

                    id:
                        postId,

                    type:
                        "video",

                    url:
                        uploadResult.secure_url,

                    publicId:
                        uploadResult.public_id,

                    caption:
                        req.body.caption || "",

                    createdAt:
                        Date.now()

                });


            await fs.remove(
                req.file.path
            );


            res.json({

                success: true,

                message:
                    "Video Uploaded Successfully",

                id:
                    postId,

                videoUrl:
                    uploadResult.secure_url,

                publicId:
                    uploadResult.public_id

            });

        }

        catch (error) {

            console.error(
                "Video Upload Error:",
                error
            );


            if (req.file) {

                await fs
                    .remove(
                        req.file.path
                    )
                    .catch(
                        () => {}
                    );

            }


            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// Upload Photo
// ==========================================

router.post(
    "/photo",
    upload.single("photo"),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No photo selected"

                });

            }


            const uploadResult =
                await cloudinary.uploader.upload(

                    req.file.path,

                    {

                        resource_type:
                            "image",

                        folder:
                            "bot-pro/photos"

                    }

                );


            const postId =
                Date.now().toString();


            await db
                .ref(
                    "posts/" +
                    postId
                )
                .set({

                    id:
                        postId,

                    type:
                        "photo",

                    url:
                        uploadResult.secure_url,

                    publicId:
                        uploadResult.public_id,

                    caption:
                        req.body.caption || "",

                    createdAt:
                        Date.now()

                });


            await fs.remove(
                req.file.path
            );


            res.json({

                success: true,

                message:
                    "Photo Uploaded Successfully",

                id:
                    postId,

                photoUrl:
                    uploadResult.secure_url,

                publicId:
                    uploadResult.public_id

            });

        }

        catch (error) {

            console.error(
                "Photo Upload Error:",
                error
            );


            if (req.file) {

                await fs
                    .remove(
                        req.file.path
                    )
                    .catch(
                        () => {}
                    );

            }


            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// Get Home Feed Posts
// ==========================================

router.get(
    "/posts",

    async (req, res) => {

        try {

            const snapshot =
                await db
                    .ref("posts")
                    .once("value");


            const data =
                snapshot.val();


            const posts =
                data
                    ? Object.values(data)
                    : [];


            posts.sort(
                (a, b) =>

                    Number(
                        b.createdAt || 0
                    )

                    -

                    Number(
                        a.createdAt || 0
                    )

            );


            res.json({

                success: true,

                count:
                    posts.length,

                posts:
                    posts

            });

        }

        catch (error) {

            console.error(
                "Get Posts Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Unable to load posts",

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// LIKE / UNLIKE VIDEO
// ==========================================

router.post(
    "/like/:postId",

    async (req, res) => {

        try {

            const postId =
                req.params.postId;


            const {
                userId
            } = req.body;


            if (!userId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "userId is required"

                });

            }


            const postRef =
                db.ref(
                    "posts/" +
                    postId
                );


            const postSnapshot =
                await postRef.once(
                    "value"
                );


            if (!postSnapshot.exists()) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Post not found"

                });

            }


            const likeRef =
                postRef
                    .child("likes")
                    .child(userId);


            const likeSnapshot =
                await likeRef.once(
                    "value"
                );


            const alreadyLiked =
                likeSnapshot.exists();


            if (alreadyLiked) {

                await likeRef.remove();

            }

            else {

                await likeRef.set({

                    userId:
                        userId,

                    createdAt:
                        Date.now()

                });

            }


            const likesSnapshot =
                await postRef
                    .child("likes")
                    .once("value");


            const likesData =
                likesSnapshot.val();


            const likeCount =
                likesData
                    ? Object.keys(
                        likesData
                    ).length
                    : 0;


            res.json({

                success: true,

                liked:
                    !alreadyLiked,

                likeCount:
                    likeCount

            });

        }

        catch (error) {

            console.error(
                "Like Error:",
                error
            );


            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// SAVE / UNSAVE VIDEO
// ==========================================

router.post(
    "/save/:postId",

    async (req, res) => {

        try {

            const postId =
                req.params.postId;


            const {
                userId
            } = req.body;


            if (!userId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "userId is required"

                });

            }


            const postRef =
                db.ref(
                    "posts/" +
                    postId
                );


            const postSnapshot =
                await postRef.once(
                    "value"
                );


            if (!postSnapshot.exists()) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Post not found"

                });

            }


            const saveRef =
                postRef
                    .child("saves")
                    .child(userId);


            const saveSnapshot =
                await saveRef.once(
                    "value"
                );


            const alreadySaved =
                saveSnapshot.exists();


            if (alreadySaved) {

                await saveRef.remove();

            }

            else {

                await saveRef.set({

                    userId:
                        userId,

                    createdAt:
                        Date.now()

                });

            }


            res.json({

                success: true,

                saved:
                    !alreadySaved

            });

        }

        catch (error) {

            console.error(
                "Save Error:",
                error
            );


            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// ADD COMMENT
// ==========================================

router.post(
    "/comment/:postId",

    async (req, res) => {

        try {

            const postId =
                req.params.postId;


            const {
                userId,
                userName,
                text
            } = req.body;


            if (
                !userId ||
                !text
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "userId and text are required"

                });

            }


            const cleanText =
                String(
                    text
                ).trim();


            if (!cleanText) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Comment cannot be empty"

                });

            }


            const postRef =
                db.ref(
                    "posts/" +
                    postId
                );


            const postSnapshot =
                await postRef.once(
                    "value"
                );


            if (!postSnapshot.exists()) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Post not found"

                });

            }


            const commentRef =
                postRef
                    .child("comments")
                    .push();


            const commentId =
                commentRef.key;


            const comment = {

                id:
                    commentId,

                userId:
                    userId,

                userName:
                    userName ||
                    "User",

                text:
                    cleanText,

                createdAt:
                    Date.now()

            };


            await commentRef.set(
                comment
            );


            res.json({

                success: true,

                message:
                    "Comment Added",

                comment:
                    comment

            });

        }

        catch (error) {

            console.error(
                "Comment Error:",
                error
            );


            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// GET COMMENTS
// ==========================================

router.get(
    "/comments/:postId",

    async (req, res) => {

        try {

            const postId =
                req.params.postId;


            const snapshot =
                await db
                    .ref(
                        "posts/" +
                        postId +
                        "/comments"
                    )
                    .once("value");


            const data =
                snapshot.val();


            const comments =
                data
                    ? Object.values(data)
                    : [];


            comments.sort(
                (a, b) =>

                    Number(
                        a.createdAt || 0
                    )

                    -

                    Number(
                        b.createdAt || 0
                    )

            );


            res.json({

                success: true,

                count:
                    comments.length,

                comments:
                    comments

            });

        }

        catch (error) {

            console.error(
                "Get Comments Error:",
                error
            );


            res.status(500).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ==========================================
// Export
// ==========================================

export default router;
