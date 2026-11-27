let currentPage = 1;
const limit = 6;

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('events');

  // Prepopulate from URL search params
  const params = new URLSearchParams(window.location.search);
  if (params.get('keyword')) document.getElementById('filter-keyword').value = params.get('keyword');
  if (params.get('category')) document.getElementById('filter-category').value = params.get('category');
  if (params.get('startDate')) document.getElementById('filter-start-date').value = params.get('startDate');
  if (params.get('endDate')) document.getElementById('filter-end-date').value = params.get('endDate');
  if (params.get('sortBy')) document.getElementById('filter-sort').value = params.get('sortBy');

  loadEventsList();
});

function applyFilters() {
  currentPage = 1;
  loadEventsList();
}

function resetFilters() {
  document.getElementById('filter-keyword').value = '';
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-start-date').value = '';
  document.getElementById('filter-end-date').value = '';
  document.getElementById('filter-sort').value = 'date';
  applyFilters();
}

async function loadEventsList() {
  const container = document.getElementById('events-catalog-container');
  const pagination = document.getElementById('pagination-controls');
  container.innerHTML = `
    <div class="col-12 spinner-container">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="text-muted mt-2">Loading events...</p>
    </div>
  `;

  const kw = document.getElementById('filter-keyword').value.trim();
  const cat = document.getElementById('filter-category').value;
  const sDate = document.getElementById('filter-start-date').value;
  const eDate = document.getElementById('filter-end-date').value;
  const sortBy = document.getElementById('filter-sort').value;

  const q = new URLSearchParams({
    page: currentPage,
    limit: limit,
    sortBy: sortBy
  });
  if (kw) q.append('keyword', kw);
  if (cat) q.append('category', cat);
  if (sDate) q.append('startDate', sDate);
  if (eDate) q.append('endDate', eDate);

  try {
    const data = await API.fetch(`/api/events?${q.toString()}`);
    container.innerHTML = '';

    if (!data.events || data.events.length === 0) {
      container.innerHTML = `
        <div class="col-12 empty-state">
          <i class="bi bi-funnel"></i>
          <h4 class="mt-3 text-muted">No matching events found</h4>
          <p class="text-muted">Try adjusting your filters or search keywords.</p>
          <button class="btn btn-outline-primary btn-sm mt-2" onclick="resetFilters()">Reset All Filters</button>
        </div>
      `;
      pagination.innerHTML = '';
      return;
    }

    data.events.forEach(evt => {
      const theme = getCategoryTheme(evt.category);
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';
      col.innerHTML = `
        <div class="card h-100 card-hover shadow-sm border-0" data-testid="catalog-event-${evt.id}">
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
              <a href="event-details.html?id=${evt.id}" class="btn btn-outline-primary w-100 fw-semibold" data-testid="catalog-details-${evt.id}">
                <span>View Details & Register</span>
                <i class="bi bi-arrow-right ms-2"></i>
              </a>
            </div>
          </div>
        </div>
      `;
      container.appendChild(col);
    });

    // Render modern pagination
    renderPagination(data.pagination);
  } catch (err) {
    container.innerHTML = `
      <div class="col-12 text-center text-danger py-5">
        <i class="bi bi-exclamation-triangle fs-2"></i>
        <p class="mt-2">Failed to load events. Please try again later.</p>
      </div>
    `;
  }
}

function renderPagination(meta) {
  const container = document.getElementById('pagination-controls');
  if (!meta || meta.totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <nav aria-label="Event pagination">
      <ul class="pagination pagination-md justify-content-center gap-1">
        <li class="page-item ${meta.page <= 1 ? 'disabled' : ''}">
          <button class="page-link rounded-circle border-0 me-1" style="width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center;" onclick="changePage(${meta.page - 1})">
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
  `;

  for (let i = 1; i <= meta.totalPages; i++) {
    html += `
      <li class="page-item ${i === meta.page ? 'active' : ''}">
        <button class="page-link rounded-circle border-0 ${i === meta.page ? 'bg-primary text-white shadow-sm' : ''}" style="width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center;" onclick="changePage(${i})">${i}</button>
      </li>
    `;
  }

  html += `
        <li class="page-item ${meta.page >= meta.totalPages ? 'disabled' : ''}">
          <button class="page-link rounded-circle border-0 ms-1" style="width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center;" onclick="changePage(${meta.page + 1})">
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  `;

  container.innerHTML = html;
}

function changePage(page) {
  currentPage = page;
  loadEventsList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
