import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// 1. Kategorileri Hiyerarşik Yapıda Listeleme
router.get('/', async (req, res, next) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY name ASC');
        const allCategories = result.rows;

        // Ağaç yapısına dönüştürme yardımcı fonksiyonu
        const buildTree = (parentId = null) => {
            return allCategories
                .filter(cat => cat.parent_id === parentId)
                .map(cat => ({
                    ...cat,
                    subcategories: buildTree(cat.id)
                }));
        };

        const categoryTree = buildTree(null);

        res.json({ categories: categoryTree });
    } catch (err) {
        next(err);
    }
});

// 2. [Admin] Yeni Kategori Oluşturma
router.post('/', authenticateToken, requireRole(['admin']), async (req, res, next) => {
    try {
        const { name, slug, description, parent_id } = req.body;

        if (!name || !slug) {
            return res.status(400).json({ error: 'Kategori adı ve slug zorunludur.' });
        }

        const result = await db.query(
            `INSERT INTO categories (name, slug, description, parent_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, slug, description, parent_id || null]
        );

        res.status(201).json({
            message: 'Kategori başarıyla oluşturuldu.',
            category: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Bu kategori adı veya slug zaten kullanımda.' });
        }
        next(err);
    }
});

export default router;
