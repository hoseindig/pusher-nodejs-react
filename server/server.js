// server.js (Express)

import express from 'express';
import bodyParser from 'body-parser';
import Pusher from 'pusher';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config(); // بارگذاری مقادیر از فایل .env

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());  // اضافه کردن CORS به سرور
// تنظیمات Pusher با استفاده از مقادیر از فایل .env
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
});

// مسیر API برای ارسال پیام
app.post('/api/send-message', (req, res) => {
    const { message } = req.body;

    // ارسال پیام به کانال Pusher
    pusher.trigger('my-channel', 'my-event', {
        message,
    });
    console.log('message', message);
    res.status(200).json({ success: true });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
