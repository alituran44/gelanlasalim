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
            bid_count_this_month: 0,
            rating_sum: 0,
            rating_count: 0,
            created_at: new Date()
        }
    ],
    categories: [
        { id: 1, name: 'İnşaat & Yapı Malzemeleri', slug: 'insaat-yapi-malzemeleri', description: 'Demir, beton, çimento, ince yapı ve kaba inşaat malzemeleri' },
        { id: 2, name: 'Lojistik & Nakliye', slug: 'lojistik-nakliye', description: 'Şehir içi ve şehirler arası yük taşımacılığı, tır, kamyon ve depo hizmetleri' },
        { id: 3, name: 'Endüstriyel Hammadde', slug: 'endustriyel-hammadde', description: 'Plastik, metal, kimyasal ve diğer endüstriyel üretim hammadde tedariği' },
        { id: 4, name: 'Kurumsal Hizmetler & IT', slug: 'kurumsal-hizmetler-it', description: 'Yazılım, donanım tedariği, danışmanlık, güvenlik ve temizlik hizmetleri' }
    ],
    tenders: [],
    bids: [],
    company_categories: [],
    company_service_regions: []
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
        const [buyerId, categoryId, title, description, quantity, unit, city, district, delivery_address, delivery_date, expires_at] = params;
        const newTender = {
            id: generateUUID(),
            buyer_id: buyerId,
            category_id: categoryId,
            title,
            description,
            quantity,
            unit,
            city,
            district,
            delivery_address,
            delivery_date,
            status: 'open',
            expires_at,
            winning_bid_id: null,
            created_at: new Date()
        };
        mockDb.tenders.push(newTender);
        return { rows: [newTender] };
    }

    // 18. İhaleleri Listeleme
    if (cleanText.startsWith('SELECT t.*, c.name as category_name FROM tenders t JOIN categories c')) {
        // Parametrelere göre filtrele
        let filtered = mockDb.tenders;
        
        // Basit filtre simülasyonu
        if (params.length > 0) {
            // Durum filtresi kontrolü
            const statusVal = params.find(p => ['open', 'awarded', 'completed', 'cancelled'].includes(p));
            if (statusVal) {
                filtered = filtered.filter(t => t.status === statusVal);
            }
        }

        const mapped = filtered.map(t => {
            const cat = mockDb.categories.find(c => c.id === t.category_id) || {};
            return { ...t, category_name: cat.name };
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
            return {
                rows: [{
                    ...t,
                    category_name: cat.name,
                    buyer_first_name: u.first_name,
                    buyer_last_name: u.last_name
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
        release();
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
