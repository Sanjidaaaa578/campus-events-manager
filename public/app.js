let currentUser = null;
let authToken = localStorage.getItem('token') || null;

document.addEventListener('DOMContentLoaded', () => {
  if (authToken) {
    fetchProfile();
  }
  loadEvents();
});

function switchAuthTab(tab) {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const tabs = document.querySelectorAll('.tab-btn');

  tabs.forEach(t => t.classList.remove('active'));

  if (tab === 'login') {
    tabs[0].classList.add('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    tabs[1].classList.add('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;
  const department = document.getElementById('register-dept').value;
  const msgBox = document.getElementById('auth-message');

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, department })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Registration failed');

    authToken = data.token;
    localStorage.setItem('token', authToken);
    currentUser = data.user;
    updateUserUI();

    msgBox.className = 'message-box success';
    msgBox.textContent = 'Registered successfully!';
  } catch (err) {
    msgBox.className = 'message-box error';
    msgBox.textContent = err.message;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const msgBox = document.getElementById('auth-message');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Login failed');

    authToken = data.token;
    localStorage.setItem('token', authToken);
    currentUser = data.user;
    updateUserUI();

    msgBox.className = 'message-box success';
    msgBox.textContent = 'Login successful!';
  } catch (err) {
    msgBox.className = 'message-box error';
    msgBox.textContent = err.message;
  }
}

async function fetchProfile() {
  try {
    const res = await fetch('/api/users/profile', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      updateUserUI();
    } else {
      logout();
    }
  } catch {
    logout();
  }
}

function updateUserUI() {
  const userDisplay = document.getElementById('user-display');
  const logoutBtn = document.getElementById('logout-btn');

  if (currentUser) {
    userDisplay.textContent = `Welcome, ${currentUser.name} (${currentUser.role})`;
    logoutBtn.style.display = 'inline-block';
  } else {
    userDisplay.textContent = 'Not logged in';
    logoutBtn.style.display = 'none';
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('token');
  updateUserUI();
}

async function loadEvents() {
  const search = document.getElementById('search-input').value;
  const sortBy = document.getElementById('sort-select').value;
  const list = document.getElementById('events-list');

  try {
    const query = new URLSearchParams({ keyword: search, sortBy: sortBy });
    const res = await fetch(`/api/events?${query.toString()}`);
    const data = await res.json();

    list.innerHTML = '';
    if (!data.events || data.events.length === 0) {
      list.innerHTML = '<p class="empty-notice">No upcoming campus events found.</p>';
      return;
    }

    data.events.forEach(evt => {
      const item = document.createElement('div');
      item.className = 'event-item';
      item.innerHTML = `
        <h3>${evt.title}</h3>
        <p><strong>Category:</strong> ${evt.category} | <strong>Venue:</strong> ${evt.venue}</p>
        <p><strong>Date & Time:</strong> ${evt.date} at ${evt.time}</p>
        <p><strong>Capacity:</strong> ${evt.capacity}</p>
        <button class="btn-register" onclick="registerForEvent(${evt.id})">Register</button>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    list.innerHTML = '<p class="empty-notice">Failed to load events.</p>';
  }
}

function filterEvents() {
  loadEvents();
}

async function registerForEvent(eventId) {
  const msgBox = document.getElementById('action-message');
  if (!authToken) {
    msgBox.className = 'message-box error';
    msgBox.textContent = 'Please log in to register for events.';
    return;
  }

  try {
    const res = await fetch(`/api/events/${eventId}/register`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.message || 'Registration failed');

    msgBox.className = 'message-box success';
    msgBox.textContent = data.message;
  } catch (err) {
    msgBox.className = 'message-box error';
    msgBox.textContent = err.message;
  }
}
