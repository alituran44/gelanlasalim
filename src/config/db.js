import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let useInMemory = false;

// Demo şifre hash'i oluştur
const salt = bcrypt.genSaltSync(10);
const demoPasswordHash = bcrypt.hashSync('demo-password', salt);

// ---------------------------------------------------------
// BELLEK İÇİ (IN-MEMORY) MOCK VERİTABANI
// ---------------------------------------------------------
const mockDb = {
    users: [
        {
            id: 'mock-admin-id',
            email: 'admin_test@gelanlasalim.com',
            password_hash: demoPasswordHash,
            first_name: 'Serkan',
            last_name: 'Demir',
            phone: '08502223344',
            role: 'admin',
            is_active: true,
            created_at: new Date()
        },
        {
            id: 'mock-buyer-id',
            email: 'müteahhit_test@gelanlasalim.com',
            password_hash: demoPasswordHash,
            first_name: 'Ahmet',
            last_name: 'Yılmaz',
            phone: '05551112233',
            role: 'buyer',
            is_active: true,
            created_at: new Date()
        },
        {
            id: 'mock-seller-id',
            email: 'beta_beton_test@gelanlasalim.com',
            password_hash: demoPasswordHash,
            first_name: 'Mehmet',
            last_name: 'Öztürk',
            phone: '05321112233',
            role: 'seller',
            is_active: true,
            created_at: new Date()
        },
        {
            id: 'mock-seller-2-id',
            email: 'kaya_peyzaj@gelanlasalim.com',
            password_hash: demoPasswordHash,
            first_name: 'Ali',
            last_name: 'Kaya',
            phone: '05332223344',
            role: 'seller',
            is_active: true,
            created_at: new Date()
        },
        {
            id: 'mock-seller-3-id',
            email: 'kirtasiye_test@gelanlasalim.com',
            password_hash: demoPasswordHash,
            first_name: 'Hakan',
            last_name: 'Yıldız',
            phone: '05343334455',
            role: 'seller',
            is_active: true,
            created_at: new Date()
        }
    ],
    companies: [
        {
            id: 'mock-company-id',
            user_id: 'mock-seller-id',
            name: 'Beta Hazır Beton & Malzeme Tic. A.Ş.',
            tax_number: '9876543210',
            tax_office: 'Gebze',
            address: 'Organize Sanayi Bölgesi, Gebze',
            city: 'Kocaeli',
            district: 'Gebze',
            logo_url: '',
            is_verified: true,
            verification_documents: ['Vergi_Levhasi_2026.pdf'],
            monthly_bid_limit: 10,
            bid_count_this_month: 2,
            rating_sum: 23,
            rating_count: 5,
            created_at: new Date()
        },
        {
            id: 'mock-company-2-id',
            user_id: 'mock-seller-2-id',
            name: 'Kaya Peyzaj ve Fidancılık',
            tax_number: '1231231234',
            tax_office: 'Bornova',
            address: 'Bornova, İzmir',
            city: 'İzmir',
            district: 'Bornova',
            logo_url: '',
            is_verified: true,
            verification_documents: ['Ticaret_Sicil.pdf'],
            monthly_bid_limit: 10,
            bid_count_this_month: 1,
            rating_sum: 18,
            rating_count: 4,
            created_at: new Date()
        },
        {
            id: 'mock-company-3-id',
            user_id: 'mock-seller-3-id',
            name: 'Kırtasiye Dünyası Ltd. Şti.',
            tax_number: '5556667778',
            tax_office: 'Kadıköy',
            address: 'Kadıköy, İstanbul',
            city: 'İstanbul',
            district: 'Kadıköy',
            logo_url: '',
            is_verified: true,
            verification_documents: ['Vergi_Levhasi.pdf'],
            monthly_bid_limit: 10,
            bid_count_this_month: 3,
            rating_sum: 9,
            rating_count: 2,
            created_at: new Date()
        }
    ],
    categories: [
        { id: 1, name: 'İnşaat, Altyapı ve Yapı İşleri', slug: 'insaat-altyapi-ve-yapi-isleri', description: 'İnşaat, Altyapı ve Yapı İşleri' },
        { id: 2, name: 'Kanalizasyon, Boru ve Tesisat', slug: 'kanalizasyon-boru-ve-tesisat', description: 'Kanalizasyon, Boru ve Tesisat' },
        { id: 3, name: 'Kent Mobilyaları ve Prefabrik Yapılar', slug: 'kent-mobilyalari-ve-prefabrik-yapilar', description: 'Kent Mobilyaları ve Prefabrik Yapılar' },
        { id: 4, name: 'Mühendislik, Mimarlık ve Danışmanlık', slug: 'muhendislik-mimarlik-ve-danismanlik', description: 'Mühendislik, Mimarlık ve Danışmanlık' },
        { id: 5, name: 'Madencilik, Sondaj ve Doğal Kaynaklar', slug: 'madencilik-sondaj-ve-dogal-kaynaklar', description: 'Madencilik, Sondaj ve Doğal Kaynaklar' },
        { id: 6, name: 'Hırdavat, Metal ve Plastik Ürünler', slug: 'hirdavat-metal-ve-plastik-urunler', description: 'Hırdavat, Metal ve Plastik Ürünler' },
        { id: 7, name: 'Enerji, Elektrik ve Aydınlatma', slug: 'enerji-elektrik-ve-aydinlatma', description: 'Enerji, Elektrik ve Aydınlatma' },
        { id: 8, name: 'Yangın ve Güvenlik Sistemleri', slug: 'yangin-ve-guvenlik-sistemleri', description: 'Yangın ve Güvenlik Sistemleri' },
        { id: 9, name: 'Asansör ve Yapı Otomasyonu', slug: 'asansor-ve-yapi-otomasyonu', description: 'Asansör ve Yapı Otomasyonu' },
        { id: 10, name: 'Klima, Isıtma ve Havalandırma', slug: 'klima-isitma-ve-havalandirma', description: 'Klima, Isıtma ve Havalandırma' },
        { id: 11, name: 'Endüstriyel Makine ve Üretim', slug: 'endustriyel-makine-ve-uretim', description: 'Endüstriyel Makine ve Üretim' },
        { id: 12, name: 'Taşıt, İş Makinesi ve Yedek Parça', slug: 'tasit-is-makinesi-ve-yedek-parca', description: 'Taşıt, İş Makinesi ve Yedek Parça' },
        { id: 13, name: 'Nakliye, Lojistik ve Taşımacılık', slug: 'nakliye-lojistik-ve-tasimacilik', description: 'Nakliye, Lojistik ve Taşımacılık' },
        { id: 14, name: 'Turizm ve Organizasyon', slug: 'turizm-ve-organizasyon', description: 'Turizm ve Organizasyon' },
        { id: 15, name: 'Reklam, Tanıtım ve Pazarlama', slug: 'reklam-tanitim-ve-pazarlama', description: 'Reklam, Tanıtım ve Pazarlama' },
        { id: 16, name: 'Matbaa, Kırtasiye ve Ambalaj', slug: 'matbaa-kirtasiye-ve-ambalaj', description: 'Matbaa, Kırtasiye ve Ambalaj' },
        { id: 17, name: 'Peyzaj, Bahçe ve Ormancılık', slug: 'peyzaj-bahce-ve-ormancilik', description: 'Peyzaj, Bahçe ve Ormancılık' },
        { id: 18, name: 'Sağlık, Medikal ve Tıbbi Cihaz', slug: 'saglik-medikal-ve-tibbi-cihaz', description: 'Sağlık, Medikal ve Tıbbi Cihaz' },
        { id: 19, name: 'Akaryakıt, Yakıt ve Madeni Yağ', slug: 'akaryakit-yakit-ve-madeni-yag', description: 'Akaryakıt, Yakıt ve Madeni Yağ' },
        { id: 20, name: 'Gıda, Tarım ve Catering', slug: 'gida-tarim-ve-catering', description: 'Gıda, Tarım ve Catering' },
        { id: 21, name: 'Elektronik, Bilgisayar ve İletişim', slug: 'elektronik-bilgisayar-ve-iletisim', description: 'Elektronik, Bilgisayar ve İletişim' },
        { id: 22, name: 'Yazılım, Bilişim ve Dijital Hizmetler', slug: 'yazilim-bilisim-ve-dijital-hizmetler', description: 'Yazılım, Bilişim ve Dijital Hizmetler' },
        { id: 23, name: 'Kamera, Otomasyon ve Haberleşme', slug: 'kamera-otomasyon-ve-haberlesme', description: 'Kamera, Otomasyon ve Haberleşme' },
        { id: 24, name: 'Temizlik, İlaçlama ve Geri Dönüşüm', slug: 'temizlik-ilaclama-ve-geri-donusum', description: 'Temizlik, İlaçlama ve Geri Dönüşüm' },
        { id: 25, name: 'Kimyasal Maddeler ve Endüstriyel Ürünler', slug: 'kimyasal-maddeler-ve-endustriyel-urunler', description: 'Kimyasal Maddeler ve Endüstriyel Ürünler' },
        { id: 26, name: 'Tekstil, Giyim ve İş Kıyafetleri', slug: 'tekstil-giyim-ve-is-kiyafetleri', description: 'Tekstil, Giyim ve İş Kıyafetleri' },
        { id: 27, name: 'İş Sağlığı ve Güvenliği', slug: 'is-sagligi-ve-guvenligi', description: 'İş Sağlığı ve Güvenliği' },
        { id: 28, name: 'Mobilya, Ofis ve Dekorasyon', slug: 'mobilya-ofis-ve-dekorasyon', description: 'Mobilya, Ofis ve Dekorasyon' },
        { id: 29, name: 'Özel Güvenlik ve Koruma', slug: 'ozel-guvenlik-ve-koruma', description: 'Özel Güvenlik ve Koruma' },
        { id: 30, name: 'Eğitim ve Kurumsal Gelişim', slug: 'egitim-ve-kurumsal-gelisim', description: 'Eğitim ve Kurumsal Gelişim' },
        { id: 31, name: 'İnsan Kaynakları ve Sosyal Hizmetler', slug: 'insan-kaynaklari-ve-sosyal-hizmetler', description: 'İnsan Kaynakları ve Sosyal Hizmetler' },
        { id: 32, name: 'Sigorta, Mali ve Hukuki Hizmetler', slug: 'sigorta-mali-ve-hukuki-hizmetler', description: 'Sigorta, Mali ve Hukuki Hizmetler' },
        { id: 33, name: 'Gayrimenkul ve İşyeri Hizmetleri', slug: 'gayrimenkul-ve-isyeri-hizmetler', description: 'Gayrimenkul ve İşyeri Hizmetleri' }
    ],
    tenders: [
        {
            id: 'tender-1',
            buyer_id: 'mock-buyer-id',
            category_id: 1,
            title: 'A4 KAĞIT ALIMI',
            description: 'Şirket merkezimizde kullanılmak üzere 500 paket A4 fotokopi kağıdı alınacaktır. Marka: Double A veya Copier Land tercihidir. Teslimat adresi Kadıköy.',
            quantity: 500,
            unit: 'paket',
            city: 'İstanbul',
            district: 'Kadıköy',
            delivery_address: 'Kadıköy İş Merkezi No:12, İstanbul',
            delivery_date: '2026-08-01',
            status: 'open',
            expires_at: '2026-07-28',
            winning_bid_id: null,
            created_at: new Date(),
            country: 'Türkiye',
            neighborhood: 'Caferağa Mah.',
            file_url: 'Sartname_A4_Kagit.rar',
            image_url: 'a4_paper.jpg',
            type: 'Alış',
            target_price: 65000
        },
        {
            id: 'tender-2',
            buyer_id: 'mock-buyer-id',
            category_id: 2,
            title: 'BİTKİ ALIMI',
            description: 'Belediye parkı projemiz için 200 adet Leylandi ağacı ve 150 adet Taflan çalısı alımı yapılacaktır. Leylandiler en az 1.5 metre boyunda olmalıdır.',
            quantity: 350,
            unit: 'adet',
            city: 'İzmir',
            district: 'Bornova',
            delivery_address: 'Bornova Şantiye Sahası, İzmir',
            delivery_date: '2026-08-10',
            status: 'open',
            expires_at: '2026-07-30',
            winning_bid_id: null,
            created_at: new Date(),
            country: 'Türkiye',
            neighborhood: 'Evka 3',
            file_url: 'Peyzaj_Bitki.rar',
            image_url: 'flowers.jpg',
            type: 'Alış',
            target_price: 45000
        },
        {
            id: 'tender-3',
            buyer_id: 'mock-buyer-id',
            category_id: 2,
            title: 'BİTKİ SATIMI',
            description: 'Üretim sahamızdaki 1000 adet zeytin fidanını toptan olarak satıyoruz. Fidanlar 2 yaşındadır ve tüplüdür.',
            quantity: 1000,
            unit: 'adet',
            city: 'Antalya',
            district: 'Muratpaşa',
            delivery_address: 'Antalya Sera Deposu',
            delivery_date: '2026-08-05',
            status: 'open',
            expires_at: '2026-07-25',
            winning_bid_id: null,
            created_at: new Date(),
            country: 'Türkiye',
            neighborhood: 'Yeşilbahçe Mah.',
            file_url: '',
            image_url: '',
            type: 'Satış',
            target_price: 35000
        },
        {
            id: 'tender-4',
            buyer_id: 'mock-buyer-id',
            category_id: 3,
            title: 'HİZMET ALIMI',
            description: 'Genel müdürlük binamızın dış cephe temizliği için 1 defaya mahsus temizlik hizmeti alınacaktır. Gerekli güvenlik belgeleri zorunludur.',
            quantity: 1,
            unit: 'hizmet',
            city: 'Ankara',
            district: 'Çankaya',
            delivery_address: 'Çankaya Plaza Kat:10, Ankara',
            delivery_date: '2026-08-15',
            status: 'open',
            expires_at: '2026-08-05',
            winning_bid_id: null,
            created_at: new Date(),
            country: 'Türkiye',
            neighborhood: 'Kavaklıdere',
            file_url: 'Cephe_Temizlik_Sartname.rar',
            image_url: '',
            type: 'Hizmet',
            target_price: 25000
        },
        {
            id: 'tender-5',
            buyer_id: 'mock-buyer-id',
            category_id: 4,
            title: 'TARIM ÜRÜNÜ ALIŞ',
            description: 'Fabrikamızda işlenmek üzere 20 ton organik nohut alımı yapılacaktır. Rutubet oranı en fazla %12 olmalıdır.',
            quantity: 20,
            unit: 'ton',
            city: 'Konya',
            district: 'Selçuklu',
            delivery_address: 'Konya Organize Gıda Deposu',
            delivery_date: '2026-08-20',
            status: 'open',
            expires_at: '2026-07-27',
            winning_bid_id: null,
            created_at: new Date(),
            country: 'Türkiye',
            neighborhood: 'Büyük Kayacık',
            file_url: '',
            image_url: '',
            type: 'Alış',
            target_price: 800000
        },
        {
            id: 'tender-6',
            buyer_id: 'mock-buyer-id',
            category_id: 4,
            title: 'TARIM ÜRÜNÜ SATIŞ',
            description: 'Kendi bahçemizden hasat edilmiş 5 ton Çukurova limonunu satışa sunuyoruz. Kasalanmış ve sevke hazırdır.',
            quantity: 5,
            unit: 'ton',
            city: 'Adana',
            district: 'Seyhan',
            delivery_address: 'Seyhan Hal Deposu, Adana',
            delivery_date: '2026-08-12',
            status: 'open',
            expires_at: '2026-08-01',
            winning_bid_id: null,
            created_at: new Date(),
            country: 'Türkiye',
            neighborhood: 'Reşatbey',
            file_url: '',
            image_url: '',
            type: 'Satış',
            target_price: 150000
        }
    ],
    bids: [
        {
            id: 'bid-1-1',
            tender_id: 'tender-1',
            company_id: 'mock-company-3',
            price: 62000,
            tax_included: false,
            delivery_lead_time_days: 2,
            note: 'Double A marka, ertesi gün teslimat garantisi.',
            status: 'active',
            created_at: new Date()
        },
        {
            id: 'bid-1-2',
            tender_id: 'tender-1',
            company_id: 'mock-company-id',
            price: 64000,
            tax_included: true,
            delivery_lead_time_days: 3,
            note: 'KDV dahil en iyi fiyat.',
            status: 'active',
            created_at: new Date()
        },
        {
            id: 'bid-1-3',
            tender_id: 'tender-1',
            company_id: 'mock-company-2-id',
            price: 68000,
            tax_included: false,
            delivery_lead_time_days: 5,
            note: 'Stoktan hemen teslim.',
            status: 'active',
            created_at: new Date()
        },
        {
            id: 'bid-2-1',
            tender_id: 'tender-2',
            company_id: 'mock-company-2-id',
            price: 43000,
            tax_included: false,
            delivery_lead_time_days: 4,
            note: 'Leylandiler budanmış, saksılı teslim edilir.',
            status: 'active',
            created_at: new Date()
        },
        {
            id: 'bid-4-1',
            tender_id: 'tender-4',
            company_id: 'mock-company-id',
            price: 24000,
            tax_included: true,
            delivery_lead_time_days: 1,
            note: 'Dış cephe asansörü firmamıza aittir.',
            status: 'active',
            created_at: new Date()
        },
        {
            id: 'bid-4-2',
            tender_id: 'tender-4',
            company_id: 'mock-company-3',
            price: 23000,
            tax_included: false,
            delivery_lead_time_days: 2,
            note: 'Hafta sonu çalışma yapılabilir.',
            status: 'active',
            created_at: new Date()
        }
    ],
    company_categories: [],
    company_service_regions: [],
    site_content: []
};

