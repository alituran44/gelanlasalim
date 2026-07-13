import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Admin Finansal ve Sistem İstatistiklerini Getir
router.get('/stats', authenticateToken, requireRole(['admin']), async (req, res, next) => {
    try {
        // Toplam ihale hacmi (Onaylanmış veya tamamlanmış ihalelerin kazanan tekliflerinin toplam bedeli)
        const totalHacimRes = await db.query(
            `SELECT COALESCE(SUM(b.price), 0) as total_volume
             FROM tenders t
             JOIN bids b ON t.winning_bid_id = b.id
             WHERE t.status IN ('awarded', 'completed')`
        );
        const totalVolume = parseFloat(totalHacimRes.rows[0].total_volume);

        // Biriken Komisyon (%2)
        const commission = totalVolume * 0.02;

        // Havuzda Bekleyen Para (Sadece 'awarded' durumundaki, yani henüz tamamlanmamış ihalelerin bedeli)
        const activeEscrowRes = await db.query(
            `SELECT COALESCE(SUM(b.price), 0) as total_escrow
             FROM tenders t
             JOIN bids b ON t.winning_bid_id = b.id
             WHERE t.status = 'awarded'`
        );
        const activeEscrow = parseFloat(activeEscrowRes.rows[0].total_escrow);

        // Sistemdeki toplam kullanıcı, firma ve aktif ihale sayıları
        const countRes = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM users) as total_users,
                (SELECT COUNT(*) FROM companies) as total_companies,
                (SELECT COUNT(*) FROM tenders WHERE status = 'open') as active_tenders
        `);

        res.json({
            stats: {
                total_volume: totalVolume,
                commission: commission,
                active_escrow: activeEscrow,
                total_users: parseInt(countRes.rows[0].total_users),
                total_companies: parseInt(countRes.rows[0].total_companies),
                active_tenders: parseInt(countRes.rows[0].active_tenders)
            }
        });
    } catch (err) {
        next(err);
    }
});

export default router;
