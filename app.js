/* ═══════════════════════════════════════════════════════════════════
   ABEENAZ LUXURY PARLOR — app.js
   ═══════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════
   STORAGE KEY
══════════════════════════════════════════════════════ */
const STORE_KEY = 'abeenaz_data';

/* ══════════════════════════════════════════════════════
   DEFAULT DATA
══════════════════════════════════════════════════════ */
function getDefaultData() {
  return {
    admin: {
      phone: '3192641891',
      pin: '1234' // Default PIN, should be changed
    },
    settings: {
      brand: 'Abeenaz',
      tagline: 'where luxury meets you',
      address: 'Karachi, Pakistan',
      whatsapp: '3192641891',
      hours: 'Mon–Sat, 10am–8pm',
      estYear: '2023',
      aboutText: 'Abeenaz was born from a simple belief — every woman deserves to feel extraordinary. Founded in 2023, our parlour has grown into one of the most trusted beauty destinations in the city.\n\nOur team of expert stylists and beauty artists are trained in both classic techniques and modern trends, ensuring every visit is a transformative experience.',
      pointsRate: 1, // points per Rs.100
      heroTitle: 'Where Every Woman<br/><em>Deserves to Shine</em>',
      heroSub: 'Premium beauty services crafted with care, artistry and the finest products.'
    },
    clients: {},
    services: [
      {
        id: 'hair',
        name: 'Hair',
        items: [
          { id: 'h1', name: 'Haircut & Styling', price: 800 },
          { id: 'h2', name: 'Blowout & Blowdry', price: 600 },
          { id: 'h3', name: 'Hair Color (global)', price: 2500 },
          { id: 'h4', name: 'Balayage / Highlights', price: 4000 },
          { id: 'h5', name: 'Keratin Treatment', price: 6000 },
          { id: 'h6', name: 'Hair Spa', price: 1500 }
        ]
      },
      {
        id: 'skin',
        name: 'Skin',
        items: [
          { id: 's1', name: 'Basic Facial', price: 1200 },
          { id: 's2', name: 'Gold Facial', price: 2500 },
          { id: 's3', name: 'Deep Cleansing', price: 1800 },
          { id: 's4', name: 'Whitening Facial', price: 3000 },
          { id: 's5', name: 'Threading (full face)', price: 300 },
          { id: 's6', name: 'Waxing (arms/legs)', price: 700 }
        ]
      },
      {
        id: 'nails',
        name: 'Nails',
        items: [
          { id: 'n1', name: 'Manicure', price: 600 },
          { id: 'n2', name: 'Pedicure', price: 800 },
          { id: 'n3', name: 'Gel Nails', price: 1500 },
          { id: 'n4', name: 'Nail Extensions', price: 2500 },
          { id: 'n5', name: 'Nail Art (per nail)', price: 100 }
        ]
      },
      {
        id: 'bridal',
        name: 'Bridal',
        items: [
          { id: 'b1', name: 'Bridal Makeup (full)', price: 15000 },
          { id: 'b2', name: 'Engagement Makeup', price: 8000 },
          { id: 'b3', name: 'Mehndi Function Look', price: 5000 },
          { id: 'b4', name: 'Bridal Hair (updo)', price: 4000 },
          { id: 'b5', name: 'Pre-Bridal Package', price: 25000 }
        ]
      }
    ],
    perks: [
      { id: 'p1', name: 'Basic', monthlyMin: 3000, discount: 5, benefits: '5% off all services' },
      { id: 'p2', name: 'Silver', monthlyMin: 5000, discount: 10, benefits: '10% off all services' },
      { id: 'p3', name: 'Gold', monthlyMin: 8000, discount: 15, benefits: '15% off + priority booking' },
      { id: 'p4', name: 'Diamond', monthlyMin: 12000, discount: 20, benefits: '20% off + priority + birthday gift' }
    ],
    loyaltyShop: [
      { id: 'l1', name: 'Free Basic Facial', points: 500, desc: 'One complimentary basic facial session' },
      { id: 'l2', name: 'Rs.500 Discount Voucher', points: 300, desc: 'Off your next visit' },
      { id: 'l3', name: 'Free Manicure', points: 200, desc: 'Classic manicure on the house' }
    ],
    bills: []
  };
}

/* ══════════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════════ */
let DB = loadDB();
let pinBuffer = '';
let currentScreen = 's-welcome';

/* ══════════════════════════════════════════════════════
   DATABASE FUNCTIONS
══════════════════════════════════════════════════════ */
function loadDB() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return getDefaultData();
}

function saveDB() {
  localStorage.setItem(STORE_KEY, JSON.stringify(DB));
}

/* ══════════════════════════════════════════════════════
   UTILITIES
══════════════════════════════════════════════════════ */
function fmt(n) {
  return Number(n).toLocaleString('en-PK');
}

function today() {
  return new Date().toISOString().split('T')[0];
}

function monthKey(offset = 0) {
  const d = new Date();
  if (offset) d.setMonth(d.getMonth() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function capitalize(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}

function getPerk(monthlySpend) {
  const sorted = [...DB.perks].sort((a, b) => b.monthlyMin - a.monthlyMin);
  for (const p of sorted) {
    if (monthlySpend >= p.monthlyMin) return p;
  }
  return null;
}

function getPerkByName(name) {
  return DB.perks.find(p => p.name === name);
}

function calcPoints(amount) {
  const rate = DB.settings.pointsRate || 1;
  return Math.floor(amount / 100) * rate;
}

/* ══════════════════════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════════════════════ */
let toastTimer;
function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3800);
}

/* ══════════════════════════════════════════════════════
   SCREEN NAVIGATION
══════════════════════════════════════════════════════ */
function goScreen(id) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  const el = document.getElementById(id);
  if (el) {
    el.style.display = 'flex';
    setTimeout(() => el.classList.add('active'), 10);
  }
  currentScreen = id;
}

