// ==========================================
// Bot Pro Cloudinary
// ==========================================

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ==========================================
// Config
// ==========================================

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET

});

// ==========================================
// Export
// ==========================================

export default cloudinary;

console.log("✅ Cloudinary Ready");
