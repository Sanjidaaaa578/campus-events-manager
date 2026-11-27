let currentEvent = null;
let userRegistrationStatus = null; // 'Registered', 'Waitlisted', or null

document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('events');
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get('id');

  if (!eventId) {
    window.location.href = 'events.html';
    return;
  }

  await loadEventDetails(eventId);
});

async function loadEventDetails(eventId) {
  const loading = document.getElementById('details-loading');
  const content = document.getElementById('details-content');

  try {
    const data = await API.fetch(`/api/events/${eventId}`);
    currentEvent = data.event;

    // Check student's current registration status
    const token = API.getToken();
    const user = API.getUser();
    if (token && user && user.role === 'Student') {
      try {
        const myRegs = await API.fetch('/api/registrations/my-events');
        const match = myRegs.events.find(r => r.event_id === parseInt(eventId, 10));
        if (match) {
          userRegistrationStatus = match.registration_status;
        }
      } catch {}
    }

    renderEventView();
    loading.classList.add('d-none');
    content.classList.remove('d-none');
  } catch (err) {
    loading.innerHTML = `
      <div class="empty-state text-danger">
        <i class="bi bi-exclamation-octagon"></i>
        <h4 class="mt-3">Event Not Found</h4>
        <p class="text-muted">The requested event could not be retrieved.</p>
        <a href="events.html" class="btn btn-outline-primary mt-2">Back to Events</a>
      </div>
    `;
  }
}

function renderEventView() {
  document.getElementById('event-title').textContent = currentEvent.title;
  document.getElementById('event-description').textContent = currentEvent.description || 'No description provided.';
  document.getElementById('event-category-badge').textContent = currentEvent.category;
  document.getElementById('event-datetime').textContent = `${currentEvent.date} at ${currentEvent.time}`;
  document.getElementById('event-venue').textContent = currentEvent.venue;
  document.getElementById('event-organizer-name').textContent = currentEvent.organizer_name || 'Campus Faculty';
  document.getElementById('event-organizer-email').textContent = currentEvent.organizer_email || 'events@campus.edu';

  const statusBadge = document.getElementById('event-status-badge');
  statusBadge.className = `badge badge-status-${currentEvent.status.toLowerCase()}`;
  statusBadge.textContent = currentEvent.status;

  updateCapacityAndButtons();
}

async function updateCapacityAndButtons() {
  let registeredCount = 0;
  try {
    const attendeesData = await API.fetch(`/api/events/${currentEvent.id}/attendees`);
    registeredCount = attendeesData.totalRegistered || 0;
  } catch {
    registeredCount = 0;
  }

  const capacity = currentEvent.capacity;
  const pct = Math.min(100, Math.round((registeredCount / capacity) * 100));
  const isFull = registeredCount >= capacity;

  document.getElementById('capacity-text').textContent = `${registeredCount} / ${capacity} seats`;
  const bar = document.getElementById('capacity-bar');
  bar.style.width = `${pct}%`;
  bar.className = `progress-bar ${isFull ? 'bg-danger' : pct > 75 ? 'bg-warning' : 'bg-success'}`;

  const statusText = document.getElementById('capacity-status-text');
  statusText.textContent = isFull ? 'Event is currently at maximum capacity. Additional registrations will enter the waiting list.' : `${capacity - registeredCount} seats remaining.`;

  const actionBtn = document.getElementById('register-btn');
  const notice = document.getElementById('user-status-notice');
  const user = API.getUser();

  if (!API.getToken()) {
    actionBtn.textContent = 'Log in to Register';
    actionBtn.className = 'btn btn-outline-primary btn-lg w-100 fw-semibold';
    notice.textContent = 'You need a student account to register.';
    return;
  }

  if (user && user.role !== 'Student' && user.role !== 'Admin') {
    actionBtn.textContent = 'Student Access Only';
    actionBtn.disabled = true;
    actionBtn.className = 'btn btn-secondary btn-lg w-100';
    notice.textContent = `You are logged in as an ${user.role}.`;
    return;
  }

  if (userRegistrationStatus === 'Registered') {
    actionBtn.textContent = 'Cancel My Registration';
    actionBtn.className = 'btn btn-danger btn-lg w-100 fw-semibold';
    notice.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>You are confirmed for this event!</span>';
  } else if (userRegistrationStatus === 'Waitlisted') {
    actionBtn.textContent = 'Leave Waiting List';
    actionBtn.className = 'btn btn-outline-danger btn-lg w-100 fw-semibold';
    notice.innerHTML = '<span class="text-warning"><i class="bi bi-clock-history me-1"></i>You are currently on the waiting list.</span>';
  } else {
    if (isFull) {
      actionBtn.textContent = 'Join Waiting List';
      actionBtn.className = 'btn btn-warning btn-lg w-100 fw-semibold text-dark';
      notice.textContent = 'Event is full. You will be alerted when a seat opens.';
    } else {
      actionBtn.textContent = 'Register for Event';
      actionBtn.className = 'btn btn-primary btn-lg w-100 fw-semibold';
      notice.textContent = 'Free registration with immediate confirmation.';
    }
  }
}

async function handleRegistrationAction() {
  if (!API.getToken()) {
    window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
    return;
  }

  const actionBtn = document.getElementById('register-btn');
  actionBtn.disabled = true;

  try {
    if (userRegistrationStatus === 'Registered' || userRegistrationStatus === 'Waitlisted') {
      // Cancel
      const res = await API.fetch(`/api/events/${currentEvent.id}/register`, { method: 'DELETE' });
      userRegistrationStatus = null;
      showToast('Registration cancelled successfully.', 'warning');
    } else {
      // Register or Join waitlist
      const res = await API.fetch(`/api/events/${currentEvent.id}/register`, { method: 'POST' });
      userRegistrationStatus = res.registration.status;
      showToast(res.message, 'success');
    }
    await loadEventDetails(currentEvent.id);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    actionBtn.disabled = false;
  }
}
