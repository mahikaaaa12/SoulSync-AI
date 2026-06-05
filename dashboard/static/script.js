/* =============================================
   SoulSync AI — Enhanced Dashboard JS
   ============================================= */

/* ─── Auth System ────────────────────────────── */

const AUTH_KEY = 'soulsync_user';

function getUser() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)); } catch { return null; }
}

function saveUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function applyUserToUI(user) {
  if (!user) return;

  const name = user.name || 'Matchmaker';
  const role = user.role || 'Matchmaker';
  const initials2 = initials(name);

  // Sidebar user widget
  const sidebarName = document.querySelector('.user-name');
  const sidebarRole = document.querySelector('.user-role');
  const sidebarAvatar = document.querySelector('.user-avatar span');
  if (sidebarName) sidebarName.textContent = name;
  if (sidebarRole) sidebarRole.textContent = role;
  if (sidebarAvatar) sidebarAvatar.textContent = initials2;

  // Topbar avatar
  const topbarAvatar = document.getElementById('topbarAvatar');
  if (topbarAvatar) topbarAvatar.textContent = initials2;

  // Dashboard welcome subtitle
  pages.dashboard.sub = `Welcome back, ${name.split(' ')[0]}. Here's what's happening today.`;
  const ps = document.querySelector('.page-subtitle');
  if (ps && document.getElementById('page-dashboard').classList.contains('active')) {
    ps.textContent = pages.dashboard.sub;
  }

  // Settings page inputs
  const settingsInputs = document.querySelectorAll('.settings-input');
  if (settingsInputs[0]) settingsInputs[0].value = name;
  if (settingsInputs[1]) settingsInputs[1].value = user.email || '';
  if (settingsInputs[2]) settingsInputs[2].value = role;

  // Notes author name
  notes.forEach(n => { if (n.author !== 'System Alert') n.author = name; });

  // New notes use this name
  window._currentUserName = name;
}

function showAuthModal() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.style.display = 'flex';
}

function hideAuthModal() {
  const overlay = document.getElementById('authOverlay');
  if (overlay) overlay.style.display = 'none';
}

function initAuth() {
  const overlay    = document.getElementById('authOverlay');
  const loginForm  = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const goSignup   = document.getElementById('goToSignup');
  const goLogin    = document.getElementById('goToLogin');
  const loginBtn   = document.getElementById('loginBtn');
  const signupBtn  = document.getElementById('signupBtn');
  const loginError = document.getElementById('loginError');
  const signupError= document.getElementById('signupError');

  // Toggle between login / signup
  goSignup && goSignup.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
  });
  goLogin && goLogin.addEventListener('click', () => {
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
  });

  // Login submit
  loginBtn && loginBtn.addEventListener('click', () => {
    const name     = document.getElementById('loginName').value.trim();
    const email    = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!name || !email || !password) {
      loginError.textContent = 'Please fill in all fields.';
      return;
    }
    loginError.textContent = '';
    const user = { name, email, role: 'Matchmaker', password };
    saveUser(user);
    applyUserToUI(user);
    hideAuthModal();
    addNotification('system', `Welcome back, ${name.split(' ')[0]}! You're now signed in.`);
  });

  // Signup submit
  signupBtn && signupBtn.addEventListener('click', () => {
    const name     = document.getElementById('signupName').value.trim();
    const email    = document.getElementById('signupEmail').value.trim();
    const role     = document.getElementById('signupRole').value.trim() || 'Matchmaker';
    const password = document.getElementById('signupPassword').value;
    if (!name || !email || !password) {
      signupError.textContent = 'Please fill in all required fields.';
      return;
    }
    signupError.textContent = '';
    const user = { name, email, role, password };
    saveUser(user);
    applyUserToUI(user);
    hideAuthModal();
    addNotification('system', `Account created! Welcome to SoulSync, ${name.split(' ')[0]}.`);
  });

  // Check if already logged in
  const existing = getUser();
  if (existing) {
    applyUserToUI(existing);
  } else {
    showAuthModal();
  }
}

