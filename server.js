const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Cấu hình Telegram Bot
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8256736467:AAFPgcrPF4YcLNG36emFCf1lPlW5Mqebirc';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '93372553';

// Hàm gửi tin nhắn Telegram
async function sendTelegramMessage(message) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        console.log('✅ Telegram message sent successfully');
        return true;
    } catch (error) {
        console.error('❌ Error sending Telegram message:', error.response?.data || error.message);
        return false;
    }
}

// Endpoint để tracking visitor
app.post('/api/track-visitor', async (req, res) => {
    try {
        const visitorData = req.body;
        
        // Lấy IP thực tế
        const ip = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   req.connection.socket.remoteAddress;
        
        const message = `
🚀 <b>VISITOR TRUY CẬP WEBSITE</b>

📅 <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}
🌐 <b>IP:</b> ${ip}
🔗 <b>Trang:</b> ${visitorData.pageUrl}
📱 <b>Thiết bị:</b> ${visitorData.userAgent.substring(0, 100)}...
🖥️ <b>Màn hình:</b> ${visitorData.screenResolution}
🗣️ <b>Ngôn ngữ:</b> ${visitorData.language}
📍 <b>Referrer:</b> ${visitorData.referrer}

<i>Người dùng đang xem website của bạn!</i>
        `;
        
        // Gửi thông báo đến Telegram
        await sendTelegramMessage(message);
        
        console.log('📊 Visitor tracked:', { ip, url: visitorData.pageUrl });
        res.json({ success: true, message: 'Visitor tracked' });
    } catch (error) {
        console.error('❌ Tracking error:', error);
        res.status(500).json({ success: false, error: 'Internal error' });
    }
});

// Endpoint để xử lý form liên hệ
app.post('/api/contact', async (req, res) => {
    try {
        const formData = req.body;
        
        // Validate dữ liệu
        if (!formData.name || !formData.phone) {
            return res.status(400).json({ 
                success: false, 
                error: 'Vui lòng điền đầy đủ thông tin bắt buộc' 
            });
        }
        
        // Lấy IP thực tế
        const ip = req.headers['x-forwarded-for'] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress ||
                   req.connection.socket.remoteAddress;
        
        // Tạo tin nhắn chi tiết
        const message = `
🔥 <b>KHÁCH HÀNG MỚI LIÊN HỆ!</b>

👤 <b>Tên:</b> ${formData.name}
📞 <b>SĐT:</b> ${formData.phone}
📧 <b>Email:</b> ${formData.email || 'Chưa cung cấp'}
📍 <b>Địa chỉ:</b> ${formData.address || 'Chưa cung cấp'}
🎯 <b>Dịch vụ:</b> ${formData.service}
💬 <b>Nội dung:</b> ${formData.message || 'Không có'}

📋 <b>THÔNG TIN BỔ SUNG</b>
🌐 <b>IP:</b> ${ip}
📅 <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}
🔗 <b>Trang:</b> ${formData.pageUrl}
📱 <b>Thiết bị:</b> ${formData.userAgent.substring(0, 100)}...

<i>⚠️ HÃY LIÊN HỆ LẠI NGAY!</i>
        `;
        
        // Gửi thông báo đến Telegram
        const telegramSent = await sendTelegramMessage(message);
        
        if (telegramSent) {
            console.log('✅ Form submitted:', formData.name, formData.phone);
            res.json({ 
                success: true, 
                message: 'Form submitted and Telegram notification sent!' 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Failed to send Telegram notification' 
            });
        }
    } catch (error) {
        console.error('❌ Form processing error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

// Route mặc định
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} in your browser`);
    console.log(`🤖 Telegram bot is ready to receive notifications`);
    
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === '8256736467:AAFPgcrPF4YcLNG36emFCf1lPlW5Mqebirc') {
        console.warn('⚠️  WARNING: Please set TELEGRAM_BOT_TOKEN in .env file');
    }
    if (!TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === '93372553') {
        console.warn('⚠️  WARNING: Please set TELEGRAM_CHAT_ID in .env file');
    }
});
