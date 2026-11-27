document.addEventListener('DOMContentLoaded', async () => {
  renderNavbar('home');
  loadFeaturedEvents();
});

function handleSearchClick() {
  const kw = document.getElementById('quick-search').value.trim();
  const cat = document.getElementById('quick-category').value;
  const params = new URLSearchParams();
  if (kw) params.append('keyword', kw);
  if (cat) params.append('category', cat);
  window.location.href = `events.html?${params.toString()}`;
}

async function loadFeaturedEvents() {
  const grid = document.getElementById('events-grid');
  try {
    const data = await API.fetch('/api/events?limit=6&sortBy=date');
    grid.innerHTML = '';

    if (!data.events || data.events.length === 0) {
      grid.innerHTML = `
        <div class="col-12 empty-state">
          <i class="bi bi-calendar-x"></i>
          <h4 class="mt-3 text-muted">No upcoming events scheduled</h4>
          <p class="text-muted">Check back soon for new campus activities and announcements.</p>
        </div>
      `;
      return;
    }

    data.events.forEach(evt => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';
      col.innerHTML = `
        <div class="card h-100 card-hover shadow-sm" data-testid="event-card-${evt.id}">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle">${evt.category}</span>
              <small class="text-muted"><i class="bi bi-people me-1"></i>Cap: ${evt.capacity}</small>
            </div>
            <h5 class="card-title fw-bold text-primary mb-2">${evt.title}</h5>
            <p class="card-text text-muted small flex-grow-1">
              ${evt.description ? evt.description.substring(0, 110) + (evt.description.length > 110 ? '...' : '') : 'No description provided.'}
            </p>
            <div class="mt-3 pt-3 border-top">
              <div class="small text-muted mb-1">
                <i class="bi bi-calendar3 me-2"></i><strong>${evt.date}</strong> at ${evt.time}
              </div>
              <div class="small text-muted mb-3">
                <i class="bi bi-geo-alt me-2"></i>${evt.venue}
              </div>
              <a href="event-details.html?id=${evt.id}" class="btn btn-outline-primary w-100 fw-semibold" data-testid="view-details-btn-${evt.id}">
                View Details & Register
              </a>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(col);
    });
  } catch (err) {
    grid.innerHTML = `
      <div class="col-12 text-center text-danger py-5">
        <i class="bi bi-exclamation-triangle fs-2"></i>
        <p class="mt-2">Failed to load events. Please try again later.</p>
      </div>
    `;
  }
}
