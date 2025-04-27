import Pusher from 'pusher-js';
import { useState, useEffect } from 'react';

export default function Chat() {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [userId, setUserId] = useState('11');
    const [isAdmin, setIsAdmin] = useState(false);

    // ارسال پیام از کاربر به ادمین
    const sendMessage = async () => {
        const response = await fetch('http://localhost:5000/api/send-message', {
            method: 'POST',
            body: JSON.stringify({ fromUserId: userId, message }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            setMessage('');
        }
    };

    // ارسال پیام از ادمین به کاربر
    const sendToUser = async (toUserId, message) => {
        const response = await fetch('http://localhost:5000/api/send-to-user', {
            method: 'POST',
            body: JSON.stringify({ toUserId, message }),
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            setMessage('');
        }
    };

    useEffect(() => {
        let pusher;

        if (isAdmin) {
            // اگر ادمین است به کانال ادمین متصل می‌شود
            pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
                cluster: process.env.REACT_APP_PUSHER_CLUSTER,
                // authEndpoint: 'http://localhost:5000/pusher/auth', // اینجا درستش کن
                encrypted: true,
                auth: {
                    params: {
                        user_id: userId,  // اینجا اضافه کن
                    },
                },
            });

            const channel = pusher.subscribe('private-admin-channel');
            channel.bind('new-message', (data) => {
                setMessages((prevMessages) => [...prevMessages, `From User ${data.fromUserId}: ${data.message}`]);
            });
        } else {
            // اگر کاربر است به کانال خصوصی خودش متصل می‌شود
            pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
                cluster: process.env.REACT_APP_PUSHER_CLUSTER,
                authEndpoint: 'http://localhost:5000/pusher/auth', // اینجا درستش کن
                encrypted: true,
                auth: {
                    params: {
                        user_id: userId,  // اینجا اضافه کن
                    },
                },
            });

            const channel = pusher.subscribe(`private-user-${userId}`);
            channel.bind('new-message', (data) => {
                setMessages((prevMessages) => [...prevMessages, `From Admin: ${data.message}`]);
            });
        }

        return () => {
            if (pusher) {
                pusher.disconnect();
            }
        };
    }, [userId, isAdmin]);

    return (
        <div>
            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    value={userId}
                    placeholder='userId'
                    onChange={(e) => setUserId(e.target.value)}
                />
                <input
                    type="text"
                    value={message}
                    placeholder='message'
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button onClick={sendMessage}>Send Message</button>
                {!isAdmin && <button button onClick={() => setIsAdmin(true)}>setIsAdmin</button>}
                {isAdmin && (
                    <button onClick={() => sendToUser('user1', message)}>Send to User1</button>
                )}
            </div>
        </div >
    );
}