/* ─── Notifications ──────────────────────────── */

const notifData = [
  { id: 1, type: 'match',   text: 'AI found a new 94% match for Priya Sharma.',         time: '2 min ago',   read: false },
  { id: 2, type: 'meeting', text: 'Meeting with Arjun M. × Priya S. is in 2 days.',     time: '1 hr ago',    read: false },
  { id: 3, type: 'client',  text: 'Rohan Mehta updated his preferences.',                time: '3 hrs ago',   read: false },
  { id: 4, type: 'alert',   text: 'Venue change requested for Jan 14th introduction.',   time: 'Yesterday',   read: true  },
  { id: 5, type: 'match',   text: 'Compatibility report ready for Kavya Reddy.',         time: 'Yesterday',   read: true  },
];

const notifIcons = {
  match:   `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 16C9 16 3 12 3 7.5C3 5 5.5 3 8 4C8.7 4.3 9 4.5 9 4.5C9 4.5 9.3 4.3 10 4C12.5 3 15 5 15 7.5C15 12 9 16 9 16Z" stroke="currentColor" stroke-width="1.5"/></svg>`,
  meeting: `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M6 1V4M12 1V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M2 8H16" stroke="currentColor" stroke-width="1.5"/></svg>`,
  client:  `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 17C2.5 13.7 5.4 11 9 11C12.6 11 15.5 13.7 15.5 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  alert:   `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 3L15.5 15H2.5L9 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 8V11M9 13V13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  system:  `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M9 5V9L12 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

function unreadCount() {
  return notifData.filter(n => !n.read).length;
}

function updateNotifBadge() {
  const dot = document.getElementById('notifDot');
  if (!dot) return;
  dot.style.display = unreadCount() > 0 ? 'block' : 'none';
}

function renderNotifDropdown() {
  const list = document.getElementById('notifList');
  if (!list) return;
  if (notifData.length === 0) {
    list.innerHTML = `<div class="notif-empty">All caught up! No notifications.</div>`;
    return;
  }
  list.innerHTML = notifData.map(n => `
    <div class="notif-item ${n.read ? 'read' : 'unread'}" data-id="${n.id}">
      <div class="notif-icon-wrap notif-type-${n.type}">${notifIcons[n.type] || notifIcons.system}</div>
      <div class="notif-body">
        <p class="notif-text">${n.text}</p>
        <p class="notif-time">${n.time}</p>
      </div>
      ${!n.read ? '<div class="notif-unread-dot"></div>' : ''}
    </div>
  `).join('');

  // Click to mark individual as read
  list.querySelectorAll('.notif-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = parseInt(el.dataset.id);
      const item = notifData.find(n => n.id === id);
      if (item) { item.read = true; }
      renderNotifDropdown();
      updateNotifBadge();
    });
  });
}

function addNotification(type, text) {
  const newId = Date.now();
  notifData.unshift({ id: newId, type, text, time: 'Just now', read: false });
  renderNotifDropdown();
  updateNotifBadge();
}

function initNotifications() {
  const btn      = document.getElementById('notifBtn');
  const dropdown = document.getElementById('notifDropdown');
  const markRead = document.getElementById('markAllRead');

  if (!btn || !dropdown) return;

  btn.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    dropdown.classList.toggle('open', !isOpen);
    if (!isOpen) {
      renderNotifDropdown();
      // Anchor dropdown under button
      const rect = btn.getBoundingClientRect();
      dropdown.style.top  = (rect.bottom + 8) + 'px';
      dropdown.style.right = (window.innerWidth - rect.right) + 'px';
    }
  });

  document.addEventListener('click', e => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove('open');
    }
  });

  markRead && markRead.addEventListener('click', () => {
    notifData.forEach(n => n.read = true);
    renderNotifDropdown();
    updateNotifBadge();
  });

  updateNotifBadge();

  // Simulate a real-time notification after 30s
  setTimeout(() => {
    addNotification('match', 'New 88% compatibility match ready for Ananya Iyer.');
  }, 30000);
}

/* ─── Custom Cursor ─────────────────────────── */
const cursor = document.getElementById('cursor');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.18;
  cursorY += (mouseY - cursorY) * 0.18;
  if (cursor) {
    cursor.style.left = cursorX + 'px';
    cursor.style.top  = cursorY + 'px';
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, input, select, textarea, .nav-item, .kpi-card, .match-card, .client-table tbody tr').forEach(el => {
  el.addEventListener('mouseenter', () => cursor && cursor.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('hovering'));
});

/* ─── Sidebar Toggle ────────────────────────── */
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const mainContent = document.querySelector('.main-content');
let sidebarOpen = true;

sidebarToggle && sidebarToggle.addEventListener('click', () => {
  if (window.innerWidth <= 768) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebarOpen = !sidebarOpen;
    if (sidebarOpen) {
      sidebar.classList.remove('collapsed');
      mainContent.classList.remove('expanded');
    } else {
      sidebar.classList.add('collapsed');
      mainContent.classList.add('expanded');
    }
  }
});

/* ─── Page Navigation ───────────────────────── */
const pages = {
  dashboard: { title: 'Dashboard',       sub: "Welcome back, Sarah. Here's what's happening today." },
  clients:   { title: 'Clients',          sub: 'Manage your active client roster.' },
  matches:   { title: 'Match Suggestions',sub: 'AI-curated compatibility profiles.' },
  meetings:  { title: 'Meetings',         sub: 'Scheduled introductions and consultations.' },
  profile:   { title: 'Client Profile',   sub: 'Priya Sharma — Active client since Nov 2024.' },
  notes:     { title: 'Notes',            sub: 'Session notes and matchmaker observations.' },
  analytics: { title: 'Analytics',        sub: 'Performance overview for this quarter.' },
  settings:  { title: 'Settings',         sub: 'Manage your account and preferences.' }
};

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const targetPage = document.getElementById('page-' + pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    const info = pages[pageId] || {};
    const pt = document.querySelector('.page-title');
    const ps = document.querySelector('.page-subtitle');
    if (pt) pt.textContent = info.title || '';
    if (ps) ps.textContent = info.sub || '';
  }

  const navItem = document.querySelector(`[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add('active');

  // Run page-specific init
  if (pageId === 'analytics') renderAnalytics();
  if (pageId === 'meetings')  renderMeetingsFull();

  if (window.innerWidth <= 768) {
    sidebar && sidebar.classList.remove('mobile-open');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    showPage(item.dataset.page);
  });
});

