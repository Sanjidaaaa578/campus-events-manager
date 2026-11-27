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
        </div>
      `;
      pagination.innerHTML = '';
      return;
    }

    data.events.forEach(evt => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-lg-4';
      col.innerHTML = `
        <div class="card h-100 card-hover shadow-sm" data-testid="catalog-event-${evt.id}">
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
              <div class="small text-muted mb-1"><i class="bi bi-calendar3 me-2"></i><strong>${evt.date}</strong> at ${evt.time}</div>
              <div class="small text-muted mb-3"><i class="bi bi-geo-alt me-2"></i>${evt.venue}</div>
              <a href="event-details.html?id=${evt.id}" class="btn btn-outline-primary w-100 fw-semibold" data-testid="catalog-details-${evt.id}">
                View Details & Register
              </a>
            </div>
          </div>
        </div>
      `;
      container.appendChild(col);
    });

    // Render Pagination
    const totalPages = Math.ceil(data.total / limit);
    if (totalPages > 1) {
      let pagesHtml = '<ul class="pagination shadow-sm">';
      pagesHtml += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}"><button class="page-link" onclick="goToPage(${currentPage - 1})">Previous</button></li>`;
      for (let p = 1; p <= totalPages; p++) {
        pagesHtml += `<li class="page-item ${currentPage === p ? 'active' : ''}"><button class="page-link" onclick="goToPage(${p})">${p}</button></li>`;
      }
      pagesHtml += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}"><button class="page-link" onclick="goToPage(${currentPage + 1})">Next</button></li>`;
      pagesHtml += '</ul>';
      pagination.innerHTML = pagesHtml;
    } else {
      pagination.innerHTML = '';
    }

  } catch (err) {
    container.innerHTML = `<div class="col-12 text-center text-danger py-5"><p>${err.message}</p></div>`;
  }
}

function goToPage(page) {
  currentPage = page;
  loadEventsList();
  window.scrollTo({ top: 150, behavior: 'smooth' });
}
