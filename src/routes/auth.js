import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gelanlasalim_super_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Kayıt Olma (Register)
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, first_name, last_name, phone, role } = req.body;

        if (!email || !password || !first_name || !last_name || !phone) {
            return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurun.' });
        }

        // Rol doğrulaması (Sadece buyer veya seller kaydedilebilir)
        const targetRole = role || 'buyer';
        if (targetRole === 'admin') {
            return res.status(400).json({ error: 'Bu yöntemle Admin hesabı oluşturulamaz.' });
        }

        if (targetRole !== 'buyer' && targetRole !== 'seller') {
            return res.status(400).json({ error: 'Geçersiz rol seçimi.' });
        }

        // Şifre hash'leme
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Kullanıcıyı veritabanına ekleme
        const result = await db.query(
            `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, email, first_name, last_name, phone, role, created_at`,
            [email, passwordHash, first_name, last_name, phone, targetRole]
        );

        res.status(201).json({
            message: 'Kullanıcı başarıyla oluşturuldu.',
            user: result.rows[0]
        });
    } catch (err) {
        if (err.code === '23505') { // Unique constraint violation (email veya phone)
            return res.status(400).json({ error: 'E-posta veya telefon numarası zaten kullanımda.' });
        }
        next(err);
    }
});

// Giriş Yapma (Login)
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'E-posta ve şifre gereklidir.' });
        }

        // Kullanıcı sorgusu
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
        }

        const user = result.rows[0];

        if (!user.is_active) {
            return res.status(403).json({ error: 'Hesabınız askıya alınmıştır.' });
        }

        // Şifre doğrulama
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
        }

        // Token oluşturma
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );

        res.json({
            message: 'Giriş başarılı.',
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
});

// Profil Bilgilerini Getirme
router.get('/profile', authenticateToken, async (req, res, next) => {
    try {
        const result = await db.query(
            'SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
        }

        res.json({ user: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

export default router;
