document.addEventListener('DOMContentLoaded', () => {
  if (!protectRoute(['Admin'])) return;
  renderNavbar('admin-approvals');
  loadPendingEvents();
});

async function loadPendingEvents() {
  const tbody = document.getElementById('approvals-table-body');
  try {
    const data = await API.fetch('/api/events?status=Pending');
    const events = data.events || [];
    document.getElementById('pending-count').textContent = events.length;

    tbody.innerHTML = '';
    if (events.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-5">
            <i class="bi bi-check2-circle text-success fs-1 d-block mb-2"></i>
            <h5 class="text-muted mb-0">All caught up!</h5>
            <p class="text-muted small">No pending event submissions require your review.</p>
          </td>
        </tr>
      `;
      return;
    }

    events.forEach(ev => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="ps-4">
          <h6 class="fw-bold text-primary mb-1">${ev.title}</h6>
          <span class="badge bg-light text-muted border">${ev.category}</span>
          ${ev.description ? `<p class="small text-muted mb-0 mt-1">${ev.description}</p>` : ''}
        </td>
        <td>
          <div class="fw-semibold small">${ev.organizer_name}</div>
          <div class="small text-muted">${ev.organizer_email}</div>
        </td>
        <td>
          <div class="small fw-semibold">${ev.date} at ${ev.time}</div>
          <div class="small text-muted">${ev.venue}</div>
        </td>
        <td>
          <span class="small fw-bold">${ev.capacity} seats</span>
        </td>
        <td class="text-end pe-4">
          <button class="btn btn-success btn-sm me-1 px-3 fw-semibold" onclick="updateEventStatus(${ev.id}, 'Approved')" data-testid="approve-btn-${ev.id}">
            <i class="bi bi-check-lg me-1"></i> Approve
          </button>
          <button class="btn btn-danger btn-sm px-3 fw-semibold" onclick="updateEventStatus(${ev.id}, 'Rejected')" data-testid="reject-btn-${ev.id}">
            <i class="bi bi-x-lg me-1"></i> Reject
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function updateEventStatus(eventId, status) {
  try {
    const res = await API.fetch(`/api/events/${eventId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    showToast(`Event successfully marked as ${status}.`, 'success');
    loadPendingEvents();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
