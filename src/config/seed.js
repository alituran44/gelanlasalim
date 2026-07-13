import db from './db.js';

export const seedDatabase = async () => {
    try {
        // Kategorileri kontrol et ve ekle
        const checkCats = await db.query('SELECT COUNT(*) FROM categories');
        if (parseInt(checkCats.rows[0].count) === 0) {
            console.log('🌱 Veritabanında kategori bulunamadı, genel B2B tohumlama (seeding) başlatılıyor...');
            await db.query(`
                INSERT INTO categories (name, slug, description) VALUES
                ('İnşaat & Yapı Malzemeleri', 'insaat-yapi-malzemeleri', 'Demir, beton, çimento, ince yapı ve kaba inşaat malzemeleri'),
                ('Lojistik & Nakliye', 'lojistik-nakliye', 'Şehir içi ve şehirler arası yük taşımacılığı, tır, kamyon ve depo hizmetleri'),
                ('Endüstriyel Hammadde', 'endustriyel-hammadde', 'Plastik, metal, kimyasal ve diğer endüstriyel üretim hammaddeleri'),
                ('Kurumsal Hizmetler & IT', 'kurumsal-hizmetler-it', 'Yazılım, donanım tedariği, danışmanlık ve temizlik/güvenlik hizmetleri')
            `);
            console.log('🌱 Genel B2B Kategorileri başarıyla veritabanına eklendi.');
        }
    } catch (err) {
        console.error('⚠️ Tohumlama hatası (Tablolar veya DB bağlantısı hazır olmayabilir):', err.message);
    }
};
