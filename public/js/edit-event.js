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

  await loadEventData();
});

async function loadEventData() {
  try {
    const data = await API.fetch(`/api/events/${eventId}`);
    const ev = data.event;
    document.getElementById('edit-title').value = ev.title;
    document.getElementById('edit-desc').value = ev.description || '';
    document.getElementById('edit-date').value = ev.date;
    document.getElementById('edit-time').value = ev.time;
    document.getElementById('edit-venue').value = ev.venue;
    document.getElementById('edit-capacity').value = ev.capacity;
    document.getElementById('edit-category').value = ev.category;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function handleEditEvent(event) {
  event.preventDefault();
  const title = document.getElementById('edit-title').value.trim();
  const desc = document.getElementById('edit-desc').value.trim();
  const date = document.getElementById('edit-date').value;
  const time = document.getElementById('edit-time').value;
  const venue = document.getElementById('edit-venue').value.trim();
  const capacity = parseInt(document.getElementById('edit-capacity').value, 10);
  const category = document.getElementById('edit-category').value;

  const btn = document.getElementById('save-event-btn');
  btn.disabled = true;

  try {
    await API.fetch(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description: desc, date, time, venue, capacity, category })
    });

    showToast('Event updated and attendees notified!', 'success');
    setTimeout(() => {
      window.location.href = 'my-events.html';
    }, 1000);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
  }
}
