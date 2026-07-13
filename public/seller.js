const API_URL = window.location.origin;
let socket;
let userToken = localStorage.getItem('seller_token');
let userData = JSON.parse(localStorage.getItem('seller_user') || '{}');
let companyData = {};
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
            loadSellerPanel();
        }
    });
}

// Kategorileri Çek
async function fetchCategories() {
    try {
        const res = await fetch(`${API_URL}/api/categories`);
        const data = await res.json();
        allCategories = data.categories || [];
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
        document.getElementById('currentUserDisplay').innerText = `Firma Yetkilisi: ${userData.name} ${userData.surname}`;
        loadSellerPanel();
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
        localStorage.setItem('seller_token', userToken);
        localStorage.setItem('seller_user', JSON.stringify(userData));
        checkAuth();
    } catch (err) {
        alert(err.message);
    }
};

// Kayıt Ol (Yeni Firma)
document.getElementById('formRegister').onsubmit = async (e) => {
    e.preventDefault();
    const companyName = document.getElementById('regCompanyName').value;
    const name = document.getElementById('regName').value;
    const surname = document.getElementById('regSurname').value;
    const email = document.getElementById('regEmail').value;
    const phone = document.getElementById('regPhone').value;
    const docInput = document.getElementById('regDoc').value;
    const password = document.getElementById('regPassword').value;

    try {
        // 1. Kullanıcı olarak kaydol
        const regRes = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: name, last_name: surname, email, phone, password, role: 'seller' })
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(regData.error || 'Firma kullanıcısı kaydedilemedi.');

        // 2. Giriş yap ve token al
        const logRes = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const logData = await logRes.json();
        if (!logRes.ok) throw new Error(logData.error || 'Otomatik giriş başarısız.');

        // 3. Firma profilini oluştur
        const compRes = await fetch(`${API_URL}/api/companies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${logData.token}`
            },
            body: JSON.stringify({
                company_name: companyName,
                tax_no: '1234567890',
                address: 'Türkiye',
                verification_document_url: docInput
            })
        });
        const compData = await compRes.json();
        if (!compRes.ok) throw new Error(compData.error || 'Firma profili oluşturulamadı.');

        alert('Firma başvurunuz başarıyla alındı! Evraklarınız onaylanmak üzere yönetici sırasına eklendi.');
        
        userToken = logData.token;
        userData = logData.user;
        localStorage.setItem('seller_token', userToken);
        localStorage.setItem('seller_user', JSON.stringify(userData));
        checkAuth();
    } catch (err) {
        alert(err.message);
    }
};

