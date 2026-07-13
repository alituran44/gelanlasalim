import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Firma Profili Oluşturma/Güncelleme
router.post('/', authenticateToken, requireRole(['seller']), async (req, res, next) => {
    try {
        const { name, tax_number, tax_office, address, city, district, logo_url, verification_documents } = req.body;
        const userId = req.user.id;

        if (!name || !tax_number || !tax_office || !address || !city || !district) {
            return res.status(400).json({ error: 'Lütfen zorunlu alanları doldurun.' });
        }

        // Mevcut firmayı kontrol et
        const existingCompany = await db.query('SELECT * FROM companies WHERE user_id = $1', [userId]);

        let result;
        if (existingCompany.rows.length > 0) {
            // Güncelleme
            result = await db.query(
                `UPDATE companies
                 SET name = $1, tax_number = $2, tax_office = $3, address = $4, city = $5, district = $6, logo_url = $7, verification_documents = $8, updated_at = CURRENT_TIMESTAMP
                 WHERE user_id = $9
                 RETURNING *`,
                [name, tax_number, tax_office, address, city, district, logo_url, JSON.stringify(verification_documents || {}), userId]
            );
        } else {
            // Yeni oluşturma
            result = await db.query(
                `INSERT INTO companies (user_id, name, tax_number, tax_office, address, city, district, logo_url, verification_documents)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [userId, name, tax_number, tax_office, address, city, district, logo_url, JSON.stringify(verification_documents || {})]
            );
        }

        res.status(existingCompany.rows.length > 0 ? 200 : 201).json({
            message: 'Firma profili başarıyla kaydedildi.',
            company: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Bu vergi numarası başka bir firma tarafından kullanılıyor.' });
        }
        next(err);
    }
});

// 2. Kendi Firma Profilini Görüntüleme
router.get('/profile', authenticateToken, requireRole(['seller']), async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM companies WHERE user_id = $1', [req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Firma profili bulunamadı. Lütfen önce profil oluşturun.' });
        }
        res.json({ company: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

// 3. Faaliyet Alanı (Kategoriler) Ekleme
router.post('/categories', authenticateToken, requireRole(['seller']), async (req, res, next) => {
    try {
        const { category_ids } = req.body; // Array of category IDs [1, 2, 3]
        if (!category_ids || !Array.isArray(category_ids)) {
            return res.status(400).json({ error: 'Geçersiz kategori listesi.' });
        }

        // Firma ID'sini bul
        const companyRes = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
        if (companyRes.rows.length === 0) {
            return res.status(404).json({ error: 'Firma profili bulunamadı.' });
        }
        const companyId = companyRes.rows[0].id;

        // Transaction başlat
        await db.query('BEGIN');
        
        // Önce eskileri sil
        await db.query('DELETE FROM company_categories WHERE company_id = $1', [companyId]);

        // Yenileri ekle
        for (const catId of category_ids) {
            await db.query(
                'INSERT INTO company_categories (company_id, category_id) VALUES ($1, $2)',
                [companyId, catId]
            );
        }

        await db.query('COMMIT');

        res.json({ message: 'Faaliyet alanları başarıyla güncellendi.' });
    } catch (err) {
        await db.query('ROLLBACK');
        next(err);
    }
});

// 4. Hizmet Bölgesi (İl/İlçe) Ekleme
router.post('/regions', authenticateToken, requireRole(['seller']), async (req, res, next) => {
    try {
        const { city, district } = req.body;
        if (!city) {
            return res.status(400).json({ error: 'Şehir bilgisi zorunludur.' });
        }

        const companyRes = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
        if (companyRes.rows.length === 0) {
            return res.status(404).json({ error: 'Firma profili bulunamadı.' });
        }
        const companyId = companyRes.rows[0].id;

        const result = await db.query(
            'INSERT INTO company_service_regions (company_id, city, district) VALUES ($1, $2, $3) RETURNING *',
            [companyId, city, district || null]
        );

        res.status(201).json({
            message: 'Hizmet bölgesi başarıyla eklendi.',
            region: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
});

// 5. Hizmet Bölgelerini Listeleme
router.get('/regions', authenticateToken, requireRole(['seller']), async (req, res, next) => {
    try {
        const companyRes = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
        if (companyRes.rows.length === 0) {
            return res.status(404).json({ error: 'Firma profili bulunamadı.' });
        }
        const companyId = companyRes.rows[0].id;

        const result = await db.query('SELECT * FROM company_service_regions WHERE company_id = $1', [companyId]);
        res.json({ regions: result.rows });
    } catch (err) {
        next(err);
    }
});

// 6. Hizmet Bölgesi Silme
router.delete('/regions/:id', authenticateToken, requireRole(['seller']), async (req, res, next) => {
    try {
        const regionId = req.params.id;
        const companyRes = await db.query('SELECT id FROM companies WHERE user_id = $1', [req.user.id]);
        if (companyRes.rows.length === 0) {
            return res.status(404).json({ error: 'Firma profili bulunamadı.' });
        }
        const companyId = companyRes.rows[0].id;

        const deleteRes = await db.query(
            'DELETE FROM company_service_regions WHERE id = $1 AND company_id = $2 RETURNING *',
            [regionId, companyId]
        );

        if (deleteRes.rows.length === 0) {
            return res.status(404).json({ error: 'Hizmet bölgesi bulunamadı veya bu işlem için yetkiniz yok.' });
        }

        res.json({ message: 'Hizmet bölgesi başarıyla silindi.' });
    } catch (err) {
        next(err);
    }
});

// 7. [Admin] Tüm Firmaları Listeleme (Doğrulama Durumu Dahil)
router.get('/', authenticateToken, requireRole(['admin']), async (req, res, next) => {
    try {
        const result = await db.query(
            `SELECT c.*, u.email as user_email, u.first_name, u.last_name, u.phone as user_phone
             FROM companies c
             JOIN users u ON c.user_id = u.id
             ORDER BY c.created_at DESC`
        );
        res.json({ companies: result.rows });
    } catch (err) {
        next(err);
    }
});

// 8. [Admin] Firma Doğrulama/Onaylama
router.patch('/:id/verify', authenticateToken, requireRole(['admin']), async (req, res, next) => {
    try {
        const { is_verified } = req.body;
        const companyId = req.params.id;

        if (typeof is_verified !== 'boolean') {
            return res.status(400).json({ error: 'is_verified parametresi boolean (true/false) olmalıdır.' });
        }

        const result = await db.query(
            'UPDATE companies SET is_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [is_verified, companyId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Firma bulunamadı.' });
        }

        res.json({
            message: `Firma başarıyla ${is_verified ? 'onaylandı' : 'reddedildi'}.`,
            company: result.rows[0]
        });
    } catch (err) {
        next(err);
    }
});

export default router;
