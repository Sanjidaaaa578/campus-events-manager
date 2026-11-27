document.addEventListener('DOMContentLoaded', () => {
  if (!protectRoute(['Organizer', 'Admin'])) return;
  renderNavbar('create-event');
});

async function handleCreateEvent(event) {
  event.preventDefault();
  const title = document.getElementById('event-title');
  const desc = document.getElementById('event-desc');
  const date = document.getElementById('event-date');
  const time = document.getElementById('event-time');
  const venue = document.getElementById('event-venue');
  const capacity = document.getElementById('event-capacity');
  const category = document.getElementById('event-category');

  [title, date, time, venue, capacity].forEach(el => el.classList.remove('is-invalid'));

  let valid = true;
  if (!title.value.trim()) { title.classList.add('is-invalid'); valid = false; }
  if (!date.value) { date.classList.add('is-invalid'); valid = false; }
  if (!time.value) { time.classList.add('is-invalid'); valid = false; }
  if (!venue.value.trim()) { venue.classList.add('is-invalid'); valid = false; }
  if (!capacity.value || parseInt(capacity.value, 10) <= 0) { capacity.classList.add('is-invalid'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('submit-event-btn');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const res = await API.fetch('/api/events', {
      method: 'POST',
      body: JSON.stringify({
        title: title.value.trim(),
        description: desc.value.trim(),
        date: date.value,
        time: time.value,
        venue: venue.value.trim(),
        capacity: parseInt(capacity.value, 10),
        category: category.value
      })
    });

    showToast('Event submitted for review successfully!', 'success');
    setTimeout(() => {
      window.location.href = 'my-events.html';
    }, 1000);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Submit for Approval';
  }
}
