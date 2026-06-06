/* =============================================
   SoulSync AI — Enhanced Dashboard JS
   ============================================= */

/* ─── Auth System ────────────────────────────── */

const AUTH_KEY = "soulsync_user";

function getUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY));
  } catch {
    return null;
  }
}

function saveUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function applyUserToUI(user) {
  if (!user) return;

  const name = user.name || "Matchmaker";
  const role = user.role || "Matchmaker";
  const initials2 = initials(name);

  // Sidebar user widget
  const sidebarName = document.querySelector(".user-name");
  const sidebarRole = document.querySelector(".user-role");
  const sidebarAvatar = document.querySelector(".user-avatar span");
  if (sidebarName) sidebarName.textContent = name;
  if (sidebarRole) sidebarRole.textContent = role;
  if (sidebarAvatar) sidebarAvatar.textContent = initials2;

  // Topbar avatar
  const topbarAvatar = document.getElementById("topbarAvatar");
  const menu = document.getElementById("dropdownMenu");

  if (topbarAvatar && menu) {
    topbarAvatar.addEventListener("click", () => {
      menu.classList.toggle("show");
    });
  }
  if (topbarAvatar) topbarAvatar.textContent = initials2;

  // Dashboard welcome subtitle
  pages.dashboard.sub = `Welcome back, ${name.split(" ")[0]}. Here's what's happening today.`;
  const ps = document.querySelector(".page-subtitle");
  if (
    ps &&
    document.getElementById("page-dashboard").classList.contains("active")
  ) {
    ps.textContent = pages.dashboard.sub;
  }

  // Settings page inputs
  const settingsInputs = document.querySelectorAll(".settings-input");
  if (settingsInputs[0]) settingsInputs[0].value = name;
  if (settingsInputs[1]) settingsInputs[1].value = user.email || "";
  if (settingsInputs[2]) settingsInputs[2].value = role;

  // Notes author name
  notes.forEach((n) => {
    if (n.author !== "System Alert") n.author = name;
  });

  // New notes use this name
  window._currentUserName = name;
}

function showAuthModal() {
  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.style.display = "flex";
}

function hideAuthModal() {
  const overlay = document.getElementById("authOverlay");
  if (overlay) overlay.style.display = "none";
}

