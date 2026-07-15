-- gelanlasalim.com - PostgreSQL Veritabanı Şeması
-- Sürüm: 1.0.0
-- Açıklama: İnşaat sektörü odaklı tersine ihale ve pazar yeri platformu veri modeli.

-- UUID üretimi için gerekli eklentiyi aktifleştiriyoruz.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------
-- ENUMLER (Özel Veri Tipleri)
-- ---------------------------------------------------------

-- İhale Durumları
CREATE TYPE tender_status AS ENUM (
    'draft',      -- Taslak halindeki ilan
    'open',       -- Canlı yayında, teklife açık
    'awarded',    -- Teklif onaylandı, havuz ödemesi bekleniyor/yapıldı
    'completed',  -- Teslimat tamamlandı, ihale kapandı
    'cancelled'   -- İhale iptal edildi
);

-- Teklif Durumları
CREATE TYPE bid_status AS ENUM (
    'active',     -- Canlı teklif, geçerli
    'won',        -- Kazanan teklif
    'lost',       -- Kaybeden teklif
    'retracted'   -- Firma tarafından geri çekilen teklif
);

-- Kullanıcı Rolleri
CREATE TYPE user_role AS ENUM (
    'buyer',      -- Bireysel veya Kurumsal Alıcı
    'seller',     -- Satıcı Firma
    'admin'       -- Sistem Yöneticisi
);

-- ---------------------------------------------------------
-- TABLOLAR
-- ---------------------------------------------------------

-- 1. USERS (Kullanıcılar) Tablosu
-- Hem alıcıları, hem satıcı firma temsilcilerini hem de adminleri barındırır.
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'buyer',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. COMPANIES (Firmalar / Satıcılar) Tablosu
-- Satıcı rolündeki kullanıcıların kurumsal bilgilerini barındırır.
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    tax_number VARCHAR(11) UNIQUE NOT NULL,
    tax_office VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    logo_url VARCHAR(512),
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    verification_documents JSONB, -- İmza sirküleri, vergi levhası vb. belgelerin URL'leri
    monthly_bid_limit INT NOT NULL DEFAULT 50, -- Aylık teklif verebilme limiti
    bid_count_this_month INT NOT NULL DEFAULT 0, -- Mevcut ayda verilen teklif sayısı
    rating_sum INT NOT NULL DEFAULT 0, -- Toplam puan (ortalama puan hesabı için)
    rating_count INT NOT NULL DEFAULT 0, -- Toplam oy sayısı
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. CATEGORIES (Kategoriler) Tablosu
-- Demir, çimento, hazır beton, iş makinesi kiralama vb.
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    parent_id INT REFERENCES categories(id) ON DELETE CASCADE, -- Alt kategoriler için self-reference
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. TENDERS (İhaleler / İlanlar) Tablosu
-- Alıcıların açtığı malzeme veya hizmet taleplerini barındırır.
CREATE TABLE tenders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL, -- Örn: 150.50
    unit VARCHAR(20) NOT NULL,        -- Örn: 'ton', 'm3', 'adet'
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_date TIMESTAMPTZ NOT NULL,
    status tender_status NOT NULL DEFAULT 'draft',
    expires_at TIMESTAMPTZ NOT NULL,   -- İhalenin canlı teklif almaya kapanacağı zaman
    winning_bid_id UUID,                -- Kazanan teklif atandığında güncellenir (aşağıda foreign key eklenecek)
    country VARCHAR(100),
    neighborhood VARCHAR(100),
    file_url VARCHAR(512),
    image_url VARCHAR(512),
    type VARCHAR(50) DEFAULT 'Alış',
    target_price NUMERIC(12, 2),
    material_list TEXT,
    admin_spec TEXT,
    tech_spec TEXT,
    similar_history TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_quantity_positive CHECK (quantity > 0)
);

-- 5. BIDS (Teklifler) Tablosu
-- Firmaların ihalelere verdiği fiyat tekliflerini barındırır.
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tender_id UUID NOT NULL REFERENCES tenders(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    price DECIMAL(12, 2) NOT NULL, -- Birim fiyat veya toplam fiyat (tasarıma göre)
    tax_included BOOLEAN NOT NULL DEFAULT FALSE,
    delivery_lead_time_days INT NOT NULL, -- Kaç günde teslim edileceği
    note TEXT,
    status bid_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_price_positive CHECK (price > 0)
);

-- Tenders tablosundaki winning_bid_id için döngüsel (circular) referans kısıtlamasını ekliyoruz.
ALTER TABLE tenders ADD CONSTRAINT fk_tenders_winning_bid 
    FOREIGN KEY (winning_bid_id) REFERENCES bids(id) ON DELETE SET NULL;

-- ---------------------------------------------------------
-- İLİŞKİ TABLOLARI (Çoktan Çoka İlişkiler)
-- ---------------------------------------------------------

-- 6. COMPANY_CATEGORIES (Firmaların Faaliyet Alanları)
CREATE TABLE company_categories (
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (company_id, category_id)
);

-- 7. COMPANY_SERVICE_REGIONS (Firmaların Hizmet Bölgeleri)
CREATE TABLE company_service_regions (
    id SERIAL PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    city VARCHAR(50) NOT NULL,
    district VARCHAR(50), -- Null ise tüm şehre hizmet veriyor demektir
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------
-- TRIGGERS (Otomatik Güncelleme Mekanizmaları)
-- ---------------------------------------------------------

-- updated_at kolonunu otomatik güncelleyen fonksiyon
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tablolar için triggerları tanımlıyoruz
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_companies_modtime BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tenders_modtime BEFORE UPDATE ON tenders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_bids_modtime BEFORE UPDATE ON bids FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ---------------------------------------------------------
-- INDEXES (Performans Optimizasyonları)
-- ---------------------------------------------------------

-- E-posta aramaları için
CREATE INDEX idx_users_email ON users(email);

-- Şehir/İlçe bazlı ihale filtrelemeleri için
CREATE INDEX idx_tenders_location ON tenders(city, district);
CREATE INDEX idx_tenders_status ON tenders(status);
CREATE INDEX idx_tenders_expires_at ON tenders(expires_at);

-- Tekliflerin hızlı sorgulanması ve en düşük tekliflerin sıralanması için (Tersine İhale performansı)
CREATE INDEX idx_bids_tender_price ON bids(tender_id, price ASC);

-- Firmaların kategoriye göre hızlı eşleştirilmesi için
CREATE INDEX idx_company_categories_cat ON company_categories(category_id);
