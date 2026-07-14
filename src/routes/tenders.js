import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getIO } from '../config/websocket.js';

const router = express.Router();

// 1. Yeni İhale İlanı Açma (Sadece Alıcı)
router.post('/', authenticateToken, requireRole(['buyer']), async (req, res, next) => {
    try {
        const {
            category_id, title, description, quantity, unit,
            city, district, delivery_address, delivery_date, expires_at,
            country, neighborhood, file_url, image_url, type, target_price
        } = req.body;
        const buyerId = req.user.id;

        if (!category_id || !title || !description || !quantity || !unit || !city || !district || !delivery_address || !delivery_date || !expires_at) {
            return res.status(400).json({ error: 'Lütfen zorunlu tüm alanları doldurun.' });
        }

        if (Number(quantity) <= 0) {
            return res.status(400).json({ error: 'Miktar sıfırdan büyük olmalıdır.' });
        }

        const result = await db.query(
            `INSERT INTO tenders (
                buyer_id, category_id, title, description, quantity, unit,
                city, district, delivery_address, delivery_date, status, expires_at,
                country, neighborhood, file_url, image_url, type, target_price
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'open', $11, $12, $13, $14, $15, $16, $17)
             RETURNING *`,
            [
                buyerId, category_id, title, description, quantity, unit,
                city, district, delivery_address, delivery_date, expires_at,
                country || 'Türkiye', neighborhood || '', file_url || '', image_url || '', type || 'Alış', target_price || null
            ]
        );

        res.status(201).json({
            message: 'İhale başarıyla açıldı ve yayına alındı.',
            tender: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
});

// 2. İhaleleri Listeleme & Filtreleme
router.get('/', async (req, res, next) => {
    try {
        const { category_id, city, district, status, q } = req.query;

        let queryText = `
            SELECT t.*, c.name as category_name
            FROM tenders t
            JOIN categories c ON t.category_id = c.id
            WHERE 1=1
        `;
        const params = [];
        let count = 1;

        if (category_id) {
            queryText += ` AND t.category_id = $${count}`;
            params.push(category_id);
            count++;
        }

        if (city) {
            queryText += ` AND t.city ILIKE $${count}`;
            params.push(city);
            count++;
        }

        if (district) {
            queryText += ` AND t.district ILIKE $${count}`;
            params.push(district);
            count++;
        }

        if (q) {
            queryText += ` AND (t.title ILIKE $${count} OR t.description ILIKE $${count})`;
            params.push(`%${q}%`);
            count++;
        }

        // Durum filtresi
        if (status && status !== 'all') {
            queryText += ` AND t.status = $${count}`;
            params.push(status);
            count++;
        } else if (!status) {
            // Varsayılan olarak açık olanları getir
            queryText += ` AND t.status = 'open'`;
        }

        queryText += ` ORDER BY t.created_at DESC`;

        const result = await db.query(queryText, params);
        res.json({ tenders: result.rows });
    } catch (err) {
        next(err);
    }
});

// 3. İhale Detayı ve Teklifleri Görüntüleme
router.get('/:id', async (req, res, next) => {
    try {
        const tenderId = req.params.id;

        // İhale bilgisi
        const tenderRes = await db.query(
            `SELECT t.*, c.name as category_name, u.first_name as buyer_first_name, u.last_name as buyer_last_name
             FROM tenders t
             JOIN categories c ON t.category_id = c.id
             JOIN users u ON t.buyer_id = u.id
             WHERE t.id = $1`,
            [tenderId]
        );

        if (tenderRes.rows.length === 0) {
            return res.status(404).json({ error: 'İhale bulunamadı.' });
        }

        // İhaleye gelen teklifler (En düşük fiyat en başta olacak şekilde)
        const bidsRes = await db.query(
            `SELECT b.*, comp.name as company_name, comp.logo_url as company_logo
             FROM bids b
             JOIN companies comp ON b.company_id = comp.id
             WHERE b.tender_id = $1
             ORDER BY b.price ASC, b.created_at ASC`,
            [tenderId]
        );

        res.json({
            tender: tenderRes.rows[0],
            bids: bidsRes.rows
        });
    } catch (err) {
        next(err);
    }
});

// 4. İhaleyi Kazanan Teklifi Seçme (Sadece İhale Sahibi Alıcı)
router.patch('/:id/award', authenticateToken, requireRole(['buyer']), async (req, res, next) => {
    try {
        const tenderId = req.params.id;
        const { winning_bid_id } = req.body;
        const buyerId = req.user.id;

        if (!winning_bid_id) {
            return res.status(400).json({ error: 'Lütfen kazanan teklif ID\'sini belirtin.' });
        }

        // İhalenin sahibini ve durumunu kontrol et
        const tenderRes = await db.query('SELECT * FROM tenders WHERE id = $1', [tenderId]);
        if (tenderRes.rows.length === 0) {
            return res.status(404).json({ error: 'İhale bulunamadı.' });
        }

        const tender = tenderRes.rows[0];
        if (tender.buyer_id !== buyerId) {
            return res.status(403).json({ error: 'Bu ihale üzerinde işlem yapma yetkiniz yok.' });
        }

        if (tender.status !== 'open') {
            return res.status(400).json({ error: 'Sadece açık ihaleler için kazanan belirlenebilir.' });
        }

        // Teklifin bu ihaleye ait olduğunu doğrula
        const bidRes = await db.query('SELECT * FROM bids WHERE id = $1 AND tender_id = $2', [winning_bid_id, tenderId]);
        if (bidRes.rows.length === 0) {
            return res.status(400).json({ error: 'Geçersiz veya bu ihaleye ait olmayan teklif.' });
        }

        // Transaction başlatarak durumları güncelle
        await db.query('BEGIN');

        // İhale durumunu güncelle
        const updatedTender = await db.query(
            `UPDATE tenders
             SET status = 'awarded', winning_bid_id = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [winning_bid_id, tenderId]
        );

        // Kazanan teklif durumunu güncelle
        await db.query(
            `UPDATE bids SET status = 'won', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [winning_bid_id]
        );

        // Kaybeden diğer aktif tekliflerin durumunu güncelle
        await db.query(
            `UPDATE bids
             SET status = 'lost', updated_at = CURRENT_TIMESTAMP
             WHERE tender_id = $1 AND id != $2 AND status = 'active'`,
            [tenderId, winning_bid_id]
        );

        await db.query('COMMIT');

        // WebSocket yayını: İhaleyi izleyen tüm istemcilere durum değişikliğini bildir
        try {
            const io = getIO();
            io.to(tenderId).emit('tender_status_changed', {
                tender_id: tenderId,
                status: 'awarded',
                winning_bid_id: winning_bid_id
            });
        } catch (wsErr) {
            console.error('WebSocket yayını başarısız:', wsErr.message);
        }

        res.json({
            message: 'İhale kazananı başarıyla belirlendi, havuz ödemesi aşamasına geçildi.',
            tender: updatedTender.rows[0]
        });
    } catch (err) {
        await db.query('ROLLBACK');
        next(err);
    }
});

// 5. İhale İptal Etme (Alıcı veya Admin)
router.patch('/:id/cancel', authenticateToken, async (req, res, next) => {
    try {
        const tenderId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const tenderRes = await db.query('SELECT * FROM tenders WHERE id = $1', [tenderId]);
        if (tenderRes.rows.length === 0) {
            return res.status(404).json({ error: 'İhale bulunamadı.' });
        }

        const tender = tenderRes.rows[0];

        // Yetki kontrolü (Yalnızca ihale sahibi veya admin iptal edebilir)
        if (tender.buyer_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ error: 'Bu ihaleyi iptal etme yetkiniz bulunmamaktadır.' });
        }

        if (tender.status === 'completed' || tender.status === 'cancelled') {
            return res.status(400).json({ error: 'Tamamlanmış veya zaten iptal edilmiş ihale güncellenemez.' });
        }

        await db.query('BEGIN');

        // İhale durumunu güncelle
        const updatedTender = await db.query(
            `UPDATE tenders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [tenderId]
        );

        // Gelen aktif teklifleri iptal/geçersiz say
        await db.query(
            `UPDATE bids SET status = 'retracted', updated_at = CURRENT_TIMESTAMP WHERE tender_id = $1 AND status = 'active'`,
            [tenderId]
        );

        await db.query('COMMIT');

        // WebSocket yayını: İhaleyi izleyen tüm istemcilere durum değişikliğini bildir
        try {
            const io = getIO();
            io.to(tenderId).emit('tender_status_changed', {
                tender_id: tenderId,
                status: 'cancelled'
            });
        } catch (wsErr) {
            console.error('WebSocket yayını başarısız:', wsErr.message);
        }

        res.json({
            message: 'İhale ve ilişkili aktif teklifler başarıyla iptal edildi.',
            tender: updatedTender.rows[0]
        });
    } catch (err) {
        await db.query('ROLLBACK');
        next(err);
    }
});

export default router;
