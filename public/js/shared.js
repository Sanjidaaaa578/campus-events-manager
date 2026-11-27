/**
 * Shared Campus Events Manager Frontend Utilities & Navigation
 */
const API = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  getUser: () => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),

  // Fetch wrapper with automatic auth header and JSON decoding
  async fetch(url, options = {}) {
    const headers = options.headers || {};
    const token = API.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions = {
      ...options,
      headers,
      cache: options.cache || 'no-store'
    };

    const res = await fetch(url, fetchOptions);
    let data;
    try {
      data = await res.json();
    } catch {
      data = { message: 'Unexpected response from server' };
    }

    if (!res.ok) {
      const error = new Error(data.message || `Request failed with status ${res.status}`);
      error.status = res.status;
      error.data = data;
      throw error;
    }
    return data;
  }
};

// Global compatibility wrappers
window.API = API;
window.isAuthenticated = () => !!API.getToken();
window.apiRequest = (url, options) => API.fetch(url, options);
window.getCurrentUser = () => API.getUser();

/**
 * Formats a 24-hour time string (e.g. "14:00" or "09:30") into a 12-hour AM/PM format (e.g. "2:00 PM" or "9:30 AM").
 */
function formatTime(timeStr) {
  if (!timeStr) return '';
  const trimmed = String(timeStr).trim();
  if (/am|pm/i.test(trimmed)) return trimmed;
  const parts = trimmed.split(':');
  if (parts.length < 2) return trimmed;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2).padStart(2, '0');
  if (isNaN(hours)) return trimmed;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}
window.formatTime = formatTime;

/**
 * Toast Notifications (Replaces alert())
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container') || document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
  }

  const isError = type === 'error' || type === 'danger';
  const isWarning = type === 'warning';
  const toastBg = isError ? 'bg-danger text-white' : isWarning ? 'bg-warning text-dark' : 'bg-dark text-white';
  const icon = isError ? 'bi-exclamation-triangle-fill text-danger' : isWarning ? 'bi-exclamation-circle-fill text-warning' : 'bi-check-circle-fill text-success';

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center ${toastBg} border-0 mb-2 shadow-lg`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex p-2 align-items-center">
      <div class="toast-body d-flex align-items-center py-1">
        <i class="bi ${icon} fs-5 me-2"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close ${isWarning ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toastEl);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
  bsToast.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

/**
 * Render Navbar with dynamic role-based links and unread notification counter
 */
