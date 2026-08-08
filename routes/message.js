// ==========================================
// Bot Pro Message Route
// Firebase Message + Seen System
// ==========================================

import express from "express";
import { db } from "../firebase.js";

const router = express.Router();


// ==========================================
// Test Route
// ==========================================

router.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Bot Pro Message API Ready"

    });

});


// ==========================================
// Send Message
// ==========================================

router.post(
    "/send",
    async (req, res) => {

        try {

            const {
                chatId,
                senderId,
                receiverId,
                text
            } = req.body;


            // ==================================
            // Validate
            // ==================================

            if (
                !chatId ||
                !senderId ||
                !receiverId ||
                !text
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "chatId, senderId, receiverId and text are required"

                });

            }


            // ==================================
            // Clean Text
            // ==================================

            const cleanText =
                text.trim();


            if (!cleanText) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Message cannot be empty"

                });

            }


            // ==================================
            // Create Message Reference
            // ==================================

            const messageRef =
                db
                    .ref(
                        "messages/" +
                        chatId
                    )
                    .push();


            const messageId =
                messageRef.key;


            // ==================================
            // Message Data
            // ==================================

            const message = {

                id:
                    messageId,

                chatId:
                    chatId,

                senderId:
                    senderId,

                receiverId:
                    receiverId,

                text:
                    cleanText,

                createdAt:
                    Date.now(),

                // ==============================
                // Seen Status
                // ==============================

                seen:
                    false,

                seenAt:
                    null

            };


            // ==================================
            // Save Message
            // ==================================

            await messageRef.set(
                message
            );


            // ==================================
            // Success Response
            // ==================================

            res.json({

                success: true,

                message:
                    "Message Sent Successfully",

                data:
                    message

            });

        }

        catch (error) {

            console.error(
                "Message Send Error:",
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
// Get Chat Messages
// ==========================================

router.get(
    "/:chatId",
    async (req, res) => {

        try {

            const chatId =
                req.params.chatId;


            const snapshot =
                await db
                    .ref(
                        "messages/" +
                        chatId
                    )
                    .once("value");


            const data =
                snapshot.val();


            const messages =
                data
                    ? Object.values(data)
                    : [];


            messages.sort(
                (a, b) =>
                    a.createdAt -
                    b.createdAt
            );


            res.json({

                success: true,

                chatId:
                    chatId,

                messages:
                    messages

            });

        }

        catch (error) {

            console.error(
                "Get Messages Error:",
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
// Mark Messages As Seen
// ==========================================

router.post(
    "/seen/:chatId",
    async (req, res) => {

        try {

            const chatId =
                req.params.chatId;


            const {
                receiverId
            } = req.body;


            // ==================================
            // Validate
            // ==================================

            if (!receiverId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "receiverId is required"

                });

            }


            // ==================================
            // Firebase Reference
            // ==================================

            const messagesRef =
                db.ref(
                    "messages/" +
                    chatId
                );


            const snapshot =
                await messagesRef.once(
                    "value"
                );


            const data =
                snapshot.val();


            if (!data) {

                return res.json({

                    success: true,

                    message:
                        "No messages found",

                    updated:
                        0

                });

            }


            // ==================================
            // Prepare Updates
            // ==================================

            const updates = {};

            let updatedCount =
                0;


            Object.entries(data)
                .forEach(
                    ([messageId, message]) => {

                        // ==========================
                        // Only Receiver's Messages
                        // ==========================

                        if (
                            message.receiverId ===
                                receiverId &&
                            message.seen !== true
                        ) {

                            updates[
                                messageId +
                                "/seen"
                            ] = true;


                            updates[
                                messageId +
                                "/seenAt"
                            ] = Date.now();


                            updatedCount++;

                        }

                    }
                );


            // ==================================
            // Update Firebase
            // ==================================

            if (
                Object.keys(updates).length >
                0
            ) {

                await messagesRef.update(
                    updates
                );

            }


            // ==================================
            // Response
            // ==================================

            res.json({

                success: true,

                message:
                    "Messages Marked As Seen",

                chatId:
                    chatId,

                updated:
                    updatedCount

            });

        }

        catch (error) {

            console.error(
                "Mark Seen Error:",
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
// REAL-TIME MESSAGE STREAM
// ==========================================

router.get(
    "/stream/:chatId",
    (req, res) => {

        const chatId =
            req.params.chatId;


        // =====================================
        // SSE Headers
        // =====================================

        res.setHeader(
            "Content-Type",
            "text/event-stream"
        );

        res.setHeader(
            "Cache-Control",
            "no-cache"
        );

        res.setHeader(
            "Connection",
            "keep-alive"
        );

        res.setHeader(
            "X-Accel-Buffering",
            "no"
        );


        // =====================================
        // Connected Event
        // =====================================

        res.write(
            `event: connected\n` +
            `data: ${JSON.stringify({

                success: true,

                chatId:
                    chatId

            })}\n\n`
        );


        // =====================================
        // Firebase Reference
        // =====================================

        const messagesRef =
            db.ref(
                "messages/" +
                chatId
            );


        // =====================================
        // Firebase Listener
        // =====================================

        const listener =
            messagesRef.on(
                "value",
                (snapshot) => {

                    const data =
                        snapshot.val();


                    const messages =
                        data
                            ? Object.values(data)
                            : [];


                    messages.sort(
                        (a, b) =>
                            a.createdAt -
                            b.createdAt
                    );


                    // =================================
                    // Send Messages To Browser
                    // =================================

                    res.write(

                        `event: messages\n` +

                        `data: ${JSON.stringify({

                            success: true,

                            chatId:
                                chatId,

                            messages:
                                messages

                        })}\n\n`

                    );

                }
            );


        // =====================================
        // Keep Connection Alive
        // =====================================

        const heartbeat =
            setInterval(
                () => {

                    res.write(
                        `: heartbeat\n\n`
                    );

                },
                25000
            );


        // =====================================
        // Disconnect Cleanup
        // =====================================

        req.on(
            "close",
            () => {

                clearInterval(
                    heartbeat
                );


                messagesRef.off(
                    "value",
                    listener
                );


                console.log(
                    "🔌 Message stream closed:",
                    chatId
                );

            }
        );


        console.log(
            "🟢 Message stream connected:",
            chatId
        );

    }
);


// ==========================================
// Export
// ==========================================

export default router;
