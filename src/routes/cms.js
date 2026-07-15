import express from 'express';
import db from '../config/db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// ============================================================
// CMS — Landing Page İçerik Yönetimi API
// ============================================================

// Varsayılan içerik (fallback)
const DEFAULT_CONTENT = {
  hero: {
    badge: "Kurumsal satın alma ekipleri için B2B ters ihale platformu",
    title: "Tedarik Maliyetlerinizi Canlı Eksiltme ile Düşürün",
    description: "Malzeme, lojistik veya hizmet taleplerinizi yayınlayın; doğrulanmış tedarikçilerin anlık fiyat kırarak yarıştığı canlı tersine ihale arenasını izleyin. Satın alma süreçlerinizi şeffaflaştırın.",
    cta1: "Ücretsiz Başla",
    cta2: "Platform Turu"
  },
  trustStrip: {
    mersis: "0XXX-XXXX-XXXX-XXXX",
    kep: "gelanlasalim@hs01.kep.tr",
    etbisLink: "#"
  },
  stats: [
    { value: "12.4M ₺+", label: "Toplam Ticaret Hacmi" },
    { value: "150+", label: "Doğrulanmış B2B Üretici" },
    { value: "%14.2", label: "Ortalama Tedarik Tasarrufu" },
    { value: "0 ₺", label: "Alıcı Üyelik Komisyonu" }
  ],
  videoGuides: [
    { title: "Nasıl Kayıt Olunur?", desc: "Adım adım üyelik rehberi: firma bilgilerinizi girin, doğrulama sürecini tamamlayın ve ihale arenasına katılın.", videoUrl: "" },
    { title: "Nasıl İhale Açılır?", desc: "İlk ihalenizi dakikalar içinde oluşturun: ürün cinsi, miktar ve şartname dosyalarınızı yükleyin.", videoUrl: "" },
    { title: "Nasıl Teklif Verilir?", desc: "Tedarikçi olarak aktif ihaleleri keşfedin, anlık fiyat kırın ve siparişi kazanın.", videoUrl: "" },
    { title: "Yönetim Paneli", desc: "Kontrol panelinizden ihalelerinizi, tekliflerinizi ve ödemelerinizi tek ekrandan yönetin.", videoUrl: "" }
  ],
  features: [
    { icon: "fa-gavel", title: "Ters İhale Sistemi", desc: "Kapalı zarf usulü yerine şeffaf, anlık rekabet ortamı. Tedarikçiler birbirlerinin fiyatlarını görerek en düşük teklifi sunar. Rekabet güdümlü fiyatlandırma ile tasarrufunuz maximize olur." },
    { icon: "fa-user-check", title: "Nitelikli Tedarikçi Akışı", desc: "Belge bazlı firma profili ve teklif başvuru sistemi. Vergi levhası, imza sirküleri, ticaret sicil gazetesi doğrulamasıyla sadece nitelikli tedarikçiler sisteme dahil olur." },
    { icon: "fa-file-contract", title: "Belgeli Teklif Akışı", desc: "Şartname yükleme, teklif gelişi ve kayıt takibi süreçleri tamamen dijital. Her adım zaman damgalı, KVKK uyumlu ve geri izlenebilir." },
    { icon: "fa-chart-line", title: "Detaylı Analitik", desc: "Teklif karşılaştırma, maliyet analizi ve tedarikçi performans raporları. KVKK uyumlu veri saklama, denetlenebilir kayıt sistemi." }
  ],
  trustStandards: [
    { title: "TLS 1.2+", subtitle: "ŞİFRELİ İLETİŞİM", desc: "HTTPS/SSL şifreli veri aktarımı ile tüm platform iletişimleri uçtan uca korunur. Hassas ticari verileriniz en üst düzey güvenlik standartlarıyla iletilir." },
    { title: "KVKK", subtitle: "KİŞİSEL VERİ KORUMA", desc: "6698 sayılı Kişisel Verilerin Korunması Kanunu'na tam uyum. Veri işleme, saklama ve imha süreçleri yasal çerçevede yürütülür." },
    { title: "Kayıt İzi", subtitle: "İŞLEM GÜNLÜKLERİ", desc: "Her işlem zaman damgalı olarak kayıt altına alınır. Teklif geçmişi, onay süreçleri ve ödeme adımları denetlenebilir şekilde saklanır." },
    { title: "TR · EN", subtitle: "ÇOK DİL DESTEĞİ", desc: "Türkçe ana arayüz ile İngilizce dil desteği. Uluslararası tedarikçilerle çalışan firmalar için çoklu dil altyapısı." }
  ],
  problems: [
    { title: "Şartname ve teklif penceresi herkes için ayrı zeminde kalır.", desc: "Tedarikçilere ayrı formlar gönderilir, gelen teklifler e-posta ve telefon trafiğinde kaybolur. Standart bir karşılaştırma zemini oluşturulamaz." },
    { title: "Fiyat kıyaslaması manuel ve hataya açıktır.", desc: "Excel tabloları ve e-posta zincirleri üzerinden yapılan fiyat karşılaştırmaları zaman kaybettirir, hatalı karar riskini artırır." },
    { title: "Tedarikçi kalifikasyonu belgesizdir.", desc: "Referans kontrolü yapılmadan, firma doğrulaması olmadan tedarikçi seçilir. Bu durum teslimat kalitesi ve güvenilirlik sorunlarına yol açar." }
  ],
  faqs: [
    { q: "Tersine ihale (eksiltme) sistemi nasıl çalışır?", a: "Alıcı firma satın almak istediği ürünü/hizmeti şartnamesi ile ilan eder. İlana başvuran onaylı satıcılar, belirlenen süre boyunca birbirlerinin verdiği fiyatların altına inerek anlık teklif verirler. Süre sonunda en düşük fiyatı veren kazanır." },
    { q: "Firmaların doğrulanması nasıl sağlanıyor?", a: "Platforma üye olan her şirketin vergi kimlik numarası, imza sirküleri ve ticaret sicil gazetesi kayıtları yönetim panelimiz tarafından doğrulanır. Yalnızca onaylanmış B2B firmaları ihale açabilir veya teklif sunabilir." },
    { q: "Ödeme ve teslimat süreçleri güvenli mi?", a: "Evet. Alıcı ihale bedelini platformumuzun Güvenli Havuz (Escrow) hesabına yatırır. Tedarikçi teslimatı gerçekleştirip alıcı onayını aldığında, havuzdaki bakiye tedarikçi hesabına aktarılır. Bu sayede iki taraf da güvence altındadır." },
    { q: "Alıcı olarak komisyon ödemem gerekiyor mu?", a: "Hayır. gelanlasalim.com platformunda alıcılardan hiçbir komisyon veya üyelik ücreti alınmaz. Alıcı firmalar sınırsız ihale açabilir ve tedarikçi tekliflerini ücretsiz olarak inceleyebilir." },
    { q: "Hangi sektörlerde ihale açabilirim?", a: "Kırtasiye, peyzaj, inşaat, lojistik, tarım, hizmet, fason üretim ve proje fazlası stok eritme dahil birçok sektörde ihale açabilirsiniz. Platform, her türlü B2B ürün ve hizmet tedarikine açıktır." },
    { q: "gelanlasalim üzerinden satış yapmak güvenli mi?", a: "Evet. Tüm finansal işlemler Güvenli Havuz (Escrow) sistemi üzerinden gerçekleştirilir. Tedarikçi teslimatını yapmadan ödeme aktarılmaz, alıcı onay vermeden süreç tamamlanmaz." },
    { q: "İhaleyi açan firma, ihaleyi yayından kaldırabilir mi?", a: "Evet. İhale sahibi, teklif süresi dolmadan ihaleyi iptal edebilir veya kapsamını güncelleyebilir. Teklif verilmiş ihalelerde iptal durumunda tüm taraflar bilgilendirilir." }
  ],
  pricing: {
    badge: "Profesyonel plan lansman döneminde ücretsiz.",
    plans: [
      { name: "Temel", price: "5.000,00", period: "aylık", desc: "Küçük ölçekli alıcılar ve yeni başlayan firmalar için temel ihale erişimi.", features: ["5 tedarikçiye teklif isteği", "Standart destek"], cta: "Temel planı başlat", highlighted: false },
      { name: "Profesyonel", price: "Ücretsiz", period: "aylık", desc: "Orta ve büyük ölçekli firmalar için tam kapsamlı ihale ve tedarik yönetimi.", features: ["Ayda 50 ihale açma hakkı", "5 tedarikçiye paralel teklif isteme", "Öncelikli destek"], cta: "Ücretsiz başla", highlighted: true },
      { name: "Kurumsal", price: "15.000,00", period: "aylık", desc: "Holding ve çok şubeli yapılar için özelleştirilmiş kurumsal çözüm.", features: ["Sınırsız ihale", "Özel API entegrasyonu", "Kurumsal firma.co.tr bağlantısı"], cta: "Kurumsal teklif al", highlighted: false }
    ]
  },
  explorer: {
    title: "B2B İhale ve Tedarik Gezgini",
    subtitle: "Türkiye'nin en kapsamlı sektörel ihale arşivi ve tedarik dizini",
    dailyStats: [
      { label: "Bugün Yayınlananlar", count: "756 İhale" },
      { label: "Bugün Yapılacaklar", count: "98 İhale" },
      { label: "Bugün Sonuçlananlar", count: "33 İhale" }
    ],
    categories: [
      { name: "İnşaat - Altyapı - Yapım işi ve Yıkım İhaleleri", count: "7.208", slug: "insaat-altyapi" },
      { name: "Kanalizasyon - Boru - Su - Doğalgaz - Sıhhi Tesisat İhaleleri", count: "411", slug: "kanalizasyon" },
      { name: "Kent Mobilyaları - Prefabrik Yapılar - Doğramacılık İhaleleri", count: "807", slug: "kent-mobilyalari" },
      { name: "Mühendislik - Mimarlık - Danışmanlık İhaleleri", count: "199", slug: "muhendislik" },
      { name: "Madencilik - Sondaj - Doğal Kaynaklar İhaleleri", count: "78", slug: "madencilik" },
      { name: "Hırdavat - Nalburiye - Metal ve Plastik Ürünler İhaleleri", count: "608", slug: "hirdavat" },
      { name: "Enerji - Aydınlatma - Elektrik Tesisatı İhaleleri", count: "737", slug: "enerji" },
      { name: "Yangın Algılama - Söndürme - İhbar Sistemleri İhaleleri", count: "96", slug: "yangin" },
      { name: "Asansör - Yapı otomasyon - Mekanik Güvenlik İhaleleri", count: "79", slug: "asansor" },
      { name: "Klima - Soğutma - Isıtma - Havalandırma Tesisatı İhaleleri", count: "307", slug: "klima" },
      { name: "Endüstriyel Makine - Motor - Konveyör İhaleleri", count: "609", slug: "endustriyel-makine" },
      { name: "Savunma Sanayi, Silah - Denizcilik - Havacılık İhaleleri", count: "97", slug: "savunma-sanayi" },
      { name: "Taşıt - İş Makinesi - Yedek Partça İhaleleri", count: "301", slug: "tasit-is-makinesi" },
      { name: "Nakliye - Servis - Taşımacılık hizmetleri İhaleleri", count: "609", slug: "nakliye-tasimacilik" },
      { name: "Turizm - Organizasyon - Ödüllendirme Hizmetleri İhaleleri", count: "88", slug: "turizm" },
      { name: "Reklam - Tabela - Billboard - Tanıtım Materyalleri İhaleleri", count: "78", slug: "reklam" },
      { name: "Matbaa - Kırtasiye - Toner - Kartuş - Ambalaj İhaleleri", count: "508", slug: "matbaa-kirtasiye" },
      { name: "Ormancılık, Bahçıvanlık, Bitki, Kozalak - Peyzaj İhaleleri", count: "168", slug: "peyzaj-tarim" },
      { name: "Hayvancılık - Veterinerlik - Hayvan Yemi İhaleleri", count: "86", slug: "hayvancilik" },
      { name: "Sanat Eserleri - Müzik Aletleri - Heykel - Maket İhaleleri", count: "9", slug: "sanat" },
      { name: "Sağlık - Medikal - İlaç - Kozmetik İhaleleri", count: "2.120", slug: "saglik-medikal" },
      { name: "Tıbbi Cihaz - Laboratuvar - Hastane Ekipmanları İhaleleri", count: "1.737", slug: "tibbi-cihaz" },
      { name: "Akaryakıt - Gazyağı - Madeni Yağ İhaleleri", count: "578", slug: "akaryakit-yag" },
      { name: "Odun - Kömür - Katıyakıt İhaleleri", count: "50", slug: "katiyakit" },
      { name: "Gıda - Tarım Ürünleri - Yiyecek - İçecek İhaleleri", count: "2.088", slug: "gida-tarim" },
      { name: "Hazır Yemek - Lokantacılık İhaleleri", count: "608", slug: "hazir-yemek" },
      { name: "Elektronik - Bilgisayar - İletişim - Ölçü Aletleri İhaleleri", count: "882", slug: "elektronik-bilgisayar" },
      { name: "Yazılım - Bilişim - Bilgi Yönetimi Hizmetleri İhaleleri", count: "509", slug: "yazilim-bilisim" },
      { name: "Uydu Takip - Kamera - Scada - Haberleşme Sistemleri İhaleleri", count: "121", slug: "uydu-takip" },
      { name: "Temizlik - İlaçlama - Geri Dönüşüm İhaleleri", count: "787", slug: "temizlik-geri-donusum" },
      { name: "Kimyasal Maddeler - Dezenfektan - Gübre İhaleleri", count: "376", slug: "kimyasal-maddeler" },
      { name: "Tekstil - Giyim - Spor Ekipmanları İhaleleri", count: "771", slug: "tekstil-giyim" },
      { name: "İş Sağlığı - İş Güvenliği ve Ekipmanları İhaleleri", count: "151", slug: "is-sagligi" },
      { name: "Mobilya - Beyaz Eşya - Mutfak - Züccaciye İhaleleri", count: "308", slug: "mobilya-mutfak" },
      { name: "Özel Güvenlik - Koruma - Bekçilik İhaleleri", count: "78", slug: "ozel-guvenlik" },
      { name: "Eğitim - Araştırma - Anket - Tercümanlık İhaleleri", count: "78", slug: "egitim-arastirma" },
      { name: "İşletmecilik - İşçilik - Social Hizmetler İhaleleri", count: "168", slug: "isletmecilik-iscilik" },
      { name: "Sigortacılık - Mali ve Hukuki Hizmetler İhaleleri", count: "90", slug: "sigortacilik" },
      { name: "Menkul Mallar - Araç ve Hurda satışı İhaleleri", count: "87", slug: "menkul-mallar" },
      { name: "Gayrimenkul, Arsa Satışı, İşyeri ve Kantin İhaleleri", count: "671", slug: "gayrimenkul" }
    ],
    cities: ["Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"],
    sectors: [
      "Tarım, Çiftçilik, Balıkçılık, Ormancılık Ve İlgili Ürünler",
      "Madencilik, Temel Metaller Ve İlgili Ürünler",
      "Tarım Makineleri",
      "Deri Ve Tekstil Kumaşlar, Plastik Ve Kauçuk Malzemeler",
      "Kimyasal Ürünler",
      "Elektrikli Makine, Cihaz, Ekipman Ve Sarf Malzemeleri; Aydınlatma",
      "Tıbbi Cihazlar, İlaç Ve Kişisel Bakım Ürünleri",
      "Güvenlik, Yangınla Mücadele, Polis Ve Savunma Teçhizatı",
      "Laboratuvar, Optik Ve Hassas Ekipmanları (Gözlük Hariç)",
      "Toplanmış Ve Arıtılmış Su",
      "Madencilik, Taşocakçılığı, İnşaat Ekipmanları İçin Kullanılan Makineler",
      "İnşaat İşleri",
      "Onarım Ve Bakım Hizmetleri",
      "Otel, Restoran Ve Perakende Ticaret Hizmetleri",
      "Destek Ve Yardımcı Ulaştırmacılık Hizmetleri; Seyahat Acentası Hizmetleri",
      "Kamu Yararına Hizmet Ve Tesisler",
      "Emlakçılık Hizmetleri",
      "It Hizmetleri: Danışmanlık, Yazılım Geliştirme, İnternet Ve Destek",
      "Yönetim, Savunma Ve Sosyal Güvenlik Hizmetleri",
      "Tarım, Ormancılık, Bahçecilik, Su Ürünleri Yetiştiriciliği Ve Arıcılık Hizmetleri",
      "Eğitim Ve Öğrenim Hizmetleri",
      "Kanalizasyon, Çöp Temizlik Ve Çevre Hizmetleri",
      "Diğer Sosyal, Toplumsal Ve Kişisel Hizmetler",
      "Petrol Ürünleri, Yakıt, Elektrik Ve Diğer Enerji Kaynakları",
      "Gıda, İçecekler, Tütün Ve İlgili Ürünler",
      "Giyim, Ayakkabı, Bavul Eşyaları Ve Aksesuarlar",
      "Basılı Malzeme Ve İlgili Ürünler",
      "Mobilya Ve Yazılım Paketleri Hariç, Ofis Ve Bilgi İşlem Makineleri, Ekipman Ve Malzemeleri",
      "Radyo, Televizyon, İletişim, Telekomünikasyon Ve İlgili Ekipmanlar",
      "Nakliye Araçları Ve Nakliye İçin Yardımcı Ürünler",
      "Müzik Aletleri, Spor Ürünleri, Oyunlar, Oyuncaklar, El Sanatları, Sanat",
      "Mobilya (Ofis Mobilyaları Dahil), Mefruşat, Ev Aletleri (Aydınlatma Hariç) Ve Temizlik Ürünleri",
      "Sanayi Tipi Makineler",
      "İnşaat Yapı Ve Malzemeleri; İnşaatlarda Kullanılan Yardımcı/Destek Ürünler",
      "Yazılım Paketi Ve Bilgi Sistemleri",
      "Kurulum Hizmetleri (Yazılım Hariç)",
      "Nakliye Hizmetleri (Atık Taşımacılığı Hariç)",
      "Posta Ve Telekomünikasyon Hizmetleri",
      "Finans Ve Sigorta Hizmetleri",
      "Mimarlık, İnşaat, Mühendislik Ve Teftiş Hizmetleri",
      "Araştırma Ve Geliştirme Hizmetleri Ve İlgili Danışmanlık Hizmetleri",
      "Petrol Ve Gaz Endüstrisi İle İlgili Hizmetler",
      "Ticari Hizmetler: Hukuk, Pazarlama, Danışmanlık, İşe Alma Ve İstihdam, Baskı Ve Güvenlik",
      "Sağlık Ve Sosyal Çalışma Hizmetleri",
      "Rekreasyon, Kültür Ve Spor Amaçlı Hizmetler"
    ],
    types: ["Yapım İşi", "Mal Alımı", "Hizmet Alımı", "Kiralama", "Satış"]
  },
  footer: {
    email: "info@gelanlasalim.com",
    phone: "+90 (555) 555 55 55",
    address: "İstanbul, Türkiye"
  }
};

