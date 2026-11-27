let categoryChartInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!protectRoute(['Admin'])) return;
  renderNavbar('admin-dashboard');
  await loadDashboardAnalytics();
});

async function loadDashboardAnalytics() {
  try {
    // 1. Summary Metrics
    const sumRes = await API.fetch('/api/reports/summary');
    const s = sumRes.summary;
    document.getElementById('metric-total-events').textContent = s.totalEvents;
    document.getElementById('metric-approved-events').textContent = s.approvedEvents;
    document.getElementById('metric-total-registrations').textContent = s.totalRegistrations;
    document.getElementById('metric-total-waitlisted').textContent = s.totalWaitlisted;

    // 2. Popular Events
    const popRes = await API.fetch('/api/reports/popular-events?limit=5');
    const popTbody = document.getElementById('popular-events-tbody');
    popTbody.innerHTML = '';
    (popRes.popularEvents || []).forEach((p, idx) => {
      const theme = getCategoryTheme(p.category);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="ps-4">
          <span class="badge ${idx === 0 ? 'bg-danger text-white' : idx === 1 ? 'bg-warning text-dark' : 'bg-light text-muted border'} me-2 fw-bold">#${idx + 1}</span>
          <span class="fw-semibold text-dark">${p.title}</span>
        </td>
        <td><span class="badge ${theme.headerClass} text-white px-2 py-1">${p.category}</span></td>
        <td class="small text-muted">${p.organizer_name}</td>
        <td class="text-end pe-4 fw-bold text-success">${p.registration_count} seats</td>
      `;
      popTbody.appendChild(tr);
    });

    // 3. Category Breakdown & Chart.js
    const catRes = await API.fetch('/api/reports/categories');
    const categories = catRes.categories || [];
    renderCategoryChart(categories);

    // 4. Attendance & Occupancy
    const attRes = await API.fetch('/api/reports/attendance');
    const attTbody = document.getElementById('attendance-tbody');
    attTbody.innerHTML = '';
    (attRes.attendance || []).forEach(a => {
      const pct = Math.min(100, a.occupancy_rate || 0);
      const isFull = pct >= 100;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="ps-4">
          <div class="fw-semibold text-dark">${a.title}</div>
          <small class="badge badge-status-${a.event_status.toLowerCase()}">${a.event_status}</small>
        </td>
        <td class="small text-muted">${a.date}</td>
        <td class="small fw-semibold">${a.capacity}</td>
        <td class="small fw-bold text-success">${a.registered_count}</td>
        <td class="small fw-bold text-warning">${a.waitlisted_count}</td>
        <td class="pe-4">
          <div class="d-flex align-items-center">
            <div class="progress flex-grow-1 me-2" style="height: 8px; border-radius: var(--radius-full);">
              <div class="progress-bar ${isFull ? 'bg-danger' : pct > 75 ? 'bg-warning' : 'bg-primary'}" style="width: ${pct}%"></div>
            </div>
            <span class="small fw-bold text-dark">${pct}%</span>
          </div>
        </td>
      `;
      attTbody.appendChild(tr);
    });

  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderCategoryChart(categories) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  const labels = categories.map(c => c.category);
  const data = categories.map(c => c.event_count);

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: [
          '#4f46e5', '#8b5cf6', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#64748b'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 }
          }
        }
      },
      cutout: '68%'
    }
  });
}
