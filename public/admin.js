const API_URL = window.location.origin;
let userToken = localStorage.getItem('admin_token');
let userData = JSON.parse(localStorage.getItem('admin_user') || '{}');

// Sayfa Yüklendiğinde
window.onload = () => {
    checkAuth();
};

// Yetkilendirme Kontrolü
function checkAuth() {
    if (userToken) {
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('dashboardContainer').classList.remove('hidden');
        document.getElementById('headerActions').style.display = 'flex';
        document.getElementById('currentUserDisplay').innerText = `Yönetici: ${userData.name} ${userData.surname}`;
        loadAdminPanel();
    } else {
        document.getElementById('authContainer').classList.remove('hidden');
        document.getElementById('dashboardContainer').classList.add('hidden');
        document.getElementById('headerActions').style.display = 'none';
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
        if (!res.ok) throw new Error(data.error || 'Yönetici girişi başarısız.');

        if (data.user.role !== 'admin') {
            throw new Error('Yetki Hatası: Bu sayfaya yalnızca sistem yöneticileri erişebilir.');
        }

        userToken = data.token;
        userData = data.user;
        localStorage.setItem('admin_token', userToken);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        checkAuth();
    } catch (err) {
        alert(err.message);
    }
};

// Tek Tıkla Demo Giriş
async function quickLogin() {
    const email = 'admin_test@gelanlasalim.com';
    const password = 'demo-password';

    try {
        // Önce yöneticiyi kaydetmeyi dene
        await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                first_name: 'Serkan',
                last_name: 'Demir',
                email: email,
                phone: '08502223344',
                password: password,
                role: 'admin'
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
        localStorage.setItem('admin_token', userToken);
        localStorage.setItem('admin_user', JSON.stringify(userData));
        checkAuth();
    } catch(err) {
        alert(err.message);
    }
}

// Güvenli Çıkış
function logout() {
    userToken = null;
    userData = {};
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    checkAuth();
}

// Admin Verilerini Yükle
async function loadAdminPanel() {
    try {
        // 1. İstatistikleri Çek
        const statsRes = await fetch(`${API_URL}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const statsData = await statsRes.json();
        
        document.getElementById('adminStatVolume').innerText = `${parseFloat(statsData.total_volume).toLocaleString('tr-TR')} TL`;
        document.getElementById('adminStatCommission').innerText = `${parseFloat(statsData.commission_earned).toLocaleString('tr-TR')} TL`;
        document.getElementById('adminStatEscrow').innerText = `${parseFloat(statsData.active_escrow).toLocaleString('tr-TR')} TL`;

        // 2. Firma Onay Kuyruğunu Yükle
        const verifRes = await fetch(`${API_URL}/api/admin/unverified-companies`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const verifData = await verifRes.json();
        const unverified = verifData.companies || [];

        const verifQueue = document.getElementById('adminVerificationQueue');
        if (unverified.length === 0) {
            verifQueue.innerHTML = `<div class="empty-feed">Onay bekleyen firma başvurusu bulunmamaktadır.</div>`;
        } else {
            verifQueue.innerHTML = unverified.map(comp => `
                <div class="queue-item">
                    <div class="queue-item-header">
                        <h4>${comp.company_name}</h4>
                    </div>
                    <p>
                        <strong>Vergi Numarası:</strong> ${comp.tax_no}<br>
                        <strong>Adres:</strong> ${comp.address}<br>
                        <strong>Evrak Bilgisi:</strong> <span style="color: var(--clr-accent);">${comp.verification_document_url}</span>
                    </p>
                    <div class="queue-actions">
                        <button class="btn-small-approve" onclick="verifyCompany('${comp.id}', true)">Onayla</button>
                        <button class="btn-small-reject" onclick="verifyCompany('${comp.id}', false)">Reddet</button>
                    </div>
                </div>
            `).join('');
        }

        // 3. Moderasyon Tenders Listesini Yükle (Filtresiz tüm ihaleler)
        const tendersRes = await fetch(`${API_URL}/api/admin/all-tenders`, {
            headers: { 'Authorization': `Bearer ${userToken}` }
        });
        const tendersData = await tendersRes.json();
        const allTenders = tendersData.tenders || [];

        const tendersQueue = document.getElementById('adminTendersList');
        if (allTenders.length === 0) {
            tendersQueue.innerHTML = `<div class="empty-feed">Platformda henüz ihale açılmamıştır.</div>`;
        } else {
            tendersQueue.innerHTML = allTenders.map(t => {
                const badgeClass = t.status === 'open' ? 'open' : (t.status === 'awarded' ? 'awarded' : 'cancelled');
                const statusText = t.status === 'open' ? 'Canlı' : (t.status === 'awarded' ? 'Tamamlandı' : 'İptal Edildi');
                
                return `
                    <div class="queue-item">
                        <div class="queue-item-header">
                            <h4>${t.title}</h4>
                            <span class="verification-badge-label ${badgeClass}">${statusText}</span>
                        </div>
                        <p>
                            <strong>Kategori:</strong> ${t.category_name || 'B2B'}<br>
                            <strong>Miktar:</strong> ${t.quantity} ${t.unit} | <strong>Konum:</strong> ${t.city}, ${t.district}
                        </p>
                        ${t.status === 'open' ? `
                            <div class="queue-actions">
                                <button class="btn-small-reject" onclick="cancelTender('${t.id}')">İhaleyi İptal Et</button>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');
        }

    } catch (e) {
        console.error('Yönetim paneli yüklenemedi:', e);
    }
}

// Firma Onayla / Reddet
async function verifyCompany(companyId, status) {
    const actionText = status ? 'onaylamak' : 'reddetmek';
    if (!confirm(`Bu firmanın başvurusunu ${actionText} istediğinize emin misiniz?`)) return;

    try {
        const res = await fetch(`${API_URL}/api/companies/${companyId}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            },
            body: JSON.stringify({ is_verified: status })
        });
        if (!res.ok) throw new Error('İşlem gerçekleştirilemedi.');
        
        alert(`Firma başarıyla ${status ? 'doğrulandı' : 'reddedildi'}.`);
        loadAdminPanel();
    } catch (err) {
        alert(err.message);
    }
}

// İhaleyi İptal Et
async function cancelTender(tenderId) {
    if (!confirm('Bu ihaleyi kalıcı olarak iptal etmek istediğinize emin misiniz?')) return;

    try {
        const res = await fetch(`${API_URL}/api/tenders/${tenderId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}`
            }
        });
        if (!res.ok) throw new Error('İhale iptal edilemedi.');

        alert('İhale başarıyla iptal edildi.');
        loadAdminPanel();
    } catch (err) {
        alert(err.message);
    }
}