function initAuth() {
  const overlay = document.getElementById("authOverlay");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const goSignup = document.getElementById("goToSignup");
  const goLogin = document.getElementById("goToLogin");
  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");
  const loginError = document.getElementById("loginError");
  const signupError = document.getElementById("signupError");

  // Toggle between login / signup
  goSignup &&
    goSignup.addEventListener("click", () => {
      loginForm.style.display = "none";
      signupForm.style.display = "block";
    });
  goLogin &&
    goLogin.addEventListener("click", () => {
      signupForm.style.display = "none";
      loginForm.style.display = "block";
    });

  // Login submit
  loginBtn &&
    loginBtn.addEventListener("click", () => {
      const name = document.getElementById("loginName").value.trim();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value;
      if (!name || !email || !password) {
        loginError.textContent = "Please fill in all fields.";
        return;
      }
      loginError.textContent = "";
      const user = { name, email, role: "Matchmaker", password };
      saveUser(user);
      applyUserToUI(user);
      hideAuthModal();
      addNotification(
        "system",
        `Welcome back, ${name.split(" ")[0]}! You're now signed in.`,
      );
    });

  // Signup submit
  signupBtn &&
    signupBtn.addEventListener("click", () => {
      const name = document.getElementById("signupName").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const role =
        document.getElementById("signupRole").value.trim() || "Matchmaker";
      const password = document.getElementById("signupPassword").value;
      if (!name || !email || !password) {
        signupError.textContent = "Please fill in all required fields.";
        return;
      }
      signupError.textContent = "";
      const user = { name, email, role, password };
      saveUser(user);
      applyUserToUI(user);
      hideAuthModal();
      addNotification(
        "system",
        `Account created! Welcome to SoulSync, ${name.split(" ")[0]}.`,
      );
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
  {
    id: 1,
    type: "client",
    text: "New client assigned: Ananya Iyer is ready for profile review.",
    time: "Just now",
    read: false,
    page: "clients",
  },
  {
    id: 2,
    type: "followup",
    text: "Follow-up due: Priya Sharma needs a post-match check-in.",
    time: "Today",
    read: false,
    page: "notes",
  },
  {
    id: 3,
    type: "meeting",
    text: "Meeting tomorrow: Arjun Mehta × Priya Sharma at 11:00 AM.",
    time: "Tomorrow",
    read: false,
    page: "meetings",
  },
  {
    id: 4,
    type: "accepted",
    text: "Match accepted: Kavya Reddy approved the latest introduction.",
    time: "1 hr ago",
    read: true,
    page: "matches",
  },
];

const notifIcons = {
  match: `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 16C9 16 3 12 3 7.5C3 5 5.5 3 8 4C8.7 4.3 9 4.5 9 4.5C9 4.5 9.3 4.3 10 4C12.5 3 15 5 15 7.5C15 12 9 16 9 16Z" stroke="currentColor" stroke-width="1.5"/></svg>`,
  meeting: `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M6 1V4M12 1V4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M2 8H16" stroke="currentColor" stroke-width="1.5"/></svg>`,
  client: `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3.5" stroke="currentColor" stroke-width="1.5"/><path d="M2.5 17C2.5 13.7 5.4 11 9 11C12.6 11 15.5 13.7 15.5 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  followup: `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M4 4H14C14.6 4 15 4.4 15 5V12C15 12.6 14.6 13 14 13H8L4 16V5C4 4.4 4.4 4 4 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 8H12M7 10.5H10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  accepted: `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 16C9 16 3 12 3 7.5C3 5 5.5 3 8 4C8.7 4.3 9 4.5 9 4.5C9 4.5 9.3 4.3 10 4C12.5 3 15 5 15 7.5C15 12 9 16 9 16Z" stroke="currentColor" stroke-width="1.5"/><path d="M6.5 9L8.3 10.8L11.8 7.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  alert: `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><path d="M9 3L15.5 15H2.5L9 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 8V11M9 13V13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
  system: `<svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M9 5V9L12 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

function unreadCount() {
  return notifData.filter((n) => !n.read).length;
}

function updateNotifBadge() {
  const dot = document.getElementById("notifDot");
  if (!dot) return;
  dot.style.display = unreadCount() > 0 ? "block" : "none";
}

function renderNotifDropdown() {
  const list = document.getElementById("notifList");
  if (!list) return;
  if (notifData.length === 0) {
    list.innerHTML = `<div class="notif-empty">All caught up! No notifications.</div>`;
    return;
  }
  list.innerHTML = notifData
    .map(
      (n) => `
    <div class="notif-item ${n.read ? "read" : "unread"}" data-id="${n.id}">
      <div class="notif-icon-wrap notif-type-${n.type}">${notifIcons[n.type] || notifIcons.system}</div>
      <div class="notif-body">
        <p class="notif-text">${escapeHtml(n.text)}</p>
        <p class="notif-time">${escapeHtml(n.time)}</p>
      </div>
      ${!n.read ? '<div class="notif-unread-dot"></div>' : ""}
    </div>
  `,
    )
    .join("");

  // Click to mark individual as read
  list.querySelectorAll(".notif-item").forEach((el) => {
    el.addEventListener("click", () => {
      const id = parseInt(el.dataset.id);
      const item = notifData.find((n) => n.id === id);
      if (item) {
        item.read = true;
      }
      renderNotifDropdown();
      updateNotifBadge();
      if (item?.page) {
        document.getElementById("notifDropdown")?.classList.remove("open");
        showPage(item.page);
      }
    });
  });
}

function addNotification(type, text) {
  const newId = Date.now();
  notifData.unshift({ id: newId, type, text, time: "Just now", read: false });
  renderNotifDropdown();
  updateNotifBadge();
}

function initNotifications() {
  const btn = document.getElementById("notifBtn");
  const dropdown = document.getElementById("notifDropdown");
  const markRead = document.getElementById("markAllRead");

  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains("open");
    dropdown.classList.toggle("open", !isOpen);
    if (!isOpen) {
      renderNotifDropdown();
      // Anchor dropdown under button
      const rect = btn.getBoundingClientRect();
      dropdown.style.top = rect.bottom + 8 + "px";
      dropdown.style.right = window.innerWidth - rect.right + "px";
    }
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove("open");
    }
  });

  markRead &&
    markRead.addEventListener("click", () => {
      notifData.forEach((n) => (n.read = true));
      renderNotifDropdown();
      updateNotifBadge();
    });

  updateNotifBadge();

  renderNotifDropdown();
}

/* ─── Custom Cursor ─────────────────────────── */
const cursor = document.getElementById("cursor");

let mouseX = 0,
  mouseY = 0;
let cursorX = 0,
  cursorY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.18;
  cursorY += (mouseY - cursorY) * 0.18;
  if (cursor) {
    cursor.style.left = cursorX + "px";
    cursor.style.top = cursorY + "px";
  }
  requestAnimationFrame(animateCursor);
}
animateCursor();

document
  .querySelectorAll(
    "a, button, input, select, textarea, .nav-item, .kpi-card, .match-card, .client-table tbody tr",
  )
  .forEach((el) => {
    el.addEventListener(
      "mouseenter",
      () => cursor && cursor.classList.add("hovering"),
    );
    el.addEventListener(
      "mouseleave",
      () => cursor && cursor.classList.remove("hovering"),
    );
  });

/* ─── Sidebar Toggle ────────────────────────── */
const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const mainContent = document.querySelector(".main-content");
let sidebarOpen = true;

sidebarToggle &&
  sidebarToggle.addEventListener("click", () => {
    if (window.innerWidth <= 768) {
      sidebar.classList.toggle("mobile-open");
    } else {
      sidebarOpen = !sidebarOpen;
      if (sidebarOpen) {
        sidebar.classList.remove("collapsed");
        mainContent.classList.remove("expanded");
      } else {
        sidebar.classList.add("collapsed");
        mainContent.classList.add("expanded");
      }
    }
  });

/* ─── Page Navigation ───────────────────────── */
const pages = {
  dashboard: {
    title: "Dashboard",
    sub: "Welcome back, Sarah. Here's what's happening today.",
  },
  workspace: {
    title: "Matchmaker Workspace",
    sub: "Your assigned clients, due follow-ups, meetings, and new leads.",
  },
  clients: { title: "Clients", sub: "Manage your active client roster." },
  "add-client": {
    title: "Create Client",
    sub: "Add a new client profile to your roster.",
  },
  matches: {
    title: "Match Suggestions",
    sub: "AI-curated compatibility profiles.",
  },
  meetings: {
    title: "Meetings",
    sub: "Scheduled introductions and consultations.",
  },
  "schedule-meeting": {
    title: "Schedule Meeting",
    sub: "Create an introduction or consultation.",
  },
  profile: {
    title: "Client Profile",
    sub: "Priya Sharma — Active client since Nov 2024.",
  },
  notes: { title: "Notes", sub: "Session notes and matchmaker observations." },
  analytics: {
    title: "Analytics",
    sub: "Live metrics from your matchmaking database.",
  },
  settings: { title: "Settings", sub: "Manage your account and preferences." },
};

function showPage(pageId) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-item")
    .forEach((n) => n.classList.remove("active"));

  const targetPage = document.getElementById("page-" + pageId);
  if (targetPage) {
    targetPage.classList.add("active");
    const info = pages[pageId] || {};
    const pt = document.querySelector(".page-title");
    const ps = document.querySelector(".page-subtitle");
    if (pt) pt.textContent = info.title || "";
    if (ps) ps.textContent = info.sub || "";
  }

  const navItem = document.querySelector(`[data-page="${pageId}"]`);
  if (navItem) navItem.classList.add("active");

  // Run page-specific init
  if (pageId === "analytics") renderAnalytics();
  if (pageId === "meetings") renderMeetingsFull();
  if (pageId === "workspace") renderWorkspace();
  if (pageId === "schedule-meeting") renderMeetingCustomerOptions();
  if (pageId === "matches") {
    loadMatchSuggestions(currentMatchCustomerId || clients[0]?.id);
  }

  if (window.innerWidth <= 768) {
    sidebar && sidebar.classList.remove("mobile-open");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll(".nav-item[data-page]").forEach((item) => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(item.dataset.page);
  });
});

/* ─── Data ──────────────────────────────────── */
const avatarColors = [
  { bg: "linear-gradient(135deg,#7F1D1D,#991B1B)", color: "#F7EFC6" },
  { bg: "linear-gradient(135deg,#1E3A5F,#2563EB)", color: "#DBEAFE" },
  { bg: "linear-gradient(135deg,#14532D,#16A34A)", color: "#DCFCE7" },
  { bg: "linear-gradient(135deg,#713F12,#D97706)", color: "#FEF3C7" },
  { bg: "linear-gradient(135deg,#4C1D95,#7C3AED)", color: "#EDE9FE" },
  { bg: "linear-gradient(135deg,#134E4A,#0D9488)", color: "#CCFBF1" },
];

function getAvatarStyle(i) {
  return avatarColors[i % avatarColors.length];
}

function initials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

let clients = [];
let allCustomers = [];
let activeStatusFilter = "";
let currentMatchCustomerId = "";
let matchSuggestions = [];
let sentMatchCandidateIds = new Set();

let meetings = [
  {
    day: "14",
    mon: "Jan",
    names: "Priya S. × Arjun M.",
    time: "11:00 AM",
    type: "#22C55E",
  },
  {
    day: "16",
    mon: "Jan",
    names: "Rohan M. × Kavya R.",
    time: "03:00 PM",
    type: "#D4AF37",
  },
  {
    day: "19",
    mon: "Jan",
    names: "Vikram S. × Sneha D.",
    time: "02:30 PM",
    type: "#22C55E",
  },
  {
    day: "22",
    mon: "Jan",
    names: "Ananya I. × Nikhil J.",
    time: "10:00 AM",
    type: "#F59E0B",
  },
];

const notes = [
  {
    type: "session",
    date: "Dec 18, 2024",
    text: "Initial consultation conducted via video call. Client is well-settled professionally and has a clear vision of her expectations. Mentioned preference for someone with a stable career who values family deeply. Comfortable with both arranged and semi-arranged scenarios.",
    author: "Sarah Reynolds",
  },
  {
    type: "observation",
    date: "Dec 22, 2024",
    text: "After reviewing three profiles sent, client responded positively to Arjun Mehta. Highlighted that she appreciated his educational background and family values. She expressed hesitation about distance but is open to relocation if the right connection is established.",
    author: "Sarah Reynolds",
  },
  {
    type: "followup",
    date: "Jan 3, 2025",
    text: "Follow-up call completed. Client confirmed she is comfortable with meeting Arjun Mehta in person. Meeting scheduled for January 14th. Reminded client to keep expectations open and approach the first meeting as a friendly conversation.",
    author: "Sarah Reynolds",
  },
  {
    type: "alert",
    date: "Jan 9, 2025",
    text: "Client has requested a slight change of venue for the January 14th meeting. Confirming with Arjun's profile manager. Please follow up before EOD January 10th. Updated logistics will be shared with both parties.",
    author: "System Alert",
  },
];

/* ─── Render Functions ──────────────────────── */

function renderClientTable(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;
  if (clients.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:var(--warm-gray);padding:24px;">
          No clients found
        </td>
      </tr>
    `;
    return;
  }
  tbody.innerHTML = clients
    .map((c, i) => {
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
    })
    .join("");
}

function renderMeetingsList() {
  const list = document.getElementById("meetingsList");
  if (!list) return;
  if (meetings.length === 0) {
    list.innerHTML = `<div class="empty-state-sm">No meetings scheduled yet.</div>`;
    return;
  }
  list.innerHTML = meetings
    .map(
      (m) => `
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
  `,
    )
    .join("");
}

function renderWorkspace() {
  const assignedClients = allCustomers.length || clients.length;
  const followupsDue = allCustomers.filter(
    (c) => c.status === "matched" || c.status === "pending",
  ).length;
  const meetingsToday = meetings.length;
  const newLeads = allCustomers.filter(
    (c) => c.statusTag === "New Lead",
  ).length;

  setText("workspaceAssignedClients", assignedClients);
  setText("workspaceFollowupsDue", followupsDue);
  setText("workspaceMeetingsToday", meetingsToday);
  setText("workspaceNewLeads", newLeads);
  renderWorkspacePriorityQueue();
  renderWorkspaceAgenda();
  renderWorkspacePulse();
  renderWorkspaceActivity();
}

function workspaceCustomers() {
  return allCustomers.length ? allCustomers : clients;
}

function renderWorkspacePriorityQueue() {
  const list = document.getElementById("workspacePriorityList");
  if (!list) return;

  const priority = [...workspaceCustomers()]
    .sort((a, b) => {
      const rank = { pending: 0, matched: 1, active: 2, inactive: 3 };
      return (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    })
    .slice(0, 5);

  if (priority.length === 0) {
    list.innerHTML = `<div class="workspace-empty">No priority clients yet.</div>`;
    return;
  }

  list.innerHTML = priority
    .map((client, index) => {
      const av = getAvatarStyle(index);
      return `
      <div class="workspace-priority-item">
        <div class="workspace-person">
          <div class="workspace-avatar" style="background:${av.bg};color:${av.color}">${initials(client.name)}</div>
          <div>
            <div class="workspace-name">${escapeHtml(client.name)}</div>
            <div class="workspace-meta">${escapeHtml(client.city || "Location pending")} · ${escapeHtml(client.statusTag || "Profile Review")}</div>
          </div>
        </div>
        <span class="workspace-status-pill ${escapeHtml(client.status)}">${escapeHtml(capitalize(client.status || "active"))}</span>
        <button class="row-action-btn" onclick="viewClientById('${escapeHtml(client.id)}')">Open</button>
      </div>
    `;
    })
    .join("");
}

function renderWorkspaceAgenda() {
  const list = document.getElementById("workspaceAgendaList");
  if (!list) return;

  const agenda = meetings.slice(0, 4);
  if (agenda.length === 0) {
    list.innerHTML = `<div class="workspace-empty">No meetings scheduled. Add one to build the day plan.</div>`;
    return;
  }

  list.innerHTML = agenda
    .map(
      (meeting) => `
    <div class="workspace-agenda-item">
      <div class="workspace-agenda-date">
        <strong>${escapeHtml(meeting.day)}</strong>
        <span>${escapeHtml(meeting.mon)}</span>
      </div>
      <div>
        <div class="workspace-name">${escapeHtml(meeting.names)}</div>
        <div class="workspace-meta">${escapeHtml(meeting.time)} · ${escapeHtml(meeting.meetingType || "Introduction Meeting")}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderWorkspacePulse() {
  const pulse = document.getElementById("workspacePulse");
  if (!pulse) return;

  const customers = workspaceCustomers();
  const count = (status) => customers.filter((c) => c.status === status).length;
  const groups = [
    ["Pending", count("pending")],
    ["Active", count("active")],
    ["Matched", count("matched")],
    ["Meetings", meetings.length],
  ];

  pulse.innerHTML = groups
    .map(
      ([label, value]) => `
    <div class="pulse-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `,
    )
    .join("");
}

function renderWorkspaceActivity() {
  const stream = document.getElementById("workspaceActivityStream");
  if (!stream) return;

  const customers = workspaceCustomers();
  const newest = customers.slice(-1)[0];
  const nextMeeting = meetings[0];
  const activeCount = customers.filter((c) => c.status === "active").length;
  const items = [
    {
      tag: "Intake",
      title: newest
        ? `${newest.name} joined the roster`
        : "Roster ready for intake",
      meta: newest
        ? `${newest.city || "City pending"} · ${newest.statusTag}`
        : "Create a client to begin",
    },
    {
      tag: "Calendar",
      title: nextMeeting ? nextMeeting.names : "No upcoming introductions",
      meta: nextMeeting
        ? `${nextMeeting.day} ${nextMeeting.mon} · ${nextMeeting.time}`
        : "Schedule the first meeting",
    },
    {
      tag: "Search",
      title: `${activeCount} active searches in progress`,
      meta: "Use matches to shortlist introductions",
    },
  ];

  stream.innerHTML = items
    .map(
      (item) => `
    <div class="workspace-activity-item">
      <span class="workspace-activity-tag">${escapeHtml(item.tag)}</span>
      <div class="workspace-name">${escapeHtml(item.title)}</div>
      <div class="workspace-meta">${escapeHtml(item.meta)}</div>
    </div>
  `,
    )
    .join("");
}

/* ─── Match compatibility presentation ─────────── */

const COMPAT_FACTOR_HINTS = {
  religion: ['religion', 'religious', 'faith', 'values'],
  caste: ['caste', 'cultural', 'background'],
  age: ['age'],
  height: ['height'],
  income: ['income'],
  education: ['education'],
  education_compatibility: ['education'],
  location: ['city', 'state', 'location'],
  languages: ['language'],
  wants_kids: ['children', 'kids', 'child'],
  desire_for_children: ['children', 'child', 'desire'],
  open_to_pets: ['pet'],
  open_to_relocate: ['relocation', 'relocate', 'location'],
  relocation_preferences: ['relocation', 'relocate'],
  profession_similarity: ['profession', 'designation', 'company', 'field'],
  values: ['religious', 'cultural', 'values', 'caste', 'religion'],
  lifestyle_compatibility: ['lifestyle', 'city', 'language', 'pet'],
};

function getMatchScore(match) {
  return Number(match.compat ?? match.compatibility_score ?? 0);
}

function getMatchTier(score) {
  if (score >= 85) {
    return { label: 'Exceptional Match', slug: 'exceptional', barClass: 'compat-bar-exceptional' };
  }
  if (score >= 70) {
    return { label: 'Strong Match', slug: 'strong', barClass: 'compat-bar-strong' };
  }
  if (score >= 55) {
    return { label: 'Good Match', slug: 'good', barClass: 'compat-bar-good' };
  }
  return { label: 'Moderate Match', slug: 'moderate', barClass: 'compat-bar-moderate' };
}

function findExplanationForFactor(key, explanations) {
  const hints = COMPAT_FACTOR_HINTS[key] || [key.replace(/_/g, ' ')];
  for (const explanation of explanations || []) {
    const lower = explanation.toLowerCase();
    if (hints.some((hint) => lower.includes(hint))) {
      return explanation;
    }
  }
  return null;
}

function getTopCompatibilityReasons(match, limit = 3) {
  const breakdown = match.compatibility_breakdown || {};
  const explanations = match.explanation || [];
  const ranked = Object.entries(breakdown)
    .filter(([, points]) => points > 0)
    .sort((a, b) => b[1] - a[1]);

  const reasons = [];
  const used = new Set();

  for (const [key] of ranked) {
    const reason = findExplanationForFactor(key, explanations);
    if (reason && !used.has(reason)) {
      reasons.push(reason);
      used.add(reason);
    }
    if (reasons.length >= limit) break;
  }

  for (const explanation of explanations) {
    if (!used.has(explanation) && reasons.length < limit) {
      reasons.push(explanation);
      used.add(explanation);
    }
  }

  return reasons;
}

function getMatchIntroduction(match) {
  if (match.introduction) {
    return match.introduction;
  }
  return buildMatchIntroductionFallback(match);
}

function buildMatchIntroductionFallback(match) {
  const score = getMatchScore(match);
  const profile = match.profile || {};
  const education = profile.education || match.facts?.find((f) => f[0] === "Edu")?.[1] || "";
  const designation =
    profile.designation || match.facts?.find((f) => f[0] === "Occupation")?.[1] || "";
  const company = profile.company || "";
  const wantsKids = profile.wantsKids || "Maybe";
  const openToRelocate = profile.openToRelocate || "Maybe";
  const languages = profile.languages || [];
  const firstName = (match.name || "This candidate").split(" ")[0];

  const educationLine =
    education && designation && company
      ? `${firstName} holds a ${education} and works as a ${designation} at ${company}.`
      : education && designation
        ? `${firstName} holds a ${education} and works as a ${designation}.`
        : education
          ? `${firstName} brings a ${education} background to this introduction.`
          : designation
            ? `${firstName} works as a ${designation}, offering relevant professional experience.`
            : "";

  const familyLine =
    wantsKids === "Yes"
      ? "Their profile reflects a positive outlook on building a family."
      : wantsKids === "No"
        ? "Their profile indicates a lifestyle focus without immediate parenting plans."
        : "They remain thoughtfully open on family planning preferences.";

  const relocationLine =
    openToRelocate === "Yes"
      ? "They are open to relocating for the right partnership."
      : openToRelocate === "No"
        ? "They prefer to remain settled in their current location."
        : "They show measured flexibility around relocation.";

  const languageLine =
    languages.length >= 2
      ? `Shared fluency in ${languages.slice(0, 2).join(" and ")} should support comfortable conversation.`
      : languages.length === 1
        ? `A shared command of ${languages[0]} should help both sides connect with ease.`
        : "";

  const closingLine = `At ${score}% compatibility, this introduction is worth presenting to your client.`;

  return [
    `We're pleased to introduce ${match.name} as a thoughtfully curated match for your client.`,
    educationLine,
    familyLine,
    relocationLine,
    languageLine,
    closingLine,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildMatchSummary(match) {
  const score = getMatchScore(match);
  const tier = getMatchTier(score);
  const topReasons = getTopCompatibilityReasons(match, 3);
  const reasonPhrase = topReasons.length
    ? topReasons.slice(0, 2).join(' and ')
    : 'shared profile alignment';

  if (score >= 85) {
    return `An ${tier.label.toLowerCase()} at ${score}% compatibility. ${reasonPhrase} make this a standout introduction worth prioritising.`;
  }
  if (score >= 70) {
    return `A ${tier.label.toLowerCase()} at ${score}% compatibility with meaningful overlap on ${reasonPhrase}.`;
  }
  if (score >= 55) {
    return `A ${tier.label.toLowerCase()} at ${score}% compatibility. Notable alignment includes ${reasonPhrase}.`;
  }
  return `A ${tier.label.toLowerCase()} at ${score}% compatibility. ${reasonPhrase} may still offer a worthwhile starting point for conversation.`;
}

function renderMatchSuggestions() {
  const grid = document.getElementById("matchesGrid");
  if (!grid) return;
  if (matchSuggestions.length === 0) {
    grid.innerHTML = `
      <div class="match-card">
        <div class="match-name">No match suggestions found</div>
        <div class="match-sub">Try selecting another client profile.</div>
      </div>
    `;
    return;
  }
  grid.innerHTML = matchSuggestions
    .map((m, i) => {
      const av = getAvatarStyle(i + 1);
      const score = getMatchScore(m);
      const tier = getMatchTier(score);
      const summary = buildMatchSummary(m);
      const topReasons = getTopCompatibilityReasons(m, 3);
      const introduction = getMatchIntroduction(m);
      const facts = m.facts
        .map(
          (f) => `
      <div class="match-fact">
        <div class="match-fact-label">${escapeHtml(f[0])}</div>
        <div>${escapeHtml(f[1])}</div>
      </div>
    `,
        )
        .join("");
      const topReasonsHtml = topReasons
        .map(
          (reason) => `
      <li class="match-top-reason">
        <span class="match-top-reason-icon" aria-hidden="true">✓</span>
        <span>${escapeHtml(reason)}</span>
      </li>
    `,
        )
        .join("");
      const allReasons = (m.explanation || [])
        .map(
          (reason) => `
      <li>${escapeHtml(reason)}</li>
    `,
        )
        .join("");
      const matchKey = buildMatchKey(currentMatchCustomerId, m.id);
      const hasSaved = getIntrosForMatch(matchKey).length > 0;
      const alreadySent = sentMatchCandidateIds.has(m.id);
      return `
      <div class="match-card match-card--${tier.slug}">
        <div class="match-card-top">
          <span class="match-tier-badge match-tier-badge--${tier.slug}">${escapeHtml(tier.label)}</span>
          <div class="match-compat-display" aria-label="${score} percent compatibility">
            <span class="match-compat-value">${score}</span>
            <span class="match-compat-percent">%</span>
          </div>
        </div>
        <div class="match-avatar" style="background:${av.bg};color:${av.color}">${initials(m.name)}</div>
        <div class="match-name">${escapeHtml(m.name)}</div>
        <div class="match-sub">${escapeHtml(m.sub)}</div>
        <div class="match-facts">${facts}</div>
        <div class="compat-bar-wrapper">
          <div class="compat-bar-label">
            <span>Compatibility Score</span>
            <span class="compat-bar-score">${score}%</span>
          </div>
          <div class="compat-bar-track">
            <div class="compat-bar-fill ${tier.barClass}" style="width:${score}%"></div>
          </div>
        </div>
        <p class="match-summary">${escapeHtml(summary)}</p>
        <div class="match-intro-block">
          <div class="match-intro-header">
            <span class="match-intro-icon" aria-hidden="true">✦</span>
            <p class="match-intro-label">AI Introduction</p>
          </div>
          <p class="match-intro-text">${escapeHtml(introduction)}</p>
        </div>
        ${
          topReasons.length
            ? `
        <div class="match-top-reasons">
          <p class="match-top-reasons-label">Top compatibility reasons</p>
          <ul class="match-top-reasons-list">${topReasonsHtml}</ul>
        </div>`
            : ""
        }
        <button class="why-match-toggle" type="button" onclick="toggleMatchReasons(this)">
          ${(m.explanation || []).length > topReasons.length ? "View all factors" : "Why this match?"}
        </button>
        <div class="why-match-panel">
          <p class="why-match-panel-label">Full compatibility breakdown</p>
          <ul>${allReasons || "<li>No detailed factors recorded for this pairing.</li>"}</ul>
        </div>
        <button class="gen-intro-btn ${hasSaved ? "has-saved" : ""}" type="button" data-customer-id="${escapeHtml(currentMatchCustomerId)}" data-match-id="${escapeHtml(m.id)}" data-match-name="${escapeHtml(m.name)}" data-compat="${score}">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4H12C12.6 4 13 4.4 13 5V11C13 11.6 12.6 12 12 12H7L4 14V5C4 4.4 4.4 4 4 4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 7H10M6 9.5H8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          ${hasSaved ? "✦ Letter Saved" : "View Full Introduction"}
        </button>
        <button class="send-match-btn ${alreadySent ? "sent-confirmed" : ""}" type="button" ${alreadySent ? "disabled" : ""}>
          ${alreadySent ? "✓ Match Sent" : "✦ Send Match Introduction"}
        </button>
      </div>
    `;
    })
    .join("");
}

function loadMatchSuggestions(customerId) {
  if (!customerId) {
    matchSuggestions = [];
    renderMatchSuggestions();
    return Promise.resolve([]);
  }

  currentMatchCustomerId = customerId;
  return Promise.all([
    fetch(`/api/customers/${encodeURIComponent(customerId)}/matches/`),
    fetch(`/api/customers/${encodeURIComponent(customerId)}/match-history/`),
  ])
    .then(async ([matchesRes, historyRes]) => {
      if (!matchesRes.ok) {
        throw new Error(`Match API request failed with ${matchesRes.status}`);
      }
      const data = await matchesRes.json();
      if (historyRes.ok) {
        const history = await historyRes.json();
        sentMatchCandidateIds = new Set(history.map((m) => m.candidateId));
      } else {
        sentMatchCandidateIds = new Set();
      }
      return data;
    })
    .then((data) => {
      matchSuggestions = data;
      renderMatchSuggestions();
      return data;
    })
    .catch((err) => {
      console.error("Error fetching match suggestions:", err);
      matchSuggestions = [];
      renderMatchSuggestions();
      return [];
    });
}

function toggleMatchReasons(btn) {
  const panel = btn.nextElementSibling;
  if (!panel) return;
  const isOpen = panel.classList.toggle("open");
  btn.classList.toggle("open", isOpen);
}

function renderNotesTimeline() {
  const timeline = document.getElementById("notesTimeline");
  if (!timeline) return;
  timeline.innerHTML = notes
    .map(
      (n) => `
    <div class="note-card">
      <div class="note-card-header">
        <span class="note-type-tag ${n.type}">${capitalize(n.type)}</span>
        <span class="note-date">${n.date}</span>
      </div>
      <p class="note-text">${n.text}</p>
      <p class="note-author">— ${n.author}</p>
    </div>
  `,
    )
    .join("");
}

function renderMeetingsFullStaticArchive() {
  const list = document.getElementById("meetingsFullList");
  if (!list || list.children.length > 0) return;
  const allMeetings = [
    ...meetings.map((m) => ({ ...m, status: "scheduled" })),
    {
      day: "08",
      mon: "Dec",
      names: "Sneha D. × Rahul G.",
      time: "04:00 PM",
      status: "completed",
    },
    {
      day: "15",
      mon: "Dec",
      names: "Rohan M. × Aisha B.",
      time: "12:00 PM",
      status: "completed",
    },
    {
      day: "28",
      mon: "Dec",
      names: "Kavya R. × Siddharth P.",
      time: "05:00 PM",
      status: "cancelled",
    },
  ];

  const statusClass = {
    scheduled: "msb-scheduled",
    completed: "msb-completed",
    cancelled: "msb-cancelled",
  };
  const statusLabel = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  list.innerHTML = allMeetings
    .map(
      (m) => `
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
  `,
    )
    .join("");
}

function renderMeetingsFull() {
  const list = document.getElementById("meetingsFullList");
  if (!list) return;
  if (meetings.length === 0) {
    list.innerHTML = `<div class="meeting-full-card"><div class="meeting-full-info"><div class="mf-title">No meetings scheduled yet</div><div class="mf-meta">Use Schedule Meeting to create the first one.</div></div></div>`;
    return;
  }

  const statusClass = {
    scheduled: "msb-scheduled",
    completed: "msb-completed",
    cancelled: "msb-cancelled",
  };
  const statusLabel = {
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  list.innerHTML = meetings
    .map(
      (m) => `
    <div class="meeting-full-card">
      <div class="meeting-full-date">
        <div class="mfd-day">${escapeHtml(m.day)}</div>
        <div class="mfd-mon">${escapeHtml(m.mon)}</div>
      </div>
      <div class="meeting-full-info">
        <div class="mf-title">${escapeHtml(m.names)}</div>
        <div class="mf-meta">${escapeHtml(m.time)} · ${escapeHtml(m.meetingType || "Introduction Meeting")}</div>
      </div>
      <span class="meeting-status-badge ${statusClass[m.status] || statusClass.scheduled}">${statusLabel[m.status] || "Scheduled"}</span>
    </div>
  `,
    )
    .join("");
}

const ANALYTICS_STATUS_COLORS = {
  "New Lead": "#6366F1",
  "Profile Review": "#8B5CF6",
  "Active Search": "#7F1D1D",
  "Matches Sent": "#D4AF37",
  "Meeting Scheduled": "#B45309",
  "Engagement In Progress": "#15803D",
  "On Hold": "#9CA3AF",
  Closed: "#6B7280",
};

const MATCH_METRIC_COLORS = {
  Sent: "burgundy",
  Accepted: "gold",
  Rejected: "muted",
  Pending: "warm",
};

function renderAnalytics() {
  loadAnalytics();
}

async function loadAnalytics() {
  try {
    const response = await fetch("/api/analytics/");
    if (!response.ok) {
      throw new Error(`Analytics request failed with ${response.status}`);
    }
    const data = await response.json();
    renderAnalyticsSummary(data.summary || {});
    renderStatusDistributionChart(data.statusDistribution || []);
    renderMatchSuccessChart(data.matchMetrics || {});

    const subtitle = document.getElementById("analyticsSubtitle");
    if (subtitle) {
      subtitle.textContent = `Live metrics across ${data.summary?.totalCustomers || 0} customer profiles`;
    }
  } catch (err) {
    console.error("Error loading analytics:", err);
    const subtitle = document.getElementById("analyticsSubtitle");
    if (subtitle) {
      subtitle.textContent = "Unable to load analytics data right now.";
    }
  }
}

function renderAnalyticsSummary(summary) {
  const fields = [
    ["analyticsTotalCustomers", summary.totalCustomers],
    ["analyticsActiveSearch", summary.activeSearch],
    ["analyticsMatchesSent", summary.matchesSent],
    ["analyticsMeetingsScheduled", summary.meetingsScheduled],
    ["analyticsNewLeads", summary.newLeads],
    ["analyticsClosedProfiles", summary.closedProfiles],
  ];

  fields.forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value ?? 0;
  });
}

function getAnalyticsStatusColor(label, index) {
  return (
    ANALYTICS_STATUS_COLORS[label] ||
    ["#7F1D1D", "#D4AF37", "#B45309", "#6366F1"][index % 4]
  );
}

function renderStatusDistributionChart(distribution) {
  const donut = document.getElementById("statusDistributionDonut");
  const legend = document.getElementById("statusDistributionLegend");
  const bars = document.getElementById("statusDistributionBars");
  const totalEl = document.getElementById("statusDistributionTotal");
  const sub = document.getElementById("statusDistributionSub");

  const total = distribution.reduce((sum, item) => sum + item.count, 0);
  if (totalEl) totalEl.textContent = total;
  if (sub) {
    sub.textContent =
      total > 0
        ? `Breakdown of ${total} clients by current pipeline stage`
        : "No customer records available yet";
  }

  if (!donut || !legend || !bars) return;

  if (!total) {
    donut.style.background = "rgba(127,29,29,0.08)";
    legend.innerHTML = `<div class="analytics-empty">No customer status data to display.</div>`;
    bars.innerHTML = "";
    return;
  }

  let cursor = 0;
  const segments = distribution.map((item, index) => {
    const pct = (item.count / total) * 100;
    const color = getAnalyticsStatusColor(item.label, index);
    const start = cursor;
    cursor += pct;
    return { ...item, pct, color, start, end: cursor };
  });

  donut.style.background = `conic-gradient(${segments
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(", ")})`;

  legend.innerHTML = segments
    .map(
      (segment) => `
    <div class="analytics-legend-item">
      <span class="analytics-legend-swatch" style="background:${segment.color}"></span>
      <span class="analytics-legend-label">${escapeHtml(segment.label)}</span>
      <span class="analytics-legend-value">${segment.count}</span>
    </div>
  `,
    )
    .join("");

  bars.innerHTML = segments
    .map(
      (segment) => `
    <div class="demo-item">
      <span class="demo-label">${escapeHtml(segment.label)}</span>
      <div class="demo-track">
        <div class="demo-fill" style="width:${Math.max(segment.pct, 4)}%; background:${segment.color}"></div>
      </div>
      <span class="demo-pct">${Math.round(segment.pct)}%</span>
    </div>
  `,
    )
    .join("");
}

function renderMatchSuccessChart(metrics) {
  const chart = document.getElementById("matchSuccessChart");
  const labels = document.getElementById("matchSuccessLabels");
  const summary = document.getElementById("matchMetricsSub");
  const summaryRow = document.getElementById("matchMetricsSummary");

  const items = [
    { label: "Sent", value: metrics.sent || 0, tone: MATCH_METRIC_COLORS.Sent },
    { label: "Accepted", value: metrics.accepted || 0, tone: MATCH_METRIC_COLORS.Accepted },
    { label: "Rejected", value: metrics.rejected || 0, tone: MATCH_METRIC_COLORS.Rejected },
    { label: "Pending", value: metrics.pending || 0, tone: MATCH_METRIC_COLORS.Pending },
  ];

  const max = Math.max(...items.map((item) => item.value), 1);
  const total = metrics.total || 0;

  if (summary) {
    summary.textContent =
      total > 0
        ? `${total} total match records tracked in the database`
        : "No match records available yet";
  }

  if (summaryRow) {
    summaryRow.innerHTML = `
      <div class="analytics-metric-pill">
        <span class="analytics-metric-pill-label">Acceptance Rate</span>
        <span class="analytics-metric-pill-value">${metrics.acceptanceRate || 0}%</span>
      </div>
      <div class="analytics-metric-pill">
        <span class="analytics-metric-pill-label">Avg Compatibility</span>
        <span class="analytics-metric-pill-value">${metrics.averageCompatibility || 0}%</span>
      </div>
      <div class="analytics-metric-pill">
        <span class="analytics-metric-pill-label">High Compatibility</span>
        <span class="analytics-metric-pill-value">${metrics.highCompatibility || 0}</span>
      </div>
    `;
  }

  if (!chart || !labels) return;

  if (!total) {
    chart.innerHTML = `<div class="analytics-empty">No match records to chart yet.</div>`;
    labels.innerHTML = "";
    return;
  }

  chart.innerHTML = items
    .map(
      (item) => `
    <div class="bar-item">
      <div class="bar-val">${item.value}</div>
      <div class="bar-fill analytics-bar-${item.tone}" style="height:${Math.max(Math.round((item.value / max) * 100), item.value ? 8 : 0)}%"></div>
    </div>
  `,
    )
    .join("");

  labels.innerHTML = items
    .map(
      (item) => `
    <div class="bar-label">${escapeHtml(item.label)}</div>
  `,
    )
    .join("");
}

/* ─── Dynamic Profile Renderer ─────────────── */

function viewClient(index) {
  const c = clients[index];
  if (!c) return;

  // Update topbar subtitle
  pages.profile.sub = `${c.name} — ${capitalize(c.status)} client`;

  // Avatar
  const av = getAvatarStyle(index);
  const profileAvatar = document.querySelector(".profile-avatar");
  if (profileAvatar) {
    profileAvatar.textContent = initials(c.name);
    profileAvatar.style.background = av.bg;
    profileAvatar.style.color = av.color;
  }

  // Name & location
  const profileName = document.querySelector(".profile-name");
  if (profileName) profileName.textContent = c.name;

  const profileLoc = document.querySelector(".profile-loc");
  if (profileLoc) {
    profileLoc.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1C4.8 1 3 2.8 3 5C3 8 7 13 7 13C7 13 11 8 11 5C11 2.8 9.2 1 7 1Z" stroke="currentColor" stroke-width="1.2"/><circle cx="7" cy="5" r="1.5" stroke="currentColor" stroke-width="1.2"/></svg>
      ${c.city}
    `;
  }

  // Status badge — driven by customer status_tag
  const statusBadge = document.querySelector(".profile-status-badge");
  if (statusBadge) {
    const badgeClass = getJourneyBadgeClass(c.statusTag, c.status);
    statusBadge.textContent = c.statusTag || "New Lead";
    statusBadge.className = `profile-status-badge ${badgeClass}`;
  }

  // Personal info grid
  const infoGrids = document.querySelectorAll(".info-grid");
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
  const poolProfile = (window.maleProfiles || [])
    .concat(window.femaleProfiles || [])
    .find(
      (p) =>
        p.firstName === c.name.split(" ")[0] &&
        p.lastName === c.name.split(" ")[1],
    );

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
  const profileTags = document.querySelector(".profile-tags");
  if (profileTags && poolProfile) {
    profileTags.innerHTML = [
      poolProfile.religion,
      poolProfile.education,
      poolProfile.maritalStatus,
      poolProfile.languages[0],
    ]
      .map((t) => `<span class="tag">${t}</span>`)
      .join("");
  }

  renderProfileCompletion(c, poolProfile);
  renderCustomerJourney(c);

  // Update matches page sub-heading
  const matchesSub = document.querySelector("#page-matches .matches-header p");
  if (matchesSub)
    matchesSub.textContent = `AI-curated compatibility matches for ${c.name}`;
  currentMatchCustomerId = c.id;
  loadMatchSuggestions(c.id);
  loadMatchHistory(c.id);

  showPage("profile");
}

function viewClientById(clientId) {
  const index = clients.findIndex((c) => c.id === clientId);
  if (index >= 0) {
    viewClient(index);
    return;
  }
  loadCustomers().then(() => {
    const loadedIndex = clients.findIndex((c) => c.id === clientId);
    if (loadedIndex >= 0) viewClient(loadedIndex);
  });
}

function renderProfileCompletion(customer, poolProfile) {
  const completion = calculateProfileCompletion(customer, poolProfile);
  const value = document.getElementById("profileCompletionValue");
  const fill = document.getElementById("profileCompletionFill");
  const sections = document.getElementById("profileCompletionSections");

  if (value) value.textContent = `${completion.score}% Complete`;
  if (fill) fill.style.width = `${completion.score}%`;
  if (sections) {
    sections.innerHTML = completion.sections
      .map(
        (section) => `
      <span title="${escapeHtml(section.complete ? "Complete" : "Incomplete")}">${escapeHtml(section.label)}</span>
    `,
      )
      .join("");
  }
}

function calculateProfileCompletion(customer, poolProfile) {
  const profile = poolProfile || customer;
  const sections = [
    {
      label: "Basic Information",
      weight: 20,
      complete: hasValues(
        customer.name,
        customer.age,
        customer.city,
        customer.email,
        customer.gender,
      ),
    },
    {
      label: "Family Information",
      weight: 15,
      complete: hasValues(
        profile.religion,
        profile.caste,
        profile.maritalStatus || customer.maritalStatus,
      ),
    },
    {
      label: "Career",
      weight: 20,
      complete: hasValues(
        profile.education,
        profile.income,
        profile.company,
        profile.designation,
      ),
    },
    {
      label: "Preferences",
      weight: 27,
      complete: hasValues(
        profile.wantsKids,
        profile.openToRelocate,
        profile.openToPets,
      ),
    },
    {
      label: "Photos",
      weight: 20,
      complete: Boolean(profile.photo || profile.photoUrl || profile.avatarUrl),
    },
  ];

  const score = sections.reduce(
    (total, section) => total + (section.complete ? section.weight : 0),
    0,
  );
  return { score, sections };
}

function hasValues(...values) {
  return values.every(
    (value) =>
      value !== undefined && value !== null && String(value).trim() !== "",
  );
}

const CUSTOMER_JOURNEY_STAGES = [
  "New Lead",
  "Profile Review",
  "Active Search",
  "Matches Sent",
  "Meeting Scheduled",
  "Engagement In Progress",
  "Closed",
];

function getJourneyStageIndex(statusTag) {
  const index = CUSTOMER_JOURNEY_STAGES.indexOf(statusTag);
  if (index >= 0) return index;
  if (statusTag === "On Hold") {
    return CUSTOMER_JOURNEY_STAGES.indexOf("Active Search");
  }
  return 0;
}

function getJourneyBadgeClass(statusTag, uiStatus) {
  if (statusTag === "Closed" || statusTag === "On Hold") return "inactive-badge";
  if (statusTag === "Engagement In Progress") return "matched-badge";
  if (uiStatus === "active") return "active-badge";
  return "pending-badge";
}

function getJourneyStepState(index, currentIndex, isOnHold) {
  if (index < currentIndex) return "done";
  if (index > currentIndex) return "upcoming";
  return isOnHold ? "on-hold" : "current";
}

function refreshActiveProfileJourney(customerId) {
  const profilePage = document.getElementById("page-profile");
  if (!profilePage?.classList.contains("active")) return;
  const customer = (allCustomers.length ? allCustomers : clients).find(
    (c) => c.id === customerId,
  );
  if (customer) renderCustomerJourney(customer);
}

function renderCustomerJourney(customer) {
  const container = document.getElementById("customerJourneyTracker");
  const subtitle = document.getElementById("journeySubtitle");
  const pill = document.getElementById("journeyCurrentStatus");
  if (!container) return;

  const statusTag = customer.statusTag || "New Lead";
  const currentIndex = getJourneyStageIndex(statusTag);
  const isOnHold = statusTag === "On Hold";
  const totalStages = CUSTOMER_JOURNEY_STAGES.length;
  const progressPct =
    totalStages <= 1 ? 0 : (currentIndex / (totalStages - 1)) * 100;

  container.innerHTML = `
    <div class="journey-progress-rail" aria-hidden="true">
      <div class="journey-progress-fill" style="width:${progressPct}%"></div>
    </div>
    <div class="journey-steps" role="list" aria-label="Customer journey progress">
      ${CUSTOMER_JOURNEY_STAGES.map((stage, index) => {
        const state = getJourneyStepState(index, currentIndex, isOnHold);
        const isCurrent = state === "current" || state === "on-hold";
        return `
        <div class="journey-step journey-step--${state}" role="listitem" ${isCurrent ? 'aria-current="step"' : ""}>
          <div class="journey-marker-wrap">
            <div class="journey-marker ${isCurrent ? "pulse" : ""}"></div>
          </div>
          <span class="journey-label">${escapeHtml(stage)}</span>
          ${isCurrent ? `<span class="journey-step-badge">${isOnHold ? "On Hold" : "Current"}</span>` : ""}
        </div>
      `;
      }).join("")}
    </div>
  `;

  if (pill) {
    pill.textContent = statusTag;
    pill.className = `journey-current-pill journey-pill--${getJourneyBadgeClass(statusTag, customer.status).replace("-badge", "")}`;
  }

  if (subtitle) {
    if (isOnHold) {
      subtitle.textContent =
        "This profile is paused. Reactivate to continue from Active Search.";
    } else if (statusTag === "Closed") {
      subtitle.textContent = "Journey complete. Profile archived as Closed.";
    } else {
      subtitle.textContent = `Stage ${currentIndex + 1} of ${totalStages} · Last updated ${customer.updated || "recently"}`;
    }
  }
}

/* ─── KPI Counter Animation ─────────────────── */
function animateCounters() {
  document.querySelectorAll(".kpi-value[data-target]").forEach((el) => {
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
const addNoteBtn = document.getElementById("addNoteBtn");
const noteCompose = document.getElementById("noteCompose");
const cancelNote = document.getElementById("cancelNote");
const saveNote = document.getElementById("saveNote");
const noteText = document.getElementById("noteText");
const noteType = document.getElementById("noteType");
const notesTimeline = document.getElementById("notesTimeline");

addNoteBtn &&
  addNoteBtn.addEventListener("click", () => {
    noteCompose.style.display = "block";
    noteText.focus();
  });

cancelNote &&
  cancelNote.addEventListener("click", () => {
    noteCompose.style.display = "none";
    noteText.value = "";
  });

saveNote &&
  saveNote.addEventListener("click", () => {
    const text = noteText.value.trim();
    if (!text) return;
    const type = noteType ? noteType.value : "session";
    const today = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const newNote = {
      type,
      date: today,
      text,
      author: window._currentUserName || "Matchmaker",
    };
    notes.unshift(newNote);
    renderNotesTimeline();
    noteCompose.style.display = "none";
    noteText.value = "";
    newNote.author = window._currentUserName || newNote.author;
  });

/* ─── Directory Filters ─────────────────────── */
function getDirectoryFilters() {
  return {
    status: activeStatusFilter,
    gender: document.getElementById("genderFilter")?.value || "",
    city: document.getElementById("cityFilter")?.value || "",
    religion: document.getElementById("religionFilter")?.value || "",
    marital_status: document.getElementById("maritalFilter")?.value || "",
    sort_age: document.getElementById("ageSort")?.value || "",
  };
}

function customerApiUrl(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const query = params.toString();
  return query ? `/api/customers/?${query}` : "/api/customers/";
}

function populateFilterSelect(selectId, values) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const firstOption = select.options[0];
  const selectedValue = select.value;
  select.innerHTML = "";
  select.appendChild(firstOption);
  values.forEach((value) => {
    if (!value) return;
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  select.value = values.includes(selectedValue) ? selectedValue : "";
}

function populateDirectoryFilters(data) {
  const uniqueSorted = (key) =>
    [...new Set(data.map((c) => c[key]).filter(Boolean))].sort();
  populateFilterSelect("genderFilter", uniqueSorted("gender"));
  populateFilterSelect("cityFilter", uniqueSorted("city"));
  populateFilterSelect("religionFilter", uniqueSorted("religion"));
  populateFilterSelect("maritalFilter", uniqueSorted("maritalStatus"));
}

function applyCustomerData(data) {
  clients = data;
  window.maleProfiles = clients.filter((c) => c.gender === "Male");
  window.femaleProfiles = clients.filter((c) => c.gender === "Female");
  renderClientTable("clientTableBody");
  renderClientTable("clientTableBody2");
  renderMeetingCustomerOptions();
  updateDashboardMetrics();
  renderWorkspace();
  if (document.getElementById("page-analytics")?.classList.contains("active")) {
    loadAnalytics();
  }
}

function loadCustomers(filters = {}) {
  return fetch(customerApiUrl(filters))
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Customer API request failed with ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      applyCustomerData(data);
      return data;
    })
    .catch((err) => {
      console.error("Error fetching customer database:", err);
      applyCustomerData([]);
      return [];
    });
}

function initDirectoryFilters() {
  populateDirectoryFilters(allCustomers);

  document.querySelectorAll(".filter-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      tab
        .closest(".filter-tabs")
        .querySelectorAll(".filter-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeStatusFilter = tab.dataset.status || "";
      loadCustomers(getDirectoryFilters());
    });
  });

  [
    "genderFilter",
    "cityFilter",
    "religionFilter",
    "maritalFilter",
    "ageSort",
  ].forEach((id) => {
    const control = document.getElementById(id);
    control &&
      control.addEventListener("change", () => {
        loadCustomers(getDirectoryFilters());
      });
  });
}

/* ─── Search ────────────────────────────────── */
const searchInput = document.getElementById("searchInput");
searchInput &&
  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    document
      .querySelectorAll("#clientTableBody tr, #clientTableBody2 tr")
      .forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(q)
          ? ""
          : "none";
      });
  });

/* ─── Entrance Animations ───────────────────── */
function observeAnimations() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add("in-view"), idx * 80);
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );
  document.querySelectorAll("[data-animate]").forEach((el) => io.observe(el));
}

/* ─── Init ──────────────────────────────────── */
function init() {
  initForms();
  Promise.all([loadCustomers(), loadMeetings()]).then(([data]) => {
    allCustomers = data;
    initDirectoryFilters();
    renderWorkspace();

    // Initial Render calls
    if (clients[0]) {
      currentMatchCustomerId = clients[0].id;
      loadMatchSuggestions(currentMatchCustomerId);
    } else {
      renderMatchSuggestions();
    }
    renderNotesTimeline();
    observeAnimations();
    setTimeout(animateCounters, 300);
    initAuth();
    initNotifications();
  });
}

document.addEventListener("DOMContentLoaded", init);

/* ─── Utility ───────────────────────────────── */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadAllCustomers() {
  return fetch("/api/customers/")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Customer API request failed with ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      allCustomers = data;
      populateDirectoryFilters(allCustomers);
      return data;
    });
}

function loadMeetings() {
  return fetch("/api/meetings/")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Meeting API request failed with ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      meetings = data;
      renderMeetingsList();
      renderMeetingsFull();
      updateDashboardMetrics();
      renderWorkspace();
      return data;
    })
    .catch((err) => {
      console.error("Error fetching meetings:", err);
      meetings = [];
      renderMeetingsList();
      renderMeetingsFull();
      updateDashboardMetrics();
      renderWorkspace();
      return [];
    });
}

function updateDashboardMetrics() {
  const source = allCustomers.length ? allCustomers : clients;
  const scheduledMeetings = meetings.filter(
    (m) => m.status === "scheduled",
  ).length;
  const pendingReviews = source.filter((c) => c.status === "pending").length;

  setCounterValue("Total Clients", source.length);
  setCounterValue("Meetings Scheduled", scheduledMeetings);
  setCounterValue("Pending Reviews", pendingReviews);

  const clientsBadge = document.querySelector(
    '.nav-item[data-page="clients"] .nav-badge',
  );
  if (clientsBadge) clientsBadge.textContent = source.length;
}

function setCounterValue(label, value) {
  const cards = document.querySelectorAll(".kpi-card");
  cards.forEach((card) => {
    const labelEl = card.querySelector(".kpi-label");
    const valueEl = card.querySelector(".kpi-value");
    if (labelEl?.textContent.trim() === label && valueEl) {
      valueEl.dataset.target = value;
      valueEl.textContent = value;
    }
  });
}

function renderMeetingCustomerOptions() {
  const selects = [
    document.getElementById("meetingCustomerSelect"),
    document.getElementById("meetingCandidateSelect"),
  ];
  if (selects.every((select) => !select)) return;

  const options = (allCustomers.length ? allCustomers : clients)
    .map(
      (c) =>
        `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)} · ${escapeHtml(c.city || "")}</option>`,
    )
    .join("");

  selects.forEach((select) => {
    if (!select) return;
    const selected = select.value;
    const first =
      select.querySelector("option")?.outerHTML ||
      '<option value="">Select client</option>';
    select.innerHTML = first + options;
    select.value = [...select.options].some(
      (option) => option.value === selected,
    )
      ? selected
      : "";
  });
}

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(`${name}=`)) {
      return decodeURIComponent(trimmed.slice(name.length + 1));
    }
  }
  return "";
}

function formDataToPayload(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function setFormMessage(id, text, type = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = `form-message ${type}`.trim();
}

function postJson(url, payload) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: JSON.stringify(payload),
  }).then(async (response) => {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `Request failed with ${response.status}`);
    }
    return data;
  });
}

function initForms() {
  const addClientForm = document.getElementById("addClientForm");
  addClientForm &&
    addClientForm.addEventListener("submit", (event) => {
      event.preventDefault();
      setFormMessage("addClientMessage", "Creating client...");

      postJson("/api/customers/", formDataToPayload(addClientForm))
        .then((customer) => {
          setFormMessage(
            "addClientMessage",
            `${customer.name} has been added to the roster.`,
            "success",
          );
          addClientForm.reset();
          addNotification("client", `New client created: ${customer.name}.`);
          return loadAllCustomers()
            .then(() => loadCustomers(getDirectoryFilters()))
            .then(() => {
              const newIndex = clients.findIndex((c) => c.id === customer.id);
              if (newIndex >= 0) {
                viewClient(newIndex);
              } else {
                showPage("clients");
              }
            });
        })
        .catch((err) =>
          setFormMessage("addClientMessage", err.message, "error"),
        );
    });

  const scheduleMeetingForm = document.getElementById("scheduleMeetingForm");
  scheduleMeetingForm &&
    scheduleMeetingForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const payload = formDataToPayload(scheduleMeetingForm);
      if (payload.customerId === payload.candidateId) {
        setFormMessage(
          "scheduleMeetingMessage",
          "Choose two different clients for a meeting.",
          "error",
        );
        return;
      }

      setFormMessage("scheduleMeetingMessage", "Scheduling meeting...");
      postJson("/api/meetings/", payload)
        .then((meeting) => {
          setFormMessage(
            "scheduleMeetingMessage",
            "Meeting scheduled and dashboard updated.",
            "success",
          );
          scheduleMeetingForm.reset();
          addNotification(
            "meeting",
            `Meeting scheduled: ${meeting.names} at ${meeting.time}.`,
          );
          return Promise.all([loadMeetings(), loadAllCustomers()])
            .then(() => loadCustomers(getDirectoryFilters()))
            .then(() => showPage("meetings"));
        })
        .catch((err) =>
          setFormMessage("scheduleMeetingMessage", err.message, "error"),
        );
    });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* ─── Generate Introduction Feature ─────────── */

const INTRO_STORE_KEY = "soulsync_intro_messages";

function getIntroStore() {
  try {
    return JSON.parse(localStorage.getItem(INTRO_STORE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveIntroToStore(matchKey, entry) {
  const store = getIntroStore();
  if (!store[matchKey]) store[matchKey] = [];
  store[matchKey].unshift(entry);
  store[matchKey] = store[matchKey].slice(0, 10);
  localStorage.setItem(INTRO_STORE_KEY, JSON.stringify(store));
}

function getIntrosForMatch(matchKey) {
  return getIntroStore()[matchKey] || [];
}

let _introModalMatchKey = "";
let _introModalMatchName = "";
let _introModalMessage = "";

function buildMatchKey(customerId, candidateId) {
  return `${customerId}_${candidateId}`;
}

function openIntroModal(
  customerId,
  matchId,
  matchName,
  compat,
) {
  _introModalMatchKey = buildMatchKey(customerId, matchId);
  _introModalMatchName = matchName;
  _introModalMessage = "";

  const backdrop = document.getElementById("introModalBackdrop");
  const sub = document.getElementById("introModalSub");
  const compatRow = document.getElementById("introCompatRow");
  const loading = document.getElementById("introLoading");
  const msgBox = document.getElementById("introMessageBox");
  const footer = document.getElementById("introModalFooter");
  const savedBadge = document.getElementById("introSavedBadge");
  const copyBtn = document.getElementById("introCopyBtn");

  const match = matchSuggestions.find((m) => m.id === matchId);
  const score = match ? getMatchScore(match) : Number(compat);
  const tier = getMatchTier(score);
  sub.textContent = `For ${matchName} · ${score}% compatibility · ${tier.label}`;
  msgBox.classList.remove("visible");
  msgBox.textContent = "";
  footer.style.display = "none";
  savedBadge.style.display = "none";
  if (copyBtn) {
    copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" stroke-width="1.5"/></svg> Copy to Clipboard`;
    copyBtn.classList.remove("copied");
  }

  if (match) {
    const topReasons = getTopCompatibilityReasons(match, 4);
    compatRow.innerHTML = `
      <span class="intro-compat-chip intro-compat-tier intro-compat-tier--${tier.slug}">${escapeHtml(tier.label)}</span>
      ${topReasons.map((reason) => `<span class="intro-compat-chip">${escapeHtml(reason)}</span>`).join("")}
    `;
  } else {
    compatRow.innerHTML = `<span class="intro-compat-chip intro-compat-tier intro-compat-tier--${tier.slug}">${escapeHtml(tier.label)}</span>`;
  }

  backdrop.classList.add("open");
  document.body.style.overflow = "hidden";

  renderIntroHistory();
  generateIntroMessage(
    customerId,
    matchId,
    matchName,
    compat,
  );
}

function closeIntroModal() {
  document.getElementById("introModalBackdrop").classList.remove("open");
  document.body.style.overflow = "";
}

async function generateIntroMessage(
  customerId,
  matchId,
  matchName,
  compat,
) {
  const loading = document.getElementById("introLoading");
  const msgBox = document.getElementById("introMessageBox");
  const footer = document.getElementById("introModalFooter");

  loading.style.display = "flex";
  msgBox.classList.remove("visible");
  footer.style.display = "none";

  const customerName =
    (allCustomers.length ? allCustomers : clients).find(
      (c) => c.id === customerId,
    )?.name || "Our client";

  // Get match data from matchSuggestions
  const match = matchSuggestions.find((m) => m.id === matchId);
  const score = match ? getMatchScore(match) : Number(compat);
  const introduction = match
    ? getMatchIntroduction(match)
    : buildMatchIntroductionFallback({
        name: matchName,
        compat: score,
        profile: {},
        facts: [],
      });
  const reasons = match?.explanation || [];

  await new Promise((resolve) => setTimeout(resolve, 450));

  const text = `Dear ${customerName},

${introduction}

${reasons.length ? `Key compatibility highlights:\n${reasons.slice(0, 3).map((reason) => `• ${reason}`).join("\n")}\n\n` : ""}We would be glad to arrange an introductory conversation at your convenience.

Warm regards,
SoulSync AI`;

  loading.style.display = "none";
  msgBox.textContent = text;
  msgBox.classList.add("visible");
  footer.style.display = "flex";
  _introModalMessage = text;

  const entry = {
    message: text,
    compat: score,
    matchName,
    date: new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    time: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  saveIntroToStore(_introModalMatchKey, entry);

  const savedBadge = document.getElementById("introSavedBadge");
  if (savedBadge) {
    savedBadge.style.display = "flex";
    setTimeout(() => {
      savedBadge.style.display = "none";
    }, 3000);
  }
  renderIntroHistory();
}

function renderIntroHistory() {
  const section = document.getElementById("introHistorySection");
  const list = document.getElementById("introHistoryList");
  if (!section || !list) return;

  const history = getIntrosForMatch(_introModalMatchKey);
  if (history.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  list.innerHTML = history
    .map(
      (h) => `
    <div class="intro-history-item">
      ${escapeHtml(h.message.slice(0, 200))}${h.message.length > 200 ? "…" : ""}
      <div class="intro-history-meta">${escapeHtml(h.date)} at ${escapeHtml(h.time || "")}</div>
    </div>
  `,
    )
    .join("");
}

// Delegated click handler for Generate Introduction buttons
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".gen-intro-btn");
  if (!btn) return;

  const customerId = btn.dataset.customerId;
  const matchId = btn.dataset.matchId;
  const matchName = btn.dataset.matchName;
  const compat = Number(btn.dataset.compat);

  openIntroModal(customerId, matchId, matchName, compat);
});

