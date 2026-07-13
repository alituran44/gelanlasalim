// gelanlasalim.com - Üçlü Rol Paneli İstemci Kodları
const API_URL = window.location.origin;
let socket = null;

// Durum Yönetimi
let currentRole = 'buyer'; // 'buyer', 'seller', 'admin'
let userToken = null;
let activeCompany = null; // Satıcı ise firma bilgileri
let currentTenderId = null;
let currentTenderBids = [];
let allCategories = [];

// Sayfa Yüklendiğinde Başlat
window.onload = async () => {
    initWebSocket();
    await fetchCategories();
    // İlk rol olarak Alıcıyı başlat
    await switchRole('buyer');
};

// WebSocket Bağlantısı
function initWebSocket() {
    socket = io(API_URL);

    socket.on('connect', () => {
        const dot = document.getElementById('statusDot');
        const txt = document.getElementById('statusText');
        dot.className = 'status-indicator online';
        txt.innerText = 'Canlı Bağlantı Aktif';
    });

    socket.on('disconnect', () => {
        const dot = document.getElementById('statusDot');
        const txt = document.getElementById('statusText');
        dot.className = 'status-indicator';
        txt.innerText = 'Bağlantı Kesildi';
    });

    // Canlı Teklif Alındığında
    socket.on('new_bid', (bid) => {
        if (currentTenderId === bid.tender_id) {
            // Eğer modal açıksa listeyi güncelle ve parlat
            addBidToModalLadder(bid, true);
        }
        // İlgili rollerin ihale listelerini de yenile
        refreshActiveRoleData();
    });

    // İhale Durumu Değiştiğinde
    socket.on('tender_status_changed', (data) => {
        if (currentTenderId === data.tender_id) {
            updateModalStatusUI(data.status, data.winning_bid_id);
        }
        refreshActiveRoleData();
    });
}

// ---------------------------------------------------------
// ROL VE SEKME GEÇİŞLERİ
// ---------------------------------------------------------
async function switchRole(role) {
    currentRole = role;
    
    // Navigasyon sınıflarını güncelle
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    if (role === 'buyer') document.getElementById('tabBuyer').classList.add('active');
    if (role === 'seller') document.getElementById('tabSeller').classList.add('active');
    if (role === 'admin') document.getElementById('tabAdmin').classList.add('active');

    // Panelleri göster/gizle
    document.querySelectorAll('.role-panel').forEach(p => p.classList.add('hidden'));
    
    // Otomatik Kimlik Doğrulama ve Raporlama
    try {
        if (role === 'buyer') {
            document.getElementById('panelBuyer').classList.remove('hidden');
            userToken = await authenticateMockUser('müteahhit_test@gelanlasalim.com', 'buyer', 'Ahmet', 'Yılmaz', '05551112233');
            await loadBuyerPanel();
        } else if (role === 'seller') {
            document.getElementById('panelSeller').classList.remove('hidden');
            userToken = await authenticateMockUser('beta_beton_test@gelanlasalim.com', 'seller', 'Mehmet', 'Kaya', '05559998877');
            await loadSellerPanel();
        } else if (role === 'admin') {
            document.getElementById('panelAdmin').classList.remove('hidden');
            userToken = await authenticateMockUser('admin_test@gelanlasalim.com', 'admin', 'Sistem', 'Yöneticisi', '05550000000');
            await loadAdminPanel();
        }
    } catch (err) {
        console.error('Kimlik doğrulama hatası:', err);
    }
}

// Rollere göre anlık listeleri yenileme yardımcısı
function refreshActiveRoleData() {
    if (currentRole === 'buyer') loadBuyerPanel();
    if (currentRole === 'seller') loadSellerPanel();
    if (currentRole === 'admin') loadAdminPanel();
}

// Mock Kullanıcı Kayıt/Giriş Entegrasyonu
async function authenticateMockUser(email, role, firstName, lastName, phone) {
    try {
        // Önce kaydolmayı dene
        await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email, password: 'TestPassword123!', first_name: firstName, last_name: lastName, phone, role
            })
        });
    } catch (e) {}

    // Giriş yap ve token al
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'TestPassword123!' })
    });
    const data = await res.json();
    return data.token;
}

