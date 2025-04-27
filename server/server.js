import express from 'express';
import bodyParser from 'body-parser';
import Pusher from 'pusher';
import dotenv from 'dotenv';

dotenv.config(); // بارگذاری مقادیر از .env

const app = express();
const port = 5000;

// تنظیمات پشتیبانی از CORS
import cors from 'cors';
app.use(cors());

// استفاده از body-parser برای پردازش درخواست‌های JSON
app.use(bodyParser.json());

// تنظیمات Pusher
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
});

// مسیر ارسال پیام
app.post('/api/send-message', (req, res) => {
    const { message } = req.body;

    console.log('Sending message:', message);  // اضافه کردن لاگ برای بررسی پیام دریافتی

    pusher.trigger('my-channel', 'my-event', {
        message,
    }).then(() => {
        console.log('Message sent to Pusher');
    }).catch((error) => {
        console.error('Error sending message to Pusher:', error);
    });

    res.status(200).json({ success: true });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