/* ══════════════════════════════════════════════════════
   ANIMATED BACKGROUND
══════════════════════════════════════════════════════ */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.r = Math.random() * 1.5 + 0.3;
      this.a = Math.random() * 0.35 + 0.05;
      this.dx = (Math.random() - 0.5) * 0.3;
      this.dy = (Math.random() - 0.5) * 0.3;
    }
    update() {
      this.x += this.dx;
      this.y += this.dy;
      if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
  }

  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 90; i++) particles.push(new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.update();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,168,76,${p.a})`;
      ctx.fill();
    });
    requestAnimationFrame(loop);
  })();
})();

/* ══════════════════════════════════════════════════════
   CUSTOM CURSOR
══════════════════════════════════════════════════════ */
(function initCursor() {
  const dot = document.getElementById('cursor');
  const ring = document.getElementById('cursor-follower');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top = my + 'px';
  });

  (function animateRing() {
    rx += (mx - rx) * 0.15;
    ry += (my - ry) * 0.15;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animateRing);
  })();

  const hoverTargets = 'button, input, a, select, textarea, .srv-card, .a-tab, .loyalty-item';
  document.addEventListener('mouseover', e => {
    if (e.target.matches(hoverTargets) || e.target.closest(hoverTargets)) {
      dot.style.width = '14px';
      dot.style.height = '14px';
      ring.style.width = '48px';
      ring.style.height = '48px';
      ring.style.borderColor = 'rgba(201,168,76,0.8)';
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.matches(hoverTargets) || e.target.closest(hoverTargets)) {
      dot.style.width = '8px';
      dot.style.height = '8px';
      ring.style.width = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(201,168,76,0.5)';
    }
  });
})();

/* ══════════════════════════════════════════════════════
   WELCOME SCREEN HANDLERS
══════════════════════════════════════════════════════ */
document.getElementById('btn-phone-submit')?.addEventListener('click', handlePhone);
document.getElementById('inp-phone')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') handlePhone();
});
document.getElementById('btn-explore-guest')?.addEventListener('click', () => {
  loadExploreScreen();
  goScreen('s-explore');
});

function handlePhone() {
  const phone = document.getElementById('inp-phone').value.trim().replace(/\D/g, '');
  if (phone.length !== 10) {
    showToast('Enter a valid 10-digit number', 'error');
    return;
  }

  if (phone === DB.admin.phone) {
    goScreen('s-pin');
  } else {
    showToast('Admin access only. Explore as guest!', 'warning');
  }
}

/* ══════════════════════════════════════════════════════
   PIN SCREEN HANDLERS
══════════════════════════════════════════════════════ */
function numPress(d) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += d;
  updatePinDots();
  if (pinBuffer.length === 4) {
    setTimeout(checkPin, 200);
  }
}

function delPin() {
  pinBuffer = pinBuffer.slice(0, -1);
  updatePinDots();
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('pd' + i);
    if (dot) dot.classList.toggle('filled', i < pinBuffer.length);
  }
}

function checkPin() {
  if (pinBuffer === DB.admin.pin) {
    showToast('Admin access granted ✦', 'success');
    setTimeout(() => {
      loadAdminPanel();
      goScreen('s-admin');
    }, 400);
  } else {
    showToast('Incorrect PIN', 'error');
    shakePinRow();
    pinBuffer = '';
    updatePinDots();
  }
}

function shakePinRow() {
  const row = document.getElementById('pin-row');
  if (row) {
    row.classList.add('shake');
    setTimeout(() => row.classList.remove('shake'), 500);
  }
}

/* ══════════════════════════════════════════════════════
   ADMIN PANEL
══════════════════════════════════════════════════════ */
function loadAdminPanel() {
  // Update stats
  const clients = Object.values(DB.clients);
  const thisMonth = monthKey();
  let monthlyTotal = 0;
  let attentionCount = 0;
  let referralCount = 0;

  clients.forEach(c => {
    const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
    monthlyTotal += monthlySpend;
    
    // Check if needs attention (past 20th and not meeting maintenance)
    const day = new Date().getDate();
    const perk = getPerk(monthlySpend);
    const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];
    if (day >= 20 && nextPerk && monthlySpend < nextPerk.monthlyMin) {
      attentionCount++;
    }
    if (c.referredBy) referralCount++;
  });

  document.getElementById('stat-total-clients').textContent = clients.length;
  document.getElementById('stat-this-month').textContent = 'Rs.' + fmt(monthlyTotal);
  document.getElementById('stat-alerts').textContent = attentionCount;
  document.getElementById('stat-referrals').textContent = referralCount;
  document.getElementById('admin-phone-display').textContent = '+92 ' + DB.admin.phone;

  // Alert banner
  const day = new Date().getDate();
  const banner = document.getElementById('admin-alert-banner');
  if (day >= 1 && day <= 5) {
    banner.classList.remove('hidden');
    document.getElementById('alert-title').textContent = '1st of Month';
    document.getElementById('alert-message').textContent = 'Send monthly summaries to all customers';
  } else if (day >= 20 && day <= 25) {
    banner.classList.remove('hidden');
    document.getElementById('alert-title').textContent = '20th of Month';
    document.getElementById('alert-message').textContent = attentionCount + ' customers need maintenance reminder';
  } else {
    banner.classList.add('hidden');
  }

  // Load current tab
  loadClientsList();
  loadServicesDropdown();
  loadBillsList();
  loadAttentionList();
  loadServicesAdmin();
  loadLoyaltyAdmin();
  loadCustomize();
}

function switchTab(tabId) {
  document.querySelectorAll('.a-tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
  document.querySelectorAll('.a-tab-content').forEach(c => c.classList.remove('active'));
  document.getElementById('tab-' + tabId)?.classList.add('active');

  // Load tab-specific content
  if (tabId === 'clients') loadClientsList();
  if (tabId === 'billing') { loadServicesDropdown(); loadBillsList(); }
  if (tabId === 'alerts-tab') loadAttentionList();
  if (tabId === 'mts') { loadMTSList(); loadMessagePreviews(); }
  if (tabId === 'services') loadServicesAdmin();
  if (tabId === 'loyalty') loadLoyaltyAdmin();
  if (tabId === 'customize') loadCustomize();
}

/* ══════════════════════════════════════════════════════
   CLIENTS TAB
══════════════════════════════════════════════════════ */
function loadClientsList() {
  const list = document.getElementById('clients-list');
  if (!list) return;

  const search = (document.getElementById('client-search')?.value || '').toLowerCase();
  const clients = Object.entries(DB.clients).filter(([phone, c]) =>
    phone.includes(search) || (c.name || '').toLowerCase().includes(search)
  );

  const thisMonth = monthKey();
  const day = new Date().getDate();

  list.innerHTML = clients.length ? clients.map(([phone, c]) => {
    const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
    const perk = getPerk(monthlySpend);
    const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];
    const needsAttention = day >= 20 && nextPerk && monthlySpend < nextPerk.monthlyMin;
    const pct = nextPerk ? Math.min((monthlySpend / nextPerk.monthlyMin) * 100, 100) : 100;

    return `
      <div class="client-card ${needsAttention ? 'alert' : ''}" onclick="openClientDetail('${phone}')">
        <div class="client-main">
          <div class="client-name">${c.name || 'Unknown'}</div>
          <div class="client-phone">+92 ${phone} · ${c.visits || 0} visits · Rs.${fmt(c.lifetimeSpend || 0)} lifetime</div>
          <div class="client-stats">
            <span>Monthly: <strong>Rs.${fmt(monthlySpend)}</strong></span>
            <span>Points: <strong>${c.points || 0}</strong></span>
            ${perk ? `<span>Perk: <strong class="text-gold">${perk.name} (${perk.discount}% off)</strong></span>` : ''}
          </div>
        </div>
        <div class="client-actions">
          <div class="maintenance-ring">${renderRing(pct, needsAttention)}</div>
          <button class="rm-btn" onclick="event.stopPropagation(); removeClient('${phone}')">✕</button>
        </div>
      </div>
    `;
  }).join('') : '<div class="text-center text-muted">No clients found</div>';
}

function renderRing(pct, isAlert) {
  const size = 50, r = 20, cx = size/2, cy = size/2;
  const circum = 2 * Math.PI * r;
  const dash = (pct / 100) * circum;
  const color = isAlert ? '#ef4444' : (pct >= 100 ? '#4ade80' : '#c9a84c');
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
      stroke-dasharray="${dash} ${circum - dash}" transform="rotate(-90 ${cx} ${cy})" style="transition:stroke-dasharray 0.5s"/>
    <text x="${cx}" y="${cy + 4}" text-anchor="middle" font-size="10" fill="${color}">${Math.round(pct)}%</text>
  </svg>`;
}

