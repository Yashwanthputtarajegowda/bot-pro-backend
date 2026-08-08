// ==========================================
// Bot Pro Message Route
// Firebase Real-Time Message System
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
            // Create Message Reference
            // ==================================

            const messageRef =
                db.ref(
                    "messages/" +
                    chatId
                ).push();


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
                    text.trim(),

                createdAt:
                    Date.now(),

                seen:
                    false

            };


            // ==================================
            // Save Firebase
            // ==================================

            await messageRef.set(
                message
            );


            // ==================================
            // Response
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
        // Send Connection Message
        // =====================================

        res.write(
            `event: connected\n` +
            `data: ${JSON.stringify({
                success: true,
                chatId: chatId
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
        // Firebase Real-Time Listener
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
                    // Send Updated Messages
                    // =================================

                    res.write(

                        `event: messages\n` +

                        `data: ${JSON.stringify({
                            success: true,
                            chatId: chatId,
                            messages: messages
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
        // Client Disconnect
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
