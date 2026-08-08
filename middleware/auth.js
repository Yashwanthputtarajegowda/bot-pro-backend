// ==========================================
// Bot Pro - Firebase Authentication Middleware
// ==========================================

import admin from "../firebase.js";

export async function requireAuth(req, res, next) {
    try {

        const authHeader =
            req.headers.authorization || "";

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "Authentication required."
            });
        }

        const idToken =
            authHeader.substring(7).trim();

        if (!idToken) {
            return res.status(401).json({
                success: false,
                error: "Authentication token missing."
            });
        }

        // Verify Firebase ID Token
        const decodedToken =
            await admin.auth().verifyIdToken(idToken);

        // Save verified user information
        req.user = decodedToken;

        req.userId = decodedToken.uid;

        next();

    } catch (error) {

        console.error(
            "❌ Firebase Auth Error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            error: "Invalid or expired authentication token."
        });
    }
}
