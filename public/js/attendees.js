let eventId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!protectRoute(['Organizer', 'Admin'])) return;
  renderNavbar('my-events');

  const params = new URLSearchParams(window.location.search);
  eventId = params.get('id');
  if (!eventId) {
    window.location.href = 'my-events.html';
    return;
  }

  await loadAttendeesData();
});

async function loadAttendeesData() {
  try {
    const data = await API.fetch(`/api/events/${eventId}/attendees`);
    document.getElementById('event-roster-title').textContent = data.eventTitle;
    document.getElementById('event-roster-subtitle').textContent = `Total Capacity: ${data.capacity} seats`;
    document.getElementById('total-registered-count').textContent = data.totalRegistered;
    document.getElementById('total-waitlisted-count').textContent = data.totalWaitlisted;
    document.getElementById('total-capacity-count').textContent = data.capacity;

    const registered = (data.attendees || []).filter(a => a.status === 'Registered');
    const waitlisted = (data.attendees || []).filter(a => a.status === 'Waitlisted');

    const regBody = document.getElementById('registered-table-body');
    const waitBody = document.getElementById('waitlist-table-body');

    regBody.innerHTML = '';
    if (registered.length === 0) {
      regBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No confirmed attendees yet.</td></tr>';
    } else {
      registered.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="ps-4 fw-semibold text-primary">${r.student_name}</td>
          <td>${r.student_email}</td>
          <td><span class="badge bg-light text-muted border">${r.department || 'General'}</span></td>
          <td class="text-muted small">${r.registered_at}</td>
        `;
        regBody.appendChild(tr);
      });
    }

    waitBody.innerHTML = '';
    if (waitlisted.length === 0) {
      waitBody.innerHTML = '<tr><td colspan="4" class="text-center py-4 text-muted">No students on the waiting list.</td></tr>';
    } else {
      waitlisted.forEach((w, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="ps-4"><span class="badge bg-warning text-dark">#${idx + 1}</span></td>
          <td class="fw-semibold">${w.student_name}</td>
          <td>${w.student_email}</td>
          <td class="text-muted small">${w.registered_at}</td>
        `;
        waitBody.appendChild(tr);
      });
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function sendAttendeeReminder() {
  try {
    const res = await API.fetch(`/api/events/${eventId}/remind`, { method: 'POST' });
    showToast(res.message, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}