// ---------------------------------------------------------
// ALICI (MÜTEAHHİT) PANELİ FONKSİYONLARI
// ---------------------------------------------------------
async function loadBuyerPanel() {
    // Kategori listesini ihale formuna bağla
    const select = document.getElementById('buyerTenderCategory');
    select.innerHTML = allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

    // Form tarih alanlarını ön tanımlı doldur (Test kolaylığı)
    const now = new Date();
    const futureDelivery = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const futureExpiry = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    document.getElementById('buyerTenderDelivery').value = futureDelivery.toISOString().slice(0, 16);
    document.getElementById('buyerTenderExpiry').value = futureExpiry.toISOString().slice(0, 16);

    // Alıcının kendi ihalelerini getir
    try {
        const res = await fetch(`${API_URL}/api/tenders?status=open`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await res.json();
        
        // Alıcının kendi ihalelerini filtrele
        const myTenders = data.tenders; // Test kolaylığı için tüm açık ihaleleri gösterelim
        
        document.getElementById('buyerTenderCount').innerText = `${myTenders.length} Aktif`;
        
        const listDiv = document.getElementById('buyerTendersList');
        if (myTenders.length === 0) {
            listDiv.innerHTML = `<div class="empty-feed">Henüz yayınladığınız ihale ilanı yok. Soldaki formdan ilk ilanınızı açabilirsiniz.</div>`;
            return;
        }

        listDiv.innerHTML = myTenders.map(t => renderTenderCard(t)).join('');
    } catch (err) {
        console.error('Alıcı ihaleleri yüklenemedi:', err);
    }
}

// Yeni İhale Oluşturma Form Gönderimi
document.getElementById('formCreateTender').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
        title: document.getElementById('buyerTenderTitle').value,
        category_id: parseInt(document.getElementById('buyerTenderCategory').value),
        quantity: parseFloat(document.getElementById('buyerTenderQuantity').value),
        unit: document.getElementById('buyerTenderUnit').value,
        city: document.getElementById('buyerTenderCity').value,
        district: document.getElementById('buyerTenderDistrict').value,
        delivery_address: document.getElementById('buyerTenderAddress').value,
        delivery_date: new Date(document.getElementById('buyerTenderDelivery').value).toISOString(),
        expires_at: new Date(document.getElementById('buyerTenderExpiry').value).toISOString(),
        description: document.getElementById('buyerTenderDesc').value
    };

    try {
        const res = await fetch(`${API_URL}/api/tenders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        alert('İhale ilanı başarıyla yayınlandı ve WebSocket canlı odası kuruldu.');
        document.getElementById('formCreateTender').reset();
        await loadBuyerPanel();
    } catch (err) {
        alert('İhale Açma Hatası: ' + err.message);
    }
});

// ---------------------------------------------------------
// FİRMA (SATICI) PANELİ FONKSİYONLARI
// ---------------------------------------------------------
async function loadSellerPanel() {
    // 1. Firma Profilini Getir veya Otomatik Oluştur
    try {
        const resProfile = await fetch(`${API_URL}/api/companies/profile`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        
        if (resProfile.status === 404) {
            // Firma profili yoksa otomatik oluştur (Test kolaylığı)
            const createRes = await fetch(`${API_URL}/api/companies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    name: 'Beta Hazır Beton A.Ş.',
                    tax_number: '9876543210',
                    tax_office: 'İstanbul Büyük Mükellefler V.D.',
                    address: 'Tuzla Organize Sanayi Bölgesi 2. Yol No: 12',
                    city: 'İstanbul',
                    district: 'Tuzla',
                    logo_url: ''
                })
            });
            const createData = await createRes.json();
            activeCompany = createData.company;
        } else {
            const dataProfile = await resProfile.json();
            activeCompany = dataProfile.company;
        }

        // Firma Bilgi Kartını Doldur
        renderSellerProfileCard();

        // Kategori Checkbox Listesini Çiz
        renderSellerCategorySelection();

        // Hizmet Bölgelerini Çiz
        await fetchAndRenderSellerRegions();

        // Eşleşen Canlı İhaleleri Listele
        await fetchMatchedTendersForSeller();

    } catch (err) {
        console.error('Satıcı paneli yükleme hatası:', err);
    }
}

