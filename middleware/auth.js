// ==========================================
// Bot Pro - Firebase Authentication Middleware
// ==========================================

const admin = require("firebase-admin");

async function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization || "";

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                error: "Authentication required."
            });
        }

        const idToken = authHeader.substring(7).trim();

        if (!idToken) {
            return res.status(401).json({
                success: false,
                error: "Authentication token missing."
            });
        }

        const decodedToken =
            await admin.auth().verifyIdToken(idToken);

        req.user = decodedToken;

        req.userId = decodedToken.uid;

        next();

    } catch (error) {

        console.error(
            "Firebase Auth Error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            error: "Invalid or expired authentication token."
        });
    }
}

module.exports = {
    requireAuth
};
