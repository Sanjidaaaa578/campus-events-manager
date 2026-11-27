document.addEventListener('DOMContentLoaded', () => {
  if (!protectRoute()) return;
  renderNavbar('notifications');
  loadNotifications();
});

async function loadNotifications() {
  const container = document.getElementById('notifications-list');

  try {
    const data = await API.fetch('/api/notifications');
    const notifs = data.notifications || [];
    container.innerHTML = '';

    if (notifs.length === 0) {
      container.innerHTML = `
        <div class="empty-state py-5">
          <i class="bi bi-bell-slash"></i>
          <h5 class="mt-3 text-muted">No notifications</h5>
          <p class="text-muted small">You don't have any updates right now.</p>
        </div>
      `;
      return;
    }

    notifs.forEach(n => {
      const isUnread = !n.is_read;
      const item = document.createElement('div');
      item.className = `list-group-item p-4 ${isUnread ? 'bg-primary-subtle' : ''}`;
      item.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
          <div class="me-3">
            <div class="d-flex align-items-center mb-1">
              ${isUnread ? '<span class="badge bg-primary me-2">New</span>' : ''}
              <h6 class="fw-bold mb-0 text-dark">${n.title}</h6>
            </div>
            <p class="mb-1 text-muted small">${n.message}</p>
            <small class="text-secondary"><i class="bi bi-clock me-1"></i>${n.created_at}</small>
          </div>
          ${isUnread ? `
            <button class="btn btn-outline-primary btn-sm flex-shrink-0" onclick="markRead(${n.id})" data-testid="mark-read-${n.id}">
              <i class="bi bi-check2"></i> Mark Read
            </button>
          ` : '<span class="badge bg-light text-muted border">Read</span>'}
        </div>
      `;
      container.appendChild(item);
    });
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function markRead(id) {
  try {
    await API.fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
    showToast('Notification marked as read', 'success');
    renderNavbar('notifications');
    loadNotifications();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