function filterClients() {
  loadClientsList();
}

function openClientDetail(phone) {
  const c = DB.clients[phone];
  if (!c) return;

  const thisMonth = monthKey();
  const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
  const perk = getPerk(monthlySpend);
  const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];

  const body = document.getElementById('modal-client-body');
  body.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="edit-name" value="${c.name || ''}" />
      </div>
      <div class="form-group">
        <label>Phone</label>
        <input type="text" value="+92 ${phone}" readonly />
      </div>
      <div class="form-group">
        <label>Lifetime Spend</label>
        <input type="text" value="Rs.${fmt(c.lifetimeSpend || 0)}" readonly />
      </div>
      <div class="form-group">
        <label>This Month</label>
        <input type="text" value="Rs.${fmt(monthlySpend)}" readonly />
      </div>
      <div class="form-group">
        <label>Visits</label>
        <input type="text" value="${c.visits || 0}" readonly />
      </div>
      <div class="form-group">
        <label>Points</label>
        <input type="text" value="${c.points || 0}" readonly />
      </div>
      <div class="form-group">
        <label>Active Perk</label>
        <input type="text" value="${perk ? perk.name + ' (' + perk.discount + '% off)' : 'None'}" readonly />
      </div>
      <div class="form-group">
        <label>Next Perk</label>
        <input type="text" value="${nextPerk ? 'Spend Rs.' + fmt(nextPerk.monthlyMin - monthlySpend) + ' more for ' + nextPerk.name : 'Top tier!'}" readonly />
      </div>
      <div class="form-group">
        <label>Referred By</label>
        <input type="text" value="${c.referredBy ? '+92 ' + c.referredBy + ' (' + (DB.clients[c.referredBy]?.name || 'Unknown') + ')' : 'None'}" readonly />
      </div>
      <div class="form-group">
        <label>Referral Discount</label>
        <input type="text" value="${c.referralDiscount ? '5% off next visit' : 'Not active'}" readonly />
      </div>
    </div>
    <div class="form-group">
      <label>Birthday</label>
      <input type="date" id="edit-birthday" value="${c.birthday || ''}" />
    </div>
    <div class="form-actions">
      <button class="btn-primary" onclick="saveClientChanges('${phone}')">Save Changes</button>
      <button class="btn-whatsapp" onclick="sendClientSummary('${phone}')">Send WhatsApp Summary</button>
    </div>
  `;

  document.getElementById('modal-client-name').textContent = c.name || 'Client';
  openModal('client-modal');
}

function saveClientChanges(phone) {
  const c = DB.clients[phone];
  if (!c) return;

  c.name = document.getElementById('edit-name').value.trim() || c.name;
  c.birthday = document.getElementById('edit-birthday').value || null;

  saveDB();
  closeModal('client-modal');
  loadClientsList();
  showToast('Client updated ✦', 'success');
}

function removeClient(phone) {
  if (!confirm('Remove this client?')) return;
  delete DB.clients[phone];
  saveDB();
  loadClientsList();
  loadAdminPanel();
  showToast('Client removed', '');
}

function openAddClientModal() {
  document.getElementById('add-client-phone').value = '';
  document.getElementById('add-client-name').value = '';
  document.getElementById('add-client-referrer').value = '';
  document.getElementById('add-client-birthday').value = '';
  document.getElementById('referrer-info').classList.add('hidden');
  openModal('add-client-modal');
}

document.getElementById('add-client-referrer')?.addEventListener('input', function() {
  const phone = this.value.replace(/\D/g, '');
  const info = document.getElementById('referrer-info');
  if (phone.length === 10 && DB.clients[phone]) {
    const c = DB.clients[phone];
    info.innerHTML = `<span class="text-gold">✦ ${c.name} · Rs.${fmt(c.lifetimeSpend || 0)} lifetime</span>`;
    info.classList.remove('hidden');
  } else {
    info.classList.add('hidden');
  }
});

function addClient() {
  const phone = document.getElementById('add-client-phone').value.replace(/\D/g, '');
  const name = document.getElementById('add-client-name').value.trim();
  const referrer = document.getElementById('add-client-referrer').value.replace(/\D/g, '');
  const birthday = document.getElementById('add-client-birthday').value;

  if (phone.length !== 10) { showToast('Enter valid 10-digit phone', 'error'); return; }
  if (!name) { showToast('Enter client name', 'error'); return; }
  if (DB.clients[phone]) { showToast('Client already exists', 'error'); return; }

  DB.clients[phone] = {
    name,
    phone,
    birthday: birthday || null,
    joinDate: today(),
    visits: 0,
    lifetimeSpend: 0,
    monthlySpend: {},
    points: 0,
    referredBy: null,
    referralDiscount: false,
    alertSent: false
  };

  // Handle referral
  if (referrer && referrer.length === 10 && DB.clients[referrer]) {
    DB.clients[phone].referredBy = referrer;
    DB.clients[phone].referralDiscount = true;
    DB.clients[referrer].referralDiscount = true;
    DB.clients[referrer].needsReferralReward = true; // Add referrer to MTS for reward message
  }

  saveDB();
  closeModal('add-client-modal');
  loadClientsList();
  loadAdminPanel();

  // Don't auto-send - let MTS handle it
  showToast('Client added! Check MTS to send messages. ✦', 'success');
}

function sendWelcomeMessage(phone, referrer) {
  const c = DB.clients[phone];
  if (!c) {
    showToast('Client not found', 'error');
    return;
  }

  const referrerName = referrer && DB.clients[referrer] ? DB.clients[referrer].name : 'a friend';

  let msg = `🌸 *Welcome to ${DB.settings.brand}!*

Hi ${c.name}! 💛

You're now part of our family! We're so excited to have you.

`;
  
  if (referrer && DB.clients[referrer]) {
    msg += `🎁 You were referred by *${referrerName}* and got *5% off* on your first visit!

`;
  }

  msg += `✨ *How Our Perks Work:*
Spend a minimum amount each month to unlock exclusive benefits for the next month!

${DB.perks.map(p => `• ${p.name}: Spend Rs.${fmt(p.monthlyMin)}/mo → ${p.benefits}`).join('\n')}

🎁 *Loyalty Points:*
Earn ${DB.settings.pointsRate} point(s) for every Rs.100 spent! Redeem for free services and discounts in our Loyalty Shop.

📍 ${DB.settings.address}
📞 +92 ${DB.settings.whatsapp}
🕐 ${DB.settings.hours}

We can't wait to pamper you! 💅✨`;

  openWhatsApp(phone, msg);
}

