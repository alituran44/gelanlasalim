"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Merhaba! Ben gelanlasalim.com Yapay Zeka Destek Asistanıyım. B2B Tersine İhale Arenası, Güvenli Havuz (Escrow) ödemeleri, üyelik veya pazarlık sistemi hakkında merak ettiğiniz her şeyi bana sorabilirsiniz." 
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time simulated bidding state for Hero section
  const [simulatedBids, setSimulatedBids] = useState([
    { id: 1, rank: 1, name: "Kırtasiye Dünyası Ltd. Şti.", price: 62000, logo: "KD" },
    { id: 2, rank: 2, name: "Beta Malzeme Ticaret", price: 64000, logo: "BM" },
    { id: 3, rank: 3, name: "Kaya Peyzaj ve Dağıtım", price: 68000, logo: "KP" }
  ]);

  // Periodic bid reduction to simulate live activity
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedBids(prev => {
        const next = [...prev];
        const targetIndex = Math.floor(Math.random() * next.length);
        const reduction = Math.floor(Math.random() * 800) + 200;
        const limitFloor = 55000;
        
        let newPrice = next[targetIndex].price - reduction;
        if (newPrice < limitFloor) {
          newPrice = 64500;
        }
        
        next[targetIndex].price = newPrice;
        
        const sorted = [...next].sort((a, b) => a.price - b.price);
        return prev.map(item => {
          const sortedIndex = sorted.findIndex(s => s.id === item.id);
          return {
            ...item,
            rank: sortedIndex + 1,
            price: item.id === next[targetIndex].id ? newPrice : item.price,
            justUpdated: item.id === next[targetIndex].id
          };
        });
      });
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  const handleSendChat = (textToSend) => {
    const query = textToSend || chatInput;
    if (!query.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text: query };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Thinking delay simulation
    setTimeout(() => {
      let replyText = "";
      const normalizedQuery = query.toLowerCase();

      if (normalizedQuery.includes("havuz") || normalizedQuery.includes("escrow") || normalizedQuery.includes("güvenli") || normalizedQuery.includes("odeme") || normalizedQuery.includes("ödeme")) {
        replyText = "Güvenli Havuz (Escrow) altyapımız, alıcının ihale bedelini platform korumalı hesabına yatırmasını sağlar. Tedarikçi teslimatı yaptıktan ve alıcı kontrol panelinden teslimatı onayladıktan sonra ödeme otomatik olarak tedarikçiye aktarılır. Böylece kurumsal alımlarınız sıfır riskle tamamlanır.";
      } else if (normalizedQuery.includes("üye") || normalizedQuery.includes("uye") || normalizedQuery.includes("kayıt") || normalizedQuery.includes("giriş") || normalizedQuery.includes("hesap")) {
        replyText = "Platformumuz yalnızca onaylı B2B şirketlerine açıktır. 'Üye Girişi' panelinden e-posta ve şifrenizle giriş yapabilirsiniz. Sistemi anında test etmek için Giriş panelinde bulunan 'Hızlı Demo Alıcı' veya 'Hızlı Demo Satıcı' butonlarını kullanarak şifresiz, tek tıkla giriş yapabilirsiniz.";
      } else if (normalizedQuery.includes("ihale") || normalizedQuery.includes("ilan") || normalizedQuery.includes("nasıl") || normalizedQuery.includes("talep")) {
        replyText = "İhale açmak çok kolaydır! Alıcı olarak giriş yaptıktan sonra üst menüdeki 'İLAN VER' butonuna tıklayarak ürün cinsi, miktarı, teslimat ili/ilçesi, hedef fiyatı ve varsa RAR/ZIP şartname dosyalarınızı girip ihaleyi anında yayına alabilirsiniz.";
      } else if (normalizedQuery.includes("teklif") || normalizedQuery.includes("fiyat") || normalizedQuery.includes("pazarlık") || normalizedQuery.includes("satıcı")) {
        replyText = "Satıcı (Tedarikçi) olarak sisteme giriş yaptıktan sonra ana sayfadaki aktif ihalelerden birine tıklayıp anlık fiyat kırarak teklifinizi sunabilirsiniz. Alıcı teklifinizi 'KABUL' edebilir, 'RET' edebilir veya 'PAZARLIK ET' seçeneğiyle size karşı teklif iletebilir.";
      } else if (normalizedQuery.includes("whatsapp") || normalizedQuery.includes("destek") || normalizedQuery.includes("iletişim") || normalizedQuery.includes("telefon")) {
        replyText = "Bizimle doğrudan sağ alt köşedeki yeşil WhatsApp butonuna tıklayarak iletişime geçebilirsiniz. Canlı müşteri temsilcilerimiz hafta içi 09:00 - 18:00 saatleri arasında destek sunmaktadır.";
      } else {
        replyText = "Sorunuzu tam olarak eşleştiremedim ancak size şu konularda yardımcı olabilirim: 1- Güvenli Havuz Sistemi, 2- Üye Girişi ve Demo Hesaplar, 3- İhale İlanı Oluşturma, 4- Teklif Verme ve Pazarlık Süreci. Lütfen bu başlıklardan birini sorunuz.";
      }

      setMessages(prev => [...prev, { sender: "bot", text: replyText }]);
    }, 800);
  };

  const faqs = [
    {
      q: "Tersine ihale (eksiltme) sistemi nasıl çalışır?",
      a: "Alıcı firma satın almak istediği ürünü/hizmeti şartnamesi ile ilan eder. İlana başvuran onaylı satıcılar, belirlenen süre boyunca birbirlerinin verdiği fiyatların altına inerek anlık teklif verirler. Süre sonunda en düşük fiyatı veren kazanır."
    },
    {
      q: "Firmaların doğrulanması nasıl sağlanıyor?",
      a: "Platforma üye olan her şirketin vergi kimlik numarası, imza sirküleri ve ticaret sicil gazetesi kayıtları yönetim panelimiz tarafından doğrulanır. Yalnızca onaylanmış B2B firmaları ihale açabilir veya teklif sunabilir."
    },
    {
      q: "Ödeme ve teslimat süreçleri güvenli mi?",
      a: "Evet. Alıcı ihale bedelini platformumuzun Güvenli Havuz (Escrow) hesabına yatırır. Tedarikçi teslimatı gerçekleştirip alıcı onayını aldığında, havuzdaki bakiye tedarikçi hesabına aktarılır. Bu sayede iki taraf da güvence altındadır."
    }
  ];

  const sectors = [
    { name: "Kırtasiye", desc: "Double A kağıt, dosya, kurumsal ofis sarf malzemesi talepleri ve toptan alımları.", icon: "fa-pen-nib" },
    { name: "Peyzaj", desc: "Fidan alımı, Leylandi ağacı, çim alım ve satım ihaleleri ile bahçe düzenleme.", icon: "fa-seedling" },
    { name: "Hizmet", desc: "Dış cephe temizlik hizmeti, kurumsal güvenlik ve diğer profesyonel hizmet tedariği.", icon: "fa-handshake-angle" },
    { name: "Tarım", desc: "Organize nohut alımı, taze limon satışı gibi toptan gıda ve tarımsal hammadde.", icon: "fa-wheat-awn" },
    { name: "İnşaat", desc: "Hazır beton, çimento, kaba ve ince yapı malzemeleri tedarik ihale odaları.", icon: "fa-helmet-safety" },
    { name: "Lojistik", desc: "Kurumsal yük nakliyesi, şehirler arası taşımacılık ve lojistik hizmetleri.", icon: "fa-truck-ramp-box" }
  ];

  const enterPortal = () => {
    window.location.href = '/portal.html';
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-gray-100 selection:bg-accent selection:text-white overflow-x-hidden">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#090a0f]/80 backdrop-blur-md transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-heading font-black text-black text-lg shadow-accentGlow">
              GA
            </div>
            <span className="font-heading font-bold text-xl tracking-tight">
              gelanla<span className="text-accent">salim</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#nasil-calisir" className="text-sm font-medium text-gray-400 hover:text-accent transition-colors">Sistem Nasıl Çalışır?</a>
            <a href="#sektorler" className="text-sm font-medium text-gray-400 hover:text-accent transition-colors">Faaliyet Sektörleri</a>
            <a href="#istatistikler" className="text-sm font-medium text-gray-400 hover:text-accent transition-colors">Sayılarla Platform</a>
            <a href="#faq" className="text-sm font-medium text-gray-400 hover:text-accent transition-colors">S.S.S</a>
          </nav>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-gray-300 hover:text-white transition-colors" onClick={() => window.location.href = '/portal.html#/uyelik'}>
              Üye Girişi
            </button>
            <button 
              onClick={enterPortal}
              className="px-5 py-2.5 rounded-lg bg-accent text-black font-semibold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-accentGlow"
            >
              ARENAYA GİRİŞ YAP ▷
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:py-32 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="self-start flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-xs font-semibold text-accent tracking-wide uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot"></span>
            B2B KURUMSAL TEDARİKTE LİDER ENTEGRASYON PLATFORMU
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-heading font-black text-4xl md:text-6xl tracking-tight leading-[1.08] text-white"
          >
            Tedarikte <br />
            <span className="text-accent drop-shadow-[0_0_20px_rgba(226,125,96,0.15)]">Canlı Tersine İhale</span> Arenası
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed"
          >
            Malzeme, lojistik veya hizmet taleplerinizi yayınlayın; doğrulanmış tedarikçilerin anlık fiyat kırarak yarıştığı canlı tersine ihale arenasını izleyin. Telefon trafiğini bitirin, en uygun fiyatı canlı yakalayın.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <button 
              onClick={() => window.location.href = '/portal.html#/uyelik'}
              className="px-7 py-3.5 rounded-xl bg-accent text-black font-bold text-base hover:scale-[1.02] active:scale-95 transition-all shadow-accentGlow flex items-center gap-2"
            >
              <i className="fa-solid fa-building"></i> Alıcı Olarak İlan Aç
            </button>
            <button 
              onClick={() => setShowVideoModal(true)}
              className="px-7 py-3.5 rounded-xl bg-transparent border border-white/20 text-white font-bold text-base hover:bg-white/5 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-circle-play text-accent"></i> Tanıtım Videosu
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap gap-x-6 gap-y-3 mt-6 pt-6 border-t border-white/5 text-xs text-gray-400"
          >
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-shield-halved text-accent"></i>
              <span>%100 Onaylı B2B Şirketleri</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-vault text-accent"></i>
              <span>Güvenli Havuz (Escrow) Altyapısı</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-percent text-accent"></i>
              <span>Sıfır Alıcı Komisyonu</span>
            </div>
          </motion.div>
        </div>

        {/* Live Arena Mockup Widget + Generated B2B Image Placement */}
        <div className="lg:col-span-5 relative w-full flex flex-col items-center gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="w-full max-w-[430px] rounded-2xl bg-card border border-white/5 p-6 shadow-premium relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-accent">
                <span className="w-2 h-2 rounded-full bg-accent pulse-dot"></span>
                CANLI REKABET ARENASI
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-mono">İhale No: #4812</span>
            </div>

            <div className="text-left mb-6">
              <h4 className="text-sm font-bold text-white mb-1">500 Paket A4 Fotokopi Kağıdı Alımı</h4>
              <p className="text-xs text-gray-400">Peyzaj & Kırtasiye Hizmetleri A.Ş. tarafından açıldı</p>
            </div>

            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {simulatedBids.map((bid) => (
                  <motion.div
                    key={bid.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      borderColor: bid.justUpdated ? "rgba(74, 222, 128, 0.4)" : "rgba(255, 255, 255, 0.06)"
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex items-center justify-between p-3.5 rounded-lg border bg-black/40 text-xs transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        bid.rank === 1 ? 'bg-accent/20 text-accent' :
                        bid.rank === 2 ? 'bg-white/10 text-white' : 'bg-white/5 text-gray-400'
                      }`}>
                        {bid.rank}
                      </span>
                      <span className="font-semibold text-gray-200">{bid.name}</span>
                    </div>
                    <span className="font-heading font-extrabold text-white text-right font-mono">
                      {bid.price.toLocaleString()} TL
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-[11px] text-gray-400">
              <span>Hedef Limit Fiyat: <strong className="text-white font-mono">65.000 TL</strong></span>
              <span className="text-success font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot"></span>
                Teklifler Kırılıyor...
              </span>
            </div>
          </motion.div>

          {/* Premium AI Generated Image Display */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-[430px] rounded-2xl border border-white/5 overflow-hidden shadow-premium relative group cursor-pointer"
            onClick={() => window.location.href = '/portal.html'}
          >
            <img 
              src="/b2b_trade_hero.png" 
              alt="B2B Supply Chain Network illustration" 
              className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
              <div className="text-left">
                <h5 className="text-xs font-bold text-accent uppercase tracking-wider mb-0.5">GA AKILLI ALTYAPI</h5>
                <p className="text-[11px] text-gray-300 font-medium">B2B tedarik zincirleri ve nakliyede tam otomasyon.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal Simulation */}
      <AnimatePresence>
        {showVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowVideoModal(false)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-card border border-white/10 rounded-2xl shadow-premium overflow-hidden z-10 p-2"
            >
              <button 
                onClick={() => setShowVideoModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
              
              {/* Premium Simulated Platform Tour Video (HTML5 visual mockup) */}
              <div className="w-full aspect-video bg-[#0c0d12] rounded-xl flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(226,125,96,0.3)_0%,transparent_70%)]"></div>
                
                {/* Simulated playback visual */}
                <div className="flex flex-col items-center gap-4 text-center max-w-md z-10">
                  <div className="w-20 h-20 rounded-full bg-accent/10 border-2 border-accent flex items-center justify-center text-accent text-3xl pulse-dot">
                    <i className="fa-solid fa-gavel"></i>
                  </div>
                  <h3 className="font-heading font-black text-xl text-white">gelanlasalim.com Platform Turu</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Bu simülasyon videosunda Alıcı firmaların ilan açıp tedarikçilerin saniyeler içinde anlık fiyat kırarak yarıştığı kontrol panelini inceliyorsunuz.
                  </p>
                  
                  {/* Interactive mock video loading bar */}
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                      className="h-full bg-accent"
                    ></motion.div>
                  </div>
                  <span className="text-[10px] text-gray-500 uppercase font-mono tracking-widest">Platform Simülasyonu Devam Ediyor...</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Stats Strip */}
      <section className="bg-card/50 border-y border-white/5 py-12" id="istatistikler">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col gap-1">
            <span className="font-heading font-black text-3xl md:text-5xl text-accent">12.4M TL+</span>
            <span className="text-xs text-gray-400 font-medium">Toplam Ticaret Hacmi</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading font-black text-3xl md:text-5xl text-accent">150+</span>
            <span className="text-xs text-gray-400 font-medium">Doğrulanmış B2B Üretici</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading font-black text-3xl md:text-5xl text-accent">%14.2</span>
            <span className="text-xs text-gray-400 font-medium">Ortalama Tedarik Tasarrufu</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-heading font-black text-3xl md:text-5xl text-accent">0 TL</span>
            <span className="text-xs text-gray-400 font-medium">Alıcı Üyelik Komisyonu</span>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 max-w-7xl mx-auto px-6" id="nasil-calisir">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-white mb-4">
            3 Adımda Dijital Tedarik Yönetimi
          </h2>
          <p className="text-sm md:text-base text-gray-400">
            Tüm kurumsal satın alma süreçlerinizi şeffaflaştırın, pazarlık gücünüzü en üst seviyeye çıkarın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-8 rounded-2xl bg-card border border-white/5 flex flex-col gap-4 text-left group hover:border-accent/20 transition-all duration-300">
            <div className="absolute top-6 right-6 font-heading font-black text-5xl text-white/[0.02] group-hover:text-accent/[0.05] transition-all">01</div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg">
              <i className="fa-solid fa-file-signature"></i>
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Talebinizi İletin</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Malzeme cinsi, miktar, teslimat konumu ve şartname dosyalarınızı girerek canlı ihale ilanınızı saniyeler içinde oluşturun.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl bg-card border border-white/5 flex flex-col gap-4 text-left group hover:border-accent/20 transition-all duration-300">
            <div className="absolute top-6 right-6 font-heading font-black text-5xl text-white/[0.02] group-hover:text-accent/[0.05] transition-all">02</div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg">
              <i className="fa-solid fa-gavel"></i>
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Canlı Rekabeti İzleyin</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tedarikçilerin birbirlerinin fiyatlarının altına inerek fiyat düşürdüğü tersine ihale sürecini anlık takip edin.
            </p>
          </div>

          <div className="relative p-8 rounded-2xl bg-card border border-white/5 flex flex-col gap-4 text-left group hover:border-accent/20 transition-all duration-300">
            <div className="absolute top-6 right-6 font-heading font-black text-5xl text-white/[0.02] group-hover:text-accent/[0.05] transition-all">03</div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-lg">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Güvenle Anlaşın</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              En rekabetçi teklifi seçin. Ödemenizi güvenli havuz hesabımıza yapıp tedariği sıfır riskle başlatın.
            </p>
          </div>
        </div>
      </section>

      {/* Sectors Grid */}
      <section className="py-12 bg-card/20 border-y border-white/5" id="sektorler">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-white mb-4">
              Faaliyet Gösterilen Ana Sektörler
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              İhale arenasında her türlü sektöre özel genel çerçevede alım ve satım yapabilirsiniz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((s, idx) => (
              <div 
                key={idx} 
                onClick={enterPortal}
                className="p-8 rounded-2xl bg-[#11141c] border border-white/5 hover:border-accent/20 cursor-pointer flex flex-col gap-3 text-left hover:-translate-y-1 transition-all duration-300 shadow-premium"
              >
                <i className={`fa-solid ${s.icon} text-2xl text-accent mb-2`}></i>
                <h3 className="font-heading font-bold text-lg text-white">{s.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="py-24 max-w-4xl mx-auto px-6" id="faq">
        <div className="text-center mb-16">
          <h2 className="font-heading font-black text-3xl md:text-4xl tracking-tight text-white mb-4">
            Sıkça Sorulan Sorular
          </h2>
          <p className="text-sm text-gray-400">
            Platformumuz ve tersine ihale süreci hakkında merak edilen konular.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div 
                key={index} 
                className="rounded-xl border border-white/5 bg-card overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left font-heading font-bold text-sm md:text-base text-white hover:bg-white/[0.01] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-accent bg-accent/5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                  </span>
                </button>
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 text-xs md:text-sm text-gray-400 leading-relaxed ${isOpen ? 'py-5 border-t border-white/5 max-h-48' : 'max-h-0'}`}
                >
                  {faq.a}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-white/5 py-12 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-heading font-black text-black text-sm">
              GA
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">
              gelanla<span className="text-accent">salim</span>
            </span>
          </div>
          <p className="text-xs text-gray-500">B2B Canlı Tedarik ve Tersine İhale Arenası © 2026</p>
          <div className="flex items-center gap-8 text-xs text-gray-400">
            <a href="/portal.html" className="hover:text-accent transition-colors">İhale Arenası</a>
            <a href="/portal.html#/uyelik" className="hover:text-accent transition-colors">Üyelik Oluştur</a>
            <a href="/portal.html#/ilan-ver" className="hover:text-accent transition-colors">İhale İlanı Aç</a>
          </div>
        </div>
      </footer>

      {/* YÜZEN EYLEM ELEMANLARI (WhatsApp & Yapay Zeka Chatbot) */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end">
        
        {/* WhatsApp Yüzen Butonu */}
        <motion.a 
          href="https://wa.me/905555555555?text=Merhaba,%20B2B%20%C4%B0hale%20Platformu%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white text-2xl shadow-premium relative group"
        >
          <i className="fa-brands fa-whatsapp"></i>
          {/* Tooltip */}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 font-medium">
            WhatsApp Destek
          </span>
        </motion.a>

        {/* Yapay Zeka Chatbot Butonu */}
        <motion.button 
          onClick={() => setShowChat(!showChat)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="w-14 h-14 rounded-full bg-accent hover:bg-accent/90 flex items-center justify-center text-black text-2xl shadow-premium relative group"
        >
          {showChat ? <i className="fa-solid fa-xmark"></i> : <i className="fa-solid fa-robot"></i>}
          {/* Message notification bubble */}
          {!showChat && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center pulse-dot">
              1
            </span>
          )}
          <span className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 font-medium">
            Yapay Zeka Destek
          </span>
        </motion.button>

        {/* Chatbot Sohbet Penceresi */}
        <AnimatePresence>
          {showChat && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              className="w-80 md:w-96 h-[460px] bg-card/95 border border-white/10 rounded-2xl shadow-premium backdrop-blur-lg flex flex-col overflow-hidden text-left"
            >
              {/* Chat Header */}
              <div className="bg-[#191c26] px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-black font-black text-sm">
                    GA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">Yapay Zeka Destek Asistanı</h4>
                    <span className="text-[9px] text-success font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success pulse-dot"></span> Online / Canlı Destek
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 font-sans text-xs">
                {messages.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                      m.sender === 'user' 
                        ? 'bg-accent text-black font-semibold self-end rounded-tr-none' 
                        : 'bg-white/5 border border-white/5 text-gray-300 self-start rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Suggestion Questions */}
              <div className="px-4 py-2 flex flex-wrap gap-2 border-t border-white/5 bg-black/20">
                <button 
                  onClick={() => handleSendChat("Güvenli Havuz nedir?")}
                  className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-gray-300"
                >
                  🔒 Havuz Nedir?
                </button>
                <button 
                  onClick={() => handleSendChat("Nasıl üye olurum?")}
                  className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-gray-300"
                >
                  🚀 Nasıl Üye Olunur?
                </button>
                <button 
                  onClick={() => handleSendChat("Nasıl ihale ilanı açarım?")}
                  className="text-[10px] bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-full text-gray-300"
                >
                  ➕ İhale Açmak
                </button>
              </div>

              {/* Chat Input */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                className="p-3 bg-[#11141c] border-t border-white/5 flex gap-2"
              >
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Sorunuzu buraya yazın..."
                  className="flex-1 bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-accent/40"
                />
                <button 
                  type="submit" 
                  className="w-8 h-8 rounded-lg bg-accent text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                >
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
