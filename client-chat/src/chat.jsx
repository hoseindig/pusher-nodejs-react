import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';

export default function Chat() {
    const [messages, setMessages] = useState([]); // لیست پیام‌ها
    const [message, setMessage] = useState('');  // پیام وارد شده

    // ارسال پیام به سرور
    const sendMessage = async () => {
        const response = await fetch('http://localhost:5000/api/send-message', {  // آدرس صحیح API
            method: 'POST',
            body: JSON.stringify({ message }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            setMessage(''); // پاک کردن ورودی بعد از ارسال
        } else {
            console.error('Failed to send message');
        }
    };

    useEffect(() => {
        // اتصال به Pusher
        const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
            cluster: process.env.REACT_APP_PUSHER_CLUSTER,
        });

        const channel = pusher.subscribe('my-channel');

        // گوش دادن به رویداد 'my-event'
        channel.bind('my-event', (data) => {
            // افزودن پیام جدید به لیست پیام‌ها
            setMessages((prevMessages) => [...prevMessages, data.message]);
            console.log('Received message:', data.message);
        });

        return () => {
            // پاک‌سازی: قطع اتصال از Pusher
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []); // فقط یک‌بار در ابتدای بارگذاری اجرا می‌شود

    return (
        <div>
            <div>
                {/* نمایش پیام‌ها */}
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)} // به‌روزرسانی پیام
                />
                <button onClick={sendMessage}>Send Message</button>
            </div>
        </div>
    );
}
