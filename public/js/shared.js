/**
 * Shared Campus Events Manager Frontend Utilities
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

    const res = await fetch(url, { ...options, headers });
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

/**
 * Toast Notifications (Replaces alert())
 */
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(container);
  }

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'success'} border-0 mb-2`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');

  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="bi bi-${type === 'error' ? 'exclamation-triangle-fill' : 'check-circle-fill'} me-2"></i>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
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

  navContainer.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center" href="index.html" data-testid="nav-brand">
          <i class="bi bi-calendar-event me-2"></i> Campus Events Manager
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navContent" aria-controls="navContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
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
                  <i class="bi bi-kanban me-1"></i> My Organized Events
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
                  <i class="bi bi-check2-circle me-1"></i> Event Approvals
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link ${activePage === 'admin-dashboard' ? 'active' : ''}" href="admin-dashboard.html" data-testid="nav-admin-dashboard">
                  <i class="bi bi-bar-chart-line me-1"></i> Analytics Dashboard
                </a>
              </li>
            ` : ''}
          </ul>

          <ul class="navbar-nav ms-auto align-items-center">
            ${token && user ? `
              <li class="nav-item me-2">
                <a class="nav-link position-relative ${activePage === 'notifications' ? 'active' : ''}" href="notifications.html" data-testid="nav-notifications">
                  <i class="bi bi-bell fs-5"></i>
                  ${unreadCount > 0 ? `
                    <span class="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" data-testid="unread-badge">
                      ${unreadCount}
                    </span>
                  ` : ''}
                </a>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-testid="user-dropdown">
                  <i class="bi bi-person-circle fs-5 me-1"></i>
                  <span id="nav-user-name">${user.name}</span>
                  <span class="badge bg-light text-dark ms-2">${user.role}</span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                  <li><a class="dropdown-item" href="profile.html" data-testid="nav-profile"><i class="bi bi-person me-2"></i>Profile</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><button class="dropdown-item text-danger" onclick="logout()" data-testid="nav-logout"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                </ul>
              </li>
            ` : `
              <li class="nav-item">
                <a class="btn btn-outline-light btn-sm me-2" href="login.html" data-testid="nav-login">Login</a>
              </li>
              <li class="nav-item">
                <a class="btn btn-warning btn-sm text-dark font-weight-bold" href="register.html" data-testid="nav-register">Register</a>
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
        <i class="bi bi-shield-x text-danger display-1 mb-3"></i>
        <h2 class="fw-bold">Access Forbidden</h2>
        <p class="text-muted">You do not have permission to access this page as a ${user.role}.</p>
        <a href="index.html" class="btn btn-primary mt-3">Return to Home</a>
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
