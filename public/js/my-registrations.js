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
        <a href="events.html" class="btn btn-outline-primary btn-sm mt-2 rounded-pill px-3">Browse Events Catalog</a>
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const theme = getCategoryTheme(item.category);
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="card h-100 card-hover shadow-sm border-0">
        <!-- Themed Header -->
        <div class="event-card-header ${theme.headerClass}">
          <i class="bi ${theme.icon} event-watermark-icon"></i>
          <div class="d-flex justify-content-between align-items-center position-relative" style="z-index: 2;">
            <span class="badge ${isWaitlist ? 'bg-warning text-dark' : 'bg-success text-white'} px-3 py-2 fw-semibold">
              <i class="bi ${isWaitlist ? 'bi-clock-history' : 'bi-check-circle-fill'} me-1"></i>
              ${isWaitlist ? `Waitlist Position #${item.waitlist_position || 1}` : 'Seat Confirmed'}
            </span>
            <span class="event-category-pill">
              ${item.category}
            </span>
          </div>
        </div>

        <div class="card-body p-4 d-flex flex-column">
          <h5 class="event-card-title mb-2" title="${item.title}">${item.title}</h5>
          
          <div class="event-meta-item mt-2">
            <span class="event-meta-icon meta-icon-date"><i class="bi bi-calendar3"></i></span>
            <div><strong>${item.date}</strong> at <span class="text-muted">${item.time}</span></div>
          </div>
          <div class="event-meta-item mb-3">
            <span class="event-meta-icon meta-icon-venue"><i class="bi bi-geo-alt"></i></span>
            <span class="text-truncate">${item.venue}</span>
          </div>

          ${isWaitlist ? `
            <div class="alert alert-warning py-2 px-3 small mb-3 border-0 bg-warning-subtle text-dark">
              <i class="bi bi-info-circle me-1"></i> You will be automatically enrolled if a confirmed seat is cancelled.
            </div>
          ` : ''}

          <div class="mt-auto pt-3 border-top d-flex gap-2">
            <a href="event-details.html?id=${item.event_id}" class="btn btn-outline-primary btn-sm flex-grow-1 fw-semibold">
              <i class="bi bi-eye me-1"></i> View Details
            </a>
            <button class="btn btn-outline-danger btn-sm px-3" onclick="cancelRegistration(${item.event_id})" data-testid="cancel-reg-${item.event_id}">
              <i class="bi bi-x-circle me-1"></i> Cancel
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
