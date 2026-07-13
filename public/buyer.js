const API_URL = window.location.origin;
let socket;
let userToken = localStorage.getItem('buyer_token');
let userData = JSON.parse(localStorage.getItem('buyer_user') || '{}');
let allCategories = [];
let currentTenderId = null;
let modalCountdownInterval = null;

// Sayfa Yüklendiğinde
window.onload = async () => {
    initWebSocket();
    await fetchCategories();
    checkAuth();
};

// WebSocket Kurulumu
function initWebSocket() {
    socket = io();
    socket.on('connect', () => {
        console.log('🔌 WebSocket bağlandı.');
    });
    
    // Canlı yeni teklif geldiğinde
    socket.on('new_bid', (data) => {
        if (currentTenderId && data.tender_id === currentTenderId) {
            fetchTenderDetails(currentTenderId);
            // Kartı yeşil flaşlat
            const ladder = document.getElementById('modalBidLadder');
            if (ladder) {
                ladder.classList.add('flash-success');
                setTimeout(() => ladder.classList.remove('flash-success'), 1000);
            }
        }
    });

    // İhale statüsü değiştiğinde
    socket.on('tender_status_changed', (data) => {
        if (currentTenderId && data.tender_id === currentTenderId) {
            fetchTenderDetails(currentTenderId);
        }
        if (userToken) {
            loadBuyerPanel();
        }
    });
}

// Kategorileri Çek
async function fetchCategories() {
    try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        allCategories = data.categories || [];
        const select = document.getElementById('buyerTenderCategory');
        if (select) {
            select.innerHTML = allCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        }
    } catch (e) {
        console.error('Kategoriler çekilemedi:', e);
    }
}

// Yetkilendirme Kontrolü
function checkAuth() {
    if (userToken) {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('dashboardContainer').classList.remove('hidden');
        document.getElementById('headerActions').style.display = 'flex';
        document.getElementById('currentUserDisplay').innerText = `Alıcı: ${userData.name} ${userData.surname}`;
        loadBuyerPanel();
    } else {
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('dashboardContainer').classList.add('hidden');
        document.getElementById('headerActions').style.display = 'none';
    }
}

// Giriş/Kayıt Sekmesi Değiştir
function toggleAuthMode(mode) {
    if (mode === 'login') {
        document.getElementById('tabBtnLogin').classList.add('active');
        document.getElementById('tabBtnRegister').classList.remove('active');
        document.getElementById('formLogin').classList.remove('hidden');
        document.getElementById('formRegister').classList.add('hidden');
    } else {
        document.getElementById('tabBtnLogin').classList.remove('active');
        document.getElementById('tabBtnRegister').classList.add('active');
        document.getElementById('formLogin').classList.add('hidden');
        document.getElementById('formRegister').classList.remove('hidden');
    }
}

// Giriş Yap
document.getElementById('formLogin').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Giriş yapılamadı.');

        userToken = data.token;
        userData = data.user;
        localStorage.setItem('buyer_token', userToken);
        localStorage.setItem('buyer_user', JSON.stringify(userData));
        checkAuth();
    } catch (err) {
        alert(err.message);
    }
};

// Kayıt Ol
document.getElementById('formRegister').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const surname = document.getElementById('regSurname').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const password = document.getElementById('regPassword').value;

    try {
        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: name, last_name: surname, email, phone, password, role: 'buyer' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Kayıt olunamadı.');

        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
        toggleAuthMode('login');
        document.getElementById('loginEmail').value = email;
        document.getElementById('loginPassword').value = '';
    } catch (err) {
        alert(err.message);
    }
};

// Tek Tıkla Demo Giriş
async function quickLogin(role) {
    const email = 'müteahhit_test@gelanlasalim.com';
    const password = 'demo-password';

    try {
        // Önce kayıt dene (varsa hata verir, yoksa oluşturur)
        await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: 'Ahmet',
                last_name: 'Yılmaz',
                email: email,
                phone: '05551112233',
                password: password,
                role: 'buyer'
            })
        });
    } catch(e) {}

    // Giriş yap
    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Demo girişi başarısız.');

        userToken = data.token;
        userData = data.user;
        localStorage.setItem('buyer_token', userToken);
        localStorage.setItem('buyer_user', JSON.stringify(userData));
        checkAuth();
    } catch(err) {
        alert(err.message);
    }
}

// Güvenli Çıkış
function logout() {
    userToken = null;
    userData = {};
    localStorage.removeItem('buyer_token');
    localStorage.removeItem('buyer_user');
    checkAuth();
}