async function renderNavbar(activePage = '') {
  const navContainer = document.getElementById('navbar-container');
  if (!navContainer) return;

  const user = API.getUser();
  const token = API.getToken();

  let unreadCount = 0;
  if (token) {
    try {
      const notifData = await API.fetch('/api/notifications');
      if (notifData.notifications) {
        unreadCount = notifData.notifications.filter(n => !n.is_read).length;
      }
    } catch {}
  }

  const role = user ? user.role : null;
  const initial = user && user.name ? user.name.charAt(0).toUpperCase() : 'U';

  const roleBadgeClass = role === 'Admin' ? 'bg-warning text-dark' : role === 'Organizer' ? 'bg-info text-dark' : 'bg-primary text-white';

  navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark navbar-custom">
      <div class="container">
        <a class="navbar-brand" href="index.html" data-testid="nav-brand">
          <span class="brand-icon-box">
            <i class="bi bi-calendar2-week-fill"></i>
          </span>
          <span>Campus Events</span>
          <span class="badge bg-white bg-opacity-10 text-white-50 ms-2 fw-semibold" style="font-size: 0.72rem; letter-spacing: 0.05em;">PORTAL</span>
        </a>
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navContent" aria-controls="navContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li class="nav-item">
              <a class="nav-link ${activePage === 'events' ? 'active' : ''}" href="events.html" data-testid="nav-events">
                <i class="bi bi-compass me-1"></i> Browse Events
              </a>
            </li>

            ${role === 'Student' ? `
              <li class="nav-item">
                <a class="nav-link ${activePage === 'my-registrations' ? 'active' : ''}" href="my-registrations.html" data-testid="nav-my-registrations">
                  <i class="bi bi-ticket-perforated me-1"></i> My Registrations
                </a>
              </li>
            ` : ''}

            ${role === 'Organizer' ? `
              <li class="nav-item">
                <a class="nav-link ${activePage === 'my-events' ? 'active' : ''}" href="my-events.html" data-testid="nav-my-events">
                  <i class="bi bi-kanban me-1"></i> My Events
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${activePage === 'create-event' ? 'active' : ''}" href="create-event.html" data-testid="nav-create-event">
                  <i class="bi bi-plus-circle me-1"></i> Create Event
                </a>
              </li>
            ` : ''}

            ${role === 'Admin' ? `
              <li class="nav-item">
                <a class="nav-link ${activePage === 'admin-approvals' ? 'active' : ''}" href="admin-approvals.html" data-testid="nav-admin-approvals">
                  <i class="bi bi-check2-circle me-1"></i> Approvals
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}" href="admin-dashboard.html" data-testid="nav-admin-dashboard">
                  <i class="bi bi-bar-chart-line me-1"></i> Analytics
                </a>
              </li>
            ` : ''}
          </ul>

          <ul class="navbar-nav ms-auto align-items-center gap-2">
            ${token && user ? `
              <li class="nav-item me-1">
                <a class="nav-link position-relative px-2 py-1 ${activePage === 'notifications' ? 'active' : ''}" href="notifications.html" data-testid="nav-notifications" title="Notifications">
                  <i class="bi bi-bell fs-5"></i>
                  ${unreadCount > 0 ? `
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark" data-testid="unread-badge" style="font-size: 0.65rem;">
                      ${unreadCount}
                    </span>
                  ` : ''}
                </a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center pe-0" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-testid="user-dropdown">
                  <span class="user-avatar-pill">${initial}</span>
                  <span id="nav-user-name" class="fw-semibold text-white me-2">${user.name}</span>
                  <span class="badge ${roleBadgeClass} small px-2 py-1">${user.role}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                  <li class="px-3 py-2 border-bottom">
                    <div class="fw-bold text-dark">${user.name}</div>
                    <small class="text-muted">${user.email}</small>
                  </li>
                  <li><a class="dropdown-item mt-1" href="profile.html" data-testid="nav-profile"><i class="bi bi-person me-2 text-primary"></i>My Profile</a></li>
                  ${role === 'Student' ? `<li><a class="dropdown-item" href="my-registrations.html"><i class="bi bi-ticket-perforated me-2 text-primary"></i>My Registrations</a></li>` : ''}
                  ${role === 'Organizer' ? `<li><a class="dropdown-item" href="my-events.html"><i class="bi bi-kanban me-2 text-primary"></i>Manage Events</a></li>` : ''}
                  ${role === 'Admin' ? `<li><a class="dropdown-item" href="admin-dashboard.html"><i class="bi bi-speedometer2 me-2 text-primary"></i>Admin Panel</a></li>` : ''}
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item text-danger d-flex align-items-center" onclick="logout()" data-testid="nav-logout"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</button></li>
                </ul>
              </li>
            ` : `
              <li class="nav-item">
                <a class="btn btn-glass btn-sm px-3" href="login.html" data-testid="nav-login">
                  <i class="bi bi-box-arrow-in-right me-1"></i> Sign In
                </a>
              </li>
              <li class="nav-item">
                <a class="btn btn-primary btn-sm px-3" href="register.html" data-testid="nav-register">
                  <i class="bi bi-person-plus me-1"></i> Get Started
                </a>
              </li>
            `}
          </ul>
        </div>
      </div>
    </nav>
  `;
}

/**
 * Route & Role Protection Guard
 */
function protectRoute(allowedRoles = []) {
  const token = API.getToken();
  const user = API.getUser();

  if (!token || !user) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    return false;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    document.body.innerHTML = `
      <div id="navbar-container"></div>
      <div class="container text-center py-5">
        <div class="card p-5 border-0 shadow-sm mx-auto" style="max-width: 540px;">
          <i class="bi bi-shield-x text-danger display-1 mb-3"></i>
          <h2 class="fw-bold">Access Forbidden</h2>
          <p class="text-muted">You do not have permission to access this page as a <strong>${user.role}</strong>.</p>
          <a href="index.html" class="btn btn-primary mt-3">Return to Home</a>
        </div>
      </div>
    `;
    renderNavbar();
    return false;
  }
  return true;
}

function logout() {
  API.removeToken();
  API.removeUser();
  window.location.href = 'login.html';
}

/**
 * Helper to get Category Styling Details
 */
function getCategoryTheme(category) {
  const cat = (category || '').toLowerCase();
  switch (cat) {
    case 'technology':
    case 'tech':
      return {
        headerClass: 'event-card-header-tech',
        icon: 'bi-cpu-fill',
        accentColor: '#3b82f6',
        tagBg: 'rgba(59, 130, 246, 0.15)',
        tagText: '#1d4ed8'
      };
    case 'workshop':
      return {
        headerClass: 'event-card-header-workshop',
        icon: 'bi-tools',
        accentColor: '#8b5cf6',
        tagBg: 'rgba(139, 92, 246, 0.15)',
        tagText: '#6d28d9'
      };
    case 'sports':
      return {
        headerClass: 'event-card-header-sports',
        icon: 'bi-trophy-fill',
        accentColor: '#10b981',
        tagBg: 'rgba(16, 185, 129, 0.15)',
        tagText: '#047857'
      };
    case 'career':
      return {
        headerClass: 'event-card-header-career',
        icon: 'bi-briefcase-fill',
        accentColor: '#f59e0b',
        tagBg: 'rgba(245, 158, 11, 0.15)',
        tagText: '#b45309'
      };
    case 'academic':
      return {
        headerClass: 'event-card-header-academic',
        icon: 'bi-mortarboard-fill',
        accentColor: '#06b6d4',
        tagBg: 'rgba(6, 182, 212, 0.15)',
        tagText: '#0e7490'
      };
    case 'social':
      return {
        headerClass: 'event-card-header-social',
        icon: 'bi-people-fill',
        accentColor: '#ec4899',
        tagBg: 'rgba(236, 72, 153, 0.15)',
        tagText: '#be185d'
      };
    default:
      return {
        headerClass: 'event-card-header-default',
        icon: 'bi-calendar-event-fill',
        accentColor: '#4f46e5',
        tagBg: 'rgba(79, 70, 229, 0.15)',
        tagText: '#4338ca'
      };
  }
}

window.getCategoryTheme = getCategoryTheme;
