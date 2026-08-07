// ==========================================
// Bot Pro Backend Server
// ==========================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import uploadRoutes from "./routes/upload.js";

// ==========================================
// Config
// ==========================================

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// ==========================================
// Middlewares
// ==========================================

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// ==========================================
// Home Route
// ==========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        app: "Bot Pro Backend",

        version: "1.0.0",

        status: "Running"

    });

});

// ==========================================
// API Routes
// ==========================================

app.use("/api/upload", uploadRoutes);

// ==========================================
// Health Check
// ==========================================

app.get("/health", (req, res) => {

    res.json({

        status: "OK",

        server: "Bot Pro",

        uptime: process.uptime()

    });

});

// ==========================================
// 404
// ==========================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message: "Route Not Found"

    });

});

// ==========================================
// Start Server
// ==========================================

app.listen(PORT, () => {

    console.log(

        `✅ Bot Pro Backend Running on Port ${PORT}`

    );

});