// UUID Benzeri Benzersiz ID Üretici
const generateUUID = () => {
    return 'mock-uuid-' + Math.random().toString(36).substr(2, 9);
};

// SQL Sorgularını Yakalayıp Bellek İçi Simüle Eden Motor
const runMockQuery = (text, params = []) => {
    const cleanText = text.replace(/\s+/g, ' ').trim();
    // console.log(`[Mock DB Query]: ${cleanText} | Params:`, params);

    // 1. Kategori Sayaç Kontrolü
    if (cleanText.includes('SELECT COUNT(*) FROM categories')) {
        return { rows: [{ count: mockDb.categories.length }] };
    }

    // 2. Kategorileri Listeleme
    if (cleanText.includes('SELECT * FROM categories ORDER BY name ASC')) {
        return { rows: mockDb.categories };
    }

    // 3. Kategori Ekleme
    if (cleanText.includes('INSERT INTO categories')) {
        const [name, slug, description, parent_id] = params;
        const newCat = { id: mockDb.categories.length + 1, name, slug, description, parent_id: parent_id || null };
        mockDb.categories.push(newCat);
        return { rows: [newCat] };
    }

    // 4. Kullanıcı Kayıt
    if (cleanText.includes('INSERT INTO users')) {
        const [email, password_hash, first_name, last_name, phone, role] = params;
        const newUser = {
            id: generateUUID(),
            email,
            password_hash,
            first_name,
            last_name,
            phone,
            role,
            is_active: true,
            created_at: new Date()
        };
        mockDb.users.push(newUser);
        return { rows: [newUser] };
    }

    // 5. Giriş için E-posta Sorgusu
    if (cleanText.includes('SELECT * FROM users WHERE email = $1')) {
        const email = params[0];
        const user = mockDb.users.find(u => u.email === email);
        return { rows: user ? [user] : [] };
    }

    // 6. Profil için ID Sorgusu
    if (cleanText.includes('SELECT id, email, first_name, last_name, phone, role, is_active, created_at FROM users WHERE id = $1')) {
        const id = params[0];
        const user = mockDb.users.find(u => u.id === id);
        return { rows: user ? [user] : [] };
    }

    // 7. Firma Profil Kontrolü
    if (cleanText.includes('SELECT * FROM companies WHERE user_id = $1')) {
        const userId = params[0];
        const company = mockDb.companies.find(c => c.user_id === userId);
        return { rows: company ? [company] : [] };
    }

    // 8. Firma Kayıt Güncelleme
    if (cleanText.includes('UPDATE companies SET name = $1')) {
        const [name, tax_number, tax_office, address, city, district, logo_url, verification_documents, userId] = params;
        const index = mockDb.companies.findIndex(c => c.user_id === userId);
        if (index > -1) {
            mockDb.companies[index] = {
                ...mockDb.companies[index],
                name, tax_number, tax_office, address, city, district, logo_url,
                verification_documents: JSON.parse(verification_documents),
                updated_at: new Date()
            };
            return { rows: [mockDb.companies[index]] };
        }
    }

    // 9. Yeni Firma Kayıt
    if (cleanText.includes('INSERT INTO companies')) {
        const [userId, name, tax_number, tax_office, address, city, district, logo_url, verification_documents] = params;
        const newCompany = {
            id: generateUUID(),
            user_id: userId,
            name,
            tax_number,
            tax_office,
            address,
            city,
            district,
            logo_url,
            is_verified: false,
            verification_documents: JSON.parse(verification_documents),
            monthly_bid_limit: 50,
            bid_count_this_month: 0,
            rating_sum: 0,
            rating_count: 0,
            created_at: new Date()
        };
        mockDb.companies.push(newCompany);
        return { rows: [newCompany] };
    }

    // 10. Firma Kategorileri Silme
    if (cleanText.includes('DELETE FROM company_categories WHERE company_id = $1')) {
        const companyId = params[0];
        mockDb.company_categories = mockDb.company_categories.filter(cc => cc.company_id !== companyId);
        return { rows: [] };
    }

    // 11. Firma Kategori Ekleme
    if (cleanText.includes('INSERT INTO company_categories')) {
        const [companyId, categoryId] = params;
        mockDb.company_categories.push({ company_id: companyId, category_id: categoryId });
        return { rows: [] };
    }

    // 12. Firma Hizmet Bölgesi Ekleme
    if (cleanText.includes('INSERT INTO company_service_regions')) {
        const [companyId, city, district] = params;
        const newRegion = { id: Math.floor(Math.random() * 10000), company_id: companyId, city, district: district || null };
        mockDb.company_service_regions.push(newRegion);
        return { rows: [newRegion] };
    }

    // 13. Firma Hizmet Bölgesi Listeleme
    if (cleanText.includes('SELECT * FROM company_service_regions WHERE company_id = $1')) {
        const companyId = params[0];
        const regions = mockDb.company_service_regions.filter(r => r.company_id === companyId);
        return { rows: regions };
    }

    // 14. Firma Hizmet Bölgesi Silme
    if (cleanText.includes('DELETE FROM company_service_regions WHERE id = $1 AND company_id = $2')) {
        const [id, companyId] = params;
        const beforeLen = mockDb.company_service_regions.length;
        mockDb.company_service_regions = mockDb.company_service_regions.filter(r => !(r.id === parseInt(id) && r.company_id === companyId));
        return { rows: mockDb.company_service_regions.length < beforeLen ? [{ id }] : [] };
    }

    // 15. Admin için Tüm Firmaları Listeleme
    if (cleanText.includes('SELECT c.*, u.email as user_email, u.first_name, u.last_name, u.phone as user_phone FROM companies c JOIN users u ON c.user_id = u.id')) {
        const joined = mockDb.companies.map(c => {
            const u = mockDb.users.find(user => user.id === c.user_id) || {};
            return {
                ...c,
                user_email: u.email,
                first_name: u.first_name,
                last_name: u.last_name,
                user_phone: u.phone
            };
        });
        return { rows: joined };
    }

    // 16. Admin Firma Onaylama/Reddetme
    if (cleanText.includes('UPDATE companies SET is_verified = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2')) {
        const [isVerified, companyId] = params;
        const index = mockDb.companies.findIndex(c => c.id === companyId);
        if (index > -1) {
            mockDb.companies[index].is_verified = isVerified;
            return { rows: [mockDb.companies[index]] };
        }
        return { rows: [] };
    }

    // 17. İhale Oluşturma
    if (cleanText.includes('INSERT INTO tenders')) {
        const [
            buyerId, categoryId, title, description, quantity, unit,
            city, district, delivery_address, delivery_date, expires_at,
            country, neighborhood, file_url, image_url, type, target_price,
            material_list, admin_spec, tech_spec, similar_history
        ] = params;
        const newTender = {
            id: generateUUID(),
            buyer_id: buyerId,
            category_id: parseInt(categoryId),
            title,
            description,
            quantity: parseFloat(quantity),
            unit,
            city,
            district,
            delivery_address,
            delivery_date,
            status: 'open',
            expires_at,
            winning_bid_id: null,
            created_at: new Date(),
            country: country || 'Türkiye',
            neighborhood: neighborhood || '',
            file_url: file_url || '',
            image_url: image_url || '',
            type: type || 'Alış',
            target_price: target_price ? parseFloat(target_price) : null,
            material_list: material_list || '',
            admin_spec: admin_spec || '',
            tech_spec: tech_spec || '',
            similar_history: similar_history || ''
        };
        mockDb.tenders.push(newTender);
        return { rows: [newTender] };
    }

    // 18. İhaleleri Listeleme
    if (cleanText.startsWith('SELECT t.*, c.name as category_name FROM tenders t JOIN categories c')) {
        let filtered = mockDb.tenders;
        
        // Basit filtre simülasyonu
        if (params.length > 0) {
            const statusVal = params.find(p => ['open', 'awarded', 'completed', 'cancelled'].includes(p));
            if (statusVal) {
                filtered = filtered.filter(t => t.status === statusVal);
            }
        }

        const mapped = filtered.map(t => {
            const cat = mockDb.categories.find(c => c.id === t.category_id) || {};
            const bids = mockDb.bids.filter(b => b.tender_id === t.id);
            return {
                ...t,
                category_name: cat.name,
                teklif_sayisi: bids.length,
                bid_count: bids.length
            };
        });
        return { rows: mapped };
    }

    // 19. İhale Detayı Getirme
    if (cleanText.includes('FROM tenders t JOIN categories c ON t.category_id = c.id JOIN users u ON t.buyer_id = u.id WHERE t.id = $1')) {
        const id = params[0];
        const t = mockDb.tenders.find(tender => tender.id === id);
        if (t) {
            const cat = mockDb.categories.find(c => c.id === t.category_id) || {};
            const u = mockDb.users.find(user => user.id === t.buyer_id) || {};
            const bids = mockDb.bids.filter(b => b.tender_id === t.id);
            return {
                rows: [{
                    ...t,
                    category_name: cat.name,
                    buyer_first_name: u.first_name,
                    buyer_last_name: u.last_name,
                    teklif_sayisi: bids.length,
                    bid_count: bids.length
                }]
            };
        }
        return { rows: [] };
    }

    // 20. İhaleye Gelen Teklifleri Getirme
    if (cleanText.includes('FROM bids b JOIN companies comp ON b.company_id = comp.id WHERE b.tender_id = $1 ORDER BY b.price ASC')) {
        const tenderId = params[0];
        const bids = mockDb.bids.filter(b => b.tender_id === tenderId);
        const mapped = bids.map(b => {
            const comp = mockDb.companies.find(c => c.id === b.company_id) || {};
            return {
                ...b,
                company_name: comp.name,
                company_logo: comp.logo_url
            };
        });
        // Fiyata göre sırala
        mapped.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
        return { rows: mapped };
    }

    // 21. İhaleye Teklif Ekleme
    if (cleanText.includes('INSERT INTO bids (tender_id, company_id, price, tax_included, delivery_lead_time_days, note, status)')) {
        const [tenderId, companyId, price, taxIncluded, deliveryLeadTime, note] = params;
        const newBid = {
            id: generateUUID(),
            tender_id: tenderId,
            company_id: companyId,
            price,
            tax_included: taxIncluded,
            delivery_lead_time_days: deliveryLeadTime,
            note,
            status: 'active',
            created_at: new Date()
        };
        mockDb.bids.push(newBid);
        return { rows: [newBid] };
    }

    // 22. Teklif Verildiğinde Firma Sayacını Artırma
    if (cleanText.includes('UPDATE companies SET bid_count_this_month = bid_count_this_month + 1 WHERE id = $1')) {
        const companyId = params[0];
        const index = mockDb.companies.findIndex(c => c.id === companyId);
        if (index > -1) {
            mockDb.companies[index].bid_count_this_month += 1;
        }
        return { rows: [] };
    }

    // 23. İhalenin Kazananını Belirleme
    if (cleanText.includes('UPDATE tenders SET status = \'awarded\', winning_bid_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2')) {
        const [winningBidId, tenderId] = params;
        const index = mockDb.tenders.findIndex(t => t.id === tenderId);
        if (index > -1) {
            mockDb.tenders[index].status = 'awarded';
            mockDb.tenders[index].winning_bid_id = winningBidId;
            return { rows: [mockDb.tenders[index]] };
        }
        return { rows: [] };
    }

    // 24. Teklif Durumunu Kazanana Güncelleme
    if (cleanText.includes('UPDATE bids SET status = \'won\', updated_at = CURRENT_TIMESTAMP WHERE id = $1')) {
        const bidId = params[0];
        const index = mockDb.bids.findIndex(b => b.id === bidId);
        if (index > -1) {
            mockDb.bids[index].status = 'won';
        }
        return { rows: [] };
    }

    // 25. Diğer Teklifleri Kaybettiye Çekme
    if (cleanText.includes('UPDATE bids SET status = \'lost\', updated_at = CURRENT_TIMESTAMP WHERE tender_id = $1 AND id != $2 AND status = \'active\'')) {
        const [tenderId, winningBidId] = params;
        mockDb.bids.forEach((b, idx) => {
            if (b.tender_id === tenderId && b.id !== winningBidId && b.status === 'active') {
                mockDb.bids[idx].status = 'lost';
            }
        });
        return { rows: [] };
    }

    // 26. İhale İptal Etme
    if (cleanText.includes('UPDATE tenders SET status = \'cancelled\', updated_at = CURRENT_TIMESTAMP WHERE id = $1')) {
        const tenderId = params[0];
        const index = mockDb.tenders.findIndex(t => t.id === tenderId);
        if (index > -1) {
            mockDb.tenders[index].status = 'cancelled';
            return { rows: [mockDb.tenders[index]] };
        }
        return { rows: [] };
    }

    // 27. İhale İptalinde Teklifleri Geri Çekme
    if (cleanText.includes('UPDATE bids SET status = \'retracted\', updated_at = CURRENT_TIMESTAMP WHERE tender_id = $1 AND status = \'active\'')) {
        const tenderId = params[0];
        mockDb.bids.forEach((b, idx) => {
            if (b.tender_id === tenderId && b.status === 'active') {
                mockDb.bids[idx].status = 'retracted';
            }
        });
        return { rows: [] };
    }

    // 28. Admin Finansal İstatistikler - Ciro Hacmi
    if (cleanText.includes('SUM(b.price) as total_volume') && cleanText.includes('\'awarded\', \'completed\'')) {
        let total = 0;
        mockDb.tenders.forEach(t => {
            if (['awarded', 'completed'].includes(t.status) && t.winning_bid_id) {
                const winningBid = mockDb.bids.find(b => b.id === t.winning_bid_id);
                if (winningBid) {
                    total += parseFloat(winningBid.price);
                }
            }
        });
        return { rows: [{ total_volume: total }] };
    }

    // 29. Admin Finansal İstatistikler - Havuz Tutarı
    if (cleanText.includes('SUM(b.price) as total_escrow') && cleanText.includes('t.status = \'awarded\'')) {
        let total = 0;
        mockDb.tenders.forEach(t => {
            if (t.status === 'awarded' && t.winning_bid_id) {
                const winningBid = mockDb.bids.find(b => b.id === t.winning_bid_id);
                if (winningBid) {
                    total += parseFloat(winningBid.price);
                }
            }
        });
        return { rows: [{ total_escrow: total }] };
    }

    // 30. Admin Sistem Sayaçları
    if (cleanText.includes('(SELECT COUNT(*) FROM users) as total_users')) {
        const totalUsers = mockDb.users.length;
        const totalCompanies = mockDb.companies.length;
        const activeTenders = mockDb.tenders.filter(t => t.status === 'open').length;
        return {
            rows: [{
                total_users: totalUsers,
                total_companies: totalCompanies,
                active_tenders: activeTenders
            }]
        };
    }

    // 31. Teklif Reddetme
    if (cleanText.includes("UPDATE bids SET status = 'rejected'")) {
        const bidId = params[0];
        const index = mockDb.bids.findIndex(b => b.id === bidId);
        if (index > -1) {
            mockDb.bids[index].status = 'rejected';
            return { rows: [mockDb.bids[index]] };
        }
        return { rows: [] };
    }

    // 32. Teklif Pazarlık Durumuna Çekme
    if (cleanText.includes("UPDATE bids SET status = 'negotiating'")) {
        const [note, bidId] = params;
        const index = mockDb.bids.findIndex(b => b.id === bidId);
        if (index > -1) {
            mockDb.bids[index].status = 'negotiating';
            mockDb.bids[index].note = note;
            return { rows: [mockDb.bids[index]] };
        }
        return { rows: [] };
    }

    // CMS: site_content SELECT
    if (cleanText.includes('SELECT content_json FROM site_content WHERE section_key')) {
        const key = params[0];
        const row = mockDb.site_content.find(r => r.section_key === key);
        return { rows: row ? [row] : [] };
    }

    // CMS: site_content UPSERT (INSERT ... ON CONFLICT)
    if (cleanText.includes('INSERT INTO site_content')) {
        const key = 'landing';
        const contentJson = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
        const existing = mockDb.site_content.find(r => r.section_key === key);
        if (existing) {
            existing.content_json = contentJson;
            existing.updated_at = new Date();
            return { rows: [{ id: existing.id }] };
        } else {
            const newRow = { id: generateUUID(), section_key: key, content_json: contentJson, updated_at: new Date() };
            mockDb.site_content.push(newRow);
            return { rows: [{ id: newRow.id }] };
        }
    }

    // fallback varsayılan boş satır
    return { rows: [] };
};

