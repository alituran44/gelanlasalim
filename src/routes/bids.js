import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getIO } from '../config/websocket.js';

const router = express.Router();

// 1. İhaleye Teklif Verme (Sadece Onaylı/Doğrulanmış Firmalar)
router.post('/tenders/:tenderId', authenticateToken, requireRole(['seller']), async (req, res, next) => {
    try {
        const { tenderId } = req.params;
        const { price, tax_included, delivery_lead_time_days, note } = req.body;

        if (!price || typeof tax_included !== 'boolean' || !delivery_lead_time_days) {
            return res.status(400).json({ error: 'Lütfen zorunlu alanları (fiyat, kdv durumu, teslim süresi) doldurun.' });
        }

        if (Number(price) <= 0) {
            return res.status(400).json({ error: 'Teklif fiyatı sıfırdan büyük olmalıdır.' });
        }

        // Firma bilgilerini ve doğrulama durumunu getir
        const companyRes = await db.query('SELECT * FROM companies WHERE user_id = $1', [req.user.id]);
        if (companyRes.rows.length === 0) {
            return res.status(404).json({ error: 'Teklif verebilmek için önce firma profilinizi oluşturmalısınız.' });
        }

        const company = companyRes.rows[0];

        if (!company.is_verified) {
            return res.status(403).json({ error: 'Firma profiliniz henüz yönetici tarafından onaylanmamıştır. Onaylanmadan teklif veremezsiniz.' });
        }

        // Aylık teklif limiti kontrolü
        if (company.bid_count_this_month >= company.monthly_bid_limit) {
            return res.status(403).json({ error: 'Aylık teklif verme limitinize ulaştınız.' });
        }

        // İhalenin durumunu ve süresini kontrol et
        const tenderRes = await db.query('SELECT * FROM tenders WHERE id = $1', [tenderId]);
        if (tenderRes.rows.length === 0) {
            return res.status(404).json({ error: 'Teklif verilmek istenen ihale bulunamadı.' });
        }

        const tender = tenderRes.rows[0];
        if (tender.status !== 'open') {
            return res.status(400).json({ error: 'Bu ihale yeni teklif alımına kapalıdır.' });
        }

        if (new Date(tender.expires_at) < new Date()) {
            return res.status(400).json({ error: 'İhalenin süresi dolmuştur.' });
        }

        // Teklifi ekleme ve firma limitini güncelleme işlemini transaction ile yapıyoruz
        await db.query('BEGIN');

        const bidResult = await db.query(
            `INSERT INTO bids (tender_id, company_id, price, tax_included, delivery_lead_time_days, note, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'active')
             RETURNING *`,
            [tenderId, company.id, price, tax_included, delivery_lead_time_days, note || null]
        );

        // Firmanın bu ayki teklif sayacını artır
        await db.query(
            `UPDATE companies SET bid_count_this_month = bid_count_this_month + 1 WHERE id = $1`,
            [company.id]
        );

        await db.query('COMMIT');

        // WebSocket yayını: İhale odasındaki tüm dinleyicilere yeni teklif bilgisini gönder
        try {
            const io = getIO();
            const enrichedBid = {
                ...bidResult.rows[0],
                company_name: company.name,
                company_logo: company.logo_url
            };
            io.to(tenderId).emit('new_bid', enrichedBid);
        } catch (wsErr) {
            console.error('WebSocket yayını başarısız:', wsErr.message);
        }

        res.status(201).json({
            message: 'Teklifiniz başarıyla iletildi.',
            bid: bidResult.rows[0]
        });
    } catch (err) {
        await db.query('ROLLBACK');
        next(err);
    }
});

// 2. Firmanın Kendi Verdiği Teklifleri Listelemesi
router.get('/my-bids', authenticateToken, requireRole(['seller']), async (req, res, next) => {
    try {
        const companyRes = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
        if (companyRes.rows.length === 0) {
            return res.status(404).json({ error: 'Firma profili bulunamadı.' });
        }
        const companyId = companyRes.rows[0].id;

        const result = await db.query(
            `SELECT b.*, t.title as tender_title, t.status as tender_status
             FROM bids b
             JOIN tenders t ON b.tender_id = t.id
             WHERE b.company_id = $1
             ORDER BY b.created_at DESC`,
            [companyId]
        );

        res.json({ bids: result.rows });
    } catch (err) {
        next(err);
    }
});

// 3. Teklifi Geri Çekme (Sadece Teklifi Veren Firma)
router.patch('/:id/retract', authenticateToken, requireRole(['seller']), async (req, res, next) => {
    try {
        const bidId = req.params.id;

        const companyRes = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
        if (companyRes.rows.length === 0) {
            return res.status(404).json({ error: 'Firma profili bulunamadı.' });
        }
        const companyId = companyRes.rows[0].id;

        // Teklif sahibini ve durumunu kontrol et
        const bidRes = await db.query('SELECT * FROM bids WHERE id = $1', [bidId]);
        if (bidRes.rows.length === 0) {
            return res.status(404).json({ error: 'Teklif bulunamadı.' });
        }

        const bid = bidRes.rows[0];
        if (bid.company_id !== companyId) {
            return res.status(403).json({ error: 'Bu teklif üzerinde işlem yapma yetkiniz yok.' });
        }

        if (bid.status !== 'active') {
            return res.status(400).json({ error: 'Sadece aktif teklifler geri çekilebilir.' });
        }

        // İhalenin durumunu kontrol et (ihale kapandıysa teklif geri çekilemez)
        const tenderRes = await db.query('SELECT status FROM tenders WHERE id = $1', [bid.tender_id]);
        if (tenderRes.rows.length > 0 && tenderRes.rows[0].status !== 'open') {
            return res.status(400).json({ error: 'Teklif verdiğiniz ihale açık durumda olmadığı için teklifinizi geri çekemezsiniz.' });
        }

        const result = await db.query(
            `UPDATE bids SET status = 'retracted', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
            [bidId]
        );

        res.json({
            message: 'Teklif başarıyla geri çekildi.',
            bid: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
});

export default router;