function sendReferralRewardMessage(phone) {
  const c = DB.clients[phone];
  if (!c) return;

  // Find who they referred
  const referredClients = Object.entries(DB.clients).filter(([p, client]) => client.referredBy === phone);
  const names = referredClients.map(([p, client]) => client.name).join(', ');

  const msg = `🎉 *Someone joined ${DB.settings.brand} thanks to you!*

Hi ${c.name}! 💛

${names} just signed up using your referral! 

🎁 As a thank you, you get *5% off* on your next visit!

Keep sharing the love! 💛

📍 ${DB.settings.address}
📞 +92 ${DB.settings.whatsapp}
🕐 ${DB.settings.hours}`;

  openWhatsApp(phone, msg);
}

/* ══════════════════════════════════════════════════════
   BILLING TAB
══════════════════════════════════════════════════════ */
function loadServicesDropdown() {
  const select = document.getElementById('bill-service');
  if (!select) return;

  select.innerHTML = '<option value="">-- Select Service --</option>';
  DB.services.forEach(cat => {
    const grp = document.createElement('optgroup');
    grp.label = cat.name;
    cat.items.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = `${item.name} — Rs.${fmt(item.price)}`;
      opt.dataset.price = item.price;
      grp.appendChild(opt);
    });
    select.appendChild(grp);
  });
}

function lookupClientForBill() {
  const phone = document.getElementById('bill-phone').value.replace(/\D/g, '');
  const info = document.getElementById('bill-client-info');
  
  if (phone.length === 10 && DB.clients[phone]) {
    const c = DB.clients[phone];
    const thisMonth = monthKey();
    const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
    const perk = getPerk(monthlySpend);

    info.innerHTML = `
      <span class="text-gold">✦ ${c.name}</span><br>
      <small>Lifetime: Rs.${fmt(c.lifetimeSpend || 0)} · Points: ${c.points || 0}</small><br>
      <small>This month: Rs.${fmt(monthlySpend)} · ${perk ? perk.name + ' (' + perk.discount + '% off)' : 'No active perk'}</small>
      ${c.referralDiscount ? '<br><small class="text-gold">🎁 5% referral discount available</small>' : ''}
    `;
    info.classList.remove('hidden');
    updateBillPreview();
  } else {
    info.classList.add('hidden');
  }
}

function updateServicePrice() {
  const select = document.getElementById('bill-service');
  const opt = select.options[select.selectedIndex];
  if (opt && opt.dataset.price) {
    document.getElementById('bill-amount').value = opt.dataset.price;
  }
  updateBillPreview();
}

document.getElementById('bill-amount')?.addEventListener('input', updateBillPreview);

function updateBillPreview() {
  const phone = document.getElementById('bill-phone').value.replace(/\D/g, '');
  const amount = parseFloat(document.getElementById('bill-amount').value) || 0;

  if (!phone || !DB.clients[phone] || amount <= 0) {
    document.getElementById('bill-discount-display').value = '0%';
    document.getElementById('bill-final-amount').value = 'Rs. 0';
    document.getElementById('bill-preview').classList.add('hidden');
    return;
  }

  const c = DB.clients[phone];
  const thisMonth = monthKey();
  const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
  const perk = getPerk(monthlySpend);
  
  let discount = perk ? perk.discount : 0;
  if (c.referralDiscount) discount = Math.max(discount, 5);
  
  const finalAmount = Math.round(amount * (1 - discount / 100));
  const points = calcPoints(amount);

  document.getElementById('bill-discount-display').value = discount + '%';
  document.getElementById('bill-final-amount').value = 'Rs. ' + fmt(finalAmount);

  // Show preview
  const preview = document.getElementById('bill-preview');
  preview.innerHTML = `
    <h4>Bill Summary</h4>
    <div class="bill-row"><span>Original Amount</span><span>Rs.${fmt(amount)}</span></div>
    <div class="bill-row"><span>Discount</span><span class="text-gold">${discount}% off</span></div>
    ${c.referralDiscount ? '<div class="bill-row"><span>Referral Applied</span><span class="text-gold">✓</span></div>' : ''}
    <div class="bill-row total"><span>Final Amount</span><span>Rs.${fmt(finalAmount)}</span></div>
    <div class="bill-row"><span>Points Earned</span><span class="text-gold">+${points} pts</span></div>
  `;
  preview.classList.remove('hidden');
}

function generateBill() {
  const phone = document.getElementById('bill-phone').value.replace(/\D/g, '');
  const amount = parseFloat(document.getElementById('bill-amount').value) || 0;
  const serviceSelect = document.getElementById('bill-service');
  const serviceName = serviceSelect.options[serviceSelect.selectedIndex]?.text?.split(' — ')[0] || 'Service';

  if (phone.length !== 10) { showToast('Enter valid phone', 'error'); return; }
  if (!DB.clients[phone]) { showToast('Client not found', 'error'); return; }
  if (amount <= 0) { showToast('Enter valid amount', 'error'); return; }

  const c = DB.clients[phone];
  const thisMonth = monthKey();
  const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
  const perk = getPerk(monthlySpend);
  
  let discount = perk ? perk.discount : 0;
  let usedReferral = false;
  if (c.referralDiscount) {
    discount = Math.max(discount, 5);
    usedReferral = true;
  }
  
  const finalAmount = Math.round(amount * (1 - discount / 100));
  const points = calcPoints(amount);

  // Update client
  c.visits = (c.visits || 0) + 1;
  c.lifetimeSpend = (c.lifetimeSpend || 0) + finalAmount;
  c.points = (c.points || 0) + points;
  c.monthlySpend = c.monthlySpend || {};
  c.monthlySpend[thisMonth] = (c.monthlySpend[thisMonth] || 0) + finalAmount;
  if (usedReferral) c.referralDiscount = false;
  c.alertSent = false; // Reset alert status

  // Save bill record
  const bill = {
    id: Date.now(),
    phone,
    name: c.name,
    service: serviceName,
    originalAmount: amount,
    discount,
    finalAmount,
    points,
    date: today(),
    time: new Date().toLocaleTimeString()
  };
  DB.bills.unshift(bill);

  saveDB();

  // Generate WhatsApp message
  const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];
  const newMonthlySpend = c.monthlySpend[thisMonth];
  const nextPerkNeeded = nextPerk ? nextPerk.monthlyMin - newMonthlySpend : 0;

  let msg = `🧾 *${DB.settings.brand} Invoice*

━━━━━━━━━━━━━━━━━
👤 *${c.name}*
📞 +92 ${phone}
━━━━━━━━━━━━━━━━━

📦 *Service:* ${serviceName}
💰 *Original:* Rs.${fmt(amount)}
🏷️ *Discount:* ${discount}%
💵 *Total Paid:* Rs.${fmt(finalAmount)}

━━━━━━━━━━━━━━━━━
✨ *Your Stats:*
• Lifetime Spend: Rs.${fmt(c.lifetimeSpend)}
• Loyalty Points: ${c.points} pts (+${points} earned!)
• Visits: ${c.visits}

━━━━━━━━━━━━━━━━━
`;

  if (perk) {
    msg += `🌟 *Active Perk:* ${perk.name}
🎁 *Current Discount:* ${perk.discount}% off

`;
  }

  if (nextPerk && nextPerkNeeded > 0) {
    msg += `📈 *Next Perk:* ${nextPerk.name}
💳 Spend Rs.${fmt(nextPerkNeeded)} more this month to unlock ${nextPerk.benefits}!

`;
  } else {
    msg += `💎 You're at our top tier!
`;
  }

  msg += `
━━━━━━━━━━━━━━━━━
📍 ${DB.settings.address}
🕐 ${DB.settings.hours}

Thank you for choosing ${DB.settings.brand}! 💛`;

  openWhatsApp(phone, msg);

  // Clear form
  document.getElementById('bill-phone').value = '';
  document.getElementById('bill-amount').value = '';
  document.getElementById('bill-service').selectedIndex = 0;
  document.getElementById('bill-client-info').classList.add('hidden');
  document.getElementById('bill-preview').classList.add('hidden');

  loadBillsList();
  loadClientsList();
  loadAdminPanel();
  showToast('Bill generated & sent ✦', 'success');
}