/* ─── Data ──────────────────────────────────── */
const avatarColors = [
  { bg: 'linear-gradient(135deg,#7F1D1D,#991B1B)', color: '#F7EFC6' },
  { bg: 'linear-gradient(135deg,#1E3A5F,#2563EB)', color: '#DBEAFE' },
  { bg: 'linear-gradient(135deg,#14532D,#16A34A)', color: '#DCFCE7' },
  { bg: 'linear-gradient(135deg,#713F12,#D97706)', color: '#FEF3C7' },
  { bg: 'linear-gradient(135deg,#4C1D95,#7C3AED)', color: '#EDE9FE' },
  { bg: 'linear-gradient(135deg,#134E4A,#0D9488)', color: '#CCFBF1' },
];

function getAvatarStyle(i) {
  return avatarColors[i % avatarColors.length];
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

const clients = [
  { name: 'Priya Sharma',     age: 31, city: 'Mumbai',    status: 'active',   updated: '2 days ago',  email: 'priya@email.com' },
  { name: 'Rohan Mehta',      age: 33, city: 'Pune',      status: 'matched',  updated: '1 week ago',  email: 'rohan@email.com' },
  { name: 'Ananya Iyer',      age: 28, city: 'Chennai',   status: 'pending',  updated: '3 days ago',  email: 'ananya@email.com' },
  { name: 'Vikram Singh',     age: 35, city: 'Delhi',     status: 'active',   updated: 'Today',       email: 'vikram@email.com' },
  { name: 'Sneha Desai',      age: 29, city: 'Ahmedabad', status: 'matched',  updated: '5 days ago',  email: 'sneha@email.com' },
  { name: 'Arjun Kapoor',     age: 34, city: 'Bangalore', status: 'active',   updated: 'Yesterday',   email: 'arjun@email.com' },
  { name: 'Kavya Reddy',      age: 27, city: 'Hyderabad', status: 'pending',  updated: '4 days ago',  email: 'kavya@email.com' },
  { name: 'Nikhil Joshi',     age: 36, city: 'Jaipur',    status: 'inactive', updated: '2 weeks ago', email: 'nikhil@email.com' },
];

const meetings = [
  { day: '14', mon: 'Jan', names: 'Priya S. × Arjun M.',    time: '11:00 AM', type: '#22C55E' },
  { day: '16', mon: 'Jan', names: 'Rohan M. × Kavya R.',    time: '03:00 PM', type: '#D4AF37' },
  { day: '19', mon: 'Jan', names: 'Vikram S. × Sneha D.',   time: '02:30 PM', type: '#22C55E' },
  { day: '22', mon: 'Jan', names: 'Ananya I. × Nikhil J.',  time: '10:00 AM', type: '#F59E0B' },
];

const matchSuggestions = [
  { name: 'Arjun Mehta',  sub: '34 yrs · Mumbai', compat: 92, facts: [['Occupation','CA'],['Height','5\'10"'],['Religion','Hindu'],['Edu','CA Final']], avatarIdx: 1, high: true  },
  { name: 'Karan Bose',   sub: '36 yrs · Pune',   compat: 81, facts: [['Occupation','IAS Officer'],['Height','5\'11"'],['Religion','Hindu'],['Edu','UPSC 2019']], avatarIdx: 3, high: true  },
  { name: 'Dev Nair',     sub: '32 yrs · Hyderabad', compat: 74, facts: [['Occupation','Doctor'],['Height','5\'9"'],['Religion','Hindu'],['Edu','MBBS, MD']], avatarIdx: 4, high: false },
  { name: 'Siddharth P.', sub: '33 yrs · Bangalore', compat: 68, facts: [['Occupation','Architect'],['Height','5\'10"'],['Religion','Hindu'],['Edu','B.Arch']], avatarIdx: 5, high: false },
];

const notes = [
  { type: 'session',      date: 'Dec 18, 2024', text: 'Initial consultation conducted via video call. Client is well-settled professionally and has a clear vision of her expectations. Mentioned preference for someone with a stable career who values family deeply. Comfortable with both arranged and semi-arranged scenarios.', author: 'Sarah Reynolds' },
  { type: 'observation',  date: 'Dec 22, 2024', text: 'After reviewing three profiles sent, client responded positively to Arjun Mehta. Highlighted that she appreciated his educational background and family values. She expressed hesitation about distance but is open to relocation if the right connection is established.', author: 'Sarah Reynolds' },
  { type: 'followup',     date: 'Jan 3, 2025',  text: 'Follow-up call completed. Client confirmed she is comfortable with meeting Arjun Mehta in person. Meeting scheduled for January 14th. Reminded client to keep expectations open and approach the first meeting as a friendly conversation.', author: 'Sarah Reynolds' },
  { type: 'alert',        date: 'Jan 9, 2025',  text: 'Client has requested a slight change of venue for the January 14th meeting. Confirming with Arjun\'s profile manager. Please follow up before EOD January 10th. Updated logistics will be shared with both parties.', author: 'System Alert' },
];

/* ─── Render Functions ──────────────────────── */

function renderClientTable(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  tbody.innerHTML = clients.map((c, i) => {
    const av = getAvatarStyle(i);
    return `
      <tr>
        <td>
          <div class="client-cell">
            <div class="client-avatar-sm" style="background:${av.bg};color:${av.color}">${initials(c.name)}</div>
            <div>
              <div class="client-name-sm">${c.name}</div>
              <div class="client-email-sm">${c.email}</div>
            </div>
          </div>
        </td>
        <td>${c.age}</td>
        <td>${c.city}</td>
        <td><span class="status-badge ${c.status}">${capitalize(c.status)}</span></td>
        <td style="color:var(--warm-gray)">${c.updated}</td>
        <td>
          <button class="row-action-btn" onclick="viewClient(${i})">View</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderMeetingsList() {
  const list = document.getElementById('meetingsList');
  if (!list) return;
  list.innerHTML = meetings.map(m => `
    <div class="meeting-item">
      <div class="meeting-date-block">
        <div class="meeting-day">${m.day}</div>
        <div class="meeting-mon">${m.mon}</div>
      </div>
      <div class="meeting-info">
        <div class="meeting-names">${m.names}</div>
        <div class="meeting-time">${m.time}</div>
      </div>
      <div class="meeting-type-dot" style="background:${m.type}"></div>
    </div>
  `).join('');
}

function renderMatchSuggestions() {
  const grid = document.getElementById('matchesGrid');
  if (!grid) return;
  grid.innerHTML = matchSuggestions.map(m => {
    const av = getAvatarStyle(m.avatarIdx);
    const facts = m.facts.map(f => `
      <div class="match-fact">
        <div class="match-fact-label">${f[0]}</div>
        <div>${f[1]}</div>
      </div>
    `).join('');
    return `
      <div class="match-card ${m.high ? 'high-compat' : ''}">
        <span class="match-compat-badge ${m.compat >= 85 ? 'compat-high' : 'compat-med'}">${m.compat}% Match</span>
        <div class="match-avatar" style="background:${av.bg};color:${av.color}">${initials(m.name)}</div>
        <div class="match-name">${m.name}</div>
        <div class="match-sub">${m.sub}</div>
        <div class="match-facts">${facts}</div>
        <div class="compat-bar-wrapper">
          <div class="compat-bar-label">
            <span>Compatibility</span>
            <span>${m.compat}%</span>
          </div>
          <div class="compat-bar-track">
            <div class="compat-bar-fill" style="width:${m.compat}%"></div>
          </div>
        </div>
        <button class="send-match-btn" onclick="handleSendMatch(this)">
          ✦ Send Match Introduction
        </button>
      </div>
    `;
  }).join('');
}

function handleSendMatch(btn) {
  if (btn.classList.contains('sent')) return;
  btn.textContent = 'Introduction Sent ✓';
  btn.classList.add('sent');
}

function renderNotesTimeline() {
  const timeline = document.getElementById('notesTimeline');
  if (!timeline) return;
  timeline.innerHTML = notes.map(n => `
    <div class="note-card">
      <div class="note-card-header">
        <span class="note-type-tag ${n.type}">${capitalize(n.type)}</span>
        <span class="note-date">${n.date}</span>
      </div>
      <p class="note-text">${n.text}</p>
      <p class="note-author">— ${n.author}</p>
    </div>
  `).join('');
}

function renderMeetingsFull() {
  const list = document.getElementById('meetingsFullList');
  if (!list || list.children.length > 0) return;
  const allMeetings = [
    ...meetings.map(m => ({ ...m, status: 'scheduled' })),
    { day: '08', mon: 'Dec', names: 'Sneha D. × Rahul G.', time: '04:00 PM', status: 'completed' },
    { day: '15', mon: 'Dec', names: 'Rohan M. × Aisha B.', time: '12:00 PM', status: 'completed' },
    { day: '28', mon: 'Dec', names: 'Kavya R. × Siddharth P.', time: '05:00 PM', status: 'cancelled' },
  ];

  const statusClass = { scheduled: 'msb-scheduled', completed: 'msb-completed', cancelled: 'msb-cancelled' };
  const statusLabel = { scheduled: 'Scheduled', completed: 'Completed', cancelled: 'Cancelled' };

  list.innerHTML = allMeetings.map(m => `
    <div class="meeting-full-card">
      <div class="meeting-full-date">
        <div class="mfd-day">${m.day}</div>
        <div class="mfd-mon">${m.mon}</div>
      </div>
      <div class="meeting-full-info">
        <div class="mf-title">${m.names}</div>
        <div class="mf-meta">${m.time} · Introduction Meeting</div>
      </div>
      <span class="meeting-status-badge ${statusClass[m.status]}">${statusLabel[m.status]}</span>
    </div>
  `).join('');
}

function renderAnalytics() {
  const barChart = document.getElementById('barChart');
  const barLabels = document.getElementById('barLabels');
  if (!barChart || barChart.children.length > 0) return;

  const monthData = [
    { mon: 'Oct', val: 18 },
    { mon: 'Nov', val: 24 },
    { mon: 'Dec', val: 31 },
    { mon: 'Jan', val: 22 },
  ];

  const max = Math.max(...monthData.map(d => d.val));

  barChart.innerHTML = monthData.map((d, i) => `
    <div class="bar-item">
      <div class="bar-val">${d.val}</div>
      <div class="bar-fill ${i === 2 ? 'gold' : ''}" style="height:${Math.round((d.val / max) * 100)}%"></div>
    </div>
  `).join('');

  barLabels.innerHTML = monthData.map(d => `
    <div class="bar-label">${d.mon}</div>
  `).join('');

  const demoList = document.getElementById('demoList');
  if (!demoList || demoList.children.length > 0) return;

  const demos = [
    { label: '25–30 yrs', pct: 38 },
    { label: '31–35 yrs', pct: 44 },
    { label: '36–40 yrs', pct: 14 },
    { label: '41+ yrs',   pct:  4 },
  ];

  demoList.innerHTML = demos.map(d => `
    <div class="demo-item">
      <span class="demo-label">${d.label}</span>
      <div class="demo-track">
        <div class="demo-fill" style="width:${d.pct}%"></div>
      </div>
      <span class="demo-pct">${d.pct}%</span>
    </div>
  `).join('');
}

/* ─── Dynamic Profile Renderer ─────────────── */

function viewClient(index) {
  const c = clients[index];
  if (!c) return;

  // Update topbar subtitle
  pages.profile.sub = `${c.name} — ${capitalize(c.status)} client`;

  // Avatar
  const av = getAvatarStyle(index);
  const profileAvatar = document.querySelector('.profile-avatar');
  if (profileAvatar) {
    profileAvatar.textContent = initials(c.name);
    profileAvatar.style.background = av.bg;
    profileAvatar.style.color = av.color;
  }

  // Name & location
  const profileName = document.querySelector('.profile-name');
  if (profileName) profileName.textContent = c.name;

  const profileLoc = document.querySelector('.profile-loc');
  if (profileLoc) {
    profileLoc.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 2.8 3 5C3 8 7 13 7 13C7 13 11 8 11 5C11 2.8 9.2 1 7 1Z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="5" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>
      ${c.city}
    `;
  }

  // Status badge
  const statusBadge = document.querySelector('.profile-status-badge');
  if (statusBadge) {
    statusBadge.textContent = `${capitalize(c.status)} Client`;
    statusBadge.className = `profile-status-badge ${c.status === 'active' ? 'active-badge' : c.status === 'matched' ? 'matched-badge' : 'pending-badge'}`;
  }

  // Personal info grid
  const infoGrids = document.querySelectorAll('.info-grid');
  if (infoGrids[0]) {
    infoGrids[0].innerHTML = `
      <div class="info-item"><span class="info-label">Full Name</span><span class="info-val">${c.name}</span></div>
      <div class="info-item"><span class="info-label">Age</span><span class="info-val">${c.age} years</span></div>
      <div class="info-item"><span class="info-label">City</span><span class="info-val">${c.city}</span></div>
      <div class="info-item"><span class="info-label">Email</span><span class="info-val">${c.email}</span></div>
      <div class="info-item"><span class="info-label">Marital Status</span><span class="info-val">Never Married</span></div>
      <div class="info-item"><span class="info-label">Last Updated</span><span class="info-val">${c.updated}</span></div>
    `;
  }

  // Professional info grid — use matchmaking pool data if available
  const poolProfile = (window.maleProfiles || []).concat(window.femaleProfiles || [])
    .find(p => p.firstName === c.name.split(' ')[0] && p.lastName === c.name.split(' ')[1]);

  if (infoGrids[1] && poolProfile) {
    infoGrids[1].innerHTML = `
      <div class="info-item"><span class="info-label">Occupation</span><span class="info-val">${poolProfile.designation}</span></div>
      <div class="info-item"><span class="info-label">Company</span><span class="info-val">${poolProfile.company}</span></div>
      <div class="info-item"><span class="info-label">Education</span><span class="info-val">${poolProfile.education}</span></div>
      <div class="info-item"><span class="info-label">Annual Income</span><span class="info-val">${poolProfile.income}</span></div>
    `;
  } else if (infoGrids[1]) {
    infoGrids[1].innerHTML = `
      <div class="info-item"><span class="info-label">Occupation</span><span class="info-val">—</span></div>
      <div class="info-item"><span class="info-label">Company</span><span class="info-val">—</span></div>
      <div class="info-item"><span class="info-label">Education</span><span class="info-val">—</span></div>
      <div class="info-item"><span class="info-label">Annual Income</span><span class="info-val">—</span></div>
    `;
  }

  // Partner preferences grid
  if (infoGrids[2] && poolProfile) {
    const prefReligion = poolProfile.religion;
    const prefCity = poolProfile.city;
    infoGrids[2].innerHTML = `
      <div class="info-item"><span class="info-label">Age Range</span><span class="info-val">${poolProfile.age + 1}–${poolProfile.age + 7} years</span></div>
      <div class="info-item"><span class="info-label">Religion</span><span class="info-val">${prefReligion}</span></div>
      <div class="info-item"><span class="info-label">Education</span><span class="info-val">Graduate & above</span></div>
      <div class="info-item"><span class="info-label">Location</span><span class="info-val">${prefCity} / Open to relocation</span></div>
      <div class="info-item"><span class="info-label">Open to Relocate</span><span class="info-val">${poolProfile.openToRelocate}</span></div>
      <div class="info-item"><span class="info-label">Wants Kids</span><span class="info-val">${poolProfile.wantsKids}</span></div>
    `;
  } else if (infoGrids[2]) {
    infoGrids[2].innerHTML = `
      <div class="info-item"><span class="info-label">Age Range</span><span class="info-val">${c.age + 1}–${c.age + 7} years</span></div>
      <div class="info-item"><span class="info-label">Religion</span><span class="info-val">—</span></div>
      <div class="info-item"><span class="info-label">Education</span><span class="info-val">Graduate & above</span></div>
      <div class="info-item"><span class="info-label">Location</span><span class="info-val">${c.city} / Open to relocation</span></div>
      <div class="info-item"><span class="info-label">Wants Kids</span><span class="info-val">—</span></div>
      <div class="info-item"><span class="info-label">Open to Relocate</span><span class="info-val">—</span></div>
    `;
  }

  // Profile tags
  const profileTags = document.querySelector('.profile-tags');
  if (profileTags && poolProfile) {
    profileTags.innerHTML = [poolProfile.religion, poolProfile.education, poolProfile.maritalStatus, poolProfile.languages[0]]
      .map(t => `<span class="tag">${t}</span>`).join('');
  }

  // Status tag in timeline section
  const statusTimeline = document.querySelector('.status-timeline');
  if (statusTimeline) {
    const statusStep = capitalize(c.status === 'active' ? 'Active Search' : c.status === 'matched' ? 'Matches Sent' : 'Profile Review');
    statusTimeline.innerHTML = `
      <div class="timeline-step done">
        <div class="step-dot"></div>
        <div class="step-body"><p class="step-title">Profile Onboarded</p><p class="step-date">${c.updated}</p></div>
      </div>
      <div class="timeline-step ${c.status === 'active' || c.status === 'matched' ? 'done' : 'active'}">
        <div class="step-dot ${c.status === 'pending' ? 'pulse' : ''}"></div>
        <div class="step-body"><p class="step-title">Initial Consultation</p><p class="step-date">${c.status !== 'pending' ? 'Completed' : 'Pending'}</p></div>
      </div>
      <div class="timeline-step ${c.status === 'matched' ? 'done' : c.status === 'active' ? 'active' : 'pending'}">
        <div class="step-dot ${c.status === 'active' ? 'pulse' : ''}"></div>
        <div class="step-body"><p class="step-title">${statusStep}</p><p class="step-date">${c.status === 'matched' ? 'Matches sent' : c.status === 'active' ? 'In Progress' : 'Pending'}</p></div>
      </div>
      <div class="timeline-step ${c.status === 'matched' ? 'active' : 'pending'}">
        <div class="step-dot ${c.status === 'matched' ? 'pulse' : ''}"></div>
        <div class="step-body"><p class="step-title">Meeting Scheduled</p><p class="step-date">${c.status === 'matched' ? 'Upcoming' : 'Pending'}</p></div>
      </div>
      <div class="timeline-step pending">
        <div class="step-dot"></div>
        <div class="step-body"><p class="step-title">Post-Meeting Follow-up</p><p class="step-date">Pending</p></div>
      </div>
    `;
  }

  // Update matches page sub-heading
  const matchesSub = document.querySelector('#page-matches .matches-header p');
  if (matchesSub) matchesSub.textContent = `AI-curated compatibility matches for ${c.name}`;

  showPage('profile');
}

/* ─── KPI Counter Animation ─────────────────── */
function animateCounters() {
  document.querySelectorAll('.kpi-value[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 900;
    const step = 16;
    const steps = duration / step;
    const inc = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + inc, target);
      el.textContent = Math.round(current);
      if (Math.round(current) >= target) clearInterval(timer);
    }, step);
  });
}