// Tek Tıkla Demo Girişi (Tüm aşamaları otomatik geçer, kategorileri ve bölgeleri tanımlayıp admin onayıyla aktif eder)
async function quickLogin(role) {
    const email = 'beta_beton_test@gelanlasalim.com';
    const password = 'demo-password';

    try {
        // 1. Kullanıcı kaydet
        await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: 'Mehmet',
                last_name: 'Öztürk',
                email: email,
                phone: '05321112233',
                password: password,
                role: 'seller'
            })
        });
    } catch(e) {}

    // 2. Giriş yap
    try {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Giriş başarısız.');

        userToken = data.token;
        userData = data.user;
        localStorage.setItem('seller_token', userToken);
        localStorage.setItem('seller_user', JSON.stringify(userData));

        // 3. Firma profilini oluştur veya güncelle
        const compRes = await fetch(`${API_URL}/api/companies`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                company_name: 'Beta Hazır Beton & Malzeme Tic. A.Ş.',
                tax_no: '9876543210',
                address: 'Organize Sanayi Bölgesi, Gebze',
                verification_document_url: 'Vergi_Levhasi_2026.pdf'
            })
        });
        const compData = await compRes.json();
        
        // 4. Test için kategorileri ve hizmet bölgelerini otomatik kaydet
        const profile = compData.profile || {};
        if (profile.id) {
            // Kategorileri ata (Kategori 1, 2 ve 3)
            await fetch(`${API_URL}/api/companies/categories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ category_ids: [1, 2, 3] })
            });

            // Hizmet bölgesi ekle (Gebze ve Kadıköy)
            await fetch(`${API_URL}/api/companies/regions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ city: 'Kocaeli', district: 'Gebze' })
            });
            await fetch(`${API_URL}/api/companies/regions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ city: 'İstanbul', district: 'Kadıköy' })
            });

            // 5. Test kolaylığı için firmayı otomatik doğrula (Admin token simülasyonu veya mock veritabanı doğrulaması tetiklenir)
            await fetch(`${API_URL}/api/companies/verify-demo-quick`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                }
            });
        }

        checkAuth();
    } catch(err) {
        alert(err.message);
    }
}

// Güvenli Çıkış
function logout() {
    userToken = null;
    userData = {};
    companyData = {};
    localStorage.removeItem('seller_token');
    localStorage.removeItem('seller_user');
    checkAuth();
}

// Satıcı Paneli Detaylarını Yükle
async function loadSellerPanel() {
    try {
        // 1. Firma Profilini Getir
        const profileRes = await fetch(`${API_URL}/api/companies/profile`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const profileData = await profileRes.json();
        
        if (!profileRes.ok || !profileData.profile) {
            // Profil oluşturulmamışsa (Kayıttan hemen sonra değil de manuel giriş yapıldıysa) profil formu tetiklenebilir
            document.getElementById('sellerProfileStatus').innerHTML = `
                <div class="alert error">Firma profiliniz bulunamadı. Lütfen yöneticilerle irtibata geçin.</div>
            `;
            return;
        }

        companyData = profileData.profile;

        // Firma Bilgi Kartı Render Et
        const statusText = companyData.is_verified ? 'Doğrulanmış Firma' : (companyData.verification_rejected ? 'Reddedildi' : 'Evraklar İnceleniyor');
        const statusClass = companyData.is_verified ? 'verified' : (companyData.verification_rejected ? 'rejected' : 'pending');
        
        document.getElementById('sellerProfileStatus').innerHTML = `
            <div class="company-card-top">
                <h4>${companyData.company_name}</h4>
                <span class="verification-badge-label ${statusClass}">${statusText}</span>
            </div>
            <div class="company-limits-box">
                <span class="limit-label">Teklif Verme Paketi:</span>
                <span class="limit-value">Aylık 10 Teklif</span>
                <span class="limit-remaining">Kalan Limit: <strong>${10 - companyData.monthly_bid_count}</strong></span>
            </div>
        `;

        // Kategori Checkbox'larını Render Et
        const activeCatIds = companyData.categories ? companyData.categories.map(c => c.id) : [];
        document.getElementById('sellerCategoriesList').innerHTML = allCategories.map(cat => {
            const checked = activeCatIds.includes(cat.id) ? 'checked' : '';
            return `
                <label class="checkbox-container">
                    <input type="checkbox" value="${cat.id}" ${checked} class="seller-cat-checkbox">
                    <span class="checkbox-label">${cat.name}</span>
                </label>
            `;
        }).join('');

        // Hizmet Bölgelerini Render Et
        const regionsContainer = document.getElementById('sellerRegionsContainer');
        if (companyData.regions && companyData.regions.length > 0) {
            regionsContainer.innerHTML = companyData.regions.map(r => `
                <div class="region-chip">
                    <span>${r.city} ${r.district ? `(${r.district})` : ''}</span>
                    <button class="remove-chip-btn" onclick="removeSellerRegion('${r.id}')">×</button>
                </div>
            `).join('');
        } else {
            regionsContainer.innerHTML = `<span class="no-regions-text">Hizmet bölgesi eklenmedi. Tüm Türkiye'deki ihaleler gösterilir.</span>`;
        }

        // 2. Eşleşen İhaleleri Yükle (Kategori ve Bölge bazlı filtreler sunucu tarafında yapılır)
        const matchedRes = await fetch(`${API_URL}/api/companies/matched-tenders`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const matchedData = await matchedRes.json();
        const tenders = matchedData.tenders || [];

        document.getElementById('sellerMatchedCount').innerText = `${tenders.length} Eşleşen`;

        const tendersFeed = document.getElementById('sellerMatchedTenders');
        if (tenders.length === 0) {
            tendersFeed.innerHTML = `<div class="empty-feed">Hizmet ayarlarınızla eşleşen aktif canlı ihale bulunmamaktadır.</div>`;
            return;
        }

        tendersFeed.innerHTML = tenders.map(t => {
            return `
                <div class="tender-card" onclick="openArenaModal('${t.id}')">
                    <div class="tender-card-header">
                        <span class="category-badge">${t.category_name || 'B2B'}</span>
                        <span class="status-badge open">Canlı İhale</span>
                    </div>
                    <h3 class="tender-title">${t.title}</h3>
                    <div class="tender-meta-grid">
                        <div class="meta-block">
                            <span class="label">Miktar:</span>
                            <span class="value">${t.quantity} ${t.unit}</span>
                        </div>
                        <div class="meta-block">
                            <span class="label">Şantiye Konumu:</span>
                            <span class="value">${t.city}, ${t.district}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error('Satıcı profili/ihaleleri yüklenemedi:', e);
    }
}

// Kategorileri Güncelle
async function saveSellerCategories() {
    const checkedBoxes = document.querySelectorAll('.seller-cat-checkbox:checked');
    const category_ids = Array.from(checkedBoxes).map(cb => parseInt(cb.value));

    try {
        const res = await fetch(`${API_URL}/api/companies/categories`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ category_ids })
        });
        if (!res.ok) throw new Error('Kategoriler güncellenemedi.');
        alert('Faaliyet alanları başarıyla kaydedildi.');
        loadSellerPanel();
    } catch (err) {
        alert(err.message);
    }
}

// Bölge Ekle
async function addSellerRegion() {
    const city = document.getElementById('sellerRegionCity').value.trim();
    const district = document.getElementById('sellerRegionDistrict').value.trim();

    if (!city) {
        alert('Lütfen en azından bir şehir adı girin.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/companies/regions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ city, district: district || null })
        });
        if (!res.ok) throw new Error('Bölge eklenemedi.');
        document.getElementById('sellerRegionCity').value = '';
        document.getElementById('sellerRegionDistrict').value = '';
        loadSellerPanel();
    } catch (err) {
        alert(err.message);
    }
}

// Bölge Sil
async function removeSellerRegion(regionId) {
    try {
        const res = await fetch(`${API_URL}/api/companies/regions/${regionId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        if (!res.ok) throw new Error('Bölge silinemedi.');
        loadSellerPanel();
    } catch (err) {
        alert(err.message);
    }
}

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
    loadSellerPanel();
}

// İhale Detayları ve Canlı Teklifleri Yükle
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
            ladderDiv.innerHTML = `<div class="empty-feed">Henüz teklif verilmedi. İlk teklif veren siz olun!</div>`;
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
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Sağ Taraf Teklif Verme Butonları Aktif/Pasif Kontrolü
        const actionSellerSubmit = document.getElementById('actionSellerSubmit');
        
        if (t.status !== 'open') {
            actionSellerSubmit.classList.add('hidden');
        } else {
            actionSellerSubmit.classList.remove('hidden');
        }

    } catch (e) {
        console.error('İhale detayları çekilemedi:', e);
    }
}

// Yeni Fiyat Teklifi Ver (Fiyat Kır)
document.getElementById('formSubmitBid').onsubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(document.getElementById('bidPriceInput').value);
    const lead_time_days = parseInt(document.getElementById('bidLeadTimeInput').value);
    const tax_included = document.getElementById('bidTaxInput').value === 'true';
    const note = document.getElementById('bidNoteInput').value;

    if (!companyData.is_verified) {
        alert('Teklif verebilmek için firmanızın yöneticiler tarafından doğrulanmış olması gerekmektedir.');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/api/bids`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({
                tender_id: currentTenderId,
                price, lead_time_days, tax_included, note
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Teklif gönderilemedi.');

        alert('Teklifiniz başarıyla iletildi ve canlı merdivende yarışa katıldı!');
        document.getElementById('formSubmitBid').reset();
        fetchTenderDetails(currentTenderId);
    } catch (err) {
        alert(err.message);
    }
};
