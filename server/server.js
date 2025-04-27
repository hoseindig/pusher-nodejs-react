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

app.use(cors({
    origin: 'http://localhost:3000', // اجازه بده درخواست از 3000 بیاد
    credentials: true, // اگر نیاز به ارسال کوکی یا هدر خاص داری
}));

// استفاده از body-parser برای پردازش درخواست‌های JSON
app.use(bodyParser.json()); // برای application/json
app.use(bodyParser.urlencoded({ extended: true })); // برای application/x-www-form-urlencoded

// تنظیمات Pusher
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
});

// ارسال پیام از کاربر به ادمین
app.post('/api/send-message', (req, res) => {
    const { fromUserId, message } = req.body;

    // ارسال پیام به کانال خصوصی ادمین
    pusher.trigger('private-admin-channel', 'new-message', {
        message,
        fromUserId,
    });

    res.status(200).json({ success: true });
});

// ارسال پیام از ادمین به کاربر خاص
app.post('/api/send-to-user', (req, res) => {
    const { toUserId, message } = req.body;

    // ارسال پیام به کانال خصوصی کاربر
    pusher.trigger(`private-user-${toUserId}`, 'new-message', {
        message,
        fromUserId: 'admin', // ارسال از طرف ادمین
    });

    res.status(200).json({ success: true });
});

// احراز هویت برای کانال‌های خصوصی
app.post('/pusher/auth', (req, res) => {
    const { socket_id, channel_name, user_id } = req.body;
    console.log(socket_id, channel_name, user_id);
    if (!socket_id || !channel_name || !user_id) {
        return res.status(400).send('Missing parameters');
    }

    const isAdmin = user_id === 'admin';

    if (
        (isAdmin && channel_name === 'private-admin-channel') ||
        (!isAdmin && channel_name === `private-user-${user_id}`)
    ) {
        const auth = pusher.authenticate(socket_id, channel_name);
        res.send(auth);
    } else {
        res.status(403).send('Not authorized to subscribe to this channel');
    }
});



app.listen(5000, () => {
    console.log('Server is running on port 5000');
});