// Bağlantı Hatası Durumunda Bellek İçi Modu Aktifleştir
pool.on('error', (err) => {
    console.error('⚠️ PostgreSQL bağlantısı kesildi veya başarısız. Sanal bellek moduna geçiliyor.', err.message);
    useInMemory = true;
});

// İlk bağlantıyı test et
pool.connect((err, client, release) => {
    if (err) {
        console.log('================================================================');
        console.log('⚠️ PostgreSQL veritabanı aktif değil veya bağlantı sağlanamadı.');
        console.log('🌱 Sistem Otomatik "BELLEK İÇİ (IN-MEMORY) SANAL VERİTABANI" moduna geçti!');
        console.log('👉 Arayüzdeki tüm özellikleri (Teklif, İhale, Admin) sıfır ayarla test edebilirsiniz.');
        console.log('================================================================');
        useInMemory = true;
    } else {
        console.log('📡 PostgreSQL bağlantısı başarıyla kuruldu.');
        client.query(`
            ALTER TABLE tenders 
            ADD COLUMN IF NOT EXISTS country VARCHAR(100),
            ADD COLUMN IF NOT EXISTS neighborhood VARCHAR(100),
            ADD COLUMN IF NOT EXISTS file_url VARCHAR(512),
            ADD COLUMN IF NOT EXISTS image_url VARCHAR(512),
            ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'Alış',
            ADD COLUMN IF NOT EXISTS target_price NUMERIC(12, 2),
            ADD COLUMN IF NOT EXISTS material_list TEXT,
            ADD COLUMN IF NOT EXISTS admin_spec TEXT,
            ADD COLUMN IF NOT EXISTS tech_spec TEXT,
            ADD COLUMN IF NOT EXISTS similar_history TEXT;
        `, (alterErr) => {
            if (alterErr) {
                console.error('⚠️ DB şema güncelleme hatası:', alterErr.message);
            } else {
                console.log('✅ DB şeması başarıyla güncellendi (Yeni alanlar eklendi/kontrol edildi).');
            }
            release();
        });
    }
});

export default {
  query: (text, params) => {
      if (useInMemory) {
          return runMockQuery(text, params);
      }
      return pool.query(text, params);
  },
  pool,
};