// Alıcı İhalelerini Yükle
async function loadBuyerPanel() {
    try {
        const res = await fetch(`${API_URL}/api/tenders?status=open`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await res.json();
        
        // Alıcının kendi ihalelerini filtrele (Test için tüm açık ihaleleri gösterelim, böylece kolay test edilir)
        const myTenders = data.tenders || [];
        document.getElementById('buyerTenderCount').innerText = `${myTenders.length} Aktif`;

        const listDiv = document.getElementById('buyerTendersList');
        if (myTenders.length === 0) {
            listDiv.innerHTML = `<div class="empty-feed">Yayınladığınız aktif bir ihale bulunmuyor.</div>`;
            return;
        }

        listDiv.innerHTML = myTenders.map(t => {
            return `
                <div class="tender-card" onclick="openArenaModal('${t.id}')">
                    <div class="tender-card-header">
                        <span class="category-badge">${t.category_name || 'B2B İhale'}</span>
                        <span class="status-badge open">Canlı Rekabet</span>
                    </div>
                    <h3 class="tender-title">${t.title}</h3>
                    <div class="tender-meta-grid">
                        <div class="meta-block">
                            <span class="label">Miktar:</span>
                            <span class="value">${t.quantity} ${t.unit}</span>
                        </div>
                        <div class="meta-block">
                            <span class="label">Konum:</span>
                            <span class="value">${t.city}, ${t.district}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Alıcı ihaleleri yüklenemedi:', e);
    }
}

// Yeni İhale İlanı Aç
document.getElementById('formCreateTender').onsubmit = async (e) => {
    e.preventDefault();
    const title = document.getElementById('buyerTenderTitle').value;
    const category_id = document.getElementById('buyerTenderCategory').value;
    const quantity = parseFloat(document.getElementById('buyerTenderQuantity').value);
    const unit = document.getElementById('buyerTenderUnit').value;
    const city = document.getElementById('buyerTenderCity').value;
    const district = document.getElementById('buyerTenderDistrict').value;
    const address = document.getElementById('buyerTenderAddress').value;
    const delivery_date = document.getElementById('buyerTenderDelivery').value;
    const expires_at = document.getElementById('buyerTenderExpiry').value;
    const description = document.getElementById('buyerTenderDesc').value;

    try {
        const res = await fetch(`${API_URL}/api/tenders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                title, category_id, quantity, unit, city, district, address,
                delivery_date, expires_at, description
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'İhale oluşturulamadı.');

        alert('İhale başarıyla yayına alındı! Canlı rekabet başladı.');
        document.getElementById('formCreateTender').reset();
        await fetchCategories(); // Kategorileri sıfırla
        loadBuyerPanel();
    } catch (err) {
        alert(err.message);
    }
};

// Arena Modalı Aç
async function openArenaModal(tenderId) {
    currentTenderId = tenderId;
    document.getElementById('arenaModal').classList.remove('hidden');
    
    // WebSocket odasına katıl
    if (socket) {
        socket.emit('join_tender', tenderId);
    }

    await fetchTenderDetails(tenderId);
}

// Arena Modalı Kapat
function closeArenaModal() {
    if (socket && currentTenderId) {
        socket.emit('leave_tender', currentTenderId);
    }
    currentTenderId = null;
    document.getElementById('arenaModal').classList.add('hidden');
    if (modalCountdownInterval) clearInterval(modalCountdownInterval);
    loadBuyerPanel();
}

// İhale Detaylarını Getir
async function fetchTenderDetails(tenderId) {
    try {
        const res = await fetch(`${API_URL}/api/tenders/${tenderId}`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const data = await res.json();
        const t = data.tender;
        const bids = data.bids || [];

        // Bilgileri yerleştir
        document.getElementById('modalTitle').innerText = t.title;
        document.getElementById('modalCategory').innerText = t.category_name || 'B2B';
        
        const statusBadge = document.getElementById('modalStatus');
        statusBadge.innerText = t.status === 'open' ? 'Canlı Rekabet' : (t.status === 'awarded' ? 'Onaylandı (Escrow)' : t.status.toUpperCase());
        statusBadge.className = `badge-status ${t.status}`;

        document.getElementById('modalQtyVal').innerText = `${t.quantity} ${t.unit}`;
        document.getElementById('modalLocVal').innerText = `${t.city}, ${t.district}`;
        document.getElementById('modalDesc').innerText = t.description;
        document.getElementById('modalAddressVal').innerText = t.address;
        document.getElementById('modalBidCount').innerText = `${bids.length} Teklif`;

        // Kapanış Geri Sayımı
        if (modalCountdownInterval) clearInterval(modalCountdownInterval);
        const updateCountdown = () => {
            const now = new Date().getTime();
            const exp = new Date(t.expires_at).getTime();
            const diff = exp - now;

            if (diff <= 0 || t.status !== 'open') {
                document.getElementById('modalCountdownVal').innerText = 'Süre Doldu';
                document.getElementById('modalCountdownVal').className = 'meta-value error';
                if (modalCountdownInterval) clearInterval(modalCountdownInterval);
            } else {
                const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                document.getElementById('modalCountdownVal').innerText = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                document.getElementById('modalCountdownVal').className = 'meta-value warning';
            }
        };
        updateCountdown();
        if (t.status === 'open') {
            modalCountdownInterval = setInterval(updateCountdown, 1000);
        }

        // Teklif Merdivenini Doldur (En düşük fiyat en üstte)
        const ladderDiv = document.getElementById('modalBidLadder');
        if (bids.length === 0) {
            ladderDiv.innerHTML = `<div class="empty-feed">Henüz teklif verilmedi.</div>`;
        } else {
            ladderDiv.innerHTML = bids.map((b, index) => {
                const isWinner = t.status === 'awarded' && t.winner_bid_id === b.id;
                return `
                    <div class="bid-ladder-item ${index === 0 ? 'best' : ''} ${isWinner ? 'winner-gold' : ''}">
                        <div class="bid-rank">${index + 1}</div>
                        <div class="bid-company-info">
                            <span class="company-name">${b.company_name}</span>
                            <span class="delivery-time">${b.lead_time_days} gün teslimat | ${b.tax_included ? 'KDV Dahil' : 'KDV Hariç'}</span>
                            ${b.note ? `<span class="bid-note">"${b.note}"</span>` : ''}
                        </div>
                        <div class="bid-price-action">
                            <span class="bid-price">${parseFloat(b.price).toLocaleString('tr-TR')} TL</span>
                            ${t.status === 'open' ? `<button class="btn-award" onclick="awardTender('${t.id}', '${b.id}')">Onayla (Escrow)</button>` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Sağ Taraf Alıcı Yönetim Kartı
        const actionBuyerManage = document.getElementById('actionBuyerManage');
        const escrowStatusBox = document.getElementById('buyerEscrowStatus');

        if (t.status === 'open') {
            escrowStatusBox.innerHTML = `
                <div class="escrow-alert info">
                    <span class="escrow-title">İhale Aktif</span>
                    <span class="escrow-desc">Canlı teklifleri sol merdivenden izleyebilir, uygun gördüğünüz teklifi "Onayla (Escrow)" butonuna basarak onaylayabilirsiniz.</span>
                </div>
            `;
        } else if (t.status === 'awarded') {
            const winningBid = bids.find(b => b.id === t.winner_bid_id);
            const price = winningBid ? parseFloat(winningBid.price).toLocaleString('tr-TR') : '0';
            
            escrowStatusBox.innerHTML = `
                <div class="escrow-alert success">
                    <span class="escrow-title">Ödeme Güvenli Havuzda (Escrow)</span>
                    <span class="escrow-desc">İhale başarıyla onaylandı. <strong>${price} TL</strong> platform havuz hesabına bloke edildi. Tedarikçi teslimatı başlattı.</span>
                </div>
                <div class="star-rating-box">
                    <label>Tedarikçi Firmaya Puan Verin:</label>
                    <div class="stars">
                        ${[1,2,3,4,5].map(star => `
                            <button class="star-btn ${t.buyer_rating >= star ? 'active' : ''}" onclick="rateCompany('${t.id}', ${star})">
                                <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        } else if (t.status === 'cancelled') {
            escrowStatusBox.innerHTML = `
                <div class="escrow-alert error">
                    <span class="escrow-title">İhale İptal Edildi</span>
                    <span class="escrow-desc">Bu ihale yöneticiler veya tarafınızca iptal edildi. Teklifler geçersizdir.</span>
                </div>
            `;
        }

    } catch (e) {
        console.error('İhale detayları çekilemedi:', e);
    }
}

// İhaleyi Onayla / Kazandır (Escrow Ödemesi)
async function awardTender(tenderId, bidId) {
    if (!confirm('Bu teklifi onaylayarak işi bu firmaya vermek ve ödemeyi havuz hesabına aktarmak istiyor musunuz?')) return;

    try {
        const res = await fetch(`${API_URL}/api/tenders/${tenderId}/award`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ bid_id: bidId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'İhale onaylanamadı.');

        alert('Tebrikler! İhale onaylandı ve ödeme güvenli havuz hesabına bloke edildi.');
        fetchTenderDetails(tenderId);
    } catch (err) {
        alert(err.message);
    }
}

// Tedarikçi Firmaya Puan Ver
async function rateCompany(tenderId, rating) {
    try {
        const res = await fetch(`${API_URL}/api/tenders/${tenderId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ rating })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Puan verilemedi.');

        alert('Puanınız başarıyla iletildi. Teşekkür ederiz!');
        fetchTenderDetails(tenderId);
    } catch (err) {
        alert(err.message);
    }
}