function loadBillsList() {
  const list = document.getElementById('recent-bills');
  if (!list) return;

  list.innerHTML = DB.bills.slice(0, 10).map(b => `
    <div class="recent-item">
      <div>
        <strong>${b.name}</strong>
        <small class="text-muted"> ${b.service}</small>
      </div>
      <div class="text-right">
        <div class="text-gold">Rs.${fmt(b.finalAmount)}</div>
        <small class="text-muted">${b.date} ${b.time}</small>
      </div>
    </div>
  `).join('') || '<div class="text-muted text-center">No bills yet</div>';
}

/* ══════════════════════════════════════════════════════
   ALERTS TAB
══════════════════════════════════════════════════════ */
function loadAttentionList() {
  const list = document.getElementById('attention-list');
  if (!list) return;

  const thisMonth = monthKey();
  const day = new Date().getDate();
  const attentionClients = Object.entries(DB.clients).filter(([phone, c]) => {
    const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
    const perk = getPerk(monthlySpend);
    const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];
    return nextPerk && monthlySpend < nextPerk.monthlyMin;
  });

  list.innerHTML = attentionClients.length ? attentionClients.map(([phone, c]) => {
    const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
    const perk = getPerk(monthlySpend);
    const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];
    const remaining = nextPerk ? nextPerk.monthlyMin - monthlySpend : 0;

    return `
      <div class="attention-item">
        <div class="attention-info">
          <strong>${c.name}</strong>
          <span>Spend Rs.${fmt(remaining)} more for ${nextPerk?.name || 'next perk'}</span>
        </div>
        <button class="btn-primary btn-sm" onclick="sendMaintenanceAlert('${phone}')">Send Alert</button>
      </div>
    `;
  }).join('') : '<div class="text-muted text-center">All clients are on track!</div>';
}

function sendFirstOfMonthAlerts() {
  const clients = Object.entries(DB.clients);
  let count = 0;

  clients.forEach(([phone, c]) => {
    setTimeout(() => {
      sendClientSummary(phone);
    }, count * 1500);
    count++;
  });

  showToast(`Sending ${count} monthly summaries...`, 'success');
}

function sendTwentiethAlerts() {
  const thisMonth = monthKey();
  const clients = Object.entries(DB.clients).filter(([phone, c]) => {
    const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
    const perk = getPerk(monthlySpend);
    const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];
    return nextPerk && monthlySpend < nextPerk.monthlyMin && !c.alertSent;
  });

  let count = 0;
  clients.forEach(([phone, c]) => {
    setTimeout(() => {
      sendMaintenanceAlert(phone);
      c.alertSent = true;
      saveDB();
    }, count * 1500);
    count++;
  });

  showToast(`Sending ${count} maintenance alerts...`, 'success');
}

function sendMaintenanceAlert(phone) {
  const c = DB.clients[phone];
  if (!c) return;

  const thisMonth = monthKey();
  const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
  const perk = getPerk(monthlySpend);
  const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];
  const remaining = nextPerk ? nextPerk.monthlyMin - monthlySpend : 0;

  const msg = `⚠️ *${DB.settings.brand} Reminder*

Hi ${c.name}! 👋

You've spent *Rs.${fmt(monthlySpend)}* this month.

To unlock *${nextPerk?.name || 'your perks'}* (${nextPerk?.benefits || 'benefits'}), you need to spend *Rs.${fmt(remaining)}* more by the end of this month.

💎 Don't miss out on your exclusive benefits!

📍 ${DB.settings.address}
📞 +92 ${DB.settings.whatsapp}
🕐 ${DB.settings.hours}

Book your appointment now! 💛`;

  openWhatsApp(phone, msg);
  showToast('Alert sent!', 'success');
}

function sendClientSummary(phone) {
  const c = DB.clients[phone];
  if (!c) return;

  const thisMonth = monthKey();
  const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
  const perk = getPerk(monthlySpend);
  const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];

  const msg = `✨ *${DB.settings.brand} Monthly Update*

━━━━━━━━━━━━━━━━━
👤 Hi *${c.name}*!

📊 *Your Stats:*
• Lifetime Spend: Rs.${fmt(c.lifetimeSpend || 0)}
• This Month: Rs.${fmt(monthlySpend)}
• Loyalty Points: ${c.points || 0}
• Total Visits: ${c.visits || 0}

━━━━━━━━━━━━━━━━━
🌟 *Active Perks:*
${perk ? `• ${perk.name}: ${perk.benefits}` : '• Spend more to unlock perks!'}

${nextPerk ? `📈 *Next Tier:* ${nextPerk.name}
💳 Spend Rs.${fmt(nextPerk.monthlyMin - monthlySpend)} more to unlock ${nextPerk.benefits}` : '💎 You\'re at our top tier!'}
━━━━━━━━━━━━━━━━━

${c.referralDiscount ? '🎁 *Referral Discount:* 5% off on your next visit!\n\n' : ''}

🎁 *Loyalty Shop:*
Redeem your ${c.points || 0} points for:
${DB.loyaltyShop.map(r => `• ${r.name}: ${r.points} pts`).join('\n')}

━━━━━━━━━━━━━━━━━
📍 ${DB.settings.address}
📞 +92 ${DB.settings.whatsapp}
🕐 ${DB.settings.hours}

Thank you for being part of our family! 💛`;

  openWhatsApp(phone, msg);
}

