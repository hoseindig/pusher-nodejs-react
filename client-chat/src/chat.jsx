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
        const pusher = new Pusher('97eaa6ad75fb169d4d45', {
            cluster: 'eu',
            encrypted: true,
            logToConsole: true,  // این گزینه باعث می‌شود که لاگ‌های اضافی در کنسول ظاهر شوند
        });

        const channel = pusher.subscribe('my-channel');

        // اضافه کردن لاگ برای بررسی اتصال
        channel.bind('pusher:subscription_succeeded', function () {
            console.log('Successfully connected to Pusher!');
        });

        // گوش دادن به رویداد 'my-event'
        channel.bind('my-event', (data) => {
            console.log('Received message:', data);
            setMessages((prevMessages) => [...prevMessages, data.message]);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, []);


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