function initIntroModalEvents() {
  const backdrop = document.getElementById("introModalBackdrop");
  const modal = document.getElementById("introModal");
  const closeBtn = document.getElementById("introModalClose");
  const copyBtn = document.getElementById("introCopyBtn");
  const regenBtn = document.getElementById("introRegenerateBtn");

  closeBtn && closeBtn.addEventListener("click", closeIntroModal);

  backdrop &&
    backdrop.addEventListener("click", (e) => {
      if (!modal.contains(e.target)) closeIntroModal();
    });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && backdrop?.classList.contains("open"))
      closeIntroModal();
  });

  copyBtn &&
    copyBtn.addEventListener("click", () => {
      if (!_introModalMessage) return;
      navigator.clipboard.writeText(_introModalMessage).then(() => {
        copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7.5L5 10.5L12 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg> Copied!`;
        copyBtn.classList.add("copied");
        setTimeout(() => {
          copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" stroke-width="1.5"/></svg> Copy to Clipboard`;
          copyBtn.classList.remove("copied");
        }, 2500);
      });
    });

  regenBtn &&
    regenBtn.addEventListener("click", () => {
      if (!_introModalMatchKey) return;
      const [customerId, matchId] = _introModalMatchKey.split("_");
      const match = matchSuggestions.find((m) => m.id === matchId);
      if (match)
        generateIntroMessage(
          customerId,
          matchId,
          match.name,
          match.compat,
        );
    });
}