/* ══════════════════════════════════════════════════════
   SERVICES TAB
══════════════════════════════════════════════════════ */
function loadServicesAdmin() {
  const list = document.getElementById('services-list');
  if (!list) return;

  list.innerHTML = DB.services.map((cat, ci) => `
    <div class="service-category">
      <div class="category-header">
        <h4>${cat.name}</h4>
        <button class="btn-icon" onclick="removeServiceCategory(${ci})">🗑️</button>
      </div>
      <div class="category-items">
        ${cat.items.map((item, ii) => `
          <div class="service-item">
            <div class="service-info">
              <span class="service-dot"></span>
              <span>${item.name}</span>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <span class="service-price">Rs.${fmt(item.price)}</span>
              <button class="btn-icon" onclick="removeServiceItem(${ci}, ${ii})">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // Update category dropdown
  const catSelect = document.getElementById('add-service-category');
  if (catSelect) {
    catSelect.innerHTML = '<option value="">-- Select Category --</option>' +
      DB.services.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  }
}

function openAddServiceModal() {
  document.getElementById('add-service-category').value = '';
  document.getElementById('add-service-new-category').value = '';
  document.getElementById('add-service-name').value = '';
  document.getElementById('add-service-price').value = '';
  openModal('add-service-modal');
}

function addService() {
  const catId = document.getElementById('add-service-category').value;
  const newCat = document.getElementById('add-service-new-category').value.trim();
  const name = document.getElementById('add-service-name').value.trim();
  const price = parseFloat(document.getElementById('add-service-price').value) || 0;

  if (!name) { showToast('Enter service name', 'error'); return; }
  if (price <= 0) { showToast('Enter valid price', 'error'); return; }

  if (newCat) {
    DB.services.push({
      id: 'cat_' + Date.now(),
      name: newCat,
      items: [{ id: 's_' + Date.now(), name, price }]
    });
  } else if (catId) {
    const cat = DB.services.find(c => c.id === catId);
    if (cat) {
      cat.items.push({ id: 's_' + Date.now(), name, price });
    }
  } else {
    showToast('Select or create a category', 'error');
    return;
  }

  saveDB();
  closeModal('add-service-modal');
  loadServicesAdmin();
  loadServicesDropdown();
  showToast('Service added ✦', 'success');
}

function removeServiceCategory(ci) {
  if (!confirm('Remove this category and all its services?')) return;
  DB.services.splice(ci, 1);
  saveDB();
  loadServicesAdmin();
  loadServicesDropdown();
}

function removeServiceItem(ci, ii) {
  DB.services[ci].items.splice(ii, 1);
  saveDB();
  loadServicesAdmin();
  loadServicesDropdown();
}

/* ══════════════════════════════════════════════════════
   LOYALTY TAB
══════════════════════════════════════════════════════ */
function loadLoyaltyAdmin() {
  document.getElementById('points-rate').value = DB.settings.pointsRate || 1;

  // Loyalty shop
  const shopList = document.getElementById('loyalty-shop-list');
  if (shopList) {
    shopList.innerHTML = DB.loyaltyShop.map((r, i) => `
      <div class="loyalty-item">
        <div class="loyalty-points">${r.points}</div>
        <div class="loyalty-points-label">points</div>
        <div class="loyalty-name">${r.name}</div>
        <div class="loyalty-desc">${r.desc || ''}</div>
        <button class="btn-icon mt-2" onclick="removeReward(${i})">🗑️</button>
      </div>
    `).join('');
  }

  // Perks tiers
  const tiers = document.getElementById('perks-tiers');
  if (tiers) {
    tiers.innerHTML = DB.perks.map((p, i) => `
      <div class="perk-tier">
        <div class="perk-tier-header">
          <span class="perk-tier-name">${p.name}</span>
          <span class="perk-tier-amount">Rs.${fmt(p.monthlyMin)}/mo</span>
        </div>
        <div class="perk-tier-benefits">${p.benefits} (${p.discount}% off)</div>
      </div>
    `).join('');
  }
}

function savePointsRate() {
  DB.settings.pointsRate = parseInt(document.getElementById('points-rate').value) || 1;
  saveDB();
  showToast('Points rate updated ✦', 'success');
}

function openAddRewardModal() {
  document.getElementById('add-reward-name').value = '';
  document.getElementById('add-reward-points').value = '';
  document.getElementById('add-reward-desc').value = '';
  openModal('add-reward-modal');
}

function addReward() {
  const name = document.getElementById('add-reward-name').value.trim();
  const points = parseInt(document.getElementById('add-reward-points').value) || 0;
  const desc = document.getElementById('add-reward-desc').value.trim();

  if (!name) { showToast('Enter reward name', 'error'); return; }
  if (points <= 0) { showToast('Enter valid points', 'error'); return; }

  DB.loyaltyShop.push({ id: 'l_' + Date.now(), name, points, desc });
  saveDB();
  closeModal('add-reward-modal');
  loadLoyaltyAdmin();
  showToast('Reward added ✦', 'success');
}

function removeReward(i) {
  DB.loyaltyShop.splice(i, 1);
  saveDB();
  loadLoyaltyAdmin();
}

/* ══════════════════════════════════════════════════════
   CUSTOMIZE TAB
══════════════════════════════════════════════════════ */
function loadCustomize() {
  document.getElementById('cust-brand').value = DB.settings.brand || '';
  document.getElementById('cust-tagline').value = DB.settings.tagline || '';
  document.getElementById('cust-address').value = DB.settings.address || '';
  document.getElementById('cust-whatsapp').value = DB.settings.whatsapp || '';
  document.getElementById('cust-hours').value = DB.settings.hours || '';
  document.getElementById('cust-est').value = DB.settings.estYear || '';
  document.getElementById('cust-about').value = DB.settings.aboutText || '';
}

function saveCustomization() {
  DB.settings.brand = document.getElementById('cust-brand').value || DB.settings.brand;
  DB.settings.tagline = document.getElementById('cust-tagline').value || DB.settings.tagline;
  DB.settings.address = document.getElementById('cust-address').value || DB.settings.address;
  DB.settings.whatsapp = document.getElementById('cust-whatsapp').value || DB.settings.whatsapp;
  DB.settings.hours = document.getElementById('cust-hours').value || DB.settings.hours;
  DB.settings.estYear = document.getElementById('cust-est').value || DB.settings.estYear;
  DB.settings.aboutText = document.getElementById('cust-about').value || DB.settings.aboutText;

  saveDB();
  showToast('Settings saved ✦', 'success');
}

function changeAdminPin() {
  const newPin = document.getElementById('new-pin').value;
  const confirm = document.getElementById('confirm-pin').value;

  if (newPin.length !== 4) { showToast('PIN must be 4 digits', 'error'); return; }
  if (newPin !== confirm) { showToast('PINs do not match', 'error'); return; }

  DB.admin.pin = newPin;
  saveDB();
  document.getElementById('new-pin').value = '';
  document.getElementById('confirm-pin').value = '';
  showToast('PIN updated ✦', 'success');
}

/* ══════════════════════════════════════════════════════
   SETTINGS MODAL
══════════════════════════════════════════════════════ */
function openSettings() {
  openModal('settings-modal');
}

function exportData() {
  const dataStr = JSON.stringify(DB, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `abeenaz_backup_${today()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported ✦', 'success');
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      DB = data;
      saveDB();
      loadAdminPanel();
      showToast('Data imported ✦', 'success');
    } catch (err) {
      showToast('Invalid file format', 'error');
    }
  };
  reader.readAsText(file);
}

function resetAllData() {
  if (!confirm('⚠️ This will delete ALL data. Are you sure?')) return;
  if (!confirm('⚠️ FINAL WARNING: This cannot be undone!')) return;

  DB = getDefaultData();
  saveDB();
  loadAdminPanel();
  closeModal('settings-modal');
  showToast('All data reset', 'warning');
}

/* ══════════════════════════════════════════════════════
   EXPLORE SCREEN
══════════════════════════════════════════════════════ */
function loadExploreScreen() {
  // Brand
  document.getElementById('explore-brand').textContent = DB.settings.brand;
  document.getElementById('explore-tagline').textContent = DB.settings.tagline;
  document.getElementById('footer-brand').textContent = DB.settings.brand;

  // Hero
  document.getElementById('hero-title').innerHTML = DB.settings.heroTitle;
  document.getElementById('hero-sub').textContent = DB.settings.heroSub;

  // Stats
  document.getElementById('stat-clients').textContent = Object.keys(DB.clients).length + '+';
  document.getElementById('stat-exp').textContent = DB.settings.estYear ? (new Date().getFullYear() - parseInt(DB.settings.estYear) + '+') : '5+';
  document.getElementById('stat-services-count').textContent = DB.services.reduce((sum, c) => sum + c.items.length, 0) + '+';

  // Services tabs
  const tabsEl = document.getElementById('services-tabs');
  const gridEl = document.getElementById('services-grid');

  tabsEl.innerHTML = DB.services.map((cat, i) => `
    <button class="srv-tab ${i === 0 ? 'active' : ''}" onclick="switchServiceTab(this, '${cat.id}')">${cat.name}</button>
  `).join('');

  // Show first category
  if (DB.services.length > 0) {
    renderServiceGrid(DB.services[0].id);
  }

  // Perks breakdown
  const perksEl = document.getElementById('perks-breakdown');
  perksEl.innerHTML = DB.perks.map(p => `
    <div class="perk-tier-card">
      <div>
        <div class="tier-name">${p.name}</div>
        <div class="tier-req">Spend Rs.${fmt(p.monthlyMin)}/month</div>
      </div>
      <div class="tier-benefit">${p.benefits}</div>
    </div>
  `).join('');

  // Loyalty shop
  document.getElementById('explore-points-rate').textContent = 
    `Current rate: ${DB.settings.pointsRate} point${DB.settings.pointsRate > 1 ? 's' : ''} per Rs.100 spent`;

  const loyaltyEl = document.getElementById('explore-loyalty-grid');
  loyaltyEl.innerHTML = DB.loyaltyShop.map(r => `
    <div class="loyalty-item">
      <div class="loyalty-points">${r.points}</div>
      <div class="loyalty-points-label">points</div>
      <div class="loyalty-name">${r.name}</div>
      <div class="loyalty-desc">${r.desc || ''}</div>
    </div>
  `).join('');

  // About
  document.getElementById('about-content').innerHTML = DB.settings.aboutText?.split('\n\n').map(p => `<p>${p}</p>`).join('') || '';

  // Contact
  document.getElementById('contact-address').textContent = DB.settings.address;
  document.getElementById('contact-hours').textContent = DB.settings.hours;
  document.getElementById('contact-whatsapp-btn').href = `https://wa.me/92${DB.settings.whatsapp}?text=${encodeURIComponent('Hi! I\'d like to book an appointment at ' + DB.settings.brand + '.')}`;
}

function switchServiceTab(btn, catId) {
  document.querySelectorAll('.srv-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderServiceGrid(catId);
}

function renderServiceGrid(catId) {
  const cat = DB.services.find(c => c.id === catId);
  const gridEl = document.getElementById('services-grid');
  if (!cat || !gridEl) return;

  gridEl.innerHTML = cat.items.map(item => `
    <div class="srv-card" onclick="bookService('${item.name}', ${item.price})">
      <div class="name">
        <span class="dot"></span>
        <span>${item.name}</span>
      </div>
      <span class="price">Rs.${fmt(item.price)}+</span>
    </div>
  `).join('');
}

function bookService(name, price) {
  const msg = `Hi! I'd like to book an appointment for *${name}* (Rs.${fmt(price)}) at ${DB.settings.brand}.

When are you available?`;

  openWhatsApp(DB.settings.whatsapp, msg);
}

/* ══════════════════════════════════════════════════════
   WHATSAPP HELPER
══════════════════════════════════════════════════════ */
function openWhatsApp(phone, message) {
  const url = `https://wa.me/92${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

/* ══════════════════════════════════════════════════════
   MODAL HELPERS
══════════════════════════════════════════════════════ */
function openModal(id) {
  document.getElementById(id)?.classList.add('open');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('open');
}

// Close modals on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal')) {
    e.target.classList.remove('open');
  }
});

/* ══════════════════════════════════════════════════════
   MTS - MESSAGES TO SEND
══════════════════════════════════════════════════════ */
function getPendingMessages() {
  const messages = [];
  const thisMonth = monthKey();
  const day = new Date().getDate();
  const clients = Object.entries(DB.clients);

  // Referrers who need reward message (highest priority)
  clients.forEach(([phone, c]) => {
    if (c.needsReferralReward && !c.referralRewardSent) {
      // Find who they referred
      const referredNames = Object.entries(DB.clients)
        .filter(([p, client]) => client.referredBy === phone)
        .map(([p, client]) => client.name)
        .join(', ');
      
      messages.push({
        id: `referral_reward_${phone}`,
        type: 'referral',
        phone,
        name: c.name,
        title: '🎁 Referral Reward',
        desc: `Referred: ${referredNames} - Send 5% reward message`,
        priority: 'high'
      });
    }
  });

  // New clients who haven't received welcome
  clients.forEach(([phone, c]) => {
    if (!c.welcomeSent && c.joinDate) {
      messages.push({
        id: `welcome_${phone}`,
        type: 'welcome',
        phone,
        name: c.name,
        title: '🌸 Welcome Message',
        desc: 'New client needs welcome message',
        priority: 'high'
      });
    }
  });

  // Monthly summaries (1st-5th of month)
  if (day >= 1 && day <= 5) {
    clients.forEach(([phone, c]) => {
      if (!c.monthlySummarySent || c.monthlySummarySent !== thisMonth) {
        messages.push({
          id: `monthly_${phone}_${thisMonth}`,
          type: 'monthly',
          phone,
          name: c.name,
          title: '📅 Monthly Summary',
          desc: `Send ${c.name}'s monthly stats update`,
          priority: 'medium'
        });
      }
    });
  }

  // Maintenance alerts (20th-25th of month)
  if (day >= 20 && day <= 25) {
    clients.forEach(([phone, c]) => {
      const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
      const perk = getPerk(monthlySpend);
      const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];
      const remaining = nextPerk ? nextPerk.monthlyMin - monthlySpend : 0;
      
      if (nextPerk && remaining > 0 && !c.maintenanceAlertSent) {
        messages.push({
          id: `maint_${phone}_${thisMonth}`,
          type: 'maintenance',
          phone,
          name: c.name,
          title: '⚠️ Maintenance Alert',
          desc: `Needs to spend Rs.${fmt(remaining)} more for ${nextPerk.name}`,
          priority: 'high'
        });
      }
    });
  }

  return messages;
}

