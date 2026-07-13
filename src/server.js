import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';

// WebSocket & Seeding
import { initWebSocket } from './config/websocket.js';
import { seedDatabase } from './config/seed.js';

// Route dosyalarını içeri aktarıyoruz
import authRouter from './routes/auth.js';
import companiesRouter from './routes/companies.js';
import categoriesRouter from './routes/categories.js';
import tendersRouter from './routes/tenders.js';
import bidsRouter from './routes/bids.js';
import adminRouter from './routes/admin.js';

// Hata middleware'i
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// HTTP Sunucusu oluşturuyoruz (Socket.io için gerekli)
const server = http.createServer(app);

// WebSocket sunucusunu ilklendiriyoruz
initWebSocket(server);

// JSON parser middleware
app.use(express.json());

// Statik dosyaları sunma (Frontend için)
app.use(express.static(path.join(process.cwd(), 'public')));

// CORS & Temel Güvenlik Başlıkları
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Ana Dizin / Durum Kontrolü
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        message: 'gelanlasalim.com API Sunucusu sorunsuz çalışıyor.',
        timestamp: new Date()
    });
});

// Router'ları bağlıyoruz
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tenders', tendersRouter);
app.use('/api/bids', bidsRouter);
app.use('/api/admin', adminRouter);

// Hata yönetimi (Tüm routerlardan sonra gelmeli)
app.use(errorHandler);

// Sunucuyu ayağa kaldırıyoruz (Express app yerine HTTP server dinlenmeli - Vercel harici ortamlarda)
if (!process.env.VERCEL) {
    server.listen(PORT, async () => {
        await seedDatabase();
        console.log(`==================================================`);
        console.log(`🚀 Sunucu ${PORT} portunda başarıyla başlatıldı.`);
        console.log(`👉 Sağlık Kontrolü: http://localhost:${PORT}/health`);
        console.log(`👉 Arayüz (Frontend): http://localhost:${PORT}`);
        console.log(`==================================================`);
    });
} else {
    // Vercel serverless ortamı için tohumlamayı asenkron başlat
    seedDatabase().catch(err => console.error('Tohumlama hatası:', err));
}

export default app;