document.addEventListener("DOMContentLoaded", initIntroModalEvents);

// function generateIntroduction(customer, candidate, score) {

//     const modal = document.getElementById("introModalBackdrop");
//     const messageBox = document.getElementById("introMessageBox");
//     const footer = document.getElementById("introModalFooter");

//     const message = `
// Hi ${customer.name},

// Based on our compatibility analysis, we believe ${candidate.name}
// may be an excellent match for you.

// Compatibility Score: ${score}%

// Key strengths:
// • Similar values and lifestyle preferences
// • Compatible long-term relationship goals
// • Strong communication potential

// We recommend beginning with an introductory conversation.

// Best Regards,
// SoulSync AI
// `;

//     messageBox.textContent = message;

//     footer.style.display = "flex";
//     modal.classList.add("show");
// }

// const closeBtn = document.getElementById("introModalClose");
// const backdrop = document.getElementById("introModalBackdrop");

// closeBtn.addEventListener("click", () => {
//     backdrop.classList.remove("show");
// });

function generateIntroduction() {
  console.log("BUTTON CLICKED");
}

/* ═══════════════════════════════════════════════
   SEND MATCH WORKFLOW
   ═══════════════════════════════════════════════ */

/* ─── Toast System ───────────────────────────── */
(function initToastContainer() {
  if (document.getElementById('toastContainer')) return;
  const el = document.createElement('div');
  el.id = 'toastContainer';
  el.className = 'toast-container';
  document.body.appendChild(el);
})();

