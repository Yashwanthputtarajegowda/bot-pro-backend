// ==========================================
// Bot Pro Telegram
// ==========================================

import axios from "axios";
import FormData from "form-data";
import fs from "fs";

// ==========================================
// Environment
// ==========================================

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

// ==========================================
// Upload File
// ==========================================

export async function uploadVideoToTelegram(filePath, caption = "") {

    try {

        const form = new FormData();

        form.append("chat_id", CHANNEL_ID);

        form.append("caption", caption);

        form.append(
            "video",
            fs.createReadStream(filePath)
        );

        const response = await axios.post(

            `https://api.telegram.org/bot${BOT_TOKEN}/sendVideo`,

            form,

            {
                headers: form.getHeaders()
            }

        );

        return {

            success: true,

            messageId: response.data.result.message_id,

            fileId: response.data.result.video.file_id

        };

    }

    catch (error) {

        console.error(error.response?.data || error);

        return {

            success: false,

            error: error.message

        };

    }

}

// ==========================================
// Upload Photo
// ==========================================

export async function uploadPhotoToTelegram(filePath, caption = "") {

    try {

        const form = new FormData();

        form.append("chat_id", CHANNEL_ID);

        form.append("caption", caption);

        form.append(
            "photo",
            fs.createReadStream(filePath)
        );

        const response = await axios.post(

            `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,

            form,

            {
                headers: form.getHeaders()
            }

        );

        return {

            success: true,

            messageId: response.data.result.message_id,

            fileId: response.data.result.photo.at(-1).file_id

        };

    }

    catch (error) {

        console.error(error.response?.data || error);

        return {

            success: false,

            error: error.message

        };

    }

}