function loadMTSList() {
  const list = document.getElementById('mts-list');
  if (!list) return;

  const messages = getPendingMessages();
  
  if (messages.length === 0) {
    list.innerHTML = '<div class="text-center text-muted">No pending messages! 🎉</div>';
    document.getElementById('mts-count').textContent = '0';
    return;
  }

  document.getElementById('mts-count').textContent = messages.length;

  list.innerHTML = messages.map(m => `
    <div class="mts-item ${m.priority === 'high' ? 'urgent' : ''}">
      <div class="mts-info">
        <div class="mts-type">${m.title}</div>
        <div class="mts-name">${m.name} · +92 ${m.phone}</div>
        <div class="mts-desc">${m.desc}</div>
      </div>
      <button class="btn-primary btn-sm" onclick="sendMTSMessage('${m.id}', '${m.phone}', '${m.type}')">
        Send
      </button>
    </div>
  `).join('');
}

function sendMTSMessage(msgId, phone, type) {
  const c = DB.clients[phone];
  if (!c) return;

  const thisMonth = monthKey();

  if (type === 'referral') {
    sendReferralRewardMessage(phone);
    c.referralRewardSent = true;
    c.needsReferralReward = false;
  } else if (type === 'welcome') {
    sendWelcomeMessage(phone, c.referredBy);
    c.welcomeSent = true;
  } else if (type === 'monthly') {
    sendClientSummary(phone);
    c.monthlySummarySent = thisMonth;
  } else if (type === 'maintenance') {
    sendMaintenanceAlert(phone);
    c.maintenanceAlertSent = true;
  }

  saveDB();
  
  // Remove from MTS list
  setTimeout(() => {
    loadMTSList();
    showToast('Message sent! ✦', 'success');
  }, 500);
}

