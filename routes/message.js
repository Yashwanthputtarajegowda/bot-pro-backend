// ==========================================
// Bot Pro Message Route
// Firebase Message System
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

        message: "Bot Pro Message API Ready"

    });

});


// ==========================================
// Send Message
// ==========================================

router.post("/send", async (req, res) => {

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
        // Create Message ID
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

            id: messageId,

            chatId: chatId,

            senderId: senderId,

            receiverId: receiverId,

            text: text.trim(),

            createdAt: Date.now(),

            seen: false

        };


        // ==================================
        // Save Firebase
        // ==================================

        await messageRef.set(
            message
        );


        // ==================================
        // Success
        // ==================================

        res.json({

            success: true,

            message:
                "Message Sent Successfully",

            data: message

        });

    }

    catch (error) {

        console.error(
            "Message Send Error:",
            error
        );


        res.status(500).json({

            success: false,

            error: error.message

        });

    }

});


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

                chatId: chatId,

                messages: messages

            });

        }

        catch (error) {

            console.error(
                "Get Messages Error:",
                error
            );


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
