document.addEventListener('DOMContentLoaded', () => {
  if (!protectRoute(['Organizer', 'Admin'])) return;
  renderNavbar('my-events');
  loadMyOrganizedEvents();
});

async function loadMyOrganizedEvents() {
  const tbody = document.getElementById('my-events-table-body');
  const user = API.getUser();

  try {
    // Organizers query with organizerId parameter
    const data = await API.fetch(`/api/events?organizerId=${user.id}&status=`);
    const events = data.events || [];
    tbody.innerHTML = '';

    if (events.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center py-5">
            <i class="bi bi-calendar-x fs-1 text-muted d-block mb-2"></i>
            <h5 class="text-muted mb-1">No organized events yet</h5>
            <p class="text-muted small">Click the "Create New Event" button to get started.</p>
          </td>
        </tr>
      `;
      return;
    }

    events.forEach(ev => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="ps-4">
          <h6 class="fw-bold mb-1 text-primary">${ev.title}</h6>
          <span class="badge bg-light text-muted border">${ev.category}</span>
        </td>
        <td>
          <div class="small fw-semibold">${ev.date} at ${formatTime(ev.time)}</div>
          <div class="small text-muted">${ev.venue}</div>
        </td>
        <td>
          <span class="badge badge-status-${ev.status.toLowerCase()}">${ev.status}</span>
        </td>
        <td>
          <span class="small fw-semibold">${ev.capacity} seats</span>
        </td>
        <td class="text-end pe-4">
          <div class="btn-group btn-group-sm">
            <a href="attendees.html?id=${ev.id}" class="btn btn-outline-info" title="View Attendees">
              <i class="bi bi-people"></i> Attendees
            </a>
            <button class="btn btn-outline-warning" onclick="sendReminder(${ev.id})" title="Send Reminder Broadcast">
              <i class="bi bi-bell"></i> Remind
            </button>
            <a href="edit-event.html?id=${ev.id}" class="btn btn-outline-primary" title="Edit">
              <i class="bi bi-pencil"></i>
            </a>
            <button class="btn btn-outline-danger" onclick="deleteEvent(${ev.id})" title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function sendReminder(eventId) {
  try {
    const res = await API.fetch(`/api/events/${eventId}/remind`, { method: 'POST' });
    showToast(res.message, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteEvent(eventId) {
  if (!confirm('Are you sure you want to cancel and delete this event? Registered attendees will be notified.')) return;
  try {
    await API.fetch(`/api/events/${eventId}`, { method: 'DELETE' });
    showToast('Event deleted successfully.', 'success');
    loadMyOrganizedEvents();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
