// Merkezi Hata Yakalama Middleware'i
export const errorHandler = (err, req, res, next) => {
    console.error('Hata Detayı:', err.stack || err.message || err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Sunucuda beklenmeyen bir hata oluştu.';

    res.status(statusCode).json({
        error: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};
