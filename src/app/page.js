"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ============================================================
   gelanlasalim.com — Premium B2B Ana Sayfa
   Navy-Teal | CMS API Entegrasyonu | 12 Bölüm
   ============================================================ */

// Varsayılan içerik (API yoksa fallback)
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
    { title: "TLS 1.2+", subtitle: "ŞİFRELİ İLETİŞİM", desc: "HTTPS/SSL şifreli veri aktarımı ile tüm platform iletişimleri uçtan uca korunur." },
    { title: "KVKK", subtitle: "KİŞİSEL VERİ KORUMA", desc: "6698 sayılı Kişisel Verilerin Korunması Kanunu'na tam uyum." },
    { title: "Kayıt İzi", subtitle: "İŞLEM GÜNLÜKLERİ", desc: "Her işlem zaman damgalı olarak kayıt altına alınır." },
    { title: "TR · EN", subtitle: "ÇOK DİL DESTEĞİ", desc: "Türkçe ana arayüz ile İngilizce dil desteği." }
  ],
  problems: [
    { title: "Şartname ve teklif penceresi herkes için ayrı zeminde kalır.", desc: "Tedarikçilere ayrı formlar gönderilir, gelen teklifler e-posta ve telefon trafiğinde kaybolur. Standart bir karşılaştırma zemini oluşturulamaz." },
    { title: "Fiyat kıyaslaması manuel ve hataya açıktır.", desc: "Excel tabloları ve e-posta zincirleri üzerinden yapılan fiyat karşılaştırmaları zaman kaybettirir, hatalı karar riskini artırır." },
    { title: "Tedarikçi kalifikasyonu belgesizdir.", desc: "Referans kontrolü yapılmadan, firma doğrulaması olmadan tedarikçi seçilir. Bu durum teslimat kalitesi ve güvenilirlik sorunlarına yol açar." }
  ],
  faqs: [
    { q: "Tersine ihale (eksiltme) sistemi nasıl çalışır?", a: "Alıcı firma satın almak istediği ürünü/hizmeti şartnamesi ile ilan eder. İlana başvuran onaylı satıcılar, belirlenen süre boyunca birbirlerinin verdiği fiyatların altına inerek anlık teklif verirler. Süre sonunda en düşük fiyatı veren kazanır." },
    { q: "Firmaların doğrulanması nasıl sağlanıyor?", a: "Platforma üye olan her şirketin vergi kimlik numarası, imza sirküleri ve ticaret sicil gazetesi kayıtları yönetim panelimiz tarafından doğrulanır." },
    { q: "Ödeme ve teslimat süreçleri güvenli mi?", a: "Evet. Alıcı ihale bedelini platformumuzun Güvenli Havuz (Escrow) hesabına yatırır. Tedarikçi teslimatı gerçekleştirip alıcı onayını aldığında, havuzdaki bakiye tedarikçi hesabına aktarılır." },
    { q: "Alıcı olarak komisyon ödemem gerekiyor mu?", a: "Hayır. gelanlasalim.com platformunda alıcılardan hiçbir komisyon veya üyelik ücreti alınmaz." },
    { q: "Hangi sektörlerde ihale açabilirim?", a: "Kırtasiye, peyzaj, inşaat, lojistik, tarım, hizmet, fason üretim ve proje fazlası stok eritme dahil birçok sektörde ihale açabilirsiniz." },
    { q: "gelanlasalim üzerinden satış yapmak güvenli mi?", a: "Evet. Tüm finansal işlemler Güvenli Havuz (Escrow) sistemi üzerinden gerçekleştirilir." },
    { q: "İhaleyi açan firma, ihaleyi yayından kaldırabilir mi?", a: "Evet. İhale sahibi, teklif süresi dolmadan ihaleyi iptal edebilir veya kapsamını güncelleyebilir." }
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
      { name: "İşletmecilik - İşçilik - Sosyal Hizmetler İhaleleri", count: "168", slug: "isletmecilik-iscilik" },
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

export default function LandingPage() {
  // ---------- STATE ----------
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [activeFaq, setActiveFaq] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [activeProcessTab, setActiveProcessTab] = useState("buyer");
  const [scrolled, setScrolled] = useState(false);
  const [regTab, setRegTab] = useState("buyer");
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Merhaba! Ben gelanlasalim.com Yapay Zeka Destek Asistanıyım. B2B Tersine İhale Arenası, Güvenli Havuz (Escrow) ödemeleri, üyelik veya pazarlık sistemi hakkında merak ettiğiniz her şeyi bana sorabilirsiniz." }
  ]);
  const messagesEndRef = useRef(null);

  // ---------- EXPLORER STATES ----------
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [explorerSearch, setExplorerSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedTenderId, setExpandedTenderId] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState(null);

  const handleExplorerSearch = (e) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    setExpandedTenderId(null);
    setActiveDetailTab(null);
    
    fetch('/api/tenders?status=all')
      .then(res => res.ok ? res.json() : { tenders: [] })
      .then(data => {
        let tenders = data.tenders || [];
        
        if (selectedCat !== "all") {
          tenders = tenders.filter(t => t.category_name?.toLowerCase().includes(selectedCat.toLowerCase()) || String(t.category_id) === selectedCat);
        }
        if (selectedSector !== "all") {
          const sectorQuery = selectedSector.toLowerCase();
          tenders = tenders.filter(t => {
            const catName = t.category_name?.toLowerCase() || "";
            const title = t.title?.toLowerCase() || "";
            const desc = t.description?.toLowerCase() || "";
            return catName.includes(sectorQuery) || title.includes(sectorQuery) || desc.includes(sectorQuery) || sectorQuery.includes(catName);
          });
        }
        if (selectedCity !== "all") {
          tenders = tenders.filter(t => t.city?.toLowerCase() === selectedCity.toLowerCase());
        }
        if (selectedType !== "all") {
          tenders = tenders.filter(t => t.type?.toLowerCase() === selectedType.toLowerCase());
        }
        if (explorerSearch.trim()) {
          const q = explorerSearch.toLowerCase();
          tenders = tenders.filter(t => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q));
        }

        let mapped = tenders.map(t => ({
          id: t.id,
          title: t.title,
          city: t.city,
          type: t.type || "Alış",
          date: new Date(t.created_at).toLocaleDateString('tr-TR') + " yayınlandı",
          status: t.status === "open" ? "Açık" : t.status === "awarded" ? "Onaylandı" : "Tamamlandı",
          value: t.target_price ? `${parseFloat(t.target_price).toLocaleString('tr-TR')} ₺` : "Belirtilmedi",
          source: "GEL ANLAŞALIM",
          sector: t.category_name || "Genel B2B Tedarik",
          material_list: t.material_list,
          admin_spec: t.admin_spec,
          tech_spec: t.tech_spec,
          similar_history: t.similar_history,
          description: t.description,
          idare_adi: "GEL ANLAŞALIM Üyesi"
        }));

        if (mapped.length === 0) {
          const cats = content.explorer?.categories || DEFAULT_CONTENT.explorer.categories;
          const catObj = cats.find(c => c.slug === selectedCat) || { name: "Genel B2B Tedarik ve Hizmet Alımı" };
          const sector = selectedSector === "all" ? "Tüm Sektörler" : selectedSector;
          const city = selectedCity === "all" ? "Tüm Türkiye" : selectedCity;
          const type = selectedType === "all" ? "İhale Arşivi" : selectedType;

          mapped = [
            { id: "res-1", title: `${catObj.name} İhalesi`, city: city, type: type, date: "Bugün yayınlandı", status: "Açık", value: "245.000 ₺", source: "Ekap İhale Arşivi", sector: sector },
            { id: "res-2", title: `${catObj.name} Alım ve Dağıtım Talebi`, city: city, type: type, date: "Dün yayınlandı", status: "Açık", value: "1.200.000 ₺", source: "Gazete İhale Arşivi", sector: sector },
            { id: "res-3", title: `${catObj.name} Altyapı Bakım ve Onarım İşi`, city: city, type: type, date: "3 gün önce sonuçlandı", status: "Tamamlandı", value: "540.000 ₺", source: "İstihbarat İhale Arşivi", sector: sector }
          ];
        }

        setSearchResults(mapped);
        setIsSearching(false);
      })
      .catch(() => {
        const cats = content.explorer?.categories || DEFAULT_CONTENT.explorer.categories;
        const catObj = cats.find(c => c.slug === selectedCat) || { name: "Genel B2B Tedarik ve Hizmet Alımı" };
        const sector = selectedSector === "all" ? "Tüm Sektörler" : selectedSector;
        const city = selectedCity === "all" ? "Tüm Türkiye" : selectedCity;
        const type = selectedType === "all" ? "İhale Arşivi" : selectedType;

        const fallbackList = [
          { id: "res-1", title: `${catObj.name} İhalesi`, city: city, type: type, date: "Bugün yayınlandı", status: "Açık", value: "245.000 ₺", source: "Ekap İhale Arşivi", sector: sector },
          { id: "res-2", title: `${catObj.name} Alım ve Dağıtım Talebi`, city: city, type: type, date: "Dün yayınlandı", status: "Açık", value: "1.200.000 ₺", source: "Gazete İhale Arşivi", sector: sector },
          { id: "res-3", title: `${catObj.name} Altyapı Bakım ve Onarım İşi`, city: city, type: type, date: "3 gün önce sonuçlandı", status: "Tamamlandı", value: "540.000 ₺", source: "İstihbarat İhale Arşivi", sector: sector }
        ];
        setSearchResults(fallbackList);
        setIsSearching(false);
      });
  };

  // ---------- CMS FETCH ----------
  useEffect(() => {
    fetch('/api/cms/landing')
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setContent(prev => ({ ...prev, ...data })); })
      .catch(() => {});
  }, []);

  // Scroll header
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------- SIMULATED BIDS ----------
  const [simulatedBids, setSimulatedBids] = useState([
    { id: 1, rank: 1, name: "Kırtasiye Dünyası Ltd. Şti.", price: 62000 },
    { id: 2, rank: 2, name: "Beta Malzeme Ticaret", price: 64000 },
    { id: 3, rank: 3, name: "Kaya Peyzaj ve Dağıtım", price: 68000 }
  ]);
  const [countdown, setCountdown] = useState({ h: 2, m: 14, s: 37 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 2; m = 14; s = 37; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedBids(prev => {
        const next = [...prev];
        const ti = Math.floor(Math.random() * next.length);
        const reduction = Math.floor(Math.random() * 800) + 200;
        let newPrice = next[ti].price - reduction;
        if (newPrice < 55000) newPrice = 64500;
        next[ti] = { ...next[ti], price: newPrice, justUpdated: true };
        const others = next.map((item, i) => i === ti ? item : { ...item, justUpdated: false });
        return [...others].sort((a, b) => a.price - b.price).map((item, i) => ({ ...item, rank: i + 1 }));
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // ---------- CHATBOT ----------
  const handleSendChat = (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;
    setMessages(prev => [...prev, { sender: "user", text: query }]);
    setChatInput("");
    setTimeout(() => {
      let r = "";
      const n = query.toLowerCase();
      if (n.includes("havuz") || n.includes("escrow") || n.includes("güvenli") || n.includes("ödeme")) r = "Güvenli Havuz (Escrow) altyapımız, alıcının ihale bedelini platform korumalı hesabına yatırmasını sağlar. Tedarikçi teslimatı yaptıktan ve alıcı onayını verdikten sonra ödeme otomatik olarak tedarikçiye aktarılır.";
      else if (n.includes("üye") || n.includes("kayıt") || n.includes("giriş") || n.includes("hesap")) r = "Platformumuz yalnızca onaylı B2B şirketlerine açıktır. 'Üye Girişi' panelinden e-posta ve şifrenizle giriş yapabilirsiniz. Demo hesaplarla hızlıca test edebilirsiniz.";
      else if (n.includes("ihale") || n.includes("ilan") || n.includes("nasıl") || n.includes("talep")) r = "İhale açmak çok kolaydır! Alıcı olarak giriş yaptıktan sonra 'İLAN VER' butonuyla ürün cinsi, miktarı, teslimat ili/ilçesi ve şartname dosyalarınızı girerek ihaleyi yayına alın.";
      else if (n.includes("teklif") || n.includes("fiyat") || n.includes("pazarlık")) r = "Satıcı olarak sisteme giriş yaptıktan sonra aktif ihalelerden birine tıklayıp anlık fiyat kırarak teklifinizi sunabilirsiniz.";
      else r = "Size şu konularda yardımcı olabilirim: 1- Güvenli Havuz Sistemi, 2- Üye Girişi, 3- İhale İlanı Oluşturma, 4- Teklif Verme. Lütfen bu başlıklardan birini sorunuz.";
      setMessages(prev => [...prev, { sender: "bot", text: r }]);
    }, 800);
  };

  // ---------- DATA ----------
  const buyerSteps = [
    { icon: "fa-file-signature", title: "Talep Oluştur", desc: "Ürün cinsi, miktar, teslimat il/ilçe ve şartname dosyalarınızı girerek ihale ilanınızı oluşturun." },
    { icon: "fa-gavel", title: "Canlı Rekabeti İzle", desc: "Doğrulanmış tedarikçilerin birbirlerinin fiyatlarını kırdığı canlı tersine ihale sürecini takip edin." },
    { icon: "fa-handshake", title: "Karar Ver", desc: "En uygun teklifi KABUL edin, pazarlık başlatın veya reddedin. Tüm kontrol sizde." },
    { icon: "fa-truck-fast", title: "Güvenle Teslim Al", desc: "Güvenli Havuz ödemesini yapın, teslimatı onaylayın. Ödeme otomatik tedarikçiye aktarılır." }
  ];
  const supplierSteps = [
    { icon: "fa-building", title: "Firma Kaydı", desc: "Vergi kimlik numarası ve ticaret sicil bilgilerinizle B2B onaylı tedarikçi hesabınızı açın." },
    { icon: "fa-magnifying-glass", title: "İhaleleri Keşfet", desc: "Arenada açık ihaleleri filtreleyip sektörünüze uygun talepleri anında görüntüleyin." },
    { icon: "fa-arrow-trend-down", title: "Fiyat Kır", desc: "Anlık teklif vererek rakiplerinizin altına inin. Gerçek zamanlı sıralama ile konumunuzu izleyin." },
    { icon: "fa-circle-check", title: "Sipariş Kazan", desc: "Alıcı teklifinizi kabul ettiğinde Güvenli Havuz üzerinden ödemenizi garantileyin." }
  ];
  const marketSegments = [
    { icon: "fa-boxes-stacked", title: "Ürün & Hizmet", subtitle: "Standart Tedarik", desc: "Kırtasiye, ofis malzemeleri, temizlik hizmeti, güvenlik, peyzaj ve daha birçok kategoride kurumsal alım ihaleleri.", categories: ["Kırtasiye", "Peyzaj", "Temizlik", "Güvenlik", "Lojistik"] },
    { icon: "fa-industry", title: "Üretim & Fason", subtitle: "Fason ve Seri İmalat", desc: "Hazır beton, çimento, tarımsal hammadde, tekstil fason üretim ve endüstriyel imalat talepleri.", categories: ["İnşaat", "Tarım", "Tekstil", "Gıda", "Kimya"] },
    { icon: "fa-warehouse", title: "Proje Fazlası & Stok", subtitle: "Stok Eritme ve İkinci El", desc: "Şantiye artığı malzemeler, depo fazlası ürünler, ikinci el ekipman ve stok eritme ihaleleri.", categories: ["Stok Fazlası", "İkinci El", "Hurda", "Artık Malzeme"] }
  ];

  const pad = (n) => String(n).padStart(2, '0');
  const enterPortal = () => { window.location.href = '/portal.html'; };

  // ---------- RENDER ----------
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-700 overflow-x-hidden">

      {/* ===================== HEADER ===================== */}
      <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm shadow-slate-100/10' : 'bg-transparent border-b border-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-heading font-black text-white text-lg shadow-accentGlow">GA</div>
            <span className="font-heading font-bold text-xl tracking-tight text-slate-800">gelanla<span className="text-accent">salim</span></span>
          </div>
          <nav className="hidden lg:flex items-center gap-1 nav-capsule px-2 py-1.5 bg-slate-100/60 border border-slate-200/50">
            <a href="#nasil-calisir" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-accent hover:bg-white rounded-full transition-all">Nasıl Çalışır</a>
            <a href="#ozellikler" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-accent hover:bg-white rounded-full transition-all">Özellikler</a>
            <a href="#pazar-yeri" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-accent hover:bg-white rounded-full transition-all">Pazar Yeri</a>
            <a href="#faq" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-accent hover:bg-white rounded-full transition-all">SSS</a>
          </nav>
          <div className="flex items-center gap-3">
            <button className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" onClick={() => window.location.href = '/portal.html#/uyelik'}>
              <i className="fa-solid fa-globe text-accent/60 text-xs"></i> TR
            </button>
            <button className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2" onClick={() => window.location.href = '/portal.html#/uyelik'}>Giriş Yap</button>
            <button onClick={enterPortal} className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accentLight hover:scale-[1.02] active:scale-95 transition-all shadow-accentGlow">Kayıt Ol</button>
          </div>
        </div>
      </header>

      {/* ===================== HERO ===================== */}
      <section className="relative pt-16 pb-24 md:pt-24 md:pb-32 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="self-start trust-pill">
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot"></span>
            {content.hero.badge}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="font-heading font-black text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-slate-900">
            {content.hero.title.includes('Canlı Eksiltme') ? (
              <>Tedarik Maliyetlerinizi{' '}<span className="text-accent relative">Canlı Eksiltme<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 8" fill="none"><path d="M2 6C50 2 150 2 198 6" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" opacity="0.5"/></svg></span>{' '}ile Düşürün</>
            ) : content.hero.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-base md:text-lg text-slate-600 max-w-xl leading-relaxed">
            {content.hero.description}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap gap-4 mt-2">
            <button onClick={() => window.location.href = '/portal.html#/uyelik'} className="px-7 py-3.5 rounded-xl bg-accent text-white font-bold text-base hover:bg-accentLight hover:scale-[1.02] active:scale-95 transition-all shadow-accentGlow flex items-center gap-2">
              <i className="fa-solid fa-rocket"></i> {content.hero.cta1}
            </button>
            <button onClick={() => setShowVideoModal(true)} className="px-7 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-base hover:bg-slate-50 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-sm">
              <i className="fa-solid fa-circle-play text-accent"></i> {content.hero.cta2}
            </button>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-wrap gap-x-6 gap-y-3 mt-4 pt-6 border-t border-slate-200 text-xs text-slate-500">
            {[{ icon: "fa-shield-halved", text: "KVKK Uyumlu" }, { icon: "fa-clock", text: "Zaman Damgalı İşlemler" }, { icon: "fa-lock", text: "256-bit Şifreli Aktarım" }, { icon: "fa-percent", text: "Sıfır Alıcı Komisyonu" }].map((item, i) => (
              <div key={i} className="flex items-center gap-2"><i className={`fa-solid ${item.icon} text-accent`}></i><span>{item.text}</span></div>
            ))}
          </motion.div>
        </div>

        {/* Live Auction Widget */}
        <div className="lg:col-span-5 relative w-full flex flex-col items-center">
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="w-full max-w-[440px] rounded-2xl bg-white border border-slate-200/80 p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"></div>
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-extrabold text-accent"><span className="w-2 h-2 rounded-full bg-accent pulse-dot"></span>CANLI İHALE</div>
              <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">#GLS-4812</span>
            </div>
            <div className="text-left mb-5">
              <h4 className="text-sm font-bold text-slate-800 mb-1">500 Paket A4 Fotokopi Kağıdı Alımı</h4>
              <p className="text-xs text-slate-400">Peyzaj & Kırtasiye Hizmetleri A.Ş. • İstanbul</p>
            </div>
            <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-slate-500"><i className="fa-regular fa-clock text-accent"></i><span>Kalan Süre:</span></div>
              <div className="flex items-center gap-1 ml-auto">
                {[pad(countdown.h), pad(countdown.m), pad(countdown.s)].map((val, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center font-heading font-black text-sm text-accent animate-countdown-pulse">{val}</span>
                    {i < 2 && <span className="text-accent/40 font-bold">:</span>}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <AnimatePresence mode="popLayout">
                {simulatedBids.map((bid) => (
                  <motion.div key={bid.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, borderColor: bid.justUpdated ? "rgba(13,148,136,0.4)" : "rgba(0,0,0,0.05)" }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="flex items-center justify-between p-3 rounded-lg border bg-white border-slate-100 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${bid.rank === 1 ? 'bg-accent/20 text-accent' : bid.rank === 2 ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400'}`}>{bid.rank}</span>
                      <div><span className="font-semibold text-slate-700 block">{bid.name}</span>{bid.rank === 1 && <span className="text-[9px] text-accent font-medium">En İyi Teklif</span>}</div>
                    </div>
                    <span className="font-heading font-extrabold text-slate-800 font-mono">{bid.price.toLocaleString('tr-TR')} ₺</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
              <div className="text-[11px] text-slate-500">Açılış: <strong className="text-slate-700 font-mono">75.000 ₺</strong></div>
              <div className="text-[11px] text-slate-500">Tasarruf: <strong className="text-accent font-mono">~%17</strong></div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium">
              {["Talep", "Teklif", "Karar", "Teslimat"].map((step, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${i < 2 ? 'bg-accent text-white' : 'bg-slate-100 text-slate-400'}`}>{i < 2 ? <i className="fa-solid fa-check"></i> : i + 1}</span>
                  <span className={i < 2 ? 'text-accent' : 'text-slate-400'}>{step}</span>
                  {i < 3 && <span className="text-slate-200 ml-1.5">—</span>}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===================== TRUST IDENTITY STRIP ===================== */}
      <section className="border-y border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 md:gap-8 text-[11px] text-slate-500">
            <div className="flex items-center gap-2"><i className="fa-solid fa-building-columns text-accent/60"></i><span>MERSİS No: <strong className="text-slate-700">{content.trustStrip.mersis}</strong></span></div>
            <div className="flex items-center gap-2"><i className="fa-solid fa-envelope text-accent/60"></i><span>KEP: <strong className="text-slate-700">{content.trustStrip.kep}</strong></span></div>
          </div>
          <a href={content.trustStrip.etbisLink} className="flex items-center gap-2 text-[11px] font-semibold text-accent hover:text-accentLight transition-colors">
            <i className="fa-solid fa-certificate"></i>ETBİS Kaydını Doğrula<i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
        </div>
      </section>

      {/* ===================== B2B EXPLORER SECTION ===================== */}
      <section className="py-24 max-w-7xl mx-auto px-6 border-b border-slate-200" id="ihale-gezgini">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-accent uppercase tracking-widest">ARŞİV VE ARAMA MOTORU</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-slate-900 mt-3 mb-4">
            {content.explorer?.title || DEFAULT_CONTENT.explorer.title}
          </h2>
          <p className="text-sm text-slate-600">
            {content.explorer?.subtitle || DEFAULT_CONTENT.explorer.subtitle}
          </p>
        </div>

        {/* Live Stat Bar (Bugün Yayınlananlar, vb.) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {(content.explorer?.dailyStats || DEFAULT_CONTENT.explorer.dailyStats).map((stat, idx) => (
            <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-accent pulse-dot"></span>
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block font-medium uppercase">{stat.label}</span>
                <span className="text-sm font-bold text-slate-800">{stat.count}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Filter Form */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm mb-8">
          <form onSubmit={handleExplorerSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Kategori</label>
              <select 
                value={selectedCat} 
                onChange={(e) => setSelectedCat(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-accent"
              >
                <option value="all">Tüm Kategoriler</option>
                {(content.explorer?.categories || DEFAULT_CONTENT.explorer.categories).map((cat, i) => (
                  <option key={i} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Sektör</label>
              <select 
                value={selectedSector} 
                onChange={(e) => setSelectedSector(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-accent"
              >
                <option value="all">Tüm Sektörler</option>
                {(content.explorer?.sectors || DEFAULT_CONTENT.explorer.sectors).map((sect, i) => (
                  <option key={i} value={sect}>{sect}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Şehir</label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-accent"
              >
                <option value="all">Tüm Şehirler</option>
                {(content.explorer?.cities || DEFAULT_CONTENT.explorer.cities).map((city, i) => (
                  <option key={i} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase">İhale Türü</label>
              <select 
                value={selectedType} 
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-accent"
              >
                <option value="all">Tüm Türler</option>
                {(content.explorer?.types || DEFAULT_CONTENT.explorer.types).map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase">İçerikte Ara</label>
              <input 
                type="text" 
                placeholder="Kelime yazın..." 
                value={explorerSearch}
                onChange={(e) => setExplorerSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full py-2.5 rounded-xl bg-accent text-white font-bold text-xs hover:bg-accentLight hover:scale-[1.01] active:scale-95 transition-all shadow-accentGlow flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-magnifying-glass"></i> İhaleleri Ara
              </button>
            </div>
          </form>
        </div>

        {/* Dynamic Search Results */}
        <AnimatePresence>
          {hasSearched && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 10 }}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md mb-8"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-accent">ARAMA SONUÇLARI</span>
                <button onClick={() => setHasSearched(false)} className="text-xs text-slate-400 hover:text-slate-600">Kapat</button>
              </div>
              {isSearching ? (
                <div className="py-8 flex flex-col items-center justify-center gap-3">
                  <i className="fa-solid fa-circle-notch fa-spin text-accent text-2xl"></i>
                  <span className="text-xs text-slate-500">İhale arşivi taranıyor...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {searchResults.map((res) => (
                    <div key={res.id} className="p-4 rounded-xl bg-slate-50/50 border border-slate-200/60 flex flex-col text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] bg-accent/10 border border-accent/20 text-accent font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-2 inline-block">
                            {res.source}
                          </span>
                          <h4 className="text-sm font-bold text-slate-800 mb-1">{res.title}</h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span><i className="fa-solid fa-location-dot text-accent/60 mr-1"></i>{res.city}</span>
                            <span><i className="fa-solid fa-list text-accent/60 mr-1"></i>{res.type}</span>
                            <span><i className="fa-solid fa-clock text-accent/60 mr-1"></i>{res.date}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start sm:items-end justify-center">
                          <span className="text-[10px] text-slate-400">Yaklaşık Maliyet</span>
                          <strong className="text-sm font-heading font-extrabold text-slate-800 font-mono">{res.value}</strong>
                          <button 
                            type="button"
                            onClick={() => setExpandedTenderId(expandedTenderId === res.id ? null : res.id)} 
                            className="mt-2 text-xs font-bold text-accent hover:text-accentLight flex items-center gap-1"
                          >
                            {expandedTenderId === res.id ? "Detayları Gizle" : "Detayları Gör"}{" "}
                            <i className={`fa-solid ${expandedTenderId === res.id ? "fa-chevron-up text-[8px]" : "fa-arrow-right text-[9px]"}`}></i>
                          </button>
                        </div>
                      </div>

                      {expandedTenderId === res.id && (
                        <div className="w-full mt-4 p-4 rounded-lg bg-[#f4f9fc] text-[#334155] border border-[#7dc6e6] text-[12px] font-sans flex flex-col gap-3 shadow-md">
                          {/* Header */}
                          <div className="flex items-center gap-2 pb-2 border-b border-[#d2e7f3]">
                            <span className="bg-[#f0f9ff] text-[#0284c7] border border-[#7dc6e6] text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                              # 1
                            </span>
                            <span className="font-bold text-[#1e293b] text-xs">
                              {res.id === "res-1" ? "2026/184920" : res.id === "res-2" ? "2026/492019" : "2026/902811"} - {res.title}
                            </span>
                          </div>

                          {/* Row 1: Nitellik, Süre, Yaklaşık Maliyet */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                            <div className="md:col-span-6 flex items-start gap-1">
                              <span className="text-[#0284c7] font-bold mr-1">→</span>
                              <div>
                                <span className="font-bold text-[#475569]">İşin niteliği:</span>{" "}
                                {res.id === "res-1" 
                                  ? `${res.sector || "Genel B2B Tedarik"} kapsamında, ${res.city} bölge sınırlarında teknik şartnameye ve malzeme listesine uygun olarak tedarik, nakliye ve saha montaj yapım işi.`
                                  : res.id === "res-2"
                                  ? `${res.sector || "Genel B2B Tedarik"} alımı, paketlenmesi ve dağıtımı işi.`
                                  : `${res.sector || "Genel B2B Tedarik"} altyapı bakım, onarım ve destek hizmet alımı.`
                                }
                              </div>
                            </div>
                            <div className="md:col-span-3 flex items-center gap-1.5">
                              <span className="text-[#0284c7]"><i className="fa-solid fa-calendar-days text-[11px]"></i></span>
                              <div>
                                <span className="font-bold text-[#475569]">İşin süresi:</span>{" "}
                                {res.id === "res-1" ? "2 Ay 21 Gün" : res.id === "res-2" ? "1 Yıl" : "6 Ay"}
                              </div>
                            </div>
                            <div className="md:col-span-3 flex items-center gap-1.5">
                              <span className="text-[#0284c7]"><i className="fa-solid fa-arrows-up-down text-[11px]"></i></span>
                              <div>
                                <span className="font-bold text-[#475569]">Yaklaşık maliyet:</span>{" "}
                                {res.id === "res-1" ? "10.785.492 TL'ye kadar" : res.id === "res-2" ? "4.800.000 TL'ye kadar" : "890.000 TL'ye kadar"}
                              </div>
                            </div>
                          </div>

                          {/* Row 2: İdare Adı & Konum */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start border-t border-dashed border-[#e2eff7] pt-2">
                            <div className="md:col-span-8 flex items-start gap-1">
                              <span className="text-[#0284c7]"><i className="fa-solid fa-building text-[11px]"></i></span>
                              <div>
                                <span className="font-bold text-[#475569]">İdare adı:</span>{" "}
                                {res.id === "res-1" 
                                  ? `T.C. ${res.city} Yatırım İzleme ve Koordinasyon Başkanlığı (YİKOB)` 
                                  : res.id === "res-2"
                                  ? `T.C. ${res.city} İl Sağlık Müdürlüğü`
                                  : `T.C. ${res.city} Gençlik ve Spor İl Müdürlüğü`
                                }
                              </div>
                            </div>
                            <div className="md:col-span-4 flex justify-start md:justify-end gap-3 text-right">
                              <div className="flex items-center gap-1 text-[#475569]">
                                <i className="fa-solid fa-location-arrow text-[10px] text-[#0284c7]"></i>
                                <span>Kozan / Merkez</span>
                              </div>
                              <div className="flex items-center gap-1 text-[#475569]">
                                <i className="fa-solid fa-flag text-[10px] text-[#0284c7]"></i>
                                <span className="font-bold">{res.city}</span>
                              </div>
                            </div>
                          </div>

                          {/* Row 3: Tarihler & Etiketler */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border-t border-dashed border-[#e2eff7] pt-2">
                            <div className="md:col-span-4 flex items-center gap-1.5">
                              <span className="text-[#475569]"><i className="fa-solid fa-calendar-plus text-[11px]"></i></span>
                              <div>
                                <span className="font-bold text-[#475569]">Yayın tarihi:</span> 23.06.2026
                              </div>
                            </div>
                            <div className="md:col-span-5 flex items-center flex-wrap gap-1.5">
                              <span className="text-[#475569]"><i className="fa-solid fa-stopwatch text-[11px]"></i></span>
                              <div>
                                <span className="font-bold text-[#475569]">Teklif tarihi:</span>{" "}
                                {res.id === "res-3" ? "05.07.2026 11:00 (Süre Doldu)" : "16.07.2026 10:30"}
                              </div>
                              {res.id !== "res-3" && (
                                <span className="ml-1.5 bg-[#fef2f2] border border-[#fca5a5] text-[#b91c1c] text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] animate-pulse"></span>
                                  1 gün kaldı
                                </span>
                              )}
                            </div>
                            <div className="md:col-span-3 flex justify-start md:justify-end gap-1.5 flex-wrap">
                              <span className="bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded border border-[#cbd5e1] text-[10px] font-medium flex items-center gap-1">
                                <i className="fa-solid fa-tag text-[9px] text-[#64748b]"></i> {res.source}
                              </span>
                              <span className="bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded border border-[#cbd5e1] text-[10px] font-medium flex items-center gap-1">
                                <i className="fa-solid fa-tag text-[9px] text-[#64748b]"></i> Açık İhale
                              </span>
                              <span className="bg-[#f1f5f9] text-[#475569] px-2 py-0.5 rounded border border-[#cbd5e1] text-[10px] font-medium flex items-center gap-1">
                                <i className="fa-solid fa-tag text-[9px] text-[#64748b]"></i> Kısmi Teklif
                              </span>
                            </div>
                          </div>

                          {/* Footer Buttons */}
                          <div className="border-t border-[#d2e7f3] pt-3 flex flex-wrap gap-2">
                            <button 
                              type="button"
                              onClick={() => setActiveDetailTab(activeDetailTab === `malzeme-${res.id}` ? null : `malzeme-${res.id}`)}
                              className={`px-3 py-1.5 rounded border text-[#0284c7] font-semibold bg-white hover:bg-[#e0f2fe] hover:border-[#0284c7] transition-all flex items-center gap-1.5 text-[11px] ${
                                activeDetailTab === `malzeme-${res.id}` ? "border-[#0284c7] bg-[#f0f9ff]" : "border-[#cbd5e1]"
                              }`}
                            >
                              <i className="fa-solid fa-file-invoice text-[#0284c7]"></i> Malzeme Listesi <span className="bg-[#e0f2fe] text-[#0369a1] text-[9px] font-extrabold px-1 rounded-full ml-1">22</span>
                            </button>

                            <button 
                              type="button"
                              onClick={() => setActiveDetailTab(activeDetailTab === `ilan-${res.id}` ? null : `ilan-${res.id}`)}
                              className={`px-3 py-1.5 rounded border text-[#0284c7] font-semibold bg-white hover:bg-[#e0f2fe] hover:border-[#0284c7] transition-all flex items-center gap-1.5 text-[11px] ${
                                activeDetailTab === `ilan-${res.id}` ? "border-[#0284c7] bg-[#f0f9ff]" : "border-[#cbd5e1]"
                              }`}
                            >
                              <i className="fa-solid fa-bullhorn text-[#0284c7]"></i> İhale İlanı
                            </button>

                            <button 
                              type="button"
                              onClick={() => setActiveDetailTab(activeDetailTab === `idari-${res.id}` ? null : `idari-${res.id}`)}
                              className={`px-3 py-1.5 rounded border text-[#0284c7] font-semibold bg-white hover:bg-[#e0f2fe] hover:border-[#0284c7] transition-all flex items-center gap-1.5 text-[11px] ${
                                activeDetailTab === `idari-${res.id}` ? "border-[#0284c7] bg-[#f0f9ff]" : "border-[#cbd5e1]"
                              }`}
                            >
                              <i className="fa-solid fa-file-shield text-[#0284c7]"></i> İdari Şartname
                            </button>

                            <button 
                              type="button"
                              onClick={() => setActiveDetailTab(activeDetailTab === `teknik-${res.id}` ? null : `teknik-${res.id}`)}
                              className={`px-3 py-1.5 rounded border text-[#0284c7] font-semibold bg-white hover:bg-[#e0f2fe] hover:border-[#0284c7] transition-all flex items-center gap-1.5 text-[11px] ${
                                activeDetailTab === `teknik-${res.id}` ? "border-[#0284c7] bg-[#f0f9ff]" : "border-[#cbd5e1]"
                              }`}
                            >
                              <i className="fa-solid fa-file-code text-[#0284c7]"></i> Teknik Şartname
                            </button>

                            <button 
                              type="button"
                              onClick={() => setActiveDetailTab(activeDetailTab === `benzer-${res.id}` ? null : `benzer-${res.id}`)}
                              className={`px-3 py-1.5 rounded border text-[#0284c7] font-semibold bg-white hover:bg-[#e0f2fe] hover:border-[#0284c7] transition-all flex items-center gap-1.5 text-[11px] ${
                                activeDetailTab === `benzer-${res.id}` ? "border-[#0284c7] bg-[#f0f9ff]" : "border-[#cbd5e1]"
                              }`}
                            >
                              <i className="fa-solid fa-rotate-left text-[#0284c7]"></i> Benzer İhale Geçmişi
                            </button>
                          </div>

                          {/* Dynamic content tab drawers inside card */}
                          {activeDetailTab === `malzeme-${res.id}` && (
                            <div className="mt-2 p-4 bg-white border border-[#cbd5e1] rounded-lg text-left">
                              <h5 className="font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-2 mb-3 flex items-center gap-1.5">
                                <i className="fa-solid fa-list-ol text-accent text-[12px]"></i> Malzeme & Birim Fiyat Teklif Formu
                              </h5>
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-slate-600 border-collapse">
                                  <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                      <th className="p-2 text-left font-bold text-slate-700">Malzeme/Hizmet Tanımı</th>
                                      <th className="p-2 text-center font-bold text-slate-700 w-24">Miktar / Birim</th>
                                      <th className="p-2 text-right font-bold text-slate-700 w-32">Birim Fiyat Teklifi (₺)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {res.material_list ? (
                                      res.material_list.split('\n').filter(line => line.trim()).map((m, idx) => {
                                        const parts = m.split(/[-:]/);
                                        const itemName = parts[0]?.trim() || "";
                                        const itemQty = parts[1]?.trim() || "1 Adet";
                                        return (
                                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                                            <td className="p-2 font-medium text-slate-800">{itemName}</td>
                                            <td className="p-2 text-center font-bold text-slate-600">{itemQty}</td>
                                            <td className="p-2 text-right">
                                              <input 
                                                type="number" 
                                                placeholder="0.00" 
                                                className="w-28 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
                                              />
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <>
                                        <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                                          <td className="p-2 font-medium text-slate-800">Hazır Beton (C30/37)</td>
                                          <td className="p-2 text-center font-bold text-slate-600">1.250 m³</td>
                                          <td className="p-2 text-right">
                                            <input 
                                              type="number" 
                                              placeholder="0.00" 
                                              className="w-28 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
                                            />
                                          </td>
                                        </tr>
                                        <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                                          <td className="p-2 font-medium text-slate-800">Nervürlü Çelik Boru</td>
                                          <td className="p-2 text-center font-bold text-slate-600">85 Ton</td>
                                          <td className="p-2 text-right">
                                            <input 
                                              type="number" 
                                              placeholder="0.00" 
                                              className="w-28 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
                                            />
                                          </td>
                                        </tr>
                                        <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                                          <td className="p-2 font-medium text-slate-800">Kazı ve Dolgu İşçiliği</td>
                                          <td className="p-2 text-center font-bold text-slate-600">3.400 m³</td>
                                          <td className="p-2 text-right">
                                            <input 
                                              type="number" 
                                              placeholder="0.00" 
                                              className="w-28 text-right bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-accent"
                                            />
                                          </td>
                                        </tr>
                                      </>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
                                <span className="text-[10px] text-slate-400">Teklifinizi göndermek ve canlı eksiltme arenasına katılmak için portaldan oturum açmalısınız.</span>
                                <button 
                                  type="button"
                                  onClick={() => {
                                    alert('Teklif vermek ve canlı eksiltme arenasına katılmak için kurumsal üye girişi yapmanız gerekmektedir. Portal giriş ve kayıt ekranına yönlendiriliyorsunuz.');
                                    window.location.href = '/portal.html#/uyelik';
                                  }}
                                  className="px-4 py-2 bg-accent text-white font-bold rounded-lg hover:bg-accentLight transition-all text-xs flex items-center gap-1.5 shadow-sm"
                                >
                                  <i className="fa-solid fa-paper-plane"></i> Teklif Gönder ve Katıl
                                </button>
                              </div>
                            </div>
                          )}

                          {activeDetailTab === `ilan-${res.id}` && (
                            <div className="mt-2 p-3 bg-white border border-[#cbd5e1] rounded-lg text-left text-xs text-[#475569] leading-relaxed">
                              <h5 className="font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-1.5 mb-2 font-heading">Resmi İhale İlan Metni (Özet)</h5>
                              {res.description ? (
                                <p>{res.description}</p>
                              ) : (
                                "İdare tarafından 23.06.2026 tarihinde onaylanan şartnameye istinaden, B2B tersine ihale yöntemiyle canlı eksiltme yapılacaktır. Teklifler " + (res.id === "res-3" ? "sonuçlanmıştır" : "16.07.2026 günü saat 10:30'a kadar") + " platform üzerinden kabul edilecektir. Katılmak isteyen tedarikçilerin güncel yeterlilik belgesi ve oda kayıt suretini yüklemeleri zorunludur."
                              )}
                            </div>
                          )}

                          {activeDetailTab === `idari-${res.id}` && (
                            <div className="mt-2 p-3 bg-white border border-[#cbd5e1] rounded-lg text-left text-xs text-[#475569]">
                              <h5 className="font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-1.5 mb-2 font-heading">İdari Şartname Maddeleri</h5>
                              {res.admin_spec ? (
                                <div className="whitespace-pre-line">{res.admin_spec}</div>
                              ) : (
                                <ul className="list-disc pl-4 space-y-1">
                                  <li>Teklif geçerlilik süresi, ihale tarihinden itibaren en az 90 takvim günü olmalıdır.</li>
                                  <li>Canlı eksiltme arenamızda en düşük fiyat teklifi veren 3 firma son pazarlığa davet edilecektir.</li>
                                  <li>Geçici teminat oranı olarak teklif bedelinin %3'ü oranında teminat mektubu talep edilmektedir.</li>
                                </ul>
                              )}
                            </div>
                          )}

                          {activeDetailTab === `teknik-${res.id}` && (
                            <div className="mt-2 p-3 bg-white border border-[#cbd5e1] rounded-lg text-left text-xs text-[#475569]">
                              <h5 className="font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-1.5 mb-2 font-heading">Teknik Yeterlilik Kriterleri</h5>
                              {res.tech_spec ? (
                                <div className="whitespace-pre-line">{res.tech_spec}</div>
                              ) : (
                                <>
                                  <p className="mb-2">Tüm inşaat ve yapım malzemelerinin TSE standardı belgesi bulunmalıdır. Yüklenici, işe başladıktan sonra 10 gün içinde detaylı iş programını idareye sunacaktır.</p>
                                  <span className="text-[10px] text-accent font-semibold flex items-center gap-1"><i className="fa-solid fa-circle-info"></i> Detaylı teknik şartname PDF dosyasını indirmek için portala giriş yapın.</span>
                                </>
                              )}
                            </div>
                          )}

                          {activeDetailTab === `benzer-${res.id}` && (
                            <div className="mt-2 p-3 bg-white border border-[#cbd5e1] rounded-lg text-left text-xs text-[#475569]">
                              <h5 className="font-bold text-[#1e293b] border-b border-[#e2e8f0] pb-1.5 mb-2 font-heading">Aynı Sektördeki Geçmiş Sonuçlar & Teklif Günlüğü</h5>
                              <div className="space-y-1.5">
                                {res.similar_history ? (
                                  res.similar_history.split('\n').filter(line => line.trim()).map((item, idx) => {
                                    const parts = item.split(/[-:]/);
                                    return (
                                      <div key={idx} className="flex justify-between text-[11px] border-b border-gray-100 pb-1">
                                        <span>{parts[0]?.trim()}</span>
                                        <span className="text-emerald-600 font-bold">{parts.slice(1).join('-').trim()}</span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <>
                                    <div className="flex justify-between text-[11px] border-b border-gray-100 pb-1">
                                      <span>2025/8902 - Asfalt Alımı İhalesi (Adana)</span>
                                      <span className="text-emerald-600 font-bold">Sonuç: 8.420.000 ₺ (%12.4 Tasarruf)</span>
                                    </div>
                                    <div className="flex justify-between text-[11px] border-b border-gray-100 pb-1">
                                      <span>2025/1102 - Hazır Beton Alım Hizmeti (Kozan)</span>
                                      <span className="text-emerald-600 font-bold">Sonuç: 1.150.000 ₺ (%8.5 Tasarruf)</span>
                                    </div>
                                  </>
                                )}
                              </div>
                              <h6 className="font-bold text-[#1e293b] mt-4 mb-2 flex items-center gap-1.5 text-[11.5px] font-heading">
                                <i className="fa-solid fa-clock-rotate-left text-accent"></i> Güncel Teklif Geçmişi (Audit Trail)
                              </h6>
                              <div className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 space-y-1.5 font-mono text-[10px] text-slate-500">
                                <div className="flex justify-between">
                                  <span>[15:42:01] Tedarikçi #8 (Demir A.Ş.)</span>
                                  <span className="text-red-500 font-semibold">- 8.500 ₺ indirim yaptı</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>[15:39:12] Tedarikçi #3 (Öz Yapı)</span>
                                  <span className="text-red-500 font-semibold">- 12.000 ₺ indirim yaptı</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>[15:35:50] Sistem</span>
                                  <span className="text-slate-400">İhale canlı eksiltme aşamasına geçti</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-gray-500">Arama kriterlerine uygun ihale bulunamadı.</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Categories & Metadata Grid (EKAP style from screenshot) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2 text-left">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-folder-open text-accent"></i> Sektörel İhale Kategorileri
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(content.explorer?.categories || DEFAULT_CONTENT.explorer.categories).map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white border border-slate-200 shadow-sm hover:border-accent/30 transition-all">
                <div className="flex items-center gap-3 text-left">
                  <i className="fa-solid fa-folder-open text-accent/60 text-sm"></i>
                  <div>
                    <span className="text-xs font-bold text-slate-700 block leading-tight">{cat.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono mt-1 block">{cat.count} İhale</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelectedCat(cat.slug); handleExplorerSearch(); }} className="text-xs font-bold text-accent hover:text-accentLight px-2.5 py-1.5 rounded-lg bg-accent/5 hover:bg-accent/10 border border-accent/10 transition-all">
                    İhaleler
                  </button>
                  <select className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-600 focus:outline-none">
                    <option>Günlük</option>
                    <option>Haftalık</option>
                    <option>Aylık</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 1. İhale Usulleri Block */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 border-b-0 rounded-t-xl text-xs font-bold text-slate-800">
            <i className="fa-solid fa-book-open text-accent"></i> İhale usulleri
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-b-xl rounded-r-xl bg-white border border-slate-200 shadow-sm">
            {[
              { name: "Açık ihale usulü ihaleleri", count: "5.461" },
              { name: "Doğrudan temin ihaleleri", count: "3.958" },
              { name: "Fiyat araştırması ihaleleri", count: "68" },
              { name: "Belli istekliler ihaleleri", count: "32" },
              { name: "Pazarlık usulü ihaleleri", count: "151" },
              { name: "İstisna ihaleleri", count: "576" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-accent/30 transition-all">
                <span className="text-[11px] text-slate-700 font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">{item.count}</span>
                  <select className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px] text-slate-600 focus:outline-none">
                    <option>Günlük</option>
                    <option>Haftalık</option>
                    <option>Aylık</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Teklif Türleri Block */}
        <div className="mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 border-b-0 rounded-t-xl text-xs font-bold text-slate-800">
            <i className="fa-solid fa-tags text-accent"></i> Teklif türleri
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-b-xl rounded-r-xl bg-white border border-slate-200 shadow-sm">
            {[
              { name: "E-ihale ihaleleri", count: "4.704" },
              { name: "E-eksiltme ihaleleri", count: "98" },
              { name: "Kısmi teklif verilebilir ihaleleri", count: "1.155" },
              { name: "Kısmi teklif verilemez ihaleleri", count: "2.775" },
              { name: "Birim fiyat usulü ihaleleri", count: "3.237" },
              { name: "Götürü bedel usulü ihaleleri", count: "714" },
              { name: "Sadece yerli istekliler ihaleleri", count: "2.707" },
              { name: "Yerli ve yabancı istekliler ihaleleri", count: "1.268" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-accent/30 transition-all">
                <span className="text-[11px] text-slate-700 font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">{item.count}</span>
                  <select className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px] text-slate-600 focus:outline-none">
                    <option>Günlük</option>
                    <option>Haftalık</option>
                    <option>Aylık</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. İçerik Türleri Block */}
        <div className="mb-6 text-left">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 border-b-0 rounded-t-xl text-xs font-bold text-slate-800">
            <i className="fa-solid fa-file-lines text-accent"></i> İçerik türleri
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-b-xl rounded-r-xl bg-white border border-slate-200 shadow-sm">
            {[
              { name: "Düzeltme ilanı", count: "115" },
              { name: "İptal ilanı", count: "27" },
              { name: "Zeyilname", count: "482" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-accent/30 transition-all">
                <span className="text-[11px] text-slate-700 font-medium">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-mono">{item.count}</span>
                  <select className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[9px] text-slate-600 focus:outline-none">
                    <option>Günlük</option>
                    <option>Haftalık</option>
                    <option>Aylık</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== VIDEO MODAL ===================== */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowVideoModal(false)}></div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl glass-card rounded-2xl shadow-premium overflow-hidden z-10 p-2">
              <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
              <div className="w-full aspect-video bg-[#070a13] rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.3)_0%,transparent_70%)]"></div>
                <div className="flex flex-col items-center gap-4 text-center max-w-md z-10">
                  <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-accent text-3xl pulse-dot"><i className="fa-solid fa-gavel"></i></div>
                  <h3 className="font-heading font-black text-xl text-white">gelanlasalim.com Platform Turu</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">Bu simülasyonda alıcı firmaların ilan açıp tedarikçilerin anlık fiyat kırarak yarıştığı kontrol panelini inceliyorsunuz.</p>
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-4"><motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 10, ease: "linear", repeat: Infinity }} className="h-full bg-accent"></motion.div></div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Simülasyon Devam Ediyor...</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===================== HOW IT WORKS — PROCESS SWITCHER ===================== */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="nasil-calisir">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-[11px] font-bold text-accent uppercase tracking-widest">PLATFORM SÜRECİ</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-slate-900 mb-4 mt-3">Nasıl Çalışır?</h2>
          <p className="text-sm md:text-base text-slate-600">Alıcı veya tedarikçi olarak platformu kullanma sürecinizi adım adım keşfedin.</p>
        </div>
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 rounded-full bg-slate-100/60 border border-slate-200">
            <button onClick={() => setActiveProcessTab("buyer")} className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeProcessTab === "buyer" ? 'bg-accent text-white shadow-accentGlow' : 'text-slate-500 hover:text-slate-800'}`}><i className="fa-solid fa-building mr-2"></i>Alıcı Ekip</button>
            <button onClick={() => setActiveProcessTab("supplier")} className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${activeProcessTab === "supplier" ? 'bg-accent text-white shadow-accentGlow' : 'text-slate-500 hover:text-slate-800'}`}><i className="fa-solid fa-truck mr-2"></i>Tedarikçi</button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={activeProcessTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(activeProcessTab === "buyer" ? buyerSteps : supplierSteps).map((step, idx) => (
              <div key={idx} className="relative p-7 rounded-2xl bg-white border border-slate-200/80 flex flex-col gap-4 text-left group hover:border-accent/20 transition-all duration-300 shadow-sm">
                <div className="absolute top-5 right-5 font-heading font-black text-5xl text-slate-100 group-hover:text-accent/[0.06] transition-all duration-300">{String(idx + 1).padStart(2, '0')}</div>
                <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg"><i className={`fa-solid ${step.icon}`}></i></div>
                <h3 className="font-heading font-bold text-base text-slate-800">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                {idx < 3 && <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 items-center justify-center text-accent text-[10px]"><i className="fa-solid fa-chevron-right"></i></div>}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ===================== VIDEO GUIDES CAROUSEL ===================== */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <span className="text-[11px] font-bold text-accent uppercase tracking-widest">VİDEO REHBERLER</span>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-slate-900 mt-3 mb-2">gelanlasalim&apos;i kullanmaya başlayın.</h2>
            <p className="text-sm text-slate-600">Platform süreçlerimizi adım adım anlatan video rehberlerimiz.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.videoGuides.map((guide, idx) => (
              <div key={idx} className="video-guide-card rounded-2xl bg-white border border-slate-200/80 overflow-hidden group shadow-sm" onClick={enterPortal}>
                <div className="aspect-video bg-gradient-to-br from-accent/5 to-accent/10 flex items-center justify-center relative">
                   <div className="w-14 h-14 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center text-accent text-xl group-hover:scale-110 transition-transform duration-300">
                    <i className="fa-solid fa-play ml-0.5"></i>
                  </div>
                  <div className="absolute bottom-3 left-3 text-[10px] bg-black/60 text-white px-2 py-1 rounded font-mono">0{idx + 1}</div>
                </div>
                <div className="p-5">
                  <h4 className="font-heading font-bold text-sm text-slate-800 mb-2">{guide.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{guide.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== MARKETPLACE SEGMENTS ===================== */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="pazar-yeri">
        <div className="mb-16">
          <span className="text-[11px] font-bold text-accent uppercase tracking-widest">PAZAR YERİ MODELLERİ</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-slate-900 mt-3 mb-4">Her ölçek için doğru çözüm.</h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl">İhtiyacınıza ve üretim büyüklüğünüze uygun segmentteki ihaleleri keşfedin, tedarik akışınızı doğru kanaldan yönetin.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {marketSegments.map((seg, idx) => (
            <div key={idx} onClick={enterPortal} className="relative p-8 rounded-2xl bg-white border border-slate-200/80 hover:border-accent/30 cursor-pointer flex flex-col gap-5 text-left group hover:-translate-y-1 transition-all duration-300 overflow-hidden shadow-sm">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-2xl group-hover:scale-110 transition-transform duration-300"><i className={`fa-solid ${seg.icon}`}></i></div>
              <div>
                <h3 className="font-heading font-bold text-lg text-slate-800 mb-0.5">{seg.title}</h3>
                <span className="text-[11px] text-accent font-semibold uppercase tracking-wider">{seg.subtitle}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{seg.desc}</p>
              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100">
                {seg.categories.map((cat, ci) => (<span key={ci} className="text-[10px] px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500 font-medium">{cat}</span>))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FEATURES — UÇTAN UCA YÖNETİM ===================== */}
      <section className="py-24 bg-slate-50 border-y border-slate-200" id="ozellikler">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
            <div className="lg:col-span-2">
              <span className="text-[11px] font-bold text-accent uppercase tracking-widest">PLATFORM ÖZELLİKLERİ</span>
              <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-slate-900 mt-3 mb-4 leading-tight">Tek platformda uçtan uca yönetim.</h2>
              <p className="text-sm text-slate-600 leading-relaxed">İhale oluşturmadan tedarikçi değerlendirmesine, teklif sürecinden nihai teslimat onayına kadar tüm akışı tek çatı altında yönetin.</p>
            </div>
            <div className="lg:col-span-3">
              {content.features.map((feat, idx) => (
                <div key={idx} className="feature-item flex items-start gap-5 group">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mt-1">
                    <i className={`fa-solid ${feat.icon}`}></i>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading font-bold text-base text-slate-800 mb-1.5">{feat.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TRUST STANDARDS — GÜVEN VE KAYIT ===================== */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <span className="text-[11px] font-bold text-accent uppercase tracking-widest">GÜVENLİK STANDARTLARI</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-slate-900 mt-3 mb-4 leading-tight">Güven ve kayıt standartları.</h2>
          <p className="text-sm text-slate-600 max-w-2xl">Platforma dahil her işlem şifreli aktarım, yetkilik belgesi, kayıt izi ve uluslararası kurumsal standartlar ile korunmaktadır.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.trustStandards.map((ts, idx) => (
            <div key={idx} className="trust-standard-card">
              <span className="text-[10px] font-bold text-accent/60 uppercase tracking-widest block mb-3">{ts.subtitle}</span>
              <h3 className="trust-title mb-4">{ts.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{ts.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== 3 PROBLEMS — YATAY DÜZEN ===================== */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-[11px] font-bold text-accent uppercase tracking-widest">NEDEN GELANLASALİM?</span>
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-slate-900 mt-3 mb-4 leading-tight">Geleneksel satın almanın<br />üç temel sorunu.</h2>
            <p className="text-sm text-slate-600 max-w-2xl">E-posta, telefon ve elektronik tablolarla yürütülen tedarik süreçlerinin kontrollü bir çalışma alanıyla buluşması gerekiyor.</p>
          </div>
          <div className="flex flex-col gap-0">
            {content.problems.map((prob, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-slate-200/60 last:border-b-0 group hover:bg-slate-100/30 transition-colors px-4 -mx-4 rounded-xl">
                <div className="md:col-span-1 flex items-start">
                  <span className="text-[10px] font-bold text-accent/60 uppercase tracking-widest font-mono">SORUN {String(idx + 1).padStart(2, '0')}</span>
                </div>
                <div className="md:col-span-4">
                  <h4 className="font-heading font-bold text-base text-slate-800 leading-snug">{prob.title}</h4>
                </div>
                <div className="md:col-span-7">
                  <p className="text-sm text-slate-600 leading-relaxed">{prob.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ===================== STATS ===================== */}
      <section className="py-14 border-b border-white/5" id="istatistikler">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {content.stats.map((stat, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <span className="font-heading font-black text-3xl md:text-5xl text-accent">{stat.value}</span>
              <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="py-24 max-w-3xl mx-auto px-6" id="faq">
        <div className="mb-16">
          <span className="text-[11px] font-bold text-accent uppercase tracking-widest">SIKÇA SORULAN SORULAR</span>
          <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-white mt-3 mb-2">Sıkça sorulan sorular.</h2>
          <p className="text-sm text-gray-400">Platformumuz hakkında merak edilen konular.</p>
        </div>
        <div className="flex flex-col gap-3">
          {content.faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className={`rounded-xl border bg-white overflow-hidden transition-all duration-300 ${isOpen ? 'border-accent/40 shadow-sm' : 'border-slate-200'}`}>
                <button onClick={() => setActiveFaq(isOpen ? null : index)} className="w-full px-6 py-5 flex items-center justify-between text-left font-heading font-bold text-sm md:text-base text-slate-800 hover:bg-slate-50 transition-colors">
                  <span>{faq.q}</span>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ml-4 transition-all duration-300 ${isOpen ? 'bg-accent text-white rotate-180' : 'bg-slate-100 text-accent'}`}><i className="fa-solid fa-chevron-down text-xs"></i></span>
                </button>
                <div className={`px-6 overflow-hidden transition-all duration-300 text-sm text-slate-600 leading-relaxed ${isOpen ? 'py-5 border-t border-slate-100 max-h-48' : 'max-h-0'}`}>{faq.a}</div>
              </div>
            );
          })}
        </div>
        {/* Hâlâ sorunuz mu var? */}
        <div className="mt-8 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-heading font-bold text-base text-slate-800 mb-1">Hâlâ sorunuz mu var?</h4>
            <p className="text-xs text-slate-500">Bize her zaman ulaşabilirsiniz.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowChat(true)} className="px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accentLight transition-all">Yardım merkezine git</button>
            <span className="text-xs text-slate-500">{content.footer.email}</span>
          </div>
        </div>
      </section>

      {/* ===================== REGISTRATION CTA ===================== */}
      <section className="py-24 registration-cta border-y border-slate-200 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-[11px] font-bold text-accent uppercase tracking-widest">HEMEN BAŞLAYIN</span>
            <h2 className="font-heading font-black text-3xl md:text-4xl text-slate-900 mt-3 mb-4 leading-tight">
              Satın alma süreçlerinizi<br /><span className="text-accent">tek panelde toplayın.</span>
            </h2>
            <p className="text-sm text-slate-600 mb-6 max-w-md">gelanlasalim satın alma süreçlerinizin tüm yapıtaşlarını dijital ortamda, hızlı ve güvenli şekilde birleştiren bir B2B platformudur.</p>
            <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs text-slate-500">
              <div className="flex items-center gap-2"><i className="fa-solid fa-shield-halved text-accent"></i>Güvenli altyapı</div>
              <div className="flex items-center gap-2"><i className="fa-solid fa-certificate text-accent"></i>KVKK doğrulanmış altyapı</div>
              <div className="flex items-center gap-2"><i className="fa-solid fa-wallet text-accent"></i>Fırsat maliyetlendirme</div>
            </div>
          </div>
          <div className="w-full max-w-md mx-auto lg:ml-auto">
            <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-lg">
              <div className="flex mb-6 p-1 rounded-full bg-slate-100/60 border border-slate-200">
                <button onClick={() => setRegTab("buyer")} className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${regTab === "buyer" ? 'bg-accent text-white' : 'text-slate-500'}`}>Alıcı</button>
                <button onClick={() => setRegTab("supplier")} className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all ${regTab === "supplier" ? 'bg-accent text-white' : 'text-slate-500'}`}>Tedarikçi</button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); window.location.href = '/portal.html#/uyelik'; }} className="flex flex-col gap-4">
                <input type="text" placeholder="Firma adınız" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-accent transition-colors" />
                <input type="email" placeholder="Kurumsal e-posta adresiniz" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-accent transition-colors" />
                <input type="password" placeholder="Şifre oluşturun (en az 8 karakter)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-accent transition-colors" />
                <button type="submit" className="w-full py-3.5 rounded-xl bg-accent text-white font-bold text-sm hover:bg-accentLight transition-all shadow-accentGlow mt-2">
                  {regTab === "buyer" ? "Alıcı Olarak Kayıt Ol" : "Tedarikçi Olarak Kayıt Ol"}
                </button>
              </form>
              <p className="text-[10px] text-slate-500 mt-4 text-center leading-relaxed">
                Kayıt olarak <a href="#" className="text-accent underline">Kullanım koşullarını</a>, <a href="#" className="text-accent underline">Gizlilik Politikasını</a> ve <a href="#" className="text-accent underline">Aydınlatma Metnini</a> kabul etmiş olursunuz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="bg-white border-t border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1 flex flex-col gap-4">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-heading font-black text-white text-sm">GA</div>
                <span className="font-heading font-bold text-lg tracking-tight text-slate-900">gelanla<span className="text-accent">salim</span></span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">Kurumsal B2B satın alma ekipleri için canlı tersine ihale ve güvenli tedarik platformu.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-3 text-xs text-slate-500">
                <li><a href="#nasil-calisir" className="hover:text-accent transition-colors">Nasıl Çalışır</a></li>
                <li><a href="#pazar-yeri" className="hover:text-accent transition-colors">Pazar Yeri</a></li>
                <li><a href="/portal.html" className="hover:text-accent transition-colors">İhale Arenası</a></li>
                <li><a href="#faq" className="hover:text-accent transition-colors">SSS</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Şirket</h4>
              <ul className="space-y-3 text-xs text-slate-500">
                <li><a href="#" className="hover:text-accent transition-colors">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Kullanım Koşulları</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">İletişim</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">İletişim</h4>
              <ul className="space-y-3 text-xs text-slate-500">
                <li className="flex items-center gap-2"><i className="fa-solid fa-envelope text-accent/60"></i>{content.footer.email}</li>
                <li className="flex items-center gap-2"><i className="fa-brands fa-whatsapp text-accent/60"></i>{content.footer.phone}</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-location-dot text-accent/60"></i>{content.footer.address}</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <span>© 2026 gelanlasalim.com — Tüm hakları saklıdır.</span>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-building-columns text-accent/40"></i>MERSİS Kayıtlı</span>
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-certificate text-accent/40"></i>ETBİS Tescilli</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ===================== FLOATING BUTTONS ===================== */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end">
        <motion.a href="https://wa.me/905555555555?text=Merhaba,%20B2B%20İhale%20Platformu%20hakkında%20bilgi%20almak%20istiyorum." target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BD5A] flex items-center justify-center text-white text-2xl shadow-premium relative group">
          <i className="fa-brands fa-whatsapp"></i>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-medium">WhatsApp Destek</span>
        </motion.a>
        <motion.button onClick={() => setShowChat(!showChat)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="w-14 h-14 rounded-full bg-accent hover:bg-accentLight flex items-center justify-center text-white text-2xl shadow-accentGlow relative group">
          {showChat ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-robot"></i>}
          {!showChat && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center pulse-dot">1</span>}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-medium">Yapay Zeka Destek</span>
        </motion.button>

        <AnimatePresence>
          {showChat && (
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }} className="w-80 md:w-96 h-[460px] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden text-left">
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white font-black text-sm">GA</div>
                  <div><h4 className="text-xs font-bold text-slate-800 leading-tight">Yapay Zeka Destek Asistanı</h4><span className="text-[9px] text-green-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot"></span> Online</span></div>
                </div>
                <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 text-xs">
                {messages.map((m, idx) => (
                  <div key={idx} className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${m.sender === 'user' ? 'bg-accent text-white font-semibold self-end rounded-tr-none' : 'bg-slate-50 border border-slate-200/80 text-slate-700 self-start rounded-tl-none'}`}>{m.text}</div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/50">
                {[{ label: "Havuz Nedir?", q: "Güvenli Havuz nedir?" }, { label: "Nasıl Üye Olunur?", q: "Nasıl üye olurum?" }, { label: "İhale Açmak", q: "Nasıl ihale ilanı açarım?" }].map((item, i) => (
                  <button key={i} onClick={() => handleSendChat(item.q)} className="text-[10px] bg-white hover:bg-accent/5 border border-slate-200 hover:border-accent/20 px-2.5 py-1 rounded-full text-slate-600 hover:text-accent transition-all">{item.label}</button>
                ))}
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Sorunuzu buraya yazın..." className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-accent" />
                <button type="submit" className="w-8 h-8 rounded-lg bg-accent text-white flex items-center justify-center hover:bg-accentLight hover:scale-105 active:scale-95 transition-all"><i className="fa-solid fa-paper-plane text-xs"></i></button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
