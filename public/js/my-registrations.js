document.addEventListener('DOMContentLoaded', () => {
  if (!protectRoute(['Student', 'Admin'])) return;
  renderNavbar('my-registrations');
  loadMyRegistrations();
});

async function loadMyRegistrations() {
  const confirmedList = document.getElementById('confirmed-list');
  const waitlistedList = document.getElementById('waitlisted-list');

  try {
    const data = await API.fetch('/api/registrations/my-events');
    const events = data.events || [];

    const confirmed = events.filter(e => e.registration_status === 'Registered');
    const waitlisted = events.filter(e => e.registration_status === 'Waitlisted');

    document.getElementById('confirmed-count').textContent = confirmed.length;
    document.getElementById('waitlist-count').textContent = waitlisted.length;

    renderList(confirmedList, confirmed, false);
    renderList(waitlistedList, waitlisted, true);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderList(container, items, isWaitlist) {
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = `
      <div class="col-12 empty-state">
        <i class="bi ${isWaitlist ? 'bi-hourglass-split' : 'bi-ticket-detailed'}"></i>
        <h5 class="mt-3 text-muted">No ${isWaitlist ? 'waitlisted' : 'confirmed'} events</h5>
        <p class="text-muted small">You haven't ${isWaitlist ? 'joined any event waiting lists' : 'registered for any events'} yet.</p>
        <a href="events.html" class="btn btn-outline-primary btn-sm mt-2">Browse Events Catalog</a>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card h-100 card-hover shadow-sm border-0">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge ${isWaitlist ? 'bg-warning text-dark' : 'bg-success'}">
              ${isWaitlist ? `Waitlist Position #${item.waitlist_position || 1}` : 'Confirmed Seat'}
            </span>
            <span class="badge bg-light text-muted border">${item.category}</span>
          </div>
          <h5 class="card-title fw-bold text-primary mb-2">${item.title}</h5>
          <div class="small text-muted mb-2"><i class="bi bi-calendar3 me-1"></i><strong>${item.date}</strong> at ${item.time}</div>
          <div class="small text-muted mb-3"><i class="bi bi-geo-alt me-1"></i>${item.venue}</div>

          <div class="mt-auto pt-3 border-top d-flex gap-2">
            <a href="event-details.html?id=${item.event_id}" class="btn btn-outline-primary btn-sm flex-grow-1">View Details</a>
            <button class="btn btn-outline-danger btn-sm" onclick="cancelRegistration(${item.event_id})" data-testid="cancel-reg-${item.event_id}">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

async function cancelRegistration(eventId) {
  if (!confirm('Are you sure you want to cancel your registration?')) return;
  try {
    const res = await API.fetch(`/api/events/${eventId}/register`, { method: 'DELETE' });
    showToast(res.message || 'Registration cancelled', 'success');
    loadMyRegistrations();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
