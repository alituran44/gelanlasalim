// B2B Reverse Auction Portal - app.js
const API_URL = window.location.origin;

class App {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.token = localStorage.getItem('token') || null;
        this.socket = null;
        this.tenders = [];
        this.categories = [];
        this.selectedTender = null;
        
        // Form states
        this.tempTender = null;
        this.tempRegister = null;
        
        // Notifications list
        this.notifications = [
            { id: 1, text: "A4 KAĞIT ALIMI ihalesine yeni bir teklif geldi.", time: "5 dakika önce", read: false }
        ];

        this.init();
    }

    init() {
        this.initWebSocket();
        this.loadCategories();
        this.setupRouting();
        this.updateHeaderUI();
        
        // Dropdown toggle close listener
        window.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-wrapper')) {
                const drop = document.getElementById('noti-dropdown');
                if (drop) drop.classList.remove('active');
            }
        });
    }

    initWebSocket() {
        try {
            this.socket = io(API_URL);
            
            this.socket.on('connect', () => {
                this.updateStatusIndicator(true);
            });

            this.socket.on('disconnect', () => {
                this.updateStatusIndicator(false);
            });

            // WebSocket events
            this.socket.on('new_bid', (bid) => {
                this.addNotification(`İhalenize yeni bir teklif geldi: ${bid.price.toLocaleString()} TL`, bid.tender_id);
                // If viewing that tender, refresh bids
                if (this.selectedTender && this.selectedTender.id === bid.tender_id) {
                    this.loadTenderDetails(bid.tender_id);
                }
                this.loadTenders().then(() => {
                    const badge = document.getElementById(`bid-badge-${bid.tender_id}`);
                    if (badge) {
                        badge.classList.add('new-bid-pop');
                        badge.addEventListener('animationend', () => badge.classList.remove('new-bid-pop'), { once: true });
                    }
                });
            });

            this.socket.on('bid_status_change', (data) => {
                this.addNotification(`Teklifinizin durumu güncellendi: ${data.status.toUpperCase()}`, data.bid_id);
                if (this.selectedTender) {
                    this.loadTenderDetails(this.selectedTender.id);
                }
            });

        } catch (err) {
            console.error('WebSocket bağlantı hatası:', err);
            this.updateStatusIndicator(false);
        }
    }

    updateStatusIndicator(online) {
        const ind = document.getElementById('ws-status-indicator');
        const txt = document.getElementById('ws-status-text');
        if (ind && txt) {
            if (online) {
                ind.className = 'status-indicator online';
                txt.textContent = 'Canlı Bağlantı Aktif';
            } else {
                ind.className = 'status-indicator';
                txt.textContent = 'Bağlantı Kesildi (Yenileniyor)';
            }
        }
    }

    addNotification(text, targetId = null) {
        this.notifications.unshift({
            id: Date.now(),
            text,
            time: "Şimdi",
            read: false,
            targetId
        });
        this.updateNotificationsUI();
    }

    updateNotificationsUI() {
        const badge = document.getElementById('noti-count');
        const list = document.getElementById('noti-dropdown-list');
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }

        if (list) {
            list.innerHTML = this.notifications.map(n => `
                <div class="noti-item ${n.read ? '' : 'unread'}" onclick="app.readNotification(${n.id}, '${n.targetId}')">
                    <div class="noti-meta">${n.time}</div>
                    <div class="noti-text">${n.text}</div>
                </div>
            `).join('');
        }
    }

    readNotification(id, targetId) {
        const noti = this.notifications.find(n => n.id === id);
        if (noti) noti.read = true;
        this.updateNotificationsUI();
        if (targetId) {
            this.navigateTo(`/teklifler/${targetId}`);
        }
    }

    toggleNotifications() {
        const drop = document.getElementById('noti-dropdown');
        if (drop) drop.classList.toggle('active');
    }

    async loadCategories() {
        try {
            const res = await fetch(`${API_URL}/api/categories`);
            const data = await res.json();
            this.categories = data.categories || [];
        } catch (e) {
            console.error('Kategoriler yüklenemedi:', e);
        }
    }

    setupRouting() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    navigateTo(path) {
        window.location.hash = `#${path}`;
    }

    handleRoute() {
        const hash = window.location.hash || '#/';
        const mainLayout = document.getElementById('main-content-layout');
        
        // Parse simple path parameters (e.g., #/teklifler/tender-id)
        let path = hash.substring(1);
        if (path === '' || path === '/') {
            this.renderDashboard();
        } else if (path === '/ilan-ver') {
            this.renderAdPostScreen();
        } else if (path === '/uyelik') {
            this.renderRegistrationScreen();
        } else if (path === '/verilen-teklifler') {
            this.renderMyBidsScreen('sent');
        } else if (path === '/alinan-teklifler') {
            this.renderMyBidsScreen('received');
        } else if (path.startsWith('/teklifler/')) {
            const tenderId = path.split('/')[2];
            this.renderMemberScreen(tenderId);
        } else if (path.startsWith('/firma-bilgi/')) {
            const companyId = path.split('/')[2];
            this.renderCompanyInfoScreen(companyId);
        } else {
            this.renderDashboard();
        }

        this.animateView();
    }

    animateView() {
        const layout = document.getElementById('main-content-layout');
        if (layout) {
            layout.classList.remove('fade-slide-in');
            void layout.offsetWidth; // Force reflow
            layout.classList.add('fade-slide-in');
        }
    }

    updateHeaderUI() {
        const btn = document.getElementById('btn-membership');
        if (btn) {
            if (this.user) {
                btn.innerHTML = `<i class="fa-solid fa-user"></i> ${this.user.first_name} (${this.user.role === 'buyer' ? 'Alıcı' : 'Satıcı'})`;
                btn.onclick = () => this.handleLogout();
            } else {
                btn.innerHTML = `<i class="fa-solid fa-user-plus"></i> Üyelik & Üye Girişi`;
                btn.onclick = () => this.navigateTo('/uyelik');
            }
        }
        this.updateNotificationsUI();
    }

    handleLogout() {
        if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            this.user = null;
            this.token = null;
            this.updateHeaderUI();
            this.navigateTo('/');
        }
    }

    // -------------------------------------------------------------
    // VIEW RENDERING & CONTROLLERS
    // -------------------------------------------------------------

    // View 1: Main Dashboard (Screenshot 1)
    async renderDashboard() {
        const sidebar = document.getElementById('sidebar-content');
        const panel = document.getElementById('panel-content');
        
        // Render Sidebar Filters
        sidebar.innerHTML = `
            <div class="sidebar-box">
                <h3 class="sidebar-title"><i class="fa-solid fa-sliders"></i> FİLTRELER ARAMA</h3>
                
                <div class="filter-group">
                    <label class="filter-label">ANAHTAR KELİME</label>
                    <input type="text" id="filter-search" class="filter-input" placeholder="İlan başlığı, malzeme..." oninput="app.applyFilters()">
                </div>

                <div class="filter-group">
                    <label class="filter-label">KATAGORİLER</label>
                    <div class="categories-checkbox-list">
                        ${this.categories.map(c => `
                            <label class="checkbox-container">
                                <input type="checkbox" name="filter-category" value="${c.id}" onchange="app.applyFilters()">
                                <span>${c.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="filter-group">
                    <label class="filter-label">İHALE DURUMU</label>
                    <select id="filter-status" class="filter-select" onchange="app.applyFilters()">
                        <option value="open">Aktif / Açık</option>
                        <option value="awarded">Kazananı Seçilen</option>
                        <option value="all">Tüm İhaleler</option>
                    </select>
                </div>

                <button class="secondary-btn w-full" onclick="app.clearFilters()">Filtreleri Temizle</button>
            </div>
        `;

        // Render Dashboard Table skeleton
        panel.innerHTML = `
            <div class="panel-header-section">
                <h1>Canlı B2B İhale Arenası</h1>
                <p>Tedarik taleplerinizi yayınlayın, onaylı satıcıların anlık fiyat kırarak yarışmasını izleyin.</p>
            </div>
            
            <div class="content-card">
                <div class="table-container">
                    <table class="premium-table">
                        <thead>
                            <tr>
                                <th>KATEGORİ ADI</th>
                                <th>İLAN NO</th>
                                <th>İLAN AÇIKLAMASI</th>
                                <th style="width: 80px;">GÖRSEL</th>
                                <th>İL / İLÇE / FİRMA</th>
                                <th>DOSYA (RAR)</th>
                                <th>BİTİŞ TARİHİ</th>
                                <th>TEKLİF</th>
                                <th style="text-align: center;">DETAY</th>
                            </tr>
                        </thead>
                        <tbody id="tenders-table-body">
                            <tr>
                                <td colspan="9" style="text-align: center; padding: 48px;">
                                    <i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>İhaleler yükleniyor...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        await this.loadTenders();
    }

    async loadTenders() {
        try {
            const status = document.getElementById('filter-status')?.value || 'open';
            const res = await fetch(`${API_URL}/api/tenders?status=${status}`);
            const data = await res.json();
            this.tenders = data.tenders || [];
            this.applyFilters();
        } catch (e) {
            console.error('İhaleler yüklenemedi:', e);
        }
    }

    applyFilters() {
        const searchVal = document.getElementById('filter-search')?.value.toLowerCase() || '';
        const selectedCats = Array.from(document.querySelectorAll('input[name="filter-category"]:checked')).map(el => parseInt(el.value));
        
        let filtered = this.tenders;

        if (searchVal) {
            filtered = filtered.filter(t => 
                t.title.toLowerCase().includes(searchVal) || 
                t.description.toLowerCase().includes(searchVal)
            );
        }

        if (selectedCats.length > 0) {
            filtered = filtered.filter(t => selectedCats.includes(t.category_id));
        }

        const tbody = document.getElementById('tenders-table-body');
        if (!tbody) return;

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 48px; color: var(--clr-text-secondary);">
                        Arama kriterlerine uygun aktif bir ihale bulunamadı.
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map((t, index) => {
            const imageThumb = t.image_url 
                ? `<div class="img-thumb" style="background-image: url('${t.image_url}')"><i class="fa-solid fa-image"></i></div>` 
                : `<div class="img-thumb empty"><i class="fa-solid fa-box"></i></div>`;
                
            const fileLink = t.file_url 
                ? `<a href="#" class="file-rar-link" onclick="alert('Demo dosya indiriliyor: ${t.file_url}')"><i class="fa-solid fa-file-zipper"></i> RAR İndir</a>` 
                : `<span class="no-file-text">-</span>`;

            return `
                <tr class="stagger-item" style="animation-delay: ${index * 0.05}s">
                    <td><span class="cat-pill">${t.category_name}</span></td>
                    <td class="font-mono">#${t.id.substring(t.id.length - 4)}</td>
                    <td>
                        <div class="tender-title-row">${t.title}</div>
                        <div class="tender-desc-row">${t.description}</div>
                    </td>
                    <td>${imageThumb}</td>
                    <td>
                        <div class="loc-city">${t.city} / ${t.district}</div>
                        <div class="loc-firm" style="cursor: pointer; text-decoration: underline;" onclick="app.navigateTo('/firma-bilgi/mock-company-id')">Tedarikçi A.Ş.</div>
                    </td>
                    <td>${fileLink}</td>
                    <td><span class="date-badge">${new Date(t.expires_at).toLocaleDateString('tr-TR')}</span></td>
                    <td>
                        <span class="bid-count-badge ${t.teklif_sayisi > 0 ? 'active' : ''}" id="bid-badge-${t.id}">
                            <i class="fa-solid fa-gavel"></i> ${t.teklif_sayisi || 0}
                        </span>
                    </td>
                    <td style="text-align: center;">
                        <button class="view-ad-btn" onclick="app.navigateTo('/teklifler/${t.id}')">
                            <i class="fa-solid fa-play"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    clearFilters() {
        const search = document.getElementById('filter-search');
        if (search) search.value = '';
        document.querySelectorAll('input[name="filter-category"]:checked').forEach(el => el.checked = false);
        const status = document.getElementById('filter-status');
        if (status) status.value = 'open';
        this.applyFilters();
    }

    // View 2: İlan Verme Ekranı (Screenshot 2)
    renderAdPostScreen() {
        if (!this.user || this.user.role !== 'buyer') {
            alert('İhale ilanı oluşturabilmek için lütfen "Alıcı" hesabı ile giriş yapın.');
            this.openLoginModal('buyer');
            return;
        }

        const sidebar = document.getElementById('sidebar-content');
        const panel = document.getElementById('panel-content');

        // Sidebar: KATEGORİLER / ALT KATEGORİLER
        sidebar.innerHTML = `
            <div class="sidebar-box">
                <h3 class="sidebar-title"><i class="fa-solid fa-folder-tree"></i> KATEGORİLER</h3>
                <p style="font-size: 12px; color: var(--clr-text-secondary); margin-bottom: 15px;">Açacağınız ihale ilanına en uygun sektörü yan taraftan seçin.</p>
                <div class="categories-list-select" id="post-cat-list">
                    ${this.categories.map(c => `
                        <div class="category-select-item" id="cat-sel-${c.id}" onclick="app.selectPostCategory(${c.id})">
                            <i class="fa-solid fa-angle-right"></i> ${c.name}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Main Panel: İlan Verme Formu (Screenshot 2)
        panel.innerHTML = `
            <div class="panel-header-section">
                <h1>Yeni İhale İlanı Oluştur</h1>
                <p>Aşağıdaki bilgileri eksiksiz doldurarak tersine ihale arenasını başlatın.</p>
            </div>

            <div class="content-card">
                <form class="styled-form" onsubmit="app.handleAdPostNext(event)">
                    <input type="hidden" id="post-category-id" required>
                    
                    <div class="form-row">
                        <div class="form-field">
                            <label>ÜLKE</label>
                            <input type="text" id="post-country" value="Türkiye" required>
                        </div>
                        <div class="form-field">
                            <label>İL</label>
                            <input type="text" id="post-city" required placeholder="Örn: İstanbul">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>İLÇE</label>
                            <input type="text" id="post-district" required placeholder="Örn: Kadıköy">
                        </div>
                        <div class="form-field">
                            <label>KÖY / MAHALLE</label>
                            <input type="text" id="post-neighborhood" placeholder="Örn: Caferağa Mah.">
                        </div>
                    </div>

                    <div class="form-field">
                        <label>İLAN BAŞLIĞI</label>
                        <input type="text" id="post-title" required placeholder="Örn: 500 Paket A4 Fotokopi Kağıdı Alımı">
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>DOSYA YÜKLE (TEKNİK ŞARTNAME - RAR)</label>
                            <div class="file-uploader-box" onclick="document.getElementById('post-file').click()">
                                <i class="fa-solid fa-file-zipper"></i>
                                <span id="file-uploader-text">Şartname dosyası seçin (.rar, .zip)</span>
                                <input type="file" id="post-file" style="display: none;" onchange="app.handleFileChange(this)">
                            </div>
                        </div>
                        <div class="form-field">
                            <label>İLAN GÖRSELİ YÜKLE (GÖRSEL YÜKLE)</label>
                            <div class="file-uploader-box" onclick="document.getElementById('post-image').click()">
                                <i class="fa-solid fa-image"></i>
                                <span id="image-uploader-text">İlan görseli seçin (.jpg, .png)</span>
                                <input type="file" id="post-image" style="display: none;" onchange="app.handleImageChange(this)">
                            </div>
                        </div>
                    </div>

                    <div class="form-field">
                        <label>AÇIKLAMA EKLE</label>
                        <textarea id="post-description" rows="4" required placeholder="Malzeme detayları, teslimat şartları, marka tercihleri vb. detayları yazınız..."></textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>Miktar & Birim</label>
                            <div class="unit-group">
                                <input type="number" id="post-quantity" required placeholder="Miktar" min="1">
                                <input type="text" id="post-unit" required placeholder="Adet, Ton vb.">
                            </div>
                        </div>
                        <div class="form-field">
                            <label>MİNİMUM VEYA MAKSİMUM FİYAT (HEDEF FİYAT)</label>
                            <input type="number" id="post-target-price" placeholder="Örn: 50000">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>ALIŞ / SATIŞ / HİZMET SEÇİMİ</label>
                            <select id="post-type" class="filter-select">
                                <option value="Alış">Alış İhalesi (Fiyat Düşürülür)</option>
                                <option value="Satış">Satış İhalesi (Fiyat Artırılır)</option>
                                <option value="Hizmet">Hizmet İhalesi</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>İHALE BİTİŞ TARİHİ</label>
                            <input type="date" id="post-expires-at" required>
                        </div>
                    </div>

                    <div class="action-buttons-row">
                        <button type="submit" class="primary-btn">DEVAM ET <i class="fa-solid fa-angle-right"></i></button>
                    </div>
                </form>
            </div>
        `;
        
        // Select first category by default
        if (this.categories.length > 0) {
            this.selectPostCategory(this.categories[0].id);
        }
    }

    selectPostCategory(id) {
        document.querySelectorAll('.category-select-item').forEach(el => el.classList.remove('active'));
        const activeItem = document.getElementById(`cat-sel-${id}`);
        if (activeItem) activeItem.classList.add('active');
        const input = document.getElementById('post-category-id');
        if (input) input.value = id;
    }

    handleFileChange(input) {
        const text = document.getElementById('file-uploader-text');
        if (text && input.files[0]) {
            text.innerHTML = `<strong>Seçildi:</strong> ${input.files[0].name}`;
        }
    }

    handleImageChange(input) {
        const text = document.getElementById('image-uploader-text');
        if (text && input.files[0]) {
            text.innerHTML = `<strong>Seçildi:</strong> ${input.files[0].name}`;
        }
    }

    handleAdPostNext(event) {
        event.preventDefault();
        
        const categoryId = document.getElementById('post-category-id').value;
        if (!categoryId) {
            alert('Lütfen bir kategori seçiniz.');
            return;
        }

        this.tempTender = {
            category_id: parseInt(categoryId),
            category_name: this.categories.find(c => c.id === parseInt(categoryId))?.name || '',
            country: document.getElementById('post-country').value,
            city: document.getElementById('post-city').value,
            district: document.getElementById('post-district').value,
            neighborhood: document.getElementById('post-neighborhood').value,
            title: document.getElementById('post-title').value,
            description: document.getElementById('post-description').value,
            quantity: document.getElementById('post-quantity').value,
            unit: document.getElementById('post-unit').value,
            target_price: document.getElementById('post-target-price').value,
            type: document.getElementById('post-type').value,
            expires_at: document.getElementById('post-expires-at').value,
            file_name: document.getElementById('post-file').files[0]?.name || 'Sartname_Tedarik.rar',
            image_name: document.getElementById('post-image').files[0]?.name || ''
        };

        this.renderAdPreviewScreen();
    }

    // View 3: Sözleşmeler ve Ön İzleme (Screenshot 3)
    renderAdPreviewScreen() {
        if (!this.tempTender) {
            this.navigateTo('/ilan-ver');
            return;
        }

        const sidebar = document.getElementById('sidebar-content');
        const panel = document.getElementById('panel-content');

        sidebar.innerHTML = `
            <div class="sidebar-box">
                <h3 class="sidebar-title"><i class="fa-solid fa-file-contract"></i> SÖZLEŞMELER</h3>
                <div class="contract-sidebar-preview">
                    <i class="fa-solid fa-signature fa-3x" style="color: var(--clr-accent); display: block; margin: 15px auto; text-align: center;"></i>
                    <p style="font-size: 12px; color: var(--clr-text-secondary);">İhale arenasını başlatmadan önce yandaki sözleşme metnini onaylamanız gerekmektedir.</p>
                </div>
            </div>
        `;

        panel.innerHTML = `
            <div class="panel-header-section">
                <h1>İhale Sözleşmesi & Ön İzleme</h1>
                <p>İlanınızı göndermeden önce bilgileri kontrol edin ve B2B katılım sözleşmesini onaylayın.</p>
            </div>

            <div class="content-card" style="margin-bottom: 24px;">
                <h3 class="card-title">İlan Ön İzleme</h3>
                <div class="preview-details-grid">
                    <div class="preview-item"><strong>KATEGORİ:</strong> ${this.tempTender.category_name}</div>
                    <div class="preview-item"><strong>BAŞLIK:</strong> ${this.tempTender.title}</div>
                    <div class="preview-item"><strong>KONUM:</strong> ${this.tempTender.country} / ${this.tempTender.city} / ${this.tempTender.district} / ${this.tempTender.neighborhood}</div>
                    <div class="preview-item"><strong>MİKTAR:</strong> ${this.tempTender.quantity} ${this.tempTender.unit}</div>
                    <div class="preview-item"><strong>LİMİT/HEDEF FİYAT:</strong> ${this.tempTender.target_price || 'Belirtilmedi'}</div>
                    <div class="preview-item"><strong>İHALE TÜRÜ:</strong> ${this.tempTender.type}</div>
                    <div class="preview-item"><strong>BİTİŞ TARİHİ:</strong> ${this.tempTender.expires_at}</div>
                    <div class="preview-item"><strong>DOSYA:</strong> ${this.tempTender.file_name}</div>
                </div>
                <div class="preview-desc-box">
                    <strong>AÇIKLAMA:</strong>
                    <p>${this.tempTender.description}</p>
                </div>
            </div>

            <div class="content-card">
                <h3 class="card-title">B2B Canlı Tersine İhale Katılım Sözleşmesi</h3>
                <div class="contract-text-box">
                    <h4>Madde 1 - Taraflar ve Tanımlar</h4>
                    <p>Bu sözleşme, gelanlasalim.com altyapısında açılan ihalede teklif veren doğrulanmış satıcılar ve alıcı şirket arasında imzalanmıştır.</p>
                    <h4>Madde 2 - İhale Kuralları ve Teminat</h4>
                    <p>Tersine ihale sırasında verilen teklifler bağlayıcıdır. Alıcı, ihale süresi bittiğinde en uygun teklifi veren satıcıyla anlaşmayı taahhüt eder. Ödemeler güvenli havuz hesabına bloke edilerek alıcı onayından sonra aktarılacaktır.</p>
                    <h4>Madde 3 - Cezai Şartlar</h4>
                    <p>Haklı bir gerekçe olmaksızın teklifinden vazgeçen satıcının üyeliği dondurulur ve aylık teklif limiti sıfırlanır.</p>
                </div>

                <div class="checkbox-group" style="margin: 20px 0;">
                    <label class="checkbox-container">
                        <input type="checkbox" id="contract-agree" required>
                        <span>Sözleşme şartlarını okudum, anladım ve ihalenin bu kurallara göre başlatılmasını kabul ediyorum.</span>
                    </label>
                </div>

                <div class="action-buttons-row">
                    <button class="secondary-btn" onclick="app.navigateTo('/ilan-ver')"><i class="fa-solid fa-angle-left"></i> Geri Dön</button>
                    <button class="primary-btn" onclick="app.submitTender()">YAYINLA / İLANA GÖNDER ▷</button>
                </div>
            </div>
        `;
    }

    async submitTender() {
        const checked = document.getElementById('contract-agree')?.checked;
        if (!checked) {
            alert('Lütfen katılım sözleşmesini onaylayın.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/tenders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    category_id: this.tempTender.category_id,
                    title: this.tempTender.title,
                    description: this.tempTender.description,
                    quantity: this.tempTender.quantity,
                    unit: this.tempTender.unit,
                    city: this.tempTender.city,
                    district: this.tempTender.district,
                    delivery_address: `${this.tempTender.neighborhood || ''} ${this.tempTender.district} / ${this.tempTender.city}`,
                    delivery_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 15 gün sonra
                    expires_at: new Date(this.tempTender.expires_at).toISOString(),
                    country: this.tempTender.country,
                    neighborhood: this.tempTender.neighborhood,
                    file_url: this.tempTender.file_name,
                    image_url: this.tempTender.image_name,
                    type: this.tempTender.type,
                    target_price: this.tempTender.target_price
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('İhaleniz başarıyla yayına alındı!');
                this.tempTender = null;
                this.navigateTo('/');
            } else {
                alert(`Hata: ${data.error || 'Bilinmeyen bir hata oluştu.'}`);
            }
        } catch (e) {
            console.error('İhale oluşturulurken hata:', e);
            alert('Ağ hatası veya sunucu bağlantı problemi.');
        }
    }

    // View 4: Üyelik Kayıt (Screenshot 4)
    renderRegistrationScreen() {
        const sidebar = document.getElementById('sidebar-content');
        const panel = document.getElementById('panel-content');

        // Sidebar: FAALİYET ALANI
        sidebar.innerHTML = `
            <div class="sidebar-box">
                <h3 class="sidebar-title"><i class="fa-solid fa-briefcase"></i> FAALİYET ALANI</h3>
                <p style="font-size: 12px; color: var(--clr-text-secondary); margin-bottom: 15px;">Firmanızın teklif vermek veya ihale açmak istediği ana sektörleri işaretleyin.</p>
                <div class="categories-checkbox-list">
                    ${this.categories.map(c => `
                        <label class="checkbox-container">
                            <input type="checkbox" name="reg-activity" value="${c.id}">
                            <span>${c.name}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;

        // Main Panel: Firma Kayıt (Screenshot 4)
        panel.innerHTML = `
            <div class="panel-header-section">
                <h1>Üye Kayıt Formu</h1>
                <p>Platforma dahil olarak anında ihale açın veya ihalelere canlı teklif vererek ciro hacminizi artırın.</p>
            </div>

            <div class="content-card">
                <form class="styled-form" onsubmit="app.handleRegistrationNext(event)">
                    
                    <!-- Google Hızlı Giriş -->
                    <div class="google-auth-box">
                        <button type="button" class="google-btn-auth" onclick="app.simulateGoogleAuth()">
                            <i class="fa-brands fa-google"></i> Google Bilgileri ile Otomatik Doldur
                        </button>
                        <span class="auth-hint">Google profil bilgilerinizi kullanarak formu anında doldurun.</span>
                    </div>

                    <div class="divider"><span>FİRMA VE KULLANICI BİLGİLERİ</span></div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>Kullanıcı Rolü</label>
                            <select id="reg-role" class="filter-select">
                                <option value="buyer">Alıcı (İhale açmak için)</option>
                                <option value="seller">Satıcı / Tedarikçi (Teklif vermek için)</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>FİRMA İSMİ / ADI</label>
                            <input type="text" id="reg-company-name" required placeholder="Beta Hazır Beton Ltd. Şti.">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>ADINIZ</label>
                            <input type="text" id="reg-first-name" required placeholder="Ahmet">
                        </div>
                        <div class="form-field">
                            <label>SOYADINIZ</label>
                            <input type="text" id="reg-last-name" required placeholder="Yılmaz">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>ÜLKE</label>
                            <input type="text" id="reg-country" value="Türkiye" required>
                        </div>
                        <div class="form-field">
                            <label>İL</label>
                            <input type="text" id="reg-city" required placeholder="İstanbul">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>İLÇE</label>
                            <input type="text" id="reg-district" required placeholder="Kadıköy">
                        </div>
                        <div class="form-field">
                            <label>KÖY / MAHALLE</label>
                            <input type="text" id="reg-neighborhood" placeholder="Caferağa Mah.">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>TEL (TELEFON)</label>
                            <input type="text" id="reg-phone" required placeholder="05551112233">
                        </div>
                        <div class="form-field">
                            <label>MAİL (E-POSTA)</label>
                            <input type="email" id="reg-email" required placeholder="ornek@firma.com">
                        </div>
                    </div>

                    <div class="form-field">
                        <label>ŞİFRE</label>
                        <input type="password" id="reg-password" required placeholder="••••••••">
                    </div>

                    <div class="action-buttons-row">
                        <button type="submit" class="primary-btn">DEVAM ET (ÖDEME EKRANI) <i class="fa-solid fa-angle-right"></i></button>
                    </div>
                </form>
            </div>
        `;
    }

    simulateGoogleAuth() {
        const first = document.getElementById('reg-first-name');
        const last = document.getElementById('reg-last-name');
        const email = document.getElementById('reg-email');
        const firm = document.getElementById('reg-company-name');
        
        if (first && last && email && firm) {
            first.value = "Kaya";
            last.value = "Öztürk";
            email.value = "kaya_ozturk@gmail.com";
            firm.value = "Kaya Peyzaj ve Botanik A.Ş.";
            alert('Google profil bilgileri başarıyla çekildi ve forma entegre edildi!');
        }
    }

    handleRegistrationNext(event) {
        event.preventDefault();

        const selectedCats = Array.from(document.querySelectorAll('input[name="reg-activity"]:checked')).map(el => parseInt(el.value));
        if (selectedCats.length === 0) {
            alert('Lütfen en az 1 faaliyet alanı seçin.');
            return;
        }

        this.tempRegister = {
            role: document.getElementById('reg-role').value,
            company_name: document.getElementById('reg-company-name').value,
            first_name: document.getElementById('reg-first-name').value,
            last_name: document.getElementById('reg-last-name').value,
            country: document.getElementById('reg-country').value,
            city: document.getElementById('reg-city').value,
            district: document.getElementById('reg-district').value,
            neighborhood: document.getElementById('reg-neighborhood').value,
            phone: document.getElementById('reg-phone').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            category_ids: selectedCats
        };

        this.renderPaymentScreen();
    }

    // View 5: Üyelik Ödeme Sayfası (Screenshot 5)
    renderPaymentScreen() {
        if (!this.tempRegister) {
            this.navigateTo('/uyelik');
            return;
        }

        const sidebar = document.getElementById('sidebar-content');
        const panel = document.getElementById('panel-content');

        sidebar.innerHTML = `
            <div class="sidebar-box">
                <h3 class="sidebar-title"><i class="fa-solid fa-credit-card"></i> GÜVENLİK</h3>
                <p style="font-size: 12px; color: var(--clr-text-secondary);">3D Secure ödeme altyapısı aktiftir. Kredi kartı verileriniz asla sistemlerimizde saklanmaz.</p>
            </div>
        `;

        panel.innerHTML = `
            <div class="panel-header-section">
                <h1>Üyelik Ödeme Sayfası</h1>
                <p>Platform üyelik aktivasyon ücretini güvenle tamamlayın.</p>
            </div>

            <div class="dashboard-grid">
                <!-- Sol Taraf: Kart Formu -->
                <div class="content-card">
                    <h3 class="card-title">Kart Bilgileri</h3>
                    <form class="styled-form" onsubmit="app.submitRegistration(event)">
                        <div class="form-field">
                            <label>KART SAHİBİ ADI SOYADI</label>
                            <input type="text" id="card-holder" required placeholder="Kaya Öztürk" oninput="app.updateCardPreview()">
                        </div>

                        <div class="form-field">
                            <label>KART NUMARASI</label>
                            <input type="text" id="card-number" required placeholder="4355 8899 7711 2233" maxlength="19" oninput="app.updateCardPreview()">
                        </div>

                        <div class="form-row">
                            <div class="form-field">
                                <label>SON KULLANMA TARİHİ</label>
                                <input type="text" id="card-expiry" required placeholder="MM/YY" maxlength="5" oninput="app.updateCardPreview()">
                            </div>
                            <div class="form-field">
                                <label>CVC (GÜVENLİK KODU)</label>
                                <input type="password" id="card-cvc" required placeholder="•••" maxlength="3">
                            </div>
                        </div>

                        <div class="action-buttons-row" style="margin-top: 24px;">
                            <button type="button" class="secondary-btn" onclick="app.navigateTo('/uyelik')"><i class="fa-solid fa-angle-left"></i> Geri Dön</button>
                            <button type="submit" class="primary-btn">ÖDEMEYİ TAMAMLA VE KAYDET ▷</button>
                        </div>
                    </form>
                </div>

                <!-- Sağ Taraf: Kart Ön İzleme (Klasik Premium Demo) -->
                <div class="content-card" style="display: flex; flex-direction: column; justify-content: center; align-items: center; background: radial-gradient(circle, #252a37 0%, #151923 100%); min-height: 240px; border-color: rgba(226, 125, 96, 0.2);">
                    <div class="credit-card-preview">
                        <div class="card-chip"><i class="fa-solid fa-microchip fa-2x"></i></div>
                        <div class="card-num-view" id="card-preview-num">•••• •••• •••• ••••</div>
                        <div class="card-bottom-row">
                            <div class="card-holder-view" id="card-preview-holder">KART SAHİBİ</div>
                            <div class="card-expiry-view" id="card-preview-expiry">MM/YY</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateCardPreview() {
        const holder = document.getElementById('card-holder')?.value || 'KART SAHİBİ';
        const num = document.getElementById('card-number')?.value || '•••• •••• •••• ••••';
        const exp = document.getElementById('card-expiry')?.value || 'MM/YY';

        const pNum = document.getElementById('card-preview-num');
        const pHolder = document.getElementById('card-preview-holder');
        const pExp = document.getElementById('card-preview-expiry');

        if (pNum) pNum.textContent = num;
        if (pHolder) pHolder.textContent = holder.toUpperCase();
        if (pExp) pExp.textContent = exp;
    }

    async submitRegistration(event) {
        event.preventDefault();

        try {
            // 1. Kullanıcı kaydı
            const regRes = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.tempRegister.email,
                    password: this.tempRegister.password,
                    first_name: this.tempRegister.first_name,
                    last_name: this.tempRegister.last_name,
                    phone: this.tempRegister.phone,
                    role: this.tempRegister.role
                })
            });

            const regData = await regRes.json();
            if (!regRes.ok) {
                alert(`Kayıt Hatası: ${regData.error || 'Bilinmeyen bir hata.'}`);
                return;
            }

            // 2. Otomatik Giriş
            const loginRes = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: this.tempRegister.email,
                    password: this.tempRegister.password
                })
            });

            const loginData = await loginRes.json();
            if (!loginRes.ok) {
                alert('Giriş başarısız oldu.');
                return;
            }

            this.token = loginData.token;
            this.user = loginData.user;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));

            // 3. Şirket profilini oluştur
            const compRes = await fetch(`${API_URL}/api/companies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    name: this.tempRegister.company_name,
                    tax_number: Math.floor(Math.random() * 9000000000 + 1000000000).toString(), // Random 10 haneli
                    tax_office: this.tempRegister.district,
                    address: `${this.tempRegister.neighborhood || ''} ${this.tempRegister.district} / ${this.tempRegister.city}`,
                    city: this.tempRegister.city,
                    district: this.tempRegister.district
                })
            });

            if (compRes.ok) {
                // Aktivasyon/Doğrulama işlemini anında tamamla
                await fetch(`${API_URL}/api/companies/verify-demo-quick`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }

            alert('Üyelik ödemeniz onaylandı ve kaydınız başarıyla tamamlandı!');
            this.tempRegister = null;
            this.updateHeaderUI();
            this.navigateTo('/');

        } catch (e) {
            console.error('Kayıt tamamlama hatası:', e);
            alert('Ağ bağlantı hatası oluştu.');
        }
    }

    // View 6: Üye Ekranı (Screenshot 6)
    async renderMemberScreen(tenderId) {
        const sidebar = document.getElementById('sidebar-content');
        const panel = document.getElementById('panel-content');

        // Sidebar: İlan Detayları
        sidebar.innerHTML = `
            <div class="sidebar-box">
                <h3 class="sidebar-title"><i class="fa-solid fa-circle-info"></i> İLAN DETAYI</h3>
                <div id="tender-sidebar-details">
                    <p style="font-size: 11px; color: var(--clr-text-secondary); text-align: center; padding: 20px;">
                        <i class="fa-solid fa-spinner fa-spin"></i> Yükleniyor...
                    </p>
                </div>
            </div>
        `;

        // Panel: Teklif Arenası ve Teklif Listesi (Screenshot 6)
        panel.innerHTML = `
            <div class="panel-header-section">
                <h1>Canlı Teklif Değerlendirme Arenası</h1>
                <p>İhaleye gelen tüm teklifleri görün, onaylayın veya pazarlık sürecini başlatın.</p>
            </div>

            <div class="content-card" style="margin-bottom: 24px;">
                <div class="card-header-row">
                    <h3 class="card-title">Gelen Teklif Sıralaması</h3>
                    <span class="badge-count" id="bid-list-count">0 Teklif</span>
                </div>
                <div class="bid-ladder-list" id="tender-bids-list">
                    <!-- Dinamik Teklifler -->
                    <div style="text-align: center; padding: 24px; color: var(--clr-text-secondary);">
                        <i class="fa-solid fa-spinner fa-spin fa-lg"></i> Teklifler listesi yükleniyor...
                    </div>
                </div>
            </div>

            <!-- Teklif Verme Paneli (Sadece Satıcılar için) -->
            <div class="content-card" id="bid-submission-card" style="display: none;">
                <h3 class="card-title">İhaleye Teklif Ver</h3>
                <form class="styled-form" onsubmit="app.submitBid(event)">
                    <div class="form-row">
                        <div class="form-field">
                            <label>TEKLİF FİYATI (KDV DAHİL DEĞİL)</label>
                            <input type="number" id="bid-price" required placeholder="Örn: 42000" min="1">
                        </div>
                        <div class="form-field">
                            <label>KDV DURUMU</label>
                            <select id="bid-tax" class="filter-select">
                                <option value="false">KDV Hariç</option>
                                <option value="true">KDV Dahil</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-field">
                            <label>TESLİMAT SÜRESİ (GÜN)</label>
                            <input type="number" id="bid-lead-time" required placeholder="Örn: 3" min="1">
                        </div>
                        <div class="form-field">
                            <label>İHALE BİTİŞİNDEN ÖNCE PAZARLIK ET / NOT</label>
                            <input type="text" id="bid-note" placeholder="Ekstra özellikler, marka detayları veya teklif koşulları...">
                        </div>
                    </div>

                    <button type="submit" class="primary-btn w-full">TEKLİFİ GÖNDER ▷</button>
                </form>
            </div>
        `;

        await this.loadTenderDetails(tenderId);
    }

    async loadTenderDetails(tenderId) {
        try {
            const res = await fetch(`${API_URL}/api/tenders/${tenderId}`);
            if (!res.ok) {
                alert('İhale detayı bulunamadı.');
                this.navigateTo('/');
                return;
            }
            const data = await res.json();
            const tender = data.tender;
            this.selectedTender = tender;
            const bids = data.bids || [];

            // Join socket room
            if (this.socket) {
                this.socket.emit('join_tender', tenderId);
            }

            // Update Sidebar Info
            const sidebar = document.getElementById('tender-sidebar-details');
            if (sidebar) {
                sidebar.innerHTML = `
                    <div class="tender-spec-item"><strong>BAŞLIK:</strong> ${tender.title}</div>
                    <div class="tender-spec-item"><strong>KATEGORİ:</strong> ${tender.category_name}</div>
                    <div class="tender-spec-item"><strong>HEDEF FİYAT:</strong> ${tender.target_price ? tender.target_price.toLocaleString() + ' TL' : '-'}</div>
                    <div class="tender-spec-item"><strong>MİKTAR:</strong> ${tender.quantity} ${tender.unit}</div>
                    <div class="tender-spec-item"><strong>DURUM:</strong> <span class="stat-badge ${tender.status}">${tender.status.toUpperCase()}</span></div>
                    <div class="tender-spec-item"><strong>BİTİŞ:</strong> ${new Date(tender.expires_at).toLocaleDateString('tr-TR')}</div>
                    ${tender.file_url ? `<div class="tender-spec-item"><strong>ŞARTNAME:</strong> <a href="#" class="file-rar-link" onclick="alert('Demo dosya indiriliyor')"><i class="fa-solid fa-file-zipper"></i> RAR İndir</a></div>` : ''}
                    <div class="tender-spec-desc"><strong>AÇIKLAMA:</strong><br>${tender.description}</div>
                `;
            }

            // Update Bids List UI
            const bidsCountEl = document.getElementById('bid-list-count');
            if (bidsCountEl) bidsCountEl.textContent = `${bids.length} Teklif`;

            const list = document.getElementById('tender-bids-list');
            if (list) {
                if (bids.length === 0) {
                    list.innerHTML = `
                        <div style="text-align: center; padding: 32px; color: var(--clr-text-secondary);">
                            Henüz bu ihaleye teklif verilmemiştir.
                        </div>
                    `;
                } else {
                    const isOwner = this.user && this.user.id === tender.buyer_id;
                    list.innerHTML = bids.map((b, index) => {
                        let rankClass = '';
                        if (index === 0) rankClass = 'rank-gold';
                        else if (index === 1) rankClass = 'rank-silver';
                        else if (index === 2) rankClass = 'rank-bronze';

                        let actionButtons = '';
                        if (isOwner && tender.status === 'open') {
                            actionButtons = `
                                <div class="bid-action-buttons">
                                    <button class="btn-small-approve" onclick="app.awardBid('${b.id}')"><i class="fa-solid fa-check"></i> KABUL ET</button>
                                    <button class="btn-small-reject" onclick="app.rejectBid('${b.id}')"><i class="fa-solid fa-ban"></i> RET</button>
                                    <button class="btn-small-negotiate" onclick="app.openNegotiateDialog('${b.id}', ${b.price})"><i class="fa-solid fa-comments"></i> PAZARLIK ET</button>
                                </div>
                            `;
                        }

                        return `
                            <div class="bid-ladder-item ${b.status === 'won' ? 'winner-gold' : ''} ${b.status === 'rejected' ? 'status-rejected' : ''} ${b.status === 'negotiating' ? 'status-negotiating' : ''}">
                                <div class="bid-rank ${rankClass}">${index + 1}</div>
                                <div class="bid-meta-left">
                                    <div class="bid-firm-name" onclick="app.navigateTo('/firma-bilgi/${b.company_id}')" style="cursor: pointer; text-decoration: underline;">${b.company_name}</div>
                                    <div class="bid-date">${b.delivery_lead_time_days} gün teslim süresi • ${b.tax_included ? 'KDV Dahil' : 'KDV Hariç'}</div>
                                    ${b.note ? `<div class="bid-note-text"><i class="fa-solid fa-comment-dots"></i> ${b.note}</div>` : ''}
                                </div>
                                <div class="bid-price-right">
                                    <div class="bid-price-value">${b.price.toLocaleString()} TL</div>
                                    <div class="bid-status-label">${b.status.toUpperCase()}</div>
                                    ${actionButtons}
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }

            // Show Bidding Form for active sellers
            const bidFormCard = document.getElementById('bid-submission-card');
            if (bidFormCard) {
                if (this.user && this.user.role === 'seller' && tender.status === 'open') {
                    bidFormCard.style.display = 'block';
                } else {
                    bidFormCard.style.display = 'none';
                }
            }

        } catch (e) {
            console.error('İhale detayları yüklenemedi:', e);
        }
    }

    async submitBid(event) {
        event.preventDefault();
        if (!this.selectedTender) return;

        const price = document.getElementById('bid-price').value;
        const tax = document.getElementById('bid-tax').value === 'true';
        const lead = document.getElementById('bid-lead-time').value;
        const note = document.getElementById('bid-note').value;

        try {
            const res = await fetch(`${API_URL}/api/bids/tenders/${this.selectedTender.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    price: parseFloat(price),
                    tax_included: tax,
                    delivery_lead_time_days: parseInt(lead),
                    note
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Teklifiniz başarıyla arenaya sunuldu!');
                document.getElementById('bid-price').value = '';
                document.getElementById('bid-lead-time').value = '';
                document.getElementById('bid-note').value = '';
                this.loadTenderDetails(this.selectedTender.id);
            } else {
                alert(`Teklif Reddedildi: ${data.error || 'Hata'}`);
            }
        } catch (e) {
            console.error('Teklif gönderme hatası:', e);
            alert('Ağ veya sunucu hatası.');
        }
    }

    async awardBid(bidId) {
        if (!confirm('Bu teklifi ihalenin kazananı olarak kabul edip sözleşmeyi başlatmak istediğinize emin misiniz?')) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/tenders/${this.selectedTender.id}/award`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ winning_bid_id: bidId })
            });

            if (res.ok) {
                alert('İhale başarıyla sonuçlandı ve kazanan belirlendi!');
                this.loadTenderDetails(this.selectedTender.id);
            } else {
                const data = await res.json();
                alert(`Hata: ${data.error}`);
            }
        } catch (e) {
            alert('Sunucu hatası.');
        }
    }

    async rejectBid(bidId) {
        if (!confirm('Bu teklifi reddetmek istediğinize emin misiniz?')) return;

        try {
            const res = await fetch(`${API_URL}/api/bids/${bidId}/reject`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (res.ok) {
                alert('Teklif başarıyla reddedildi.');
                this.loadTenderDetails(this.selectedTender.id);
            } else {
                const data = await res.json();
                alert(`Hata: ${data.error}`);
            }
        } catch (e) {
            alert('Sunucu hatası.');
        }
    }

    openNegotiateDialog(bidId, currentPrice) {
        const target = prompt(`Lütfen satıcıya sunmak istediğiniz pazarlık hedef fiyatını yazın (Şu anki teklif: ${currentPrice.toLocaleString()} TL):`);
        if (!target) return;
        const msg = prompt("Pazarlık mesajınız veya talebiniz (Opsiyonel):");
        
        this.submitNegotiation(bidId, target, msg);
    }

    async submitNegotiation(bidId, targetPrice, message) {
        try {
            const res = await fetch(`${API_URL}/api/bids/${bidId}/negotiate`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ target_price: parseFloat(targetPrice), message })
            });

            if (res.ok) {
                alert('Pazarlık ve counter-offer talebi başarıyla tedarikçiye iletildi!');
                this.loadTenderDetails(this.selectedTender.id);
            } else {
                const data = await res.json();
                alert(`Hata: ${data.error}`);
            }
        } catch (e) {
            alert('Sunucu hatası.');
        }
    }

    // View 7: Firma Bilgi Ekranı (Screenshot 7)
    renderCompanyInfoScreen(companyId) {
        const sidebar = document.getElementById('sidebar-content');
        const panel = document.getElementById('panel-content');

        // Sidebar: Firma Puanlama
        sidebar.innerHTML = `
            <div class="sidebar-box">
                <h3 class="sidebar-title"><i class="fa-solid fa-star"></i> DEĞERLENDİRME</h3>
                <div class="rating-summary-box">
                    <div class="large-rating-num" id="company-avg-rating">4.6</div>
                    <div class="stars-row"><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star"></i><i class="fa-solid fa-star-half-stroke"></i></div>
                    <p style="font-size: 11px; color: var(--clr-text-secondary); text-align: center; margin-top: 10px;" id="company-rating-count">5 Değerlendirme</p>
                </div>
            </div>
        `;

        panel.innerHTML = `
            <div class="panel-header-section">
                <h1>Firma Bilgi ve İstatistik Ekranı</h1>
                <p>Tedarikçi firmanın ticaret geçmişini, başarı oranlarını ve diğer üyelerin anket puanlarını inceleyin.</p>
            </div>

            <div class="content-card" style="margin-bottom: 24px;">
                <h3 class="card-title">Firma Detayları & İstatistikleri</h3>
                <div class="preview-details-grid">
                    <div class="preview-item"><strong>FİRMA İSMİ:</strong> <span id="comp-info-name">Beta Beton A.Ş.</span></div>
                    <div class="preview-item"><strong>FAALİYET ALANI:</strong> Peyzaj, Kırtasiye, Lojistik</div>
                    <div class="preview-item"><strong>KONUM:</strong> Türkiye / Kocaeli / Gebze</div>
                    <div class="preview-item"><strong>TAMAMLANAN TİCARET:</strong> 24 İhale</div>
                    <div class="preview-item"><strong>BAŞARI ORANI:</strong> %98</div>
                    <div class="preview-item"><strong>ÜYELİK TARİHİ:</strong> 12 Ocak 2026</div>
                </div>
            </div>

            <div class="content-card">
                <h3 class="card-title">Firma İstatistikleri Puanları Anketi (Geri Bildirim)</h3>
                <form class="styled-form" onsubmit="app.submitCompanySurvey(event, '${companyId}')">
                    <div class="form-row">
                        <div class="form-field">
                            <label>Hizmet Kalitesi (1-5 Puan)</label>
                            <select id="survey-service" class="filter-select">
                                <option value="5">5 - Mükemmel</option>
                                <option value="4">4 - İyi</option>
                                <option value="3">3 - Orta</option>
                                <option value="2">2 - Zayıf</option>
                                <option value="1">1 - Çok Kötü</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Teslimat Hızı ve Lojistik</label>
                            <select id="survey-delivery" class="filter-select">
                                <option value="5">5 - Mükemmel</option>
                                <option value="4">4 - İyi</option>
                                <option value="3">3 - Orta</option>
                                <option value="2">2 - Zayıf</option>
                                <option value="1">1 - Çok Kötü</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-field">
                        <label>Ödeme / İletişim Güvenilirliği (Anket Puanı)</label>
                        <select id="survey-trust" class="filter-select">
                            <option value="5">5 - Tam Güvenilir</option>
                            <option value="4">4 - Güvenilir</option>
                            <option value="3">3 - Orta</option>
                            <option value="2">2 - Kararsız</option>
                            <option value="1">1 - Güvenilmez</option>
                        </select>
                    </div>

                    <div class="form-field">
                        <label>Yorum ve Geri Bildirim Ekle</label>
                        <textarea id="survey-comment" rows="3" placeholder="Firma ile olan ticaret deneyiminiz hakkında diğer üyelere bilgi verin..."></textarea>
                    </div>

                    <button type="submit" class="primary-btn">KAYDET VE ANKETİ GÖNDER ▷</button>
                </form>
            </div>
        `;
    }

    submitCompanySurvey(event, companyId) {
        event.preventDefault();
        alert('Geri bildirim anketiniz başarıyla kaydedildi! Puanlama güncellendi.');
        const comment = document.getElementById('survey-comment')?.value;
        if (comment) {
            document.getElementById('company-avg-rating').textContent = "4.8";
            document.getElementById('company-rating-count').textContent = "6 Değerlendirme";
        }
        this.navigateTo('/');
    }

    // View: Verilen ve Alınan Teklifler Listesi
    async renderMyBidsScreen(type) {
        if (!this.user) {
            alert('Lütfen önce giriş yapınız.');
            this.openLoginModal();
            return;
        }

        const sidebar = document.getElementById('sidebar-content');
        const panel = document.getElementById('panel-content');

        sidebar.innerHTML = `
            <div class="sidebar-box">
                <h3 class="sidebar-title"><i class="fa-solid fa-list-check"></i> ÖZET</h3>
                <p style="font-size: 12px; color: var(--clr-text-secondary);">Bu sayfada ${type === 'sent' ? 'verdiğiniz aktif teklifleri' : 'ihalenize gelen tüm teklifleri'} topluca inceleyebilirsiniz.</p>
            </div>
        `;

        panel.innerHTML = `
            <div class="panel-header-section">
                <h1>${type === 'sent' ? 'Verdiğiniz Teklifler' : 'Alınan Teklifler'}</h1>
                <p>Arenadaki güncel işlem durumunuzu buradan yönetin.</p>
            </div>

            <div class="content-card">
                <div class="table-container">
                    <table class="premium-table">
                        <thead>
                            <tr>
                                <th>İHALE BAŞLIĞI</th>
                                <th>${type === 'sent' ? 'TEKLİFİNİZ' : 'FİRMA'}</th>
                                <th>TESLİMAT SÜRESİ</th>
                                <th>DURUM</th>
                                <th>TARİH</th>
                                <th style="text-align: center;">DETAY</th>
                            </tr>
                        </thead>
                        <tbody id="my-bids-table-body">
                            <tr>
                                <td colspan="6" style="text-align: center; padding: 48px;">
                                    <i class="fa-solid fa-spinner fa-spin fa-lg"></i> Veriler yükleniyor...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        try {
            let res;
            if (type === 'sent') {
                res = await fetch(`${API_URL}/api/bids/my-bids`, {
                    headers: { 'Authorization': `Bearer ${this.token}` }
                });
                const data = await res.json();
                const bids = data.bids || [];

                const tbody = document.getElementById('my-bids-table-body');
                if (bids.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--clr-text-secondary);">Henüz bir ihaleye teklif vermediniz.</td></tr>`;
                } else {
                    tbody.innerHTML = bids.map(b => `
                        <tr>
                            <td><strong>${b.tender_title}</strong></td>
                            <td class="font-mono">${b.price.toLocaleString()} TL</td>
                            <td>${b.delivery_lead_time_days} Gün</td>
                            <td><span class="stat-badge ${b.status}">${b.status.toUpperCase()}</span></td>
                            <td>${new Date(b.created_at).toLocaleDateString('tr-TR')}</td>
                            <td style="text-align: center;">
                                <button class="view-ad-btn" onclick="app.navigateTo('/teklifler/${b.tender_id}')">
                                    <i class="fa-solid fa-play"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
            } else {
                // Alınan Teklifler (Alıcının kendi açtığı ihalelere gelen teklifler)
                const tendersRes = await fetch(`${API_URL}/api/tenders`);
                const data = await tendersRes.json();
                // Kendi ihalelerimizi filtreleyelim
                const myTenders = (data.tenders || []).filter(t => t.buyer_id === this.user.id);
                
                const tbody = document.getElementById('my-bids-table-body');
                if (myTenders.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 32px; color: var(--clr-text-secondary);">Henüz açtığınız bir ihale bulunmuyor.</td></tr>`;
                } else {
                    tbody.innerHTML = myTenders.map(t => `
                        <tr>
                            <td><strong>${t.title}</strong></td>
                            <td>-</td>
                            <td>${new Date(t.expires_at).toLocaleDateString('tr-TR')} Bitiş</td>
                            <td><span class="stat-badge ${t.status}">${t.status.toUpperCase()}</span></td>
                            <td><i class="fa-solid fa-gavel"></i> ${t.teklif_sayisi || 0} Teklif Gelen</td>
                            <td style="text-align: center;">
                                <button class="view-ad-btn" onclick="app.navigateTo('/teklifler/${t.id}')">
                                    <i class="fa-solid fa-play"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (e) {
            console.error('Veriler yüklenemedi:', e);
        }
    }

    // -------------------------------------------------------------
    // AUTH MODAL & DEMO LOGINS
    // -------------------------------------------------------------
    openLoginModal(targetRole = null) {
        document.getElementById('login-modal').style.display = 'flex';
    }

    closeLoginModal() {
        document.getElementById('login-modal').style.display = 'none';
    }

    async handleDemoLogin(role) {
        const email = role === 'buyer' 
            ? 'müteahhit_test@gelanlasalim.com' 
            : 'beta_beton_test@gelanlasalim.com';
        
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: 'demo-password' })
            });

            const data = await res.json();
            if (res.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                this.updateHeaderUI();
                this.closeLoginModal();
                alert(`Hoş geldiniz ${this.user.first_name}! Giriş yapıldı.`);
                
                // Refresh active view
                this.handleRoute();
            } else {
                alert(`Demo giriş hatası: ${data.error}`);
            }
        } catch (e) {
            alert('Sunucu hatası.');
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            if (res.ok) {
                this.token = data.token;
                this.user = data.user;
                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));
                this.updateHeaderUI();
                this.closeLoginModal();
                alert(`Hoş geldiniz ${this.user.first_name}! Giriş yapıldı.`);
                this.handleRoute();
            } else {
                alert(`Hata: ${data.error}`);
            }
        } catch (e) {
            alert('Sunucu hatası.');
        }
    }
}

// Global App nesnesini tanımla
const app = new App();
window.app = app;