/* ══════════════════════════════════════════════════════
   BROADCAST SENDER
══════════════════════════════════════════════════════ */
function sendBroadcast() {
  const message = document.getElementById('broadcast-message').value.trim();
  
  if (!message) {
    showToast('Enter a message to broadcast', 'error');
    return;
  }

  const clients = Object.entries(DB.clients);
  if (clients.length === 0) {
    showToast('No clients to send to', 'error');
    return;
  }

  // Add all broadcast messages to MTS instead of auto-sending
  let count = 0;
  clients.forEach(([phone, c]) => {
    if (!c.pendingBroadcast) {
      c.pendingBroadcast = message;
      count++;
    }
  });

  saveDB();
  loadMTSList();
  document.getElementById('broadcast-message').value = '';
  showToast(`Added ${count} broadcast messages to MTS queue`, 'success');
}

/* ══════════════════════════════════════════════════════
   SEND ALL ALERTS (adds to MTS)
══════════════════════════════════════════════════════ */
function sendFirstOfMonthAlerts() {
  const thisMonth = monthKey();
  const clients = Object.entries(DB.clients);
  let count = 0;

  clients.forEach(([phone, c]) => {
    if (!c.monthlySummarySent || c.monthlySummarySent !== thisMonth) {
      // Mark for MTS - don't auto-send
      count++;
    }
  });

  loadMTSList();
  showToast(`${count} monthly summaries added to MTS. Send them one by one.`, 'success');
}

function sendTwentiethAlerts() {
  const thisMonth = monthKey();
  const clients = Object.entries(DB.clients);
  let count = 0;

  clients.forEach(([phone, c]) => {
    const monthlySpend = (c.monthlySpend || {})[thisMonth] || 0;
    const perk = getPerk(monthlySpend);
    const nextPerk = perk ? DB.perks.find(p => p.monthlyMin > (perk?.monthlyMin || 0)) : DB.perks[0];
    
    if (nextPerk && monthlySpend < nextPerk.monthlyMin && !c.maintenanceAlertSent) {
      count++;
    }
  });

  loadMTSList();
  showToast(`${count} maintenance alerts in MTS. Send them one by one.`, 'success');
}

function dismissAlertBanner() {
  document.getElementById('admin-alert-banner').classList.add('hidden');
}

function sendMonthlyAlerts() {
  const day = new Date().getDate();
  const banner = document.getElementById('admin-alert-banner');
  
  if (day >= 1 && day <= 5) {
    sendFirstOfMonthAlerts();
  } else if (day >= 20 && day <= 25) {
    sendTwentiethAlerts();
  }
  
  banner.classList.add('hidden');
}

/* ══════════════════════════════════════════════════════
   DYNAMIC MESSAGE PREVIEW
══════════════════════════════════════════════════════ */
function getWelcomeMessagePreview() {
  return `🌸 *Welcome to ${DB.settings.brand}!*

Hi [Client Name]! 💛

You're now part of our family! We're so excited to have you.

✨ *How Our Perks Work:*
Spend a minimum amount each month to unlock exclusive benefits!

${DB.perks.map(p => `• ${p.name}: Spend Rs.${fmt(p.monthlyMin)}/mo → ${p.benefits}`).join('\n')}

🎁 *Loyalty Points:*
Earn ${DB.settings.pointsRate} point(s) for every Rs.100 spent!

📍 ${DB.settings.address}
📞 +92 ${DB.settings.whatsapp}
🕐 ${DB.settings.hours}

We can't wait to pamper you! 💅✨`;
}

function getMonthlySummaryPreview() {
  return `✨ *${DB.settings.brand} Monthly Update*

━━━━━━━━━━━━━━━━━
👤 Hi [Client Name]!

📊 *Your Stats:*
• Lifetime Spend: Rs.XXX
• This Month: Rs.XXX
• Loyalty Points: XXX

━━━━━━━━━━━━━━━━━
🌟 *Active Perks:*
[Perk details here]

🎁 *Loyalty Shop:*
${DB.loyaltyShop.map(r => `• ${r.name}: ${r.points} pts`).join('\n')}

━━━━━━━━━━━━━━━━━
📍 ${DB.settings.address}
📞 +92 ${DB.settings.whatsapp}
🕐 ${DB.settings.hours}`;
}

function getMaintenanceAlertPreview() {
  return `⚠️ *${DB.settings.brand} Reminder*

Hi [Client Name]! 👋

You've spent *Rs.XXX* this month.

To unlock *your perks*, you need to spend *Rs.XXX* more by month end.

💎 Don't miss out on your exclusive benefits!

📍 ${DB.settings.address}
📞 +92 ${DB.settings.whatsapp}
🕐 ${DB.settings.hours}

Book your appointment now! 💛`;
}

function loadMessagePreviews() {
  const welcomeEl = document.getElementById('preview-welcome');
  const monthlyEl = document.getElementById('preview-monthly');
  const maintEl = document.getElementById('preview-maintenance');
  
  if (welcomeEl) welcomeEl.textContent = getWelcomeMessagePreview();
  if (monthlyEl) monthlyEl.textContent = getMonthlySummaryPreview();
  if (maintEl) maintEl.textContent = getMaintenanceAlertPreview();
}

function showPreview(type) {
  // Update tabs
  document.querySelectorAll('.preview-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update content
  document.querySelectorAll('.preview-content').forEach(c => c.classList.remove('active'));
  document.getElementById('preview-' + type)?.classList.add('active');
}

/* ══════════════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════════════ */
function logout() {
  pinBuffer = '';
  goScreen('s-welcome');
  showToast('Logged out', '');
}

/* ══════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════ */
goScreen('s-welcome');