function showToast({ type = 'info', title, message, duration = 4000 }) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const iconMap = {
    success: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6 11.5L13 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    error:   `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
    info:    `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5"/><path d="M8 7V11M8 5.5V5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${iconMap[type] || iconMap.info}</div>
    <div class="toast-body">
      <div class="toast-title">${escapeHtml(title)}</div>
      ${message ? `<div class="toast-message">${escapeHtml(message)}</div>` : ''}
    </div>
    <button class="toast-close" aria-label="Dismiss">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    </button>
  `;

  container.appendChild(toast);

  const dismiss = () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 320);
  };

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  setTimeout(dismiss, duration);
}

/* ─── Send Match Modal State ─────────────────── */
let _smCustomerId  = '';
let _smCandidateId = '';
let _smMatchName   = '';
let _smCompat      = 0;
let _smMatchData   = null;

function openSendMatchModal(customerId, candidateId, matchName, compat, matchData) {
  _smCustomerId  = customerId;
  _smCandidateId = candidateId;
  _smMatchName   = matchName;
  _smCompat      = compat;
  _smMatchData   = matchData || null;

  const backdrop = document.getElementById('sendMatchModalBackdrop');
  if (!backdrop) return;

  /* ── Populate candidate info ── */
  const nameEl   = document.getElementById('smCandidateName');
  const metaEl   = document.getElementById('smCandidateMeta');
  const avatarEl = document.getElementById('smCandidateAvatar');
  const compatEl = document.getElementById('smCompatScore');
  const pillsEl  = document.getElementById('smInfoPills');
  const subtitleEl = document.getElementById('smModalSub');

  const clientName = (allCustomers.length ? allCustomers : clients)
    .find(c => c.id === customerId)?.name || 'Your client';

  if (subtitleEl) subtitleEl.textContent = `Sending to ${escapeHtml(clientName)} · ${compat}% compatibility`;

  // Avatar
  const av = getAvatarStyle(Math.floor(Math.random() * 6));
  if (avatarEl) {
    avatarEl.style.background = av.bg;
    avatarEl.style.color = av.color;
    avatarEl.textContent = initials(matchName);
  }

  if (nameEl) nameEl.textContent = matchName;

  // Meta from matchData facts
  const age      = matchData?.sub?.split(' ')[0] || '—';
  const city     = matchData?.sub?.split('· ')[1] || '—';
  const profession = (matchData?.facts || []).find(f => f[0] === 'Occupation')?.[1] || '—';

  if (metaEl) {
    metaEl.innerHTML = `
      <span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="4.5" r="2" stroke="currentColor" stroke-width="1.2"/><path d="M2 11C2 8.8 3.8 7 6 7C8.2 7 10 8.8 10 11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        ${escapeHtml(age)} yrs
      </span>
      <span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 1C4.3 1 3 2.3 3 4C3 6.5 6 11 6 11C6 11 9 6.5 9 4C9 2.3 7.7 1 6 1Z" stroke="currentColor" stroke-width="1.2"/></svg>
        ${escapeHtml(city)}
      </span>
      <span>
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M4 2V4M8 2V4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
        ${escapeHtml(profession)}
      </span>
    `;
  }

  if (compatEl) compatEl.textContent = `${compat}%`;

  // Info pills
  if (pillsEl && matchData?.facts) {
    pillsEl.innerHTML = matchData.facts.map(([label, val]) => `
      <div class="send-match-pill">
        <span class="send-match-pill-label">${escapeHtml(label)}</span>
        ${escapeHtml(val)}
      </div>
    `).join('');
  }

  // Reset confirm button
  const confirmBtn = document.getElementById('smConfirmBtn');
  if (confirmBtn) {
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('loading');
    confirmBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 2.5L13.5 7L9 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 7H13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      Confirm & Send Match
    `;
  }

  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSendMatchModal() {
  const backdrop = document.getElementById('sendMatchModalBackdrop');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

async function confirmSendMatch() {
  const confirmBtn = document.getElementById('smConfirmBtn');
  if (!confirmBtn || confirmBtn.disabled) return;

  // Loading state
  confirmBtn.disabled = true;
  confirmBtn.classList.add('loading');
  confirmBtn.innerHTML = `<div class="btn-spinner"></div> Sending…`;

  try {
    const currentUser = getUser() || {};
    const response = await fetch(`/api/customers/${encodeURIComponent(_smCustomerId)}/send-match/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify({
        candidateId: _smCandidateId,
        compatibilityScore: _smCompat,
        matchmakerName: currentUser.name || window._currentUserName || '',
        matchmakerEmail: currentUser.email || '',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Request failed (${response.status})`);
    }

    const data = await response.json();

    closeSendMatchModal();

    // ── Update the send button in the match card ──
    const matchCards = document.querySelectorAll('.match-card');
    matchCards.forEach(card => {
      const genBtn = card.querySelector('.gen-intro-btn');
      const sendBtn = card.querySelector('.send-match-btn');
      if (genBtn && genBtn.dataset.matchId === _smCandidateId) {
        if (sendBtn) {
          sendBtn.textContent = '✓ Match Sent';
          sendBtn.classList.add('sent-confirmed');
          sendBtn.disabled = true;
        }
      }
    });

    // ── Show success toast ──
    showToast({
      type: 'success',
      title: 'Match Sent!',
      message: `${_smMatchName} has been sent as a match introduction. Status updated to "Matches Sent".`,
      duration: 5000,
    });

    // ── Add notification ──
    addNotification('match', `Match sent: ${_smMatchName} introduced to ${(allCustomers.length ? allCustomers : clients).find(c => c.id === _smCustomerId)?.name || 'client'}.`);

    // ── Reload customers to reflect status change ──
    await Promise.all([loadAllCustomers(), loadCustomers(getDirectoryFilters())]);

    sentMatchCandidateIds.add(_smCandidateId);
    renderMatchSuggestions();

    // ── Refresh match history on customer detail page ──
    const profilePage = document.getElementById('page-profile');
    if (profilePage && profilePage.classList.contains('active')) {
      loadMatchHistory(_smCustomerId);
      refreshActiveProfileJourney(_smCustomerId);
    }

  } catch (err) {
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('loading');
    confirmBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M9 2.5L13.5 7L9 11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 7H13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      Confirm & Send Match
    `;
    showToast({ type: 'error', title: 'Send Failed', message: err.message });
  }
}

/* ─── Match History (on Profile page) ─────────── */
async function loadMatchHistory(customerId) {
  if (!customerId) return [];
  try {
    const response = await fetch(`/api/customers/${encodeURIComponent(customerId)}/match-history/`);
    if (!response.ok) return [];
    const history = await response.json();
    sentMatchCandidateIds = new Set(history.map((m) => m.candidateId));
    renderMatchHistory(history);
    return history;
  } catch (err) {
    console.error('Error loading match history:', err);
    return [];
  }
}

function renderMatchHistory(history) {
  const container = document.getElementById('matchHistoryList');
  const countEl   = document.getElementById('matchHistoryCount');
  if (!container) return;

  if (countEl) countEl.textContent = history.length ? `(${history.length})` : '';

  if (history.length === 0) {
    container.innerHTML = `<div class="match-history-empty">No matches sent yet. Use the Match Suggestions page to send introductions.</div>`;
    return;
  }

  container.innerHTML = history.map((m, i) => {
    const av = getAvatarStyle(i);
    const statusClass = {
      Sent:     'mh-status-sent',
      Accepted: 'mh-status-accepted',
      Rejected: 'mh-status-rejected',
      Pending:  'mh-status-pending',
    }[m.status] || 'mh-status-sent';
    const dateSent = m.sentAt || m.createdAt;

    return `
      <div class="match-history-item">
        <div class="match-history-avatar" style="background:${av.bg};color:${av.color}">${initials(m.candidateName)}</div>
        <div class="match-history-info">
          <div class="match-history-name">${escapeHtml(m.candidateName)}</div>
          <div class="match-history-meta">
            Sent ${escapeHtml(dateSent)} · by ${escapeHtml(m.sentBy || '—')}
            <span class="match-history-meta-sep">·</span>
            ${escapeHtml(m.candidateAge)} yrs · ${escapeHtml(m.candidateCity)}
          </div>
        </div>
        <div class="match-history-score">${m.compatibilityScore}%<span> match</span></div>
        <div class="match-history-status"><span class="mh-status-badge ${statusClass}">${escapeHtml(m.status)}</span></div>
      </div>
    `;
  }).join('');
}

/* ─── Wire up modal events ───────────────────── */
function initSendMatchModal() {
  // Delegated click for send-match-btn on match cards
  document.addEventListener('click', e => {
    const btn = e.target.closest('.send-match-btn');
    if (!btn || btn.classList.contains('sent-confirmed') || btn.disabled) return;

    // Find the match data from the card
    const card = btn.closest('.match-card');
    if (!card) return;
    const genBtn = card.querySelector('.gen-intro-btn');
    if (!genBtn) return;

    const candidateId = genBtn.dataset.matchId;
    const matchName   = genBtn.dataset.matchName;
    const compat      = Number(genBtn.dataset.compat);
    const customerId  = genBtn.dataset.customerId || currentMatchCustomerId;

    // Find full match data
    const matchData = matchSuggestions.find(m => m.id === candidateId) || null;

    openSendMatchModal(customerId, candidateId, matchName, compat, matchData);
  });

  // Close button
  const closeBtn = document.getElementById('smModalClose');
  closeBtn && closeBtn.addEventListener('click', closeSendMatchModal);

  // Backdrop click-outside
  const backdrop = document.getElementById('sendMatchModalBackdrop');
  const modal    = document.getElementById('sendMatchModal');
  backdrop && backdrop.addEventListener('click', e => {
    if (modal && !modal.contains(e.target)) closeSendMatchModal();
  });

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && backdrop?.classList.contains('open')) closeSendMatchModal();
  });

  // Confirm button
  const confirmBtn = document.getElementById('smConfirmBtn');
  confirmBtn && confirmBtn.addEventListener('click', confirmSendMatch);
}

document.addEventListener('DOMContentLoaded', initSendMatchModal);