// Satıcı Bilgi Kartını Çiz
function renderSellerProfileCard() {
    const card = document.getElementById('sellerProfileStatus');
    const verifyBadge = activeCompany.is_verified 
        ? '<span class="status-value verified">Doğrulanmış</span>' 
        : '<span class="status-value pending">Onay Bekliyor</span>';
    
    card.innerHTML = `
        <div class="status-row">
            <span>Firma Adı:</span>
            <span class="status-value">${activeCompany.name}</span>
        </div>
        <div class="status-row">
            <span>Doğrulama Statüsü:</span>
            ${verifyBadge}
        </div>
        <div class="status-row">
            <span>Aylık Teklif Limiti:</span>
            <span class="status-value">${activeCompany.monthly_bid_limit}</span>
        </div>
        <div class="status-row">
            <span>Kullanılan Teklif:</span>
            <span class="status-value">${activeCompany.bid_count_this_month} / ${activeCompany.monthly_bid_limit}</span>
        </div>
    `;
}

// Satıcı Kategorileri Seçim Alanı
function renderSellerCategorySelection() {
    const container = document.getElementById('sellerCategoriesList');
    // Şimdilik test için firmaya otomatik beton kategorisi atayalım
    container.innerHTML = allCategories.map(cat => `
        <label class="checkbox-label">
            <input type="checkbox" name="sellerCat" value="${cat.id}" id="cat-check-${cat.id}">
            ${cat.name}
        </label>
    `).join('');

    // Firmaya ait mevcut faaliyet alanlarını çekip işaretleyelim
    // Demo kolaylığı için: Satıcı paneli açıldığında default beton seçili gelsin
    const checkBeton = document.getElementById(`cat-check-1`);
    if (checkBeton) checkBeton.checked = true;
}

// Kategorileri Veritabanına Kaydet
async function saveSellerCategories() {
    const checked = Array.from(document.querySelectorAll('input[name="sellerCat"]:checked')).map(el => parseInt(el.value));
    try {
        const res = await fetch(`${API_URL}/api/companies/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ category_ids: checked })
        });
        if (res.ok) {
            alert('Faaliyet kategorileri başarıyla güncellendi.');
            await fetchMatchedTendersForSeller();
        }
    } catch (e) {
        alert('Kategori kaydetme hatası');
    }
}

// Hizmet Bölgelerini Çek ve Çiz
async function fetchAndRenderSellerRegions() {
    try {
        const res = await fetch(`${API_URL}/api/companies/regions`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await res.json();
        
        const container = document.getElementById('sellerRegionsContainer');
        if (data.regions.length === 0) {
            // Test kolaylığı için ilk bölgeyi (İstanbul) otomatik ekleyelim
            await fetch(`${API_URL}/api/companies/regions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ city: 'İstanbul', district: '' })
            });
            return fetchAndRenderSellerRegions();
        }

        container.innerHTML = data.regions.map(r => `
            <span class="region-chip">
                ${r.city} ${r.district ? `(${r.district})` : '(Tümü)'}
                <button onclick="deleteSellerRegion(${r.id})">×</button>
            </span>
        `).join('');
    } catch (e) {
        console.error('Bölgeler çekilemedi:', e);
    }
}

