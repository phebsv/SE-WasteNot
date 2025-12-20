document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('claimsContainer');
  const filterChips = document.querySelectorAll('.filter-chip');
  let requests = JSON.parse(localStorage.getItem('ngoRequests') || '[]');

  // Map company to logo filename
  const logoMap = {
    'Jollibee': 'jollibee-logo.jpg',
    'SM Grocery': 'sm-logo.jpg',
    'McDonald\'s': 'mcdonalds-logo.jpg',
    'Noodle Haus': 'noodle-haus-logo.jpg'
  };

  function renderRequests(filterStatus = 'all') {
    if (!requests.length) {
      container.innerHTML = '<p style="grid-column:1/-1;color:var(--muted)">No requests yet.</p>';
      return;
    }

    let filtered = requests;
    
    if (filterStatus !== 'all') {
      filtered = requests.filter(r => {
        const status = r.status || 'Pending Provider Confirmation';
        return status === filterStatus;
      });
    }

    if (!filtered.length) {
      container.innerHTML = '<p style="grid-column:1/-1;color:var(--muted)">No requests with this status.</p>';
      return;
    }

    const html = filtered.map(r => {
      const status = r.status || 'Pending Provider Confirmation';
      return `
      <div class="claim-item">
        <div class="claim-logo">
          <img src="${logoMap[r.company] || 'placeholder-logo.jpg'}" alt="${r.company}" />
        </div>
        <div class="claim-content">
          <div class="claim-title">${r.item}</div>
          <div class="claim-provider">Provider: ${r.company}</div>
          <div class="claim-meta">Qty: ${r.qty}</div>
          <div class="claim-meta">Pickup: ${r.pickup}</div>
          <div class="claim-status">Status: ${status}</div>
          <div class="claim-actions">
            <button class="btn-action btn-cancel" data-id="${r.id}">Cancel Request</button>
            <button class="btn-action btn-details" data-id="${r.id}">View Details</button>
          </div>
        </div>
      </div>
    `;
    }).join('');

    container.innerHTML = html;

    // Add event listeners to buttons
    container.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        window.location.href = `ngo-productDetails.html?id=${id}`;
      });
    });

    container.querySelectorAll('.btn-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (confirm('Are you sure you want to cancel this request?')) {
          const updatedRequests = requests.map(r => 
            r.id === parseInt(id) ? { ...r, status: 'Cancelled' } : r
          );
          localStorage.setItem('ngoRequests', JSON.stringify(updatedRequests));
          requests = updatedRequests;
          renderRequests(filterStatus);
        }
      });
    });
  }

  // Initial render
  renderRequests('all');

  // Filter chip click handlers
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const status = chip.getAttribute('data-status');
      renderRequests(status);
    });
  });
});