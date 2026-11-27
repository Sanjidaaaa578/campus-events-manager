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
      const theme = getCategoryTheme(evt.category);
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';
      col.innerHTML = `
        <div class="card h-100 card-hover shadow-sm border-0" data-testid="event-card-${evt.id}">
          <!-- Category Themed Header Banner -->
          <div class="event-card-header ${theme.headerClass}">
            <i class="bi ${theme.icon} event-watermark-icon"></i>
            <div class="d-flex justify-content-between align-items-center position-relative" style="z-index: 2;">
              <span class="event-category-pill">
                <i class="bi ${theme.icon} me-1"></i>${evt.category}
              </span>
              <span class="event-capacity-pill">
                <i class="bi bi-people me-1"></i>Cap: ${evt.capacity}
              </span>
            </div>
          </div>

          <!-- Card Content Body -->
          <div class="card-body p-4 d-flex flex-column">
            <h5 class="event-card-title mb-2" title="${evt.title}">${evt.title}</h5>
            <p class="event-card-desc flex-grow-1">
              ${evt.description ? evt.description : 'Join faculty and students for this campus event.'}
            </p>

            <div class="mt-auto pt-3 border-top">
              <div class="event-meta-item">
                <span class="event-meta-icon meta-icon-date"><i class="bi bi-calendar3"></i></span>
                <div>
                  <strong>${evt.date}</strong> at <span class="text-muted">${evt.time}</span>
                </div>
              </div>
              <div class="event-meta-item mb-3">
                <span class="event-meta-icon meta-icon-venue"><i class="bi bi-geo-alt"></i></span>
                <span class="text-truncate" title="${evt.venue}">${evt.venue}</span>
              </div>
              <a href="event-details.html?id=${evt.id}" class="btn btn-outline-primary w-100 fw-semibold" data-testid="view-details-btn-${evt.id}">
                <span>View Details & Register</span>
                <i class="bi bi-arrow-right ms-2"></i>
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