// ----------------------------------------------------------
// GET /api/cms/landing — Landing page içeriğini getir (Public)
// ----------------------------------------------------------
router.get('/landing', async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT content_json FROM site_content WHERE section_key = 'landing' LIMIT 1"
    );

    if (result.rows && result.rows.length > 0) {
      return res.json(result.rows[0].content_json);
    }

    // Veritabanında yoksa varsayılan içerik dön
    res.json(DEFAULT_CONTENT);
  } catch (err) {
    // DB erişim hatası durumunda da varsayılan dön
    console.warn('CMS: DB erişim hatası, varsayılan içerik döndürülüyor:', err.message);
    res.json(DEFAULT_CONTENT);
  }
});

// ----------------------------------------------------------
// PUT /api/cms/landing — Landing page içeriğini güncelle (Admin)
// ----------------------------------------------------------
router.put('/landing', authenticateToken, requireRole(['admin']), async (req, res, next) => {
  try {
    const content = req.body;

    if (!content || typeof content !== 'object') {
      return res.status(400).json({ error: 'Geçerli bir JSON içerik gönderilmelidir.' });
    }

    // Upsert: varsa güncelle, yoksa ekle
    const result = await db.query(
      `INSERT INTO site_content (section_key, content_json, updated_at)
       VALUES ('landing', $1, NOW())
       ON CONFLICT (section_key) 
       DO UPDATE SET content_json = $1, updated_at = NOW()
       RETURNING id`,
      [JSON.stringify(content)]
    );

    res.json({
      success: true,
      message: 'Landing page içeriği başarıyla güncellendi.',
      id: result.rows[0]?.id
    });
  } catch (err) {
    next(err);
  }
});

export default router;