// Hizmet Bölgesi Ekle
async function addSellerRegion() {
    const city = document.getElementById('sellerRegionCity').value;
    const district = document.getElementById('sellerRegionDistrict').value;
    if (!city) return alert('Lütfen şehir girin.');

    try {
        const res = await fetch(`${API_URL}/api/companies/regions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ city, district })
        });
        if (res.ok) {
            document.getElementById('sellerRegionCity').value = '';
            document.getElementById('sellerRegionDistrict').value = '';
            await fetchAndRenderSellerRegions();
            await fetchMatchedTendersForSeller();
        }
    } catch (e) {
        alert('Bölge ekleme hatası');
    }
}

// Hizmet Bölgesi Sil
async function deleteSellerRegion(id) {
    try {
        await fetch(`${API_URL}/api/companies/regions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        await fetchAndRenderSellerRegions();
        await fetchMatchedTendersForSeller();
    } catch (e) {
        alert('Bölge silinemedi');
    }
}

// Satıcı için Eşleşen İhaleleri Filtrele ve Getir
async function fetchMatchedTendersForSeller() {
    try {
        // Bütün açık ihaleleri getir
        const resTenders = await fetch(`${API_URL}/api/tenders?status=open`);
        const dataTenders = await resTenders.json();

        // Firmanın faaliyet kategorilerini ve hizmet bölgelerini al
        // Client-side filtreleme (Matching) yaparak sadece eşleşenleri sunalım
        const checkedCats = Array.from(document.querySelectorAll('input[name="sellerCat"]:checked')).map(el => parseInt(el.value));
        
        const resRegions = await fetch(`${API_URL}/api/companies/regions`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const dataRegions = await resRegions.json();
        const cities = dataRegions.regions.map(r => r.city.toLowerCase());

        // Filtreleme
        const matched = dataTenders.tenders.filter(t => {
            const catMatch = checkedCats.includes(t.category_id);
            const cityMatch = cities.includes(t.city.toLowerCase());
            return catMatch && cityMatch;
        });

        document.getElementById('sellerMatchedCount').innerText = `${matched.length} Eşleşen`;

        const feed = document.getElementById('sellerMatchedTenders');
        if (matched.length === 0) {
            feed.innerHTML = `<div class="empty-feed">Hizmet kategorileriniz veya hizmet bölgelerinizle eşleşen aktif ihale bulunmuyor. Sol taraftan ayarlarınızı genişletebilirsiniz.</div>`;
            return;
        }

        feed.innerHTML = matched.map(t => renderTenderCard(t)).join('');
    } catch (e) {
        console.error('Eşleşen ihaleler çekilemedi:', e);
    }
}

// ---------------------------------------------------------
// YÖNETİM (ADMIN) PANELİ FONKSİYONLARI
// ---------------------------------------------------------
async function loadAdminPanel() {
    // 1. Finansal İstatistikleri Getir
    try {
        const resStats = await fetch(`${API_URL}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const dataStats = await resStats.json();
        const s = dataStats.stats;

        document.getElementById('adminStatVolume').innerText = `${Number(s.total_volume).toLocaleString('tr-TR')} TL`;
        document.getElementById('adminStatCommission').innerText = `${Number(s.commission).toLocaleString('tr-TR')} TL`;
        document.getElementById('adminStatEscrow').innerText = `${Number(s.active_escrow).toLocaleString('tr-TR')} TL`;

        // 2. Firma Doğrulama Taleplerini Getir
        const resCompanies = await fetch(`${API_URL}/api/companies`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const dataComp = await resCompanies.json();
        
        // Sadece doğrulanmamış firmaları filtrele (Doğrulama Kuyruğu)
        const unverified = dataComp.companies.filter(c => !c.is_verified);
        
        const queueDiv = document.getElementById('adminVerificationQueue');
        if (unverified.length === 0) {
            queueDiv.innerHTML = `<div class="empty-feed">Onay bekleyen firma belgesi bulunmamaktadır. Tüm firmalar güncel.</div>`;
        } else {
            queueDiv.innerHTML = unverified.map(c => `
                <div class="queue-item">
                    <div class="queue-item-header">
                        <h4>${c.name}</h4>
                        <span class="badge-count">Vergi No: ${c.tax_number}</span>
                    </div>
                    <p>Konum: ${c.city}, ${c.district} • Yetkili E-posta: ${c.user_email}</p>
                    <div class="queue-actions">
                        <button class="btn-small-approve" onclick="verifyCompany('${c.id}', true)">Onayla</button>
                        <button class="btn-small-reject" onclick="verifyCompany('${c.id}', false)">Reddet</button>
                    </div>
                </div>
            `).join('');
        }

        // 3. Tüm İhaleleri Getir (Moderasyon)
        const resTenders = await fetch(`${API_URL}/api/tenders?status=open`);
        const dataTenders = await resTenders.json();
        
        const modDiv = document.getElementById('adminTendersList');
        if (dataTenders.tenders.length === 0) {
            modDiv.innerHTML = `<div class="empty-feed">Denetlenecek aktif ihale bulunmuyor.</div>`;
        } else {
            modDiv.innerHTML = dataTenders.tenders.map(t => `
                <div class="queue-item" style="margin-bottom: var(--sp-12);">
                    <div class="queue-item-header">
                        <h4>${t.title}</h4>
                        <span class="stat-badge open">AÇIK</span>
                    </div>
                    <p>Konum: ${t.city} • Miktar: ${t.quantity} ${t.unit} • Oluşturan ID: ${t.buyer_id}</p>
                    <div class="queue-actions">
                        <button class="btn-small-reject" onclick="cancelTenderByAdmin('${t.id}')">Yayından Kaldır (İptal)</button>
                    </div>
                </div>
            `).join('');
        }

    } catch (err) {
        console.error('Yönetici paneli yükleme hatası:', err);
    }
}

// Firmayı Onayla veya Reddet
async function verifyCompany(companyId, status) {
    try {
        const res = await fetch(`${API_URL}/api/companies/${companyId}/verify`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ is_verified: status })
        });
        if (res.ok) {
            alert(`Firma başarıyla ${status ? 'onaylandı' : 'reddedildi'}.`);
            await loadAdminPanel();
        }
    } catch (e) {
        alert('Firma durum güncelleme hatası');
    }
}

// İhaleyi İptal Et (Admin Yetkisiyle)
async function cancelTenderByAdmin(tenderId) {
    if (!confirm('Bu ihaleyi yayından kaldırmak ve iptal etmek istediğinize emin misiniz?')) return;
    try {
        const res = await fetch(`${API_URL}/api/tenders/${tenderId}/cancel`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        if (res.ok) {
            alert('İhale yayından kaldırıldı ve iptal statüsüne alındı.');
            await loadAdminPanel();
        }
    } catch (e) {
        alert('İhale iptal hatası');
    }
}

// ---------------------------------------------------------
// ORTAK CANLI ARENA MODAL (WebSocket Entegrasyonlu Görünüm)
// ---------------------------------------------------------
async function openArenaModal(tenderId) {
    if (socket && currentTenderId) {
        socket.emit('leave_tender', currentTenderId);
    }
    
    currentTenderId = tenderId;
    document.getElementById('arenaModal').classList.remove('hidden');

    try {
        // İhale detaylarını ve mevcut teklifleri API'den çek
        const res = await fetch(`${API_URL}/api/tenders/${tenderId}`);
        const data = await res.json();
        const t = data.tender;
        currentTenderBids = data.bids || [];

        // Başlıkları Doldur
        document.getElementById('modalCategory').innerText = t.category_name;
        document.getElementById('modalTitle').innerText = t.title;
        document.getElementById('modalQtyVal').innerText = `${t.quantity} ${t.unit}`;
        document.getElementById('modalLocVal').innerText = `${t.city}, ${t.district}`;
        document.getElementById('modalDesc').innerText = t.description;
        document.getElementById('modalAddressVal').innerText = t.delivery_address;

        updateModalStatusUI(t.status, t.winning_bid_id);
        startModalCountdown(t.expires_at);
        renderModalBidLadder();

        // WebSocket odasına katıl
        if (socket) {
            socket.emit('join_tender', tenderId);
        }

    } catch (e) {
        console.error('Arena detayları yüklenemedi:', e);
    }
}

function closeArenaModal() {
    if (socket && currentTenderId) {
        socket.emit('leave_tender', currentTenderId);
    }
    currentTenderId = null;
    document.getElementById('arenaModal').classList.add('hidden');
    if (modalCountdownInterval) clearInterval(modalCountdownInterval);
    refreshActiveRoleData();
}

// Modal Kalan Süre Sayacı
let modalCountdownInterval = null;
function startModalCountdown(expiryStr) {
    if (modalCountdownInterval) clearInterval(modalCountdownInterval);
    const expiry = new Date(expiryStr).getTime();
    
    const run = () => {
        const now = new Date().getTime();
        const diff = expiry - now;
        const display = document.getElementById('modalCountdownVal');

        if (diff <= 0) {
            display.innerText = 'SÜRE DOLDU';
            display.className = 'meta-value danger';
            clearInterval(modalCountdownInterval);
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        display.innerText = `${days}g ${hours}s ${minutes}d ${seconds}sn`;
        display.className = 'meta-value warning';
    };

    run();
    modalCountdownInterval = setInterval(run, 1000);
}

// Modal Statü ve İşlem Alanı Güncellemeleri
function updateModalStatusUI(status, winningBidId = null) {
    const statusBadge = document.getElementById('modalStatus');
    statusBadge.className = `badge-status ${status}`;
    
    if (status === 'open') {
        statusBadge.innerText = 'Canlı / Teklife Açık';
        
        // Satıcı teklif formunu yetkiye göre göster
        if (currentRole === 'seller') {
            document.getElementById('actionSellerSubmit').classList.remove('hidden');
        } else {
            document.getElementById('actionSellerSubmit').classList.add('hidden');
        }
        document.getElementById('actionBuyerManage').classList.add('hidden');

    } else if (status === 'awarded') {
        statusBadge.innerText = 'Kazanan Belirlendi';
        document.getElementById('actionSellerSubmit').classList.add('hidden');
        
        // Alıcıya özel Escrow Durumunu Göster
        document.getElementById('actionBuyerManage').classList.remove('hidden');
        renderEscrowManagementUI(winningBidId);

    } else if (status === 'cancelled') {
        statusBadge.innerText = 'İptal Edildi';
        document.getElementById('actionSellerSubmit').classList.add('hidden');
        document.getElementById('actionBuyerManage').classList.add('hidden');
    }
}

// Escrow Ödeme ve Puanlama Panelini Çiz
function renderEscrowManagementUI(winningBidId) {
    const container = document.getElementById('buyerEscrowStatus');
    
    // Kazanan teklif detayını al
    const winningBid = currentTenderBids.find(b => b.id === winningBidId);
    const priceText = winningBid ? `${Number(winningBid.price).toLocaleString('tr-TR')} TL` : 'Fiyat Belirsiz';

    container.innerHTML = `
        <div class="escrow-step completed">
            <div class="escrow-title">İhale Kazananı Belirlendi</div>
            <div class="escrow-desc">Kazanan Teklif Bedeli: ${priceText}</div>
        </div>
        <div class="escrow-step active" id="escrowPayStep">
            <div class="escrow-title">Havuz Ödemesi Simülasyonu</div>
            <div class="escrow-desc">Para alıcı tarafından havuz hesabına yatırılır.</div>
            <button class="secondary-btn mt-8" onclick="simulateEscrowPayment()">Ödemeyi Yap</button>
        </div>
        <div class="star-rating-box hidden" id="escrowRatingStep">
            <label>Tedarikçi Firmaya Puan Verin</label>
            <div class="stars">
                <button class="star-btn" onclick="rateCompany(1)"><svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></button>
                <button class="star-btn" onclick="rateCompany(2)"><svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></button>
                <button class="star-btn" onclick="rateCompany(3)"><svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></button>
                <button class="star-btn" onclick="rateCompany(4)"><svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></button>
                <button class="star-btn" onclick="rateCompany(5)"><svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg></button>
            </div>
        </div>
    `;
}

// Simüle Escrow Ödemesi Yap
function simulateEscrowPayment() {
    alert('Simüle ödeme başarıyla güvenli havuz hesabına aktarıldı. Tedarik süreci başladı.');
    const payStep = document.getElementById('escrowPayStep');
    payStep.className = 'escrow-step completed';
    payStep.querySelector('button').classList.add('hidden');
    
    // Puanlama adımını aktifleştir
    document.getElementById('escrowRatingStep').classList.remove('hidden');
}

// Firmaya Yıldız Puan Verme
function rateCompany(stars) {
    // Yıldız sınıflarını güncelle
    const starBtns = document.querySelectorAll('.star-btn');
    starBtns.forEach((btn, index) => {
        if (index < stars) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    alert(`Firma ${stars} Yıldız ile puanlandı. Geri bildiriminiz için teşekkür ederiz.`);
}

// Modal Teklif Listesini Çiz
function renderModalBidLadder() {
    const container = document.getElementById('modalBidLadder');
    document.getElementById('modalBidCount').innerText = `${currentTenderBids.length} Teklif`;

    if (currentTenderBids.length === 0) {
        container.innerHTML = `<div class="empty-ladder">Henüz teklif verilmedi. İlk teklifi siz verin!</div>`;
        return;
    }

    container.innerHTML = currentTenderBids.map((b, index) => {
        const rank = index + 1;
        const initial = b.company_name ? b.company_name.charAt(0) : 'F';
        
        let statusBadge = '';
        if (b.status === 'won') statusBadge = '<span class="badge-won">KAZANDI</span>';
        if (b.status === 'lost') statusBadge = '<span class="badge-lost">ELENDİ</span>';

        // Alıcı için kazanan belirleme butonu
        let awardBtn = '';
        const tenderStatus = document.getElementById('modalStatus').className;
        if (currentRole === 'buyer' && !tenderStatus.includes('awarded') && !tenderStatus.includes('cancelled')) {
            awardBtn = `<button class="award-btn" onclick="awardTenderFromModal('${b.id}')">Kazanan Belirle</button>`;
        }

        return `
            <div class="bid-card" id="modal-bid-${b.id}">
                <div class="bid-card-left">
                    <div class="bid-position">${rank}</div>
                    <div class="company-initial">${initial}</div>
                    <div class="bid-info">
                        <span class="bid-company-name">${b.company_name || 'Gizli Firma'}</span>
                        <span class="bid-row-meta">${b.delivery_lead_time_days} günde teslimat • ${b.note || 'Not yok'}</span>
                    </div>
                </div>
                <div class="bid-card-right">
                    <div>
                        <span class="bid-amount">${Number(b.price).toLocaleString('tr-TR')} TL</span>
                        <span class="bid-tax-lbl">${b.tax_included ? 'KDV Dahil' : 'KDV Hariç'}</span>
                    </div>
                    ${statusBadge}
                    ${awardBtn}
                </div>
            </div>
        `;
    }).join('');
}

// WebSocket üzerinden canlı teklif ekleme/sıralama
function addBidToModalLadder(newBid, flash = false) {
    const existingIndex = currentTenderBids.findIndex(b => b.id === newBid.id);
    if (existingIndex > -1) {
        currentTenderBids[existingIndex] = newBid;
    } else {
        currentTenderBids.push(newBid);
    }

    // Fiyata göre sırala (en düşük en üstte)
    currentTenderBids.sort((a, b) => Number(a.price) - Number(b.price));

    renderModalBidLadder();

    if (flash) {
        const card = document.getElementById(`modal-bid-${newBid.id}`);
        if (card) {
            card.classList.add('new-flash');
            setTimeout(() => card.classList.remove('new-flash'), 1500);
        }
    }
}

// Modal İçinden İhaleyi Onaylama (Alıcı)
async function awardTenderFromModal(bidId) {
    if (!confirm('Bu teklifi onaylamak ve ihaleyi sonuçlandırmak istediğinize emin misiniz?')) return;

    try {
        const res = await fetch(`${API_URL}/api/tenders/${currentTenderId}/award`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ winning_bid_id: bidId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        alert('İhale onaylandı! Havuz ödemesi aşamasına geçilmiştir.');
        await openArenaModal(currentTenderId); // Ekranı tazele
    } catch (err) {
        alert('Hata: ' + err.message);
    }
}

// Satıcı Teklif Gönderme Formu
document.getElementById('formSubmitBid').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!userToken || !currentTenderId) return;

    const body = {
        price: parseFloat(document.getElementById('bidPriceInput').value),
        delivery_lead_time_days: parseInt(document.getElementById('bidLeadTimeInput').value),
        tax_included: document.getElementById('bidTaxInput').value === 'true',
        note: document.getElementById('bidNoteInput').value
    };

    try {
        const res = await fetch(`${API_URL}/api/bids/tenders/${currentTenderId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        document.getElementById('formSubmitBid').reset();
    } catch (err) {
        alert('Teklif Hata: ' + err.message);
    }
});

// ---------------------------------------------------------
// YARDIMCI GÖRSEL BİLEŞENLER
// ---------------------------------------------------------

// Kategori ve İlanları Çekme Yardımcıları
async function fetchCategories() {
    try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        allCategories = data.categories;
    } catch (e) {
        console.error('Kategoriler çekilemedi:', e);
    }
}

// İhale kartı HTML render yardımı
function renderTenderCard(t) {
    const formattedDate = new Date(t.expires_at).toLocaleDateString('tr-TR', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    return `
        <div class="tender-card" onclick="openArenaModal('${t.id}')">
            <div class="tender-card-header">
                <h3>${t.title}</h3>
                <span class="cat-badge">${t.category_name}</span>
            </div>
            <div class="tender-card-details">
                <div class="tender-card-meta">
                    <span>Miktar: <strong>${t.quantity} ${t.unit}</strong></span>
                    <span>Konum: <strong>${t.city}, ${t.district}</strong></span>
                </div>
                <div class="tender-card-right">
                    <span class="stat-badge open">Canlı</span>
                    <span style="color: var(--clr-warning); font-size: 11px; margin-top: 4px; display: block;">
                        Kapanış: ${formattedDate}
                    </span>
                </div>
            </div>
        </div>
    `;
}
