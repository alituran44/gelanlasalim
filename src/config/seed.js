import db from './db.js';

export const seedDatabase = async () => {
    try {
        // Kategorileri kontrol et ve ekle
        const checkCats = await db.query('SELECT COUNT(*) FROM categories');
        if (parseInt(checkCats.rows[0].count) === 0) {
            console.log('🌱 Veritabanında kategori bulunamadı, genel B2B tohumlama (seeding) başlatılıyor...');
            await db.query(`
                INSERT INTO categories (name, slug, description) VALUES
                ('İnşaat, Altyapı ve Yapı İşleri', 'insaat-altyapi-ve-yapi-isleri', 'İnşaat, Altyapı ve Yapı İşleri'),
                ('Kanalizasyon, Boru ve Tesisat', 'kanalizasyon-boru-ve-tesisat', 'Kanalizasyon, Boru ve Tesisat'),
                ('Kent Mobilyaları ve Prefabrik Yapılar', 'kent-mobilyalari-ve-prefabrik-yapilar', 'Kent Mobilyaları ve Prefabrik Yapılar'),
                ('Mühendislik, Mimarlık ve Danışmanlık', 'muhendislik-mimarlik-ve-danismanlik', 'Mühendislik, Mimarlık ve Danışmanlık'),
                ('Madencilik, Sondaj ve Doğal Kaynaklar', 'madencilik-sondaj-ve-dogal-kaynaklar', 'Madencilik, Sondaj ve Doğal Kaynaklar'),
                ('Hırdavat, Metal ve Plastik Ürünler', 'hirdavat-metal-ve-plastik-urunler', 'Hırdavat, Metal ve Plastik Ürünler'),
                ('Enerji, Elektrik ve Aydınlatma', 'enerji-elektrik-ve-aydinlatma', 'Enerji, Elektrik ve Aydınlatma'),
                ('Yangın ve Güvenlik Sistemleri', 'yangin-ve-guvenlik-sistemleri', 'Yangın ve Güvenlik Sistemleri'),
                ('Asansör ve Yapı Otomasyonu', 'asansor-ve-yapi-otomasyonu', 'Asansör ve Yapı Otomasyonu'),
                ('Klima, Isıtma ve Havalandırma', 'klima-isitma-ve-havalandirma', 'Klima, Isıtma ve Havalandırma'),
                ('Endüstriyel Makine ve Üretim', 'endustriyel-makine-ve-uretim', 'Endüstriyel Makine ve Üretim'),
                ('Taşıt, İş Makinesi ve Yedek Parça', 'tasit-is-makinesi-ve-yedek-parca', 'Taşıt, İş Makinesi ve Yedek Parça'),
                ('Nakliye, Lojistik ve Taşımacılık', 'nakliye-lojistik-ve-tasimacilik', 'Nakliye, Lojistik ve Taşımacılık'),
                ('Turizm ve Organizasyon', 'turizm-ve-organizasyon', 'Turizm ve Organizasyon'),
                ('Reklam, Tanıtım ve Pazarlama', 'reklam-tanitim-ve-pazarlama', 'Reklam, Tanıtım ve Pazarlama'),
                ('Matbaa, Kırtasiye ve Ambalaj', 'matbaa-kirtasiye-ve-ambalaj', 'Matbaa, Kırtasiye ve Ambalaj'),
                ('Peyzaj, Bahçe ve Ormancılık', 'peyzaj-bahce-ve-ormancilik', 'Peyzaj, Bahçe ve Ormancılık'),
                ('Sağlık, Medikal ve Tıbbi Cihaz', 'saglik-medikal-ve-tibbi-cihaz', 'Sağlık, Medikal ve Tıbbi Cihaz'),
                ('Akaryakıt, Yakıt ve Madeni Yağ', 'akaryakit-yakit-ve-madeni-yag', 'Akaryakıt, Yakıt ve Madeni Yağ'),
                ('Gıda, Tarım ve Catering', 'gida-tarim-ve-catering', 'Gıda, Tarım ve Catering'),
                ('Elektronik, Bilgisayar ve İletişim', 'elektronik-bilgisayar-ve-iletisim', 'Elektronik, Bilgisayar ve İletişim'),
                ('Yazılım, Bilişim ve Dijital Hizmetler', 'yazilim-bilisim-ve-dijital-hizmetler', 'Yazılım, Bilişim ve Dijital Hizmetler'),
                ('Kamera, Otomasyon ve Haberleşme', 'kamera-otomasyon-ve-haberlesme', 'Kamera, Otomasyon ve Haberleşme'),
                ('Temizlik, İlaçlama ve Geri Dönüşüm', 'temizlik-ilaclama-ve-geri-donusum', 'Temizlik, İlaçlama ve Geri Dönüşüm'),
                ('Kimyasal Maddeler ve Endüstriyel Ürünler', 'kimyasal-maddeler-ve-endustriyel-urunler', 'Kimyasal Maddeler ve Endüstriyel Ürünler'),
                ('Tekstil, Giyim ve İş Kıyafetleri', 'tekstil-giyim-ve-is-kiyafetleri', 'Tekstil, Giyim ve İş Kıyafetleri'),
                ('İş Sağlığı ve Güvenliği', 'is-sagligi-ve-guvenligi', 'İş Sağlığı ve Güvenliği'),
                ('Mobilya, Ofis ve Dekorasyon', 'mobilya-ofis-ve-dekorasyon', 'Mobilya, Ofis ve Dekorasyon'),
                ('Özel Güvenlik ve Koruma', 'ozel-guvenlik-ve-koruma', 'Özel Güvenlik ve Koruma'),
                ('Eğitim ve Kurumsal Gelişim', 'egitim-ve-kurumsal-gelisim', 'Eğitim ve Kurumsal Gelişim'),
                ('İnsan Kaynakları ve Sosyal Hizmetler', 'insan-kaynaklari-ve-sosyal-hizmetler', 'İnsan Kaynakları ve Sosyal Hizmetler'),
                ('Sigorta, Mali ve Hukuki Hizmetler', 'sigorta-mali-ve-hukuki-hizmetler', 'Sigorta, Mali ve Hukuki Hizmetler'),
                ('Gayrimenkul ve İşyeri Hizmetleri', 'gayrimenkul-ve-isyeri-hizmetler', 'Gayrimenkul ve İşyeri Hizmetleri')
                ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
            `);
            console.log('🌱 Genel B2B Kategorileri başarıyla veritabanına eklendi.');
        }
    } catch (err) {
        console.error('⚠️ Tohumlama hatası (Tablolar veya DB bağlantısı hazır olmayabilir):', err.message);
    }
};