/* ─── Notes UI ──────────────────────────────── */
const addNoteBtn   = document.getElementById('addNoteBtn');
const noteCompose  = document.getElementById('noteCompose');
const cancelNote   = document.getElementById('cancelNote');
const saveNote     = document.getElementById('saveNote');
const noteText     = document.getElementById('noteText');
const noteType     = document.getElementById('noteType');
const notesTimeline= document.getElementById('notesTimeline');

addNoteBtn && addNoteBtn.addEventListener('click', () => {
  noteCompose.style.display = 'block';
  noteText.focus();
});

cancelNote && cancelNote.addEventListener('click', () => {
  noteCompose.style.display = 'none';
  noteText.value = '';
});

saveNote && saveNote.addEventListener('click', () => {
  const text = noteText.value.trim();
  if (!text) return;
  const type = noteType ? noteType.value : 'session';
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const newNote = {
    type, date: today,
    text,
    author: window._currentUserName || 'Matchmaker'
  };
  notes.unshift(newNote);
  renderNotesTimeline();
  noteCompose.style.display = 'none';
  noteText.value = '';
  newNote.author = window._currentUserName || newNote.author;
});

/* ─── Filter Tabs ───────────────────────────── */
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    tab.closest('.filter-tabs').querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
  });
});

/* ─── Search ────────────────────────────────── */
const searchInput = document.getElementById('searchInput');
searchInput && searchInput.addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('#clientTableBody tr, #clientTableBody2 tr').forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
});

/* ─── Entrance Animations ───────────────────── */
function observeAnimations() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), idx * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-animate]').forEach(el => io.observe(el));
}

/* ─── Init ──────────────────────────────────── */
function init() {
  renderClientTable('clientTableBody');
  renderClientTable('clientTableBody2');
  renderMeetingsList();
  renderMatchSuggestions();
  renderNotesTimeline();
  observeAnimations();
  setTimeout(animateCounters, 300);
  initAuth();
  initNotifications();
}

document.addEventListener('DOMContentLoaded', init);

/* ─── Utility ───────────────────────────────── */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